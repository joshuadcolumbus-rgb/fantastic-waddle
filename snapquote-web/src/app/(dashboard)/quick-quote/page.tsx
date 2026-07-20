import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Quote",
};

export default function QuickQuotePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold text-white">Quick Quote</h1>
      <p className="mt-2 text-steel/80">
        Build a quote line by line. Totals update as you go.
      </p>

      <div className="mt-8 rounded-2xl border border-steel/10 bg-white/5 p-6">
        <form className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Customer name
            <input
              type="text"
              name="customer"
              className="rounded-lg border border-steel/20 bg-carbon px-3 py-2 text-white outline-none focus:border-volt"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Job address
            <input
              type="text"
              name="address"
              className="rounded-lg border border-steel/20 bg-carbon px-3 py-2 text-white outline-none focus:border-volt"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Job description
            <textarea
              name="description"
              rows={4}
              className="rounded-lg border border-steel/20 bg-carbon px-3 py-2 text-white outline-none focus:border-volt"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-volt px-6 py-3 font-semibold text-carbon md:col-span-2"
          >
            Generate quote
          </button>
        </form>
      </div>
    </section>
  );
}
