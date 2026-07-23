import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { PulseDaily } from "@/components/pulse/PulseDaily";
import { PulseScroller } from "@/components/pulse/PulseScroller";

export const metadata: Metadata = {
  title: "Pulse — An Endless Feed of Cited Fitness & Longevity Facts",
  description:
    "Pulse is a bottomless, source-verified feed of bite-sized facts across training, nutrition, recovery, sleep, physiology, supplements and longevity — like, save, share and filter by topic.",
  alternates: { canonical: "/pulse" },
};

export default function PulsePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Pulse", path: "/pulse" },
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Pulse</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Pulse</h1>
      <p className="mt-2 max-w-prose text-muted">
        A bottomless feed of bite-sized, source-verified facts across fitness,
        recovery, nutrition, sleep, physiology and longevity. Every card cites a
        real study — like the ones that click, save the keepers, and filter to
        what you care about.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/pulse/this-week" className="font-semibold text-primary underline underline-offset-2">
          This week in the science →
        </Link>{" "}
        <span className="text-muted">the newest research, with the reality check.</span>
      </p>

      <div className="mt-6">
        <PulseDaily />
        <PulseScroller />
      </div>
    </div>
  );
}
