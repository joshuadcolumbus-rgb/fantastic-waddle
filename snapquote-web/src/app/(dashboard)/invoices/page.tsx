const INVOICES = [
  { id: "SQ-2087", client: "Hendricks Residence", amount: "$474.00", status: "PAID" },
  { id: "SQ-2088", client: "Bay Ridge Deli", amount: "$1,120.00", status: "SENT" },
  { id: "SQ-2089", client: "Munoz HVAC Retrofit", amount: "$689.00", status: "OVERDUE" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  PAID: "text-steel/50 border-steel/20",
  SENT: "text-amber border-amber/40",
  OVERDUE: "text-amber border-amber bg-amber/10",
};

export default function InvoicesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
      <p className="font-mono text-xs tracking-[0.35em] text-amber">
        [ INVOICES ]
      </p>
      <ul className="mt-5">
        {INVOICES.map((inv) => (
          <li
            key={inv.id}
            className="flex items-center gap-4 border-b border-steel/10 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-steel/50">{inv.id}</p>
              <p className="truncate font-medium text-steel">{inv.client}</p>
            </div>
            <span className="font-mono font-bold tabular-nums text-steel">
              {inv.amount}
            </span>
            <span
              className={`border px-2 py-1 font-mono text-[10px] tracking-widest ${STATUS_STYLE[inv.status]}`}
            >
              {inv.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
