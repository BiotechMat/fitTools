import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { ReactionTest } from "@/components/lab/ReactionTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Reaction: The Reaction Time Test",
  description:
    "Wait for the flash, tap. Five taps, your average in milliseconds, and a tier from LIGHTNING to PING 999. Free browser reaction time test, no sign-up.",
  canonical: "/performance-lab/reaction",
  hero: "lab-reaction",
} as const;

// Shared results carry ?avg=&row= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-reaction", await searchParams));
}

export default function ReactionPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Reaction", path: "/performance-lab/reaction" },
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
        <span>Reaction</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Reaction
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The pad goes Blaze, you tap.{" "}
        <strong className="font-semibold text-foreground">
          Five taps, averaged, in milliseconds
        </strong>{" "}
        — the same simple visual reaction protocol sleep researchers have
        leaned on for decades, in its browser Sunday best. Jump early and the
        round laughs at you.
      </p>

      <div className="mt-6">
        <ReactionTest />
        <AddToHomeScreen toolName="Reaction" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Reaction time is the classic canary for sleep debt and the classic
        beneficiary of caffeine — which is exactly why it&rsquo;s worth
        retesting across a week rather than once. Your number includes your
        screen and your hardware, so duel your own best on the same device.
        The percentile compares you against{" "}
        <a
          href="https://humanbenchmark.com/tests/reactiontime/statistics"
          rel="nofollow noopener"
          target="_blank"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          public reaction-test aggregates
        </a>{" "}
        (median 273 ms across 81M+ browser clicks) until our own player
        distribution takes over.
        See what actually shifts it with the{" "}
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
        . Then try{" "}
        <Link
          href="/performance-lab/recall"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Recall
        </Link>{" "}
        or{" "}
        <Link
          href="/performance-lab/track"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Track
        </Link>
        , or head back to{" "}
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
