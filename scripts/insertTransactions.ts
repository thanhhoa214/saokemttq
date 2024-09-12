import { PrismaClient } from "@prisma/client";
import fs from "fs";
import pdfParse from "pdf-parse";

const prisma = new PrismaClient();

// Define the interface for transaction data
interface ParsedTransaction {
  date: Date;
  docNumber: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balance: number;
  description: string;
}

// Function to parse PDF and extract transactions
async function extractTransactionsFromPDF(
  filePath: string
): Promise<ParsedTransaction[]> {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Extract transactions using regex or string parsing
    // Adjust parsing logic based on your PDF structure
    const transactions: ParsedTransaction[] = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{4})\s+(\S+)\s+(\d+(\.\d+)?)\s+(\d+(\.\d+)?)?\s+(\d+(\.\d+)?)\s+(.+)/
      );
      if (match) {
        const date = new Date(match[1]);
        const docNumber = match[2];
        const debitAmount = match[3] ? parseFloat(match[3]) : null;
        const creditAmount = match[5] ? parseFloat(match[5]) : null;
        const balance = parseFloat(match[7]);
        const description = match[8];

        transactions.push({
          date,
          docNumber,
          debitAmount,
          creditAmount,
          balance,
          description,
        });
      }
    });

    return transactions;
  } catch (error) {
    console.error("Error reading PDF:", error);
    return [];
  }
}

// Function to insert transactions into the database
async function insertTransactions(transactions: ParsedTransaction[]) {
  for (const transaction of transactions) {
    try {
      await prisma.transaction.create({
        data: transaction,
      });
      console.log(`Inserted transaction ${transaction.docNumber}`);
    } catch (error) {
      console.error(
        `Failed to insert transaction ${transaction.docNumber}:`,
        error
      );
    }
  }
}

// Main function to read the PDF and insert transactions
async function main() {
  const filePath = "./path/to/your/pdf/file.pdf"; // Update with your actual PDF file path
  const transactions = await extractTransactionsFromPDF(filePath);

  if (transactions.length > 0) {
    await insertTransactions(transactions);
    console.log("Transactions inserted successfully!");
  } else {
    console.log("No transactions found or failed to parse.");
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
