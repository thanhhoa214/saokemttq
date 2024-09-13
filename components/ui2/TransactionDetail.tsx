"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDdMmYyyy, formatVnd } from "@/lib/utils";
import { Transaction } from "@prisma/client";
import { useCallback } from "react";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./PDFViewer"), { ssr: false });

function highlightPattern(text: string, patterns: string[]) {
  let result = text;
  patterns.forEach((pattern) => {
    result = result.replace(pattern, (value) => `<mark>${value}</mark>`);
  });
  return result;
}

type TransactionDetailProps = {
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (transaction: Transaction | null) => void;
};

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  selectedTransaction,
  setSelectedTransaction,
}) => {
  const textRenderer = useCallback(
    (textItem: { str: string }) =>
      highlightPattern(
        textItem.str,
        selectedTransaction
          ? [
              selectedTransaction.docNumber,
              formatVnd(selectedTransaction.creditAmount),
            ]
          : []
      ),
    [selectedTransaction]
  );

  return (
    <Dialog
      open={!!selectedTransaction}
      onOpenChange={() => setSelectedTransaction(null)}
    >
      <DialogContent className="max-w-4xl overflow-hidden max-h-[92vh]">
        <DialogHeader>
          <DialogTitle>Sao kê chi tiết giao dịch</DialogTitle>
        </DialogHeader>
        {selectedTransaction && (
          <div className="flex flex-col md:flex-row gap-4 text-sm md:text-base">
            <div className="md:w-1/3">
              <h3 className="font-bold">Date:</h3>
              <p>{formatDdMmYyyy(selectedTransaction.date)}</p>
              <h3 className="font-bold mt-2">Doc Number:</h3>
              <p>{selectedTransaction.docNumber}</p>
              <h3 className="font-bold mt-2">Credit Amount:</h3>
              <p>{formatVnd(selectedTransaction.creditAmount)}</p>
              <h3 className="font-bold mt-2">Description:</h3>
              <p className="break-words">{selectedTransaction.description}</p>
              <h3 className="font-bold mt-2">Page Number:</h3>
              <p>{selectedTransaction.pageNumber}</p>
            </div>
            <div className="bg-gray-200 p-2 rounded max-h-[80vh] max-w-[34rem] overflow-auto w-fit">
              <PDFViewer
                textRenderer={textRenderer}
                pageNumber={selectedTransaction.pageNumber}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetail;
