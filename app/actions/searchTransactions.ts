"use server";

import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export interface FilterTransactionsParams {
  nameFilter?: string;
  amount?: number;
  currentPage?: number;
  sortConfig: { key: "date" | "creditAmount"; direction: Prisma.SortOrder };
}

export async function filterTransactions({
  nameFilter,
  amount,
  sortConfig,
  currentPage = 1,
}: FilterTransactionsParams) {
  const itemsPerPage = 20;
  const hasAmount = amount && amount > 0;
  const isSortByDate = sortConfig.key === "date";

  const result = await prisma.transaction.findMany({
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
    where: {
      description: {
        contains: nameFilter,
      },
      creditAmount: hasAmount ? { gte: amount } : {},
    },
    orderBy: isSortByDate
      ? { date: sortConfig.direction }
      : { creditAmount: sortConfig.direction === "asc" ? "asc" : "desc" },
  });

  return result;
}
