"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, FileText, Settings } from "lucide-react";

const TABS = [
  { href: "/home", label: "HOME", icon: Home },
  { href: "/quick-quote", label: "QUOTE", icon: Zap },
  { href: "/invoices", label: "INVOICES", icon: FileText },
  { href: "/settings", label: "SETTINGS", icon: Settings },
] as const;

/**
 * The app chassis: collapsed icon rail on desktop, fixed bottom tab bar with
 * full-height touch targets on mobile. Active tab gets the weld-amber edge.
 */
export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* desktop: slim left rail */}
      <nav className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center border-r border-steel/10 bg-gunmetal/60 md:flex">
        <Link
          href="/home"
          aria-label="SnapQuote home"
          className="flex h-20 w-full items-center justify-center"
        >
          <span className="block h-3 w-3 rotate-45 bg-amber" />
        </Link>
        <div className="flex flex-1 flex-col gap-2 pt-4">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 w-16 flex-col items-center justify-center gap-1 border-l-2 transition-colors ${
                  active
                    ? "border-amber text-amber"
                    : "border-transparent text-steel/50 hover:text-steel"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-mono text-[9px] tracking-widest">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* mobile: fixed bottom tab bar, thumb-sized targets */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-20 grid-cols-4 border-t border-steel/10 bg-gunmetal pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 border-t-2 ${
                active
                  ? "border-amber text-amber"
                  : "border-transparent text-steel/50"
              }`}
            >
              <Icon className="h-7 w-7" />
              <span className="font-mono text-[10px] tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
