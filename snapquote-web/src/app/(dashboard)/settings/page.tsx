const SETTINGS = [
  { label: "CREW & TRUCKS", detail: "2 techs · 1 van" },
  { label: "RATE CARD", detail: "Residential default" },
  { label: "TAX & REGION", detail: "NY — 8.875%" },
  { label: "PAYOUTS", detail: "Daily · ACH ····4921" },
] as const;

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
      <p className="font-mono text-xs tracking-[0.35em] text-amber">
        [ SETTINGS ]
      </p>
      <ul className="mt-5">
        {SETTINGS.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between border-b border-steel/10 py-5"
          >
            <span className="font-mono text-xs tracking-[0.2em] text-steel">
              {s.label}
            </span>
            <span className="font-mono text-xs text-steel/50">{s.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
