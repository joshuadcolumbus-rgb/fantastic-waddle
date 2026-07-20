import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

const STATS = [
  { label: "QUOTED TODAY", value: "$1,240" },
  { label: "JOBS OPEN", value: "3" },
  { label: "UNPAID", value: "2" },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
      <p className="font-mono text-xs tracking-[0.35em] text-amber">
        [ CREW HOME ]
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-steel">
        Morning. 3 jobs on the board.
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border border-steel/15 bg-gunmetal/40 p-4"
          >
            <p className="font-mono text-[9px] tracking-[0.25em] text-steel/50">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-steel">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/quick-quote"
        className="mt-6 flex items-center justify-between border-2 border-amber bg-amber/10 p-5 transition-colors hover:bg-amber/20"
      >
        <span className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-amber" />
          <span className="font-mono text-sm font-bold tracking-[0.2em] text-steel">
            START A QUICK QUOTE
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-amber" />
      </Link>
    </div>
  );
}
