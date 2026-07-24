import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { TrackTest } from "@/components/lab/TrackTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Track: The Aim and Hand-Eye Test",
  description:
    "25 targets that shrink as they go, with every stray tap counted. Speed sorts Sniper from Butter Fingers; spraying caps you at Stormtrooper. Free browser aim test, no sign-up.",
  canonical: "/performance-lab/track",
  hero: "lab-track",
} as const;

// Shared results carry ?ms=&acc= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-track", await searchParams));
}

export default function TrackPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Track", path: "/performance-lab/track" },
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
        <span>Track</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Track
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Targets appear, you put them down.{" "}
        <strong className="font-semibold text-foreground">
          25 of them, shrinking as the run goes
        </strong>
        , with every stray tap held against you — the aimed-tapping trade-off
        (speed versus precision) that movement scientists have studied since
        the fifties, wearing a crosshair.
      </p>

      <div className="mt-6">
        <TrackTest />
        <AddToHomeScreen toolName="Track" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Hand–eye speed is trainable and shamelessly warm-up-sensitive — cold
        hands post terrible times, which is your excuse ready-made. Your
        number includes your screen and your thumbs, so the real opponent is
        yesterday&rsquo;s you on the same device. Warm hands travel well: take
        them to{" "}
        <Link
          href="/max-out"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Max Out
        </Link>{" "}
        in the arcade, browse the{" "}
        <Link
          href="/exercises"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          exercise library
        </Link>{" "}
        for the agility work behind the reflexes, or race{" "}
        <Link
          href="/performance-lab/reaction"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Reaction
        </Link>{" "}
        and{" "}
        <Link
          href="/performance-lab/recall"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Recall
        </Link>{" "}
        back in{" "}
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
