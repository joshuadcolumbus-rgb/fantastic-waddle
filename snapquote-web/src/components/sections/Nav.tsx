"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Smart-hiding navbar: slides up and out while scrolling down (freeing the
 * top of small viewports for the section copy), drops back on any upward
 * scroll. Stays put entirely under reduced motion.
 */
export default function Nav() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (scrollState.reducedMotion) return;
      const slide = gsap.quickTo(ref.current, "yPercent", {
        duration: 0.4,
        ease: "power3.out",
      });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          slide(self.direction === 1 && self.scroll() > 120 ? -100 : 0);
        },
      });
    },
    { scope: ref },
  );

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6 md:h-20 md:px-10"
    >
      <a href="#" className="group flex items-center gap-3">
        <span className="block h-2.5 w-2.5 bg-amber transition-transform duration-300 group-hover:rotate-45" />
        <span className="font-mono text-sm tracking-[0.3em] text-steel">
          SNAPQUOTE
        </span>
      </a>
      <a
        href="#early-access"
        className="border border-steel/20 px-4 py-2 font-mono text-xs tracking-[0.2em] text-steel/80 transition-colors duration-300 hover:border-amber hover:text-amber"
      >
        GET EARLY ACCESS
      </a>
    </header>
  );
}
