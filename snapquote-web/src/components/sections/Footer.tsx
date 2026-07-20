export default function Footer() {
  return (
    <footer className="border-t border-steel/10 px-6 py-10 md:px-10">
      <div className="flex flex-col items-start justify-between gap-6 font-mono text-xs tracking-[0.15em] text-steel/40 md:flex-row md:items-center">
        <p>SNAPQUOTE © 2026 — FORGED FOR THE TRADES</p>
        <nav className="flex gap-8">
          <a href="#" className="transition-colors hover:text-amber">
            PRIVACY
          </a>
          <a href="#" className="transition-colors hover:text-amber">
            TERMS
          </a>
          <a
            href="mailto:crew@snapquote.app"
            className="transition-colors hover:text-amber"
          >
            CONTACT
          </a>
        </nav>
      </div>
    </footer>
  );
}
