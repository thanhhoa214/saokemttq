"use client";
import { FilterTransactionsParams } from "@/app/actions/searchTransactions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatVnd } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export default function TransactionFilter({
  filter,
  onFilterChange,
  totalCount,
  children,
}: {
  filter: FilterTransactionsParams;
  onFilterChange: (filterParams: FilterTransactionsParams) => void;
  totalCount: number;
  children: React.ReactNode;
}) {
  const [nameFilter, setNameFilter] = useState(filter.nameFilter || "");
  const [amount, setAmount] = useState(filter.amount);
  const [sortConfig, setSortConfig] = useState<
    FilterTransactionsParams["sortConfig"]
  >(filter.sortConfig);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilterChange({
      nameFilter,
      amount,
      sortConfig,
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1 text-sm md:text-base"
      >
        <h2 className="text-lg font-semibold mb-2">Bộ lọc</h2>
        <label htmlFor="name">Lọc theo tên</label>
        <Input
          id="name"
          placeholder="Lọc theo tên"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="mb-2"
        />

        <label htmlFor="amount">Lọc theo số tiền</label>
        <Input
          id="amount"
          placeholder="Lọc theo số tiền"
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="mb-2"
        />
        <div>
          <h2 className="text-lg font-semibold mb-2">Sắp xếp theo</h2>
          <Select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onValueChange={(value) => {
              const [key, direction] = value.split("-") as [
                FilterTransactionsParams["sortConfig"]["key"],
                "asc" | "desc"
              ];
              setSortConfig({ key, direction });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trường và hướng để sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Cũ nhất</SelectItem>
              <SelectItem value="date-desc">Mới nhất</SelectItem>
              <SelectItem value="creditAmount-asc">
                Số tiền quyên góp tăng dần
              </SelectItem>
              <SelectItem value="creditAmount-desc">
                Số tiền quyên góp giảm dần
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="mt-4">
          Áp dụng
        </Button>
      </form>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant={"ghost"}
            className="flex flex-col items-center mt-4 border border-dashed p-4 w-full h-auto rounded-lg animate-pulse bg-green-200"
          >
            <p className="text-sm text-muted-foreground">
              Tổng số giao dịch: <strong>{formatVnd(totalCount)}</strong>
            </p>
            <span className="inline-flex items-center">
              Xem thêm thống kê <ArrowRight size={20} className="ml-1" />
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">{children}</SheetContent>
      </Sheet>
    </>
  );
}
