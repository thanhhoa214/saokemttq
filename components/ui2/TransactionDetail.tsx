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
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { useWindowSize } from "usehooks-ts";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const { width } = useWindowSize();

  return (
    <Dialog
      open={!!selectedTransaction}
      onOpenChange={() => setSelectedTransaction(null)}
    >
      <DialogContent className="max-w-4xl overflow-auto max-h-[92vh]">
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
            <div className="bg-gray-200 p-2 rounded max-h-80 max-w-[32rem] overflow-auto md:w-2/3">
              <Document file="/all.pdf">
                <Page
                  pageNumber={selectedTransaction.pageNumber}
                  customTextRenderer={textRenderer}
                  width={width > 768 ? 800 : width * 0.8}
                />
              </Document>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetail;
