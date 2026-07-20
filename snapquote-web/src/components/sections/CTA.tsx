"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (scrollState.reducedMotion) return;
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 40%",
            scrub: 1,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="early-access"
      ref={sectionRef}
      className="relative flex min-h-[90vh] items-center justify-center px-6 pt-24"
    >
      <div
        ref={contentRef}
        data-scrub
        className="flex flex-col items-center rounded-2xl bg-carbon/40 p-8 text-center backdrop-blur-md"
      >
        <p className="mb-6 font-mono text-xs tracking-[0.35em] text-amber">
          [ 004 / DEPLOY ]
        </p>
        <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight text-steel">
          Put your paperwork on rails.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg font-medium leading-8 text-steel/90">
          Join the early-access crew and be first on the grid when SnapQuote
          ships.
        </p>
        <a
          href="mailto:crew@snapquote.app?subject=Early%20access"
          className="mt-10 inline-block bg-amber px-8 py-4 font-mono text-sm tracking-[0.2em] text-carbon transition-colors duration-300 hover:bg-steel"
        >
          GET EARLY ACCESS
        </a>
        <p className="mt-6 font-mono text-[10px] tracking-[0.3em] text-steel/40">
          IOS · ANDROID — BUILT FOR THE FIELD
        </p>
      </div>
    </section>
  );
}
