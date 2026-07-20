import SmoothScroll from "@/components/providers/SmoothScroll";

// The scroll-scrubbed WebGL experience lives only under this group; the
// (dashboard) group must never load Lenis, GSAP, or three.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
