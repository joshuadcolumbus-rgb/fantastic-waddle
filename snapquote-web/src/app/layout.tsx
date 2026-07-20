import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapQuote",
  description: "Forged for the trades.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      {/* no bg on body — it would paint over the -z-10 canvas; html carries it.
          Smooth scroll (Lenis + GSAP) is scoped to the (marketing) group so the
          dashboard stays a lightweight standard-DOM app.
          DO NOT put <Experience /> here — it must stay under (marketing) only. */}
      <body className="font-display text-steel">{children}</body>
    </html>
  );
}
