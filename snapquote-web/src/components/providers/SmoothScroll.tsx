"use client";

import { useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Lenis ↔ GSAP lockstep: Lenis owns the scroll position, GSAP's ticker owns
 * time. ScrollTrigger updates only on Lenis scroll events so both systems
 * read one consistent scroll value per frame.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      scrollState.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Reduced motion: native scrolling, no smoothing — sections render in
      // their resting states and the canvas jump-cuts between beats.
      if (scrollState.reducedMotion) return;

      const lenis = new Lenis({ syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    { scope: wrapper },
  );

  return <div ref={wrapper}>{children}</div>;
}
