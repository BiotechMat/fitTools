import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { SteadyTest } from "@/components/lab/SteadyTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Steady: The Steady Hands Test",
  description:
    "The buzz wire, in the browser: drag the probe end to end without touching the walls. Every touch sparks. Surgeon hands or jackhammer: free steadiness test, no sign-up.",
  canonical: "/performance-lab/steady",
  hero: "lab-steady",
} as const;

// Shared results carry ?sparks=&secs= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-steady", await searchParams));
}

export default function SteadyPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Steady", path: "/performance-lab/steady" },
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
        <Link href="/performance-lab" className="hover:text-foreground">
          Performance Lab
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Steady</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Steady
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The fairground buzz wire, minus the fairground.{" "}
        <strong className="font-semibold text-foreground">
          Drag the probe end to end without touching the walls
        </strong>{" "}
        — every touch sparks, and the sparks are the score. The corridor is
        the same generous width for a thumb and a cursor, lifting off just
        pauses you, and the clock never stops. Classic mirror-tracing rigs
        sent the same message: slow is smooth.
      </p>

      <div className="mt-6">
        <SteadyTest />
        <AddToHomeScreen toolName="Steady" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Steadiness is the honest caffeine meter — espresso jitters show up on
        the wire before you feel them, which is what the{" "}
        <Link
          href="/caffeine-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          caffeine calculator
        </Link>{" "}
        is for, and post-leg-day tremble is real too (the{" "}
        <Link
          href="/exercises"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          exercise library
        </Link>{" "}
        knows why). Not a tremor assessment — persistent shakes belong with a
        GP. Warm hands? Take them to{" "}
        <Link
          href="/performance-lab/track"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Track
        </Link>{" "}
        next, or head back to{" "}
        <Link
          href="/performance-lab"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          the Lab
        </Link>
        .
      </p>
    </div>
  );
}
