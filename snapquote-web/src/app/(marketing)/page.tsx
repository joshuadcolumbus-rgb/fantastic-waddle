import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-volt">
          SnapQuote
        </p>
        <h1 className="max-w-3xl text-5xl font-bold text-white md:text-7xl">
          Quotes at the speed of the job site.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-steel/80">
          Build, sign, and send professional quotes in minutes — not evenings.
          Made for electricians, plumbers, and every trade in between.
        </p>
        <Link
          href="/quick-quote"
          className="mt-10 rounded-full bg-volt px-8 py-4 font-semibold text-carbon transition-transform hover:scale-105"
        >
          Launch Quick Quote
        </Link>
      </section>

      <section className="mx-auto grid min-h-screen max-w-5xl content-center gap-8 px-6 md:grid-cols-3">
        {[
          {
            title: "Instant math",
            body: "Materials, labor, markup, and tax computed as you type.",
          },
          {
            title: "On-site signatures",
            body: "Customers sign on your phone and get the PDF immediately.",
          },
          {
            title: "Your brand",
            body: "Logo, license number, and terms on every quote you send.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-steel/10 bg-white/5 p-8 backdrop-blur"
          >
            <h2 className="mb-3 text-xl font-semibold text-white">{f.title}</h2>
            <p className="text-steel/80">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">
          Stop quoting after dinner.
        </h2>
        <Link
          href="/quick-quote"
          className="mt-8 rounded-full border border-volt px-8 py-4 font-semibold text-volt transition-colors hover:bg-volt hover:text-carbon"
        >
          Get started free
        </Link>
      </section>
    </>
  );
}
