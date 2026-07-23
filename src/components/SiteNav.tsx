"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface NavLink {
  href: string;
  label: string;
  /** Emphasised primary destinations (ink) vs secondary links (muted). */
  emphasis?: boolean;
}

/** A category inside an expanding menu (e.g. Nutrition → its calculators). */
export interface NavGroupSection {
  label: string;
  items: NavLink[];
}

/**
 * A labelled two-level menu: the group expands on click to its categories,
 * and each category expands to its links. `lead` renders first as the
 * menu's index link.
 */
export interface NavGroup {
  label: string;
  lead?: NavLink;
  sections: NavGroupSection[];
}

export type NavItem = NavLink | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "sections" in item;
}

const domId = (prefix: string, label: string) =>
  `${prefix}-${label.toLowerCase().replace(/\s+/g, "-")}`;

/**
 * Main-nav renderer. Desktop (lg+) shows the horizontal link row and the CTA;
 * below lg it collapses to a hamburger that opens a full-width dropdown, so
 * the nav items never overflow the viewport on mobile. Driven by a single
 * `items` array (no desktop/mobile duplication). Groups are nested
 * accordions on both form factors: Calculators → categories → tools, each
 * level expanding on click (one category open at a time).
 */
export function SiteNav({ items, cta }: { items: NavItem[]; cta: NavLink }) {
  const [open, setOpen] = useState(false);
  // Mobile accordion state: which group row and which category within it.
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const closeMobileMenu = () => {
    setOpen(false);
    setExpandedGroup(null);
    setExpandedSection(null);
  };

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setExpandedGroup(null);
        setExpandedSection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Desktop: horizontal links + CTA (lg and up). */}
      <ul className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-sm lg:flex">
        {items.map((item) =>
          isGroup(item) ? (
            <NavDropdown key={item.label} group={item} />
          ) : (
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
          ),
        )}
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
        onClick={() => (open ? closeMobileMenu() : setOpen(true))}
        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-surface shadow-[2px_2px_0_0_var(--color-foreground)] active:translate-x-0.5 active:translate-y-0.5 lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile: dropdown panel, full-width below the header (header is relative). */}
      {open ? (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-40 max-h-[80dvh] overflow-y-auto border-b-2 border-foreground bg-background shadow-[0_6px_0_0_rgba(0,0,0,0.06)] lg:hidden"
        >
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {items.map((item) =>
              isGroup(item) ? (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={expandedGroup === item.label}
                    aria-controls={domId("mobile-group", item.label)}
                    onClick={() => {
                      setExpandedGroup(
                        expandedGroup === item.label ? null : item.label,
                      );
                      setExpandedSection(null);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-base text-muted hover:bg-surface-deep"
                  >
                    {item.label}
                    <ChevronIcon open={expandedGroup === item.label} />
                  </button>
                  {expandedGroup === item.label ? (
                    <div id={domId("mobile-group", item.label)} className="pb-1">
                      {item.lead ? (
                        <Link
                          href={item.lead.href}
                          onClick={closeMobileMenu}
                          className="block rounded-lg px-3 py-2 pl-6 text-sm font-semibold text-primary underline underline-offset-2"
                        >
                          {item.lead.label} →
                        </Link>
                      ) : null}
                      <ul>
                        {item.sections.map((section) => (
                          <li key={section.label}>
                            <button
                              type="button"
                              aria-expanded={expandedSection === section.label}
                              aria-controls={domId("mobile-section", section.label)}
                              onClick={() =>
                                setExpandedSection(
                                  expandedSection === section.label
                                    ? null
                                    : section.label,
                                )
                              }
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 pl-6 text-sm font-semibold text-foreground hover:bg-surface-deep"
                            >
                              {section.label}
                              <ChevronIcon open={expandedSection === section.label} />
                            </button>
                            {expandedSection === section.label ? (
                              <ul id={domId("mobile-section", section.label)}>
                                {section.items.map((child) => (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={closeMobileMenu}
                                      className="block rounded-lg px-3 py-2 pl-9 text-sm text-muted hover:bg-surface-deep"
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block rounded-lg px-3 py-2.5 text-base hover:bg-surface-deep ${
                      item.emphasis ? "font-semibold text-foreground" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li className="mt-2">
              <Link
                href={cta.href}
                onClick={closeMobileMenu}
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

/**
 * Desktop expanding menu for a nav group — click to open, closes on Escape,
 * outside click or item click. The panel lists the group's categories; each
 * category expands in place to its links (one open at a time).
 */
function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const container = useRef<HTMLLIElement>(null);
  const panelId = domId("nav-group", group.label);

  const close = () => {
    setOpen(false);
    setExpandedSection(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setExpandedSection(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (container.current && !container.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedSection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <li ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        className="inline-flex items-center gap-1 text-muted hover:text-foreground"
      >
        {group.label}
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute left-0 top-full z-40 mt-2 max-h-[75vh] w-64 overflow-y-auto rounded-xl border-2 border-foreground bg-background p-1.5 shadow-[3px_3px_0_0_var(--color-foreground)]"
        >
          {group.lead ? (
            <Link
              href={group.lead.href}
              onClick={close}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary underline underline-offset-2 hover:bg-surface-deep"
            >
              {group.lead.label} →
            </Link>
          ) : null}
          <ul>
            {group.sections.map((section) => {
              const expanded = expandedSection === section.label;
              const sectionId = domId("nav-section", section.label);
              return (
                <li key={section.label}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={sectionId}
                    onClick={() =>
                      setExpandedSection(expanded ? null : section.label)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-deep"
                  >
                    {section.label}
                    <ChevronIcon open={expanded} />
                  </button>
                  {expanded ? (
                    <ul id={sectionId} className="pb-1">
                      {section.items.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            className="block rounded-lg px-3 py-1.5 pl-6 text-sm text-muted hover:bg-surface-deep hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={open ? "rotate-180 transition-transform" : "transition-transform"}
    >
      <polyline points="5 9 12 16 19 9" />
    </svg>
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
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}
