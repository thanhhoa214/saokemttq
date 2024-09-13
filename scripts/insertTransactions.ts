import { Prisma, PrismaClient } from "@prisma/client";
import { isValid, isWithinInterval, parse } from "date-fns";
import fs from "fs";
import pdfParse from "pdf-parse";

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
      filteredLines.push(line);
      isTransactionSection = false;
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
  const [date, docNumber, ...rest] = line.split(" ").map((l) => l.trim());
  if (!isDateInRange(date)) return null;

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
    const nextDotLoc = firstDotIndex + i * 4;
    if (restString[nextDotLoc] !== ".") {
      creditAmount = parseInt(
        restString.slice(0, nextDotLoc).replaceAll(".", "")
      );
      restString = restString.slice(nextDotLoc).trim();
      break;
    }
  }

  const [dd, MM, yyyy] = date.split("/");

  return {
    date: new Date(`${yyyy}-${MM}-${dd}`).toISOString(),
    docNumber,
    creditAmount,
    description: restString,
    pageNumber,
  };
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

function linesToTxs(lines: string[]) {
  const txLines: { line: string; pageNumber: number }[] = [];

  const dateLineIndices = lines
    .map((line, index) => {
      if (isDateInRange(line)) return index;
      if (line.includes("Page")) {
        const pageMatch = line.match(/Page (\d+)/);
        if (pageMatch) return { index, pageNumber: parseInt(pageMatch[1]) };
      }
    })
    .filter((v) => v !== undefined);

  let currentPageNumber = 1;
  for (let i = 0; i < dateLineIndices.length; i++) {
    const start = dateLineIndices[i];
    const end = dateLineIndices[i + 1];

    if (typeof start === "object") continue;
    if (typeof end === "object") {
      txLines.push({
        line: lines.slice(start, end.index).join(" "),
        pageNumber: currentPageNumber,
      });
      currentPageNumber = end.pageNumber + 1;
    } else {
      if (end) {
        txLines.push({
          line: lines.slice(start, end).join(" "),
          pageNumber: currentPageNumber,
        });
      } else {
        txLines.push({
          line: lines.slice(start).join(" "),
          pageNumber: currentPageNumber,
        });
      }
    }
  }

  return txLines.map(({ line, pageNumber }) => {
    const tx = lineToTx(line, pageNumber);
    if (!tx) console.error(`Failed to parse: ${line}`);
    return tx;
  });
}

// Main function to read the PDF and insert transactions
async function main() {
  const prisma = new PrismaClient();
  const filePath = `all.pdf`; // Update with your actual PDF file path
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);
  const text = data.text;
  const lines = cleanExtractedText(text);
  const transactionLines = linesToTxs(lines).filter((tx) => tx !== null);
  const { count } = await prisma.transaction.createMany({
    data: transactionLines,
  });
  console.log(`Inserted ${count} transactions`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
