"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";

type LineItemRowProps = {
  description: string;
  unitPriceCents: number;
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

/**
 * One invoice line, built for gloved thumbs: 44px minimum hit areas on every
 * control, unmissable trash target, line total hard-right.
 */
export default function LineItemRow({
  description,
  unitPriceCents,
  qty,
  onIncrement,
  onDecrement,
  onRemove,
}: LineItemRowProps) {
  return (
    <li className="flex items-center gap-3 border-b border-steel/10 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-steel">{description}</p>
        <p className="font-mono text-xs text-steel/50">
          {formatUSD(unitPriceCents)} / EA
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrement}
          disabled={qty <= 1}
          aria-label={`Decrease quantity of ${description}`}
          className="flex h-11 w-11 items-center justify-center border border-steel/20 text-steel transition-colors hover:border-amber hover:text-amber disabled:opacity-30 disabled:hover:border-steel/20 disabled:hover:text-steel"
        >
          <Minus className="h-5 w-5" />
        </button>
        <span className="w-8 text-center font-mono text-lg font-bold text-steel">
          {qty}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Increase quantity of ${description}`}
          className="flex h-11 w-11 items-center justify-center border border-steel/20 text-steel transition-colors hover:border-amber hover:text-amber"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <span className="w-20 text-right font-mono font-bold text-steel">
        {formatUSD(unitPriceCents * qty)}
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${description}`}
        className="flex h-11 w-11 items-center justify-center text-steel/40 transition-colors hover:text-amber"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </li>
  );
}
