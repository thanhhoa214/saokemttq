// scripts/insertTransactions.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { isValid, isWithinInterval, parse } from "date-fns";
import fs from "fs";
import pdfParse from "pdf-parse";

const prisma = new PrismaClient();

// Function to clean and extract relevant transaction lines from the PDF content
function cleanExtractedText(text: string): string[] {
  // Filter out non-transaction content based on known patterns
  const lines = text.split("\n");
  const filteredLines: string[] = [];
  let isTransactionSection = false;

  for (const line of lines) {
    // Start capturing transaction lines after the "Transactions in detail" section
    if (line.includes("Transactions in detail")) {
      isTransactionSection = true;
      continue;
    }

    // Stop capturing transaction lines before footer
    if (line.includes("Page")) {
      isTransactionSection = false;
    }

    if (isTransactionSection && line.trim() !== "") {
      filteredLines.push(line.trim());
    }
  }
  return filteredLines;
}

function extractTransactions(
  line: string
): Prisma.TransactionCreateInput | null {
  const [date, docNumber, ...rest] = line.split(" ").map((l) => l.trim());
  let restString = rest.join(" ").trim();
  let creditAmount = 0;
  // 50.000292976.010924.013647.xin cam on
  // extract credit amount from value above, should be 50.000
  // 50.000.000292976.010924.013647.xin cam on
  // extract credit amount from value above, should be 50.000.000
  // 1.000.452.324292976.010924.013647.xin cam on
  // extract credit amount from value above, should be 1.000.452.324
  const firstDotIndex = restString.indexOf(".");
  const beforeFirstDotLength = restString.slice(0, firstDotIndex).length;
  if (firstDotIndex === -1 || beforeFirstDotLength > 3) return null;

  // Loop to determine the length of the credit amount, 4. ~ 1.000.000.000.000 is enough
  for (let i = 0; i <= 4; i++) {
    const jump = i * 4;
    if (restString[firstDotIndex + jump] !== ".") {
      creditAmount = parseInt(
        restString.slice(0, firstDotIndex + jump).replaceAll(".", "")
      );
      restString = restString.slice(firstDotIndex + i).trim();
      break;
    }
  }

  return {
    date,
    docNumber,
    creditAmount,
    description: restString,
  };
}

// Function to parse and extract transactions from cleaned text
async function extractTransactionsFromPDF(filePath: string) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Clean the extracted text to focus only on the transaction lines
    const lines = cleanExtractedText(text);
    const transactionLines = processTxToEachLine(lines);
    const parsedTransactions = transactionLines.map((l) => {
      const tx = extractTransactions(l);
      if (tx) return tx;
      console.log("Failed to parse transaction:", l);
    });
    fs.writeFileSync("txs.json", JSON.stringify(parsedTransactions));
  } catch (error) {
    console.error("Error reading PDF:", error);
    return [];
  }
}

function isDateInRange(dateString: string): boolean {
  const format = "dd/MM/yyyy";
  const parsedDate = parse(dateString, format, new Date());

  // Define the date range
  const startDate = new Date(2024, 8, 1); // 01/09/2024
  const endDate = new Date(2024, 8, 10); // 10/09/2024

  // Check if the parsed date is valid and within the range
  return (
    isValid(parsedDate) &&
    isWithinInterval(parsedDate, { start: startDate, end: endDate })
  );
}

function processTxToEachLine(lines: string[]) {
  // check the whole line is a correct date in format dd/MM/yyyy by using date-fns
  // if not, append this line to the previous line
  // if yes, start a new transaction
  const txLines: string[] = [];
  const dateLineIndices = lines
    .map((line, index) => {
      if (isDateInRange(line)) return index;
    })
    .filter((v) => v !== undefined) as number[];

  for (let i = 0; i < dateLineIndices.length; i++) {
    const start = dateLineIndices[i];
    const end = dateLineIndices[i + 1];
    if (end) {
      txLines.push(lines.slice(start, end).join(" "));
    } else {
      txLines.push(lines.slice(start).join(" "));
    }
  }
  return txLines;
}

// Main function to read the PDF and insert transactions
async function main() {
  const filePath = `first100.pdf`; // Update with your actual PDF file path
  const transactions = await extractTransactionsFromPDF(filePath);
  console.log(transactions);

  // if (transactions.length > 0) {
  //   await insertTransactions(transactions);
  //   console.log("Transactions inserted successfully!");
  // } else {
  //   console.log("No transactions found or failed to parse.");
  // }

  // await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
