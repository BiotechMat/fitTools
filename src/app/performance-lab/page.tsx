import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { LabBestChip } from "@/components/lab/LabBestChip";

export const metadata: Metadata = {
  title: "The Performance Lab: Test Your Reaction, Memory and Aim",
  description:
    "Free browser tests with real pedigrees: Reaction (average ms over five taps), Recall (sequence span on the grid) and Track (25 shrinking targets). Get your number, get your tier, run it back. No sign-up.",
  alternates: { canonical: "/performance-lab" },
};

/* Station roster: each card links a station page. localStorage keys must
   match the stations' own BEST_KEY constants. */
const STATIONS = [
  {
    href: "/performance-lab/reaction",
    glyph: "⚡",
    glyphClass: "bg-primary-strong text-background",
    name: "Reaction",
    tag: "Speed",
    blurb:
      "Wait for the flash, tap. Five taps, average milliseconds, a tier from LIGHTNING to PING 999. Sleep and caffeine move this number.",
    storageKey: "fittools.lab.reaction.best",
    bestLabel: "Fastest",
    unit: "ms",
    cta: "Test reaction",
  },
  {
    href: "/performance-lab/recall",
    glyph: "🧠",
    glyphClass: "bg-good text-background",
    name: "Recall",
    tag: "Memory",
    blurb:
      "The grid lights a pattern, you tap it back, every round adds one. Your span lands you on the animal ladder — goldfish to mainframe.",
    storageKey: "fittools.lab.recall.best",
    bestLabel: "Longest span",
    unit: "",
    cta: "Test recall",
  },
  {
    href: "/performance-lab/track",
    glyph: "🎯",
    glyphClass: "bg-foreground text-background",
    name: "Track",
    tag: "Precision",
    blurb:
      "25 targets, shrinking as they go, and every stray tap counts. Speed sorts Sniper from Butter Fingers; spraying caps you at Stormtrooper.",
    storageKey: "fittools.lab.track.best",
    bestLabel: "Quickest",
    unit: "ms",
    cta: "Test aim",
  },
] as const;

export default function PerformanceLabPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Performance Lab</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        The Performance Lab
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The arcade next door plays cartoons.{" "}
        <strong className="font-semibold text-foreground">
          This room measures you.
        </strong>{" "}
        Three instruments with real pedigrees, thirty-second protocols, and a
        tier ladder built for the group chat. Your numbers stay on your device
        — beat them tomorrow.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {STATIONS.map((station) => (
          <article
            key={station.href}
            className="flex flex-col rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 -rotate-3 items-center justify-center rounded-xl border-2 border-foreground text-2xl font-bold ${station.glyphClass}`}
              >
                {station.glyph}
              </span>
              <div>
                <h2 className="font-display text-2xl uppercase">{station.name}</h2>
                <span className="inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  {station.tag}
                </span>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted">{station.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={station.href}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                {station.cta}
              </Link>
              <LabBestChip
                storageKey={station.storageKey}
                label={station.bestLabel}
                unit={station.unit}
              />
            </div>
          </article>
        ))}

        <article className="flex flex-col rounded-2xl border-2 border-foreground bg-surface-deep p-5 shadow-[4px_4px_0_0_var(--color-foreground)]">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 rotate-2 items-center justify-center rounded-xl border-2 border-foreground bg-surface text-2xl font-bold"
            >
              🧪
            </span>
            <div>
              <h2 className="font-display text-2xl uppercase">On the bench</h2>
              <span className="inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                In the pipeline
              </span>
            </div>
          </div>
          <p className="mt-3 flex-1 text-sm text-muted">
            <strong className="font-semibold text-foreground">Vigil</strong> (three
            minutes of pure focus), <strong className="font-semibold text-foreground">Switch</strong>{" "}
            (the rule keeps flipping), <strong className="font-semibold text-foreground">Steady</strong>{" "}
            (the buzz wire), <strong className="font-semibold text-foreground">Wide Angle</strong>{" "}
            (edge-of-eye catches) and <strong className="font-semibold text-foreground">Breathe</strong>{" "}
            (the calm one). The blueprint is written; the bench clears in order.
          </p>
          <div className="mt-4">
            <Link
              href="/arcade"
              className="riso-press inline-block rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
            >
              Meanwhile, the Arcade →
            </Link>
          </div>
        </article>
      </div>

      <p className="mt-8 max-w-prose text-sm text-muted">
        Lab numbers are honest but homemade: your screen, your hardware and
        your thumbs are all in the measurement, so the fairest fight is
        against your own best on the same device. The tiers are banter. What
        genuinely moves these numbers is no mystery — start with the{" "}
        <Link
          href="/sleep-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          sleep calculator
        </Link>{" "}
        and the{" "}
        <Link
          href="/caffeine-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          caffeine calculator
        </Link>
        , every formula cited.
      </p>
    </div>
  );
}
