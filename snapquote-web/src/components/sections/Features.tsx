"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// One block per fractured pane; alignment mirrors the pane fan
// (left pane → copy on the right, and so on).
const FEATURES = [
  {
    index: "01",
    title: "Instant Quoting",
    body: "Site photo to signed quote in under two minutes. Materials, labor, margin — priced before you leave the driveway.",
    align: "md:ml-auto md:text-right",
  },
  {
    index: "02",
    title: "Multi-Trade Templates",
    body: "HVAC changeouts, service upgrades, repipes. Battle-tested templates for every trade, tuned to your numbers.",
    align: "",
  },
  {
    index: "03",
    title: "Automated Billing",
    body: "Invoices fire the moment the job closes. Deposits, progress draws, net-30 chasing — handled.",
    align: "md:ml-auto md:text-right",
  },
] as const;

/**
 * Beat 3 (fracture): each block fades in beside its glass pane as the
 * invoice fans out.
 */
export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (scrollState.reducedMotion) return;
      gsap.utils
        .toArray<HTMLElement>("[data-feature]")
        .forEach((block) => {
          gsap.fromTo(
            block,
            { opacity: 0, y: 60, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "none",
              scrollTrigger: {
                trigger: block,
                start: "top 70%",
                end: "top 30%",
                scrub: 1,
              },
            },
          );
        });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative">
      {FEATURES.map((feature) => (
        <div
          key={feature.index}
          className="flex min-h-[90vh] items-center px-6 pt-24 md:px-16"
        >
          <div
            data-feature
            data-scrub
            className={`max-w-sm rounded-2xl bg-carbon/40 p-6 backdrop-blur-md ${feature.align}`}
          >
            <p className="mb-4 font-mono text-xs tracking-[0.35em] text-amber">
              [ {feature.index} ]
            </p>
            <h3 className="font-display text-3xl font-bold tracking-tight text-steel md:text-4xl">
              {feature.title}
            </h3>
            <p className="mt-5 font-medium leading-7 text-steel/90">
              {feature.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
