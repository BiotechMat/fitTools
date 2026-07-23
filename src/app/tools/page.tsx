import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Tools: Timers, Breath Coach, Muscle Map & More",
  description:
    "Interactive gym micro-tools: rest and interval timers, a breathing coach, a clickable muscle map, a protein plate builder and a supplement evidence explorer. Free, in your browser.",
  alternates: { canonical: "/tools" },
};

/** The microtools hub (MICROTOOLS.md §1) — cards into each interactive. */
const TOOLS = [
  {
    href: "/tools/timer",
    name: "Gym timers",
    blurb: "Rest, intervals and EMOM, with big digits, countdown beeps and shareable settings.",
    chip: "bg-primary-soft",
    eyebrow: "Train",
  },
  {
    href: "/tools/breath",
    name: "Breath coach",
    blurb: "Box, 4-7-8 or coherent breathing with a pacing orb. Two calm minutes.",
    chip: "bg-good-soft",
    eyebrow: "Recover",
  },
  {
    href: "/tools/muscle-map",
    name: "Muscle map",
    blurb: "Tap a muscle, see every exercise in the library that trains it.",
    chip: "bg-primary-soft",
    eyebrow: "Learn",
  },
  {
    href: "/tools/plate-builder",
    name: "Plate builder",
    blurb: "Stack real foods onto a plate and watch protein and calories add up.",
    chip: "bg-good-soft",
    eyebrow: "Fuel",
  },
  {
    href: "/tools/supplement-explorer",
    name: "Supplement explorer",
    blurb: "Every supplement we cover, laid out by evidence tier. Receipts included.",
    chip: "bg-warning-bg",
    eyebrow: "Evidence",
  },
];

export default function ToolsHubPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Tools</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Tools</h1>
      <p className="mt-2 max-w-prose text-muted">
        Interactive micro-tools that earn a place in your session: timers that
        run your rest, a coach that paces your breathing, maps and builders
        driven by the same cited reference data as everything else on the site.
        No sign-up, nothing stored beyond your own browser.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="riso-press flex min-h-36 flex-col justify-between rounded-2xl border-2 border-foreground bg-surface p-4"
            >
              <span
                className={`inline-block self-start rounded-full border border-foreground px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${tool.chip}`}
              >
                {tool.eyebrow}
              </span>
              <span>
                <span className="mt-3 block font-display text-2xl uppercase">
                  {tool.name}
                </span>
                <span className="mt-1 block text-sm text-muted">{tool.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
