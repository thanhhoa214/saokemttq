import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["vietnamese"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Check VAR từ MTTQVN bởi Hòa",
  description:
    "Sao kê tài khoản VCB MTTQVN từ ngày 01/09/2024 đến 10/09/2024. Trích dẫn thông tin chân thực từ sao kê MTTQVN.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
