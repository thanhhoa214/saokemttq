"use server";
import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export async function getStatistic() {
  const totalCount = await prisma.transaction.count();
  const ranges = [
    0, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000,
    5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000,
    1_000_000_000,
  ];
  const histogram = await Promise.all(
    ranges.map(async (min, index) => {
      const max = ranges[index + 1] || Number.MAX_SAFE_INTEGER;
      const count = await prisma.transaction.count({
        where: {
          creditAmount: {
            gte: min,
            ...(index < ranges.length - 1 ? { lt: max } : {}),
          },
        },
      });
      return { min, max, count };
    })
  );

  const histogramDate = await prisma.transaction.groupBy({
    by: ["date"],
    _count: { _all: true },
  });
  return { totalCount, histogram, histogramDate };
}

export type Statistics = Prisma.PromiseReturnType<typeof getStatistic>;
