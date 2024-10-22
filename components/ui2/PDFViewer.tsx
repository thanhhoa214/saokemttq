"use client";
import { Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useWindowSize } from "usehooks-ts";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewer({
  filePath,
  pageNumber,
  textRenderer,
}: {
  filePath: string;
  pageNumber: number;
  textRenderer: (textItem: { str: string }) => string;
}) {
  const { width } = useWindowSize();
  const calculatedWidth = width > 768 ? 640 : width * 0.8;
  const calculatedHeight = calculatedWidth * 1.414;

  return (
    <Document file={filePath} loading={<Loader2 className="animate-spin" />}>
      <Page
        pageNumber={pageNumber}
        customTextRenderer={textRenderer}
        width={calculatedWidth}
        height={calculatedHeight}
        loading={<Loader2 className="animate-spin" />}
      />
    </Document>
  );
}
