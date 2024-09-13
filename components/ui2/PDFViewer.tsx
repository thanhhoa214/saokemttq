"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { useWindowSize } from "usehooks-ts";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFViewer({
  textRenderer,
  pageNumber,
}: {
  pageNumber: number;
  textRenderer: (textItem: { str: string }) => string;
}) {
  const { width } = useWindowSize();

  return (
    <Document file="/all.pdf">
      <Page
        pageNumber={pageNumber}
        customTextRenderer={textRenderer}
        width={width > 768 ? 800 : width * 0.8}
      />
    </Document>
  );
}
