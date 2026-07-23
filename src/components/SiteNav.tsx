"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
  /** Emphasised primary destinations (ink) vs secondary links (muted). */
  emphasis?: boolean;
}

/**
 * Main-nav renderer. Desktop (lg+) shows the horizontal link row and the CTA;
 * below lg it collapses to a hamburger that opens a full-width dropdown, so the
 * ~12 nav items never overflow the viewport on mobile. Driven by a single
 * `items` array (no desktop/mobile duplication).
 */
export function SiteNav({ items, cta }: { items: NavItem[]; cta: NavItem }) {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Desktop: horizontal links + CTA (lg and up). */}
      <ul className="hidden flex-wrap gap-x-4 gap-y-1 text-sm lg:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                item.emphasis
                  ? "font-semibold text-foreground hover:text-primary"
                  : "text-muted hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className="ml-auto hidden rounded-full border-2 border-foreground bg-lime px-4 py-1.5 text-center text-sm font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] lg:inline-block"
      >
        {cta.label}
      </Link>

      {/* Mobile: hamburger toggle (below lg). */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-surface shadow-[2px_2px_0_0_var(--color-foreground)] active:translate-x-0.5 active:translate-y-0.5 lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile: dropdown panel, full-width below the header (header is relative). */}
      {open ? (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-40 border-b-2 border-foreground bg-background shadow-[0_6px_0_0_rgba(0,0,0,0.06)] lg:hidden"
        >
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base hover:bg-surface-deep ${
                    item.emphasis ? "font-semibold text-foreground" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="block rounded-full border-2 border-foreground bg-lime px-4 py-2.5 text-center text-sm font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)]"
              >
                {cta.label}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
