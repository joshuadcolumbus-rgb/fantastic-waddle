import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "SnapQuote",
    template: "%s | SnapQuote",
  },
  description:
    "Instant, professional quotes for the trades. Built for speed on the job site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-carbon text-steel">{children}</body>
    </html>
  );
}
