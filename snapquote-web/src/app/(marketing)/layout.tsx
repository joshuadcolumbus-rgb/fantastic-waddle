import SmoothScroll from "@/components/providers/SmoothScroll";
import Experience from "@/components/canvas/Experience";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      {/* Fixed WebGL canvas — scoped to the (marketing) group only. */}
      <Experience />
      <main className="relative z-10">{children}</main>
    </SmoothScroll>
  );
}
