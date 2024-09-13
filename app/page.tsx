"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Transaction = {
  date: string;
  docNumber: string;
  creditAmount: string;
  balance?: string;
  description: string;
  pageNumber: number;
};

const mockTransactions: Transaction[] = [
  {
    date: "01/09/2024",
    docNumber: "5213.45946",
    creditAmount: "50.000",
    balance: "10.847.331.843",
    description: "292976.010924.013647.xin cam on",
    pageNumber: 1,
  },
  {
    date: "05/09/2024",
    docNumber: "5090.85797",
    creditAmount: "3.000.000",
    description:
      "VCB.CTDK.31/03/2024.ADIDA PHAT. CT tu 0481000755821 toi 0011001932418 MAT TRAN TO QUOC VN - BAN CUU TRO TW",
    pageNumber: 2,
  },
  {
    date: "10/09/2024",
    docNumber: "5388.96713",
    creditAmount: "1.000.000.000",
    balance: "10.856.695.843",
    description:
      "MBVCB.6916176124.CAO VIET TUAN chuyen tien.CT tu 0101001222009 CAO VIET TUAN toi 0011001932418 MAT TRAN TO QUOC VN - BAN CUU TRO TW",
    pageNumber: 3,
  },
];

export default function Component() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [nameFilter, setNameFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  }>({ key: "date", direction: "asc" });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    let result = transactions;

    if (dateFilter) {
      result = result.filter((t) => new Date(t.date) >= dateFilter);
    }

    if (nameFilter) {
      result = result.filter((t) =>
        t.description.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (amountFilter) {
      result = result.filter(
        (t) =>
          parseFloat(t.creditAmount.replace(/\./g, "")) >=
          parseFloat(amountFilter.replace(/\./g, ""))
      );
    }

    result.sort((a, b) => {
      // if (sortConfig.key === "creditAmount") {
      return sortConfig.direction === "asc"
        ? parseFloat(a.creditAmount.replace(/\./g, "")) -
            parseFloat(b.creditAmount.replace(/\./g, ""))
        : parseFloat(b.creditAmount.replace(/\./g, "")) -
            parseFloat(a.creditAmount.replace(/\./g, ""));
      // }
      // return sortConfig.direction === "asc"
      //   ? a[sortConfig.key]?.localeCompare(b[sortConfig.key])
      //   : b[sortConfig.key]?.localeCompare(a[sortConfig.key]);
    });

    setFilteredTransactions(result);
  }, [transactions, dateFilter, nameFilter, amountFilter, sortConfig]);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Account Statement Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Filter by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Input
          placeholder="Filter by amount"
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => handleSort("date")}
              className="cursor-pointer"
            >
              Date{" "}
              {sortConfig.key === "date" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUpIcon className="inline" />
                ) : (
                  <ChevronDownIcon className="inline" />
                ))}
            </TableHead>
            <TableHead>Doc Number</TableHead>
            <TableHead
              onClick={() => handleSort("creditAmount")}
              className="cursor-pointer"
            >
              Credit Amount{" "}
              {sortConfig.key === "creditAmount" &&
                (sortConfig.direction === "asc" ? (
                  <ChevronUpIcon className="inline" />
                ) : (
                  <ChevronDownIcon className="inline" />
                ))}
            </TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Page</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction, index) => (
            <TableRow
              key={index}
              onClick={() => setSelectedTransaction(transaction)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.docNumber}</TableCell>
              <TableCell>{transaction.creditAmount}</TableCell>
              <TableCell>{transaction.balance || "-"}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.pageNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold">Date:</h3>
                <p>{selectedTransaction.date}</p>
                <h3 className="font-bold mt-2">Doc Number:</h3>
                <p>{selectedTransaction.docNumber}</p>
                <h3 className="font-bold mt-2">Credit Amount:</h3>
                <p>{selectedTransaction.creditAmount}</p>
                <h3 className="font-bold mt-2">Balance:</h3>
                <p>{selectedTransaction.balance || "-"}</p>
                <h3 className="font-bold mt-2">Description:</h3>
                <p>{selectedTransaction.description}</p>
                <h3 className="font-bold mt-2">Page Number:</h3>
                <p>{selectedTransaction.pageNumber}</p>
              </div>
              <div className="bg-gray-200 p-4 rounded">
                <h3 className="font-bold mb-2">PDF Preview</h3>
                <p>
                  PDF content for page {selectedTransaction.pageNumber} would be
                  displayed here.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
