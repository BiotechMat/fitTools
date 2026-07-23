import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { PowerhouseGame } from "@/components/powerhouse/PowerhouseGame";

export const metadata: Metadata = {
  title: "Powerhouse — The Mitochondria Arcade Shooter",
  description:
    "You are the mitochondrion — the powerhouse of the cell. Autofire at free radicals and sugar spikes, stack protein and caffeine power-ups, and climb the heart-rate zones to REDLINE. Free, no sign-up.",
  alternates: { canonical: "/powerhouse" },
};

export default function PowerhousePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
    { name: "Powerhouse", path: "/powerhouse" },
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
        <Link href="/arcade" className="hover:text-foreground">
          Arcade
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Powerhouse</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Powerhouse
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The mitochondria is the powerhouse of the cell — and today,{" "}
        <strong className="font-semibold text-foreground">that&rsquo;s you</strong>. Fly the
        bloodstream, autofire at the junk, grab the good stuff, and climb the
        training zones. Your score is ATP. Zone 5 is earned. REDLINE is
        legend.
      </p>

      <div className="mt-6">
        <PowerhouseGame />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Powerhouse is a cartoon, not cell biology — no organelles were
        consulted, and nothing here measures you. For your actual training
        zones, built on real heart-rate maths with the sources cited, try the{" "}
        <Link
          href="/heart-rate-zone-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Heart Rate Zone calculator
        </Link>
        . Prefer one heartbeat at a time? Its sibling{" "}
        <Link
          href="/lifeline"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Lifeline
        </Link>{" "}
        is next door, and the rest of the games live in the{" "}
        <Link
          href="/arcade"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Arcade
        </Link>
        .
      </p>
    </div>
  );
}
