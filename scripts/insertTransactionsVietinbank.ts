import { Bank, Prisma, PrismaClient } from "@prisma/client";
import { isValid, isWithinInterval, parse } from "date-fns";
import fs from "fs";
import pdfParse from "pdf-parse";

// Function to clean and extract relevant transaction lines from the PDF content
function cleanExtractedText(text: string): string[] {
  // Filter out non-transaction content based on known patterns
  const lines = text.split("\n");
  const filteredLines: string[] = [];
  let isTransactionSection = true;

  for (const line of lines) {
    // Start capturing transaction lines after the "Transactions in detail" section
    if (
      line.includes("STTNgày GDMô tả giao dịchTên đối ứng") ||
      line.includes("NoDate TimeTransaction CommentOffset Name") ||
      line.includes("Số tiền") ||
      line.includes("(Có) Credit") ||
      line.includes("## Page 1")
    ) {
      isTransactionSection = true;
      continue;
    }

    // Stop capturing transaction lines before footer
    if (line.includes("Page 1 of 1")) {
      isTransactionSection = false;
      continue;
    }

    if (isTransactionSection && line.trim() !== "") {
      filteredLines.push(line.trim());
    }
  }
  return filteredLines;
}

function lineToTx(
  line: string,
  pageNumber: number
): Prisma.TransactionCreateInput | null {
  const [index, date, creditStr, ...descriptionArr] = line
    .split(" ")
    .map((l) => l.trim());
  if (!creditStr) return null;
  const creditAmount = parseFloat(creditStr);
  const description = descriptionArr.join(" ");

  return {
    date: date.slice(0, 10), // Extract date part only, ignore
    time: date.slice(11), // Extract time part only, ignore
    docNumber: `VTB-${index}`,
    creditAmount,
    description,
    pageNumber,
  };
}

function isDateInRange(dateString: string): boolean {
  const format = "dd/MM/yyyy";
  const parsedDate = parse(dateString, format, new Date());

  // Define the date range
  const startDate = new Date(2024, 8, 10); // 10/09/2024
  const endDate = new Date(2024, 8, 12); // 12/09/2024

  // Check if the parsed date is valid and within the range
  return (
    isValid(parsedDate) &&
    isWithinInterval(parsedDate, { start: startDate, end: endDate })
  );
}

function linesToTxs(lines: string[], jsonLines: string[]) {
  const txLines: { line: string; pageNumber: number }[] = [];
  const dateLineIndices = lines
    .map((line, index) => {
      const shouldBeIndex = /^\d+$/.test(line.slice(0, -10));
      const last10Chars = line.slice(-10);
      if (shouldBeIndex && isDateInRange(last10Chars)) return index;
      if (line.includes("Page")) {
        const pageMatch = line.match(/## Page (\d+)/);
        if (pageMatch) return { index, pageNumber: parseInt(pageMatch[1]) };
      }
    })
    .filter((v) => v !== undefined);

  let preLastIndexOfPage = 0;
  let currentPageNumber = 1;

  for (let i = 0; i < dateLineIndices.length; i++) {
    const start = dateLineIndices[i];
    const end = dateLineIndices[i + 1];
    if (typeof start === "object") continue;
    if (typeof end === "object") {
      const indexShouldBeNumber = /^\d+$/.test(lines[start].slice(0, -10));
      if (indexShouldBeNumber) {
        const index = parseInt(lines[start].slice(0, -10));
        for (
          let jsonLineIndex = preLastIndexOfPage;
          jsonLineIndex < index;
          jsonLineIndex++
        ) {
          const jsonLine = jsonLines[jsonLineIndex];
          txLines.push({ line: jsonLine, pageNumber: currentPageNumber });
        }
        currentPageNumber = end.pageNumber - 1;
        preLastIndexOfPage = index;
      }
    }
  }

  return txLines.map(({ line, pageNumber }) => {
    const tx = lineToTx(line, pageNumber);
    if (!tx) console.error(`Failed to parse: ${line} ${pageNumber}`);
    return tx;
  });
}

const options: pdfParse.Options = {
  pagerender: function (pageData) {
    return pageData
      .getTextContent()
      .then(function (textContent: {
        items: { str: string; transform: number[] }[];
      }) {
        let lastY,
          text = "";
        for (const item of textContent.items) {
          if (lastY != item.transform[5] || !lastY) {
            text += "\n";
          }
          text += item.str;
          lastY = item.transform[5];
        }
        return text;
      });
  },
};

// Main function to read the PDF and insert transactions
async function main() {
  const prisma = new PrismaClient();
  const pdfPath = `vietinbank.pdf`;
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer, options);
  let result = "";
  data.text.split("\n\n").forEach((page, index) => {
    result += `## Page ${index + 1}\n${page}\n`;
  });
  const rawLines = cleanExtractedText(result);
  const jsonPath = `data-sao-ke-mttq-2024.json`;
  const file = fs.readFileSync(jsonPath, "utf-8");
  const json = JSON.parse(file);
  const lines = (
    json as Array<{ date: string; amount: number; notes: string; code: string }>
  ).map((tx, index) => {
    const des = tx.notes.replace(/\n/g, " ");
    const code = tx.code.replace(/\n/g, " ");
    return `${index + 1} ${tx.date} ${tx.amount} ${des} từ tài khoản ${code}`;
  });
  const txs = linesToTxs(rawLines, lines).filter((tx) => tx !== null);

  await prisma.transaction.deleteMany({
    where: { bank: Bank.VietinBank },
  });

  const { count } = await prisma.transaction.createMany({
    data: txs.map((tx) => ({
      date: new Date(tx.date).toISOString(),
      time: tx.time,
      docNumber: tx.docNumber,
      creditAmount: tx.creditAmount,
      description: tx.description,
      pageNumber: tx.pageNumber,
      bank: Bank.VietinBank,
    })),
  });
  console.log(`Inserted ${count} transactions`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
