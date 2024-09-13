"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useWindowSize } from "usehooks-ts";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewer({
  textRenderer,
  pageNumber,
}: {
  pageNumber: number;
  textRenderer: (textItem: { str: string }) => string;
}) {
  const { width } = useWindowSize();
  const calculatedWidth = width > 768 ? 640 : width * 0.8;
  const calculatedHeight = calculatedWidth * 1.414;

  return (
    <Document file="/all.pdf">
      <Page
        pageNumber={pageNumber}
        customTextRenderer={textRenderer}
        width={calculatedWidth}
        height={calculatedHeight}
      />
    </Document>
  );
}
