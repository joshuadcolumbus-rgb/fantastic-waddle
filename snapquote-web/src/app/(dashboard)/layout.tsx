import type { Metadata } from "next";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const metadata: Metadata = {
  title: "SnapQuote Terminal",
  description: "Quote, invoice, get paid — from the driveway.",
};

// Standard-DOM app shell. No three, no gsap, no lenis in this group — native
// scrolling only.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-carbon">
      <DashboardNav />
      <main className="pb-24 md:pb-8 md:pl-20">{children}</main>
    </div>
  );
}
