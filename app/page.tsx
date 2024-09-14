import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TransactionStatisticByAmount } from "@/components/ui2/TransactionStatisticByAmount";
import { TransactionStatisticByDate } from "@/components/ui2/TransactionStatisticByDate";
import TransactionTable from "@/components/ui2/TransactionTable";
import { prisma } from "@/prisma/client";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { getStatistic } from "./actions/getStatistics";
import { filterTransactions } from "./actions/searchTransactions";

export default async function Page() {
  const transactions = await filterTransactions({
    sortConfig: { key: "date", direction: "asc" },
  });
  const totalCount = await prisma.transaction.count();
  const statistics = await getStatistic();

  return (
    <div className="container mx-auto p-4 sm:px-2">
      <header className="flex justify-between items-center gap-2 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Check VAR 🧙</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Sao kê tài khoản &quot;MAT TRAN TO QUOC VN - BAN CUU TRO TW&quot;
          </p>
          <p className="text-muted-foreground text-xs md:text-sm">
            Từ ngày 01/09/2024 đến 10/09/2024 (VCB) và 10/09/2024 đến 12/09/2024
            (VietinBank)
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 text-sm leading-4 shrink-0">
          <div className="flex flex-col">
            Thực hiện bởi{" "}
            <Link
              href={"https://thanhhoa214.netlify.app/"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              Thanh Hòa 🇻🇳
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 md:w-10 md:h-10">
              <AvatarImage
                src={"https://avatars.githubusercontent.com/u/32329202?v=4"}
              />
              <AvatarFallback>Thanh Hòa</AvatarFallback>
            </Avatar>

            <Link
              href={"https://github.com/thanhhoa214/saokemttq"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubLogoIcon width={24} height={24} />
            </Link>
          </div>
        </div>
      </header>

      <TransactionTable
        serverTransactions={transactions}
        totalCount={totalCount}
      >
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <TransactionStatisticByDate
            histogramDate={statistics.histogramDate}
          />
          <TransactionStatisticByAmount histogram={statistics.histogram} />
        </div>
      </TransactionTable>
    </div>
  );
}
