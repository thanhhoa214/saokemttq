"use server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ZodRawShape, ZodType, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export type ConvertTxsRequest = {
  text: string;
};

export interface ConvertTxsResponse {
  transactions: Array<{
    date: string;
    docNumber: string;
    creditAmount: number;
    balance: number;
    description: string;
  }>;
}

interface ConvertTxsResponseZod {
  transactions: ZodType<
    Array<{
      date: string;
      docNumber: string;
      creditAmount: number;
      balance: number;
      description: string;
    }>
  >;
}

const expectedReturnSchema = z.object<ZodRawShape & ConvertTxsResponseZod>({
  transactions: z.array(
    z.object({
      date: z.string(),
      docNumber: z.string(),
      creditAmount: z.number(),
      balance: z.number(),
      description: z.string(),
    })
  ),
});

const model = new ChatOpenAI({ model: "gpt-4" }).bind({
  functions: [
    {
      name: "extractor",
      description: "Extracts fields from the input.",
      parameters: zodToJsonSchema(expectedReturnSchema),
    },
  ],
  function_call: { name: "extractor" },
});
const prompt = `You are a text to transactions converter. You will receive a huge text including transactions information (date, docNumber, creditAmount, balance, description).
- date: the date of the transaction from 01/09/2024 to 10/09/2024
- docNumber: the document number of the transaction (e.g. 5213.45946 or 5090.85797 or 5388.96713)
- creditAmount: the amount of the transaction in VND (e.g. 50.000 or 3.000 or 1.000.000 or 1.000.000.000), usually end with ".000" but not always
- balance: will occur occasionally, the balance of the root account after the transaction in VND, it is a big number (e.g. 10.847.331.843 or 10.847.903.843 or 10.856.695.843)
- description: the description is the rest data of each line

Your task is to extract the transactions from the text and return them in a structured format.
`;

export async function textToTxs(info: ConvertTxsRequest) {
  const { additional_kwargs } = await model.invoke([
    new SystemMessage({ content: prompt }),
    new HumanMessage({ content: `'Here is text: ${info.text}'` }),
  ]);

  if (!additional_kwargs.function_call) return null;
  const extractionReturns = JSON.parse(
    additional_kwargs.function_call.arguments
  ) as ConvertTxsResponse;
  return extractionReturns;
}
