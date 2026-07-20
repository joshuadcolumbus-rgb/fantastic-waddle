"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Beat 1 (dive): the hero holds sticky while the camera dives through the
 * manifold, its type scrubbing out over the first 60% of the section.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Pin the resting state before any trigger exists so the type can never
      // render blurred or faded at scroll 0 (fresh load or restored position).
      gsap.set(contentRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
      if (scrollState.reducedMotion) return;
      const mm = gsap.matchMedia();
      // On mobile the scrub baseline starts below the navbar frame footprint.
      mm.add(
        { isMobile: "(max-width: 768px)", isDesktop: "(min-width: 769px)" },
        (context) => {
          gsap.fromTo(
            contentRef.current,
            { opacity: 1, y: 0, filter: "blur(0px)" },
            {
              opacity: 0,
              y: -90,
              filter: "blur(10px)",
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: context.conditions?.isMobile ? "top top+=80" : "top top",
                end: "60% top",
                scrub: 1,
              },
            },
          );
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 pt-24 md:px-16">
        <div ref={contentRef} data-scrub className="text-halo -m-8 p-8">
          <p className="mb-6 font-mono text-xs tracking-[0.35em] text-amber">
            [ 001 / FIELD REPORT ]
          </p>
          <h1 className="max-w-5xl font-display text-[clamp(3rem,11vw,9.5rem)] font-bold leading-[0.9] tracking-tight text-steel">
            The chaos of
            <br />
            the trade.
          </h1>
          <p className="mt-8 max-w-md font-mono text-sm leading-6 text-steel/75">
            Twelve jobs. Three crews. Zero paperwork done. SnapQuote turns the
            mess into money — quoting and invoicing built for HVAC, plumbing,
            and electrical.
          </p>
        </div>
        <div className="absolute bottom-10 left-6 flex items-center gap-4 md:left-16">
          <span className="block h-px w-16 bg-amber/60" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-steel/40">
            SCROLL TO ENTER THE MANIFOLD
          </span>
        </div>
      </div>
    </section>
  );
}
