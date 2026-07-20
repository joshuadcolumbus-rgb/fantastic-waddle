"use client";

import { useState } from "react";
import { Wrench, Droplets, Zap, Snowflake, type LucideIcon } from "lucide-react";
import LineItemRow from "@/components/dashboard/LineItemRow";
import { formatUSD } from "@/lib/currency";

type Macro = {
  id: string;
  name: string;
  unitPriceCents: number;
  icon: LucideIcon;
};

const MACROS: Macro[] = [
  { id: "service-call", name: "Standard Service Call", unitPriceCents: 18900, icon: Wrench },
  { id: "line-snaking", name: "Main Line Snaking", unitPriceCents: 28500, icon: Droplets },
  { id: "ac-capacitor", name: "AC Capacitor Replacement", unitPriceCents: 24900, icon: Zap },
  { id: "refrigerant", name: "Refrigerant / lb", unitPriceCents: 13500, icon: Snowflake },
];

type LineItem = { id: string; name: string; unitPriceCents: number; qty: number };

export default function QuickQuotePage() {
  const [items, setItems] = useState<LineItem[]>([]);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const totalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);

  const addMacro = (macro: Macro) => {
    setInvoiceId(null);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === macro.id);
      if (existing) {
        return prev.map((i) => (i.id === macro.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: macro.id, name: macro.name, unitPriceCents: macro.unitPriceCents, qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    );

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const generateInvoice = () => {
    if (items.length === 0) return;
    setInvoiceId(`SQ-${String(Date.now()).slice(-4)}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 md:pt-10">
      <p className="font-mono text-xs tracking-[0.35em] text-amber">
        [ QUICK QUOTE ]
      </p>

      {/* the big number: readable from a ladder */}
      <div className="mt-4 border-2 border-steel/15 bg-gunmetal/60 px-5 py-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-steel/50">
          QUOTE TOTAL
        </p>
        <p className="mt-1 font-display text-6xl font-bold tabular-nums tracking-tight text-steel md:text-7xl">
          {formatUSD(totalCents)}
        </p>
        {invoiceId && (
          <p className="mt-3 border-t border-amber/30 pt-3 font-mono text-xs tracking-[0.2em] text-amber">
            ▸ INVOICE {invoiceId} QUEUED
          </p>
        )}
      </div>

      {/* macro input pad */}
      <p className="mt-8 font-mono text-[10px] tracking-[0.3em] text-steel/50">
        TAP TO ADD
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {MACROS.map((macro) => (
          <button
            key={macro.id}
            type="button"
            onClick={() => addMacro(macro)}
            className="group flex min-h-24 flex-col items-start justify-between gap-2 border border-steel/20 bg-gunmetal/40 p-4 text-left transition-colors active:border-amber active:bg-amber/10 md:hover:border-amber"
          >
            <macro.icon className="h-6 w-6 text-amber" />
            <span>
              <span className="block text-sm font-semibold leading-tight text-steel">
                {macro.name}
              </span>
              <span className="mt-1 block font-mono text-xs text-steel/50">
                {formatUSD(macro.unitPriceCents)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* line items */}
      <p className="mt-8 font-mono text-[10px] tracking-[0.3em] text-steel/50">
        LINE ITEMS — {items.length}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 border border-dashed border-steel/15 p-6 text-center font-mono text-xs tracking-[0.2em] text-steel/40">
          NO ITEMS — TAP A MACRO ABOVE
        </p>
      ) : (
        <ul className="mt-2">
          {items.map((item) => (
            <LineItemRow
              key={item.id}
              description={item.name}
              unitPriceCents={item.unitPriceCents}
              qty={item.qty}
              onIncrement={() => changeQty(item.id, 1)}
              onDecrement={() => changeQty(item.id, -1)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </ul>
      )}

      {/* heavy CTA pinned above the bottom tab bar */}
      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-steel/10 bg-carbon/95 p-4 md:bottom-0 md:left-20">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={generateInvoice}
            disabled={items.length === 0}
            className="w-full bg-amber py-4 font-mono text-sm font-bold tracking-[0.25em] text-carbon transition-colors active:bg-steel disabled:cursor-not-allowed disabled:bg-steel/15 disabled:text-steel/40 md:hover:bg-steel"
          >
            GENERATE INVOICE — {formatUSD(totalCents)}
          </button>
        </div>
      </div>
    </div>
  );
}
