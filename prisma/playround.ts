import { prisma } from "./client";

(async () => {
  const total = await prisma.transaction.count();
  console.log(total);
})();
