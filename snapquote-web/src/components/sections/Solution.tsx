"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Beat 2 (morph): copy scrubs in while the manifold snaps into the grid and
 * the invoice materializes, then hands off before the fracture.
 */
export default function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (scrollState.reducedMotion) return;
      const mm = gsap.matchMedia();
      // On mobile the scrub baseline starts below the navbar frame footprint.
      mm.add(
        { isMobile: "(max-width: 768px)", isDesktop: "(min-width: 769px)" },
        (context) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: context.conditions?.isMobile ? "top top+=80" : "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });
          tl.fromTo(
            contentRef.current,
            { opacity: 0, y: 70, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.28,
              ease: "none",
            },
          )
            .to({}, { duration: 0.5 })
            .to(contentRef.current, {
              opacity: 0,
              y: -50,
              duration: 0.22,
              ease: "none",
            });
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center px-6 pt-24 md:px-16">
        <div ref={contentRef} data-scrub className="text-halo -m-8 max-w-2xl p-8">
          <p className="mb-6 font-mono text-xs tracking-[0.35em] text-amber">
            [ 002 / SNAP TO GRID ]
          </p>
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[0.95] tracking-tight text-steel">
            Snap into order.
          </h2>
          <p className="mt-8 max-w-lg text-lg font-medium leading-8 text-steel/90">
            Every pipe, panel, and part — quoted, templated, and billed from
            one screen. SnapQuote locks your whole workflow into place, from
            the first site photo to the final payment.
          </p>
        </div>
      </div>
    </section>
  );
}
