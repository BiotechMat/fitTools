import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { RecallTest } from "@/components/lab/RecallTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Recall: The Sequence Memory Test",
  description:
    "The grid lights a pattern, you tap it back, every clean round adds one. Your span puts you on the animal ladder, goldfish to mainframe. Free browser memory test, no sign-up.",
  canonical: "/performance-lab/recall",
  hero: "lab-recall",
} as const;

// Shared results carry ?span= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-recall", await searchParams));
}

export default function RecallPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Recall", path: "/performance-lab/recall" },
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
        <span>Recall</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Recall
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Watch the grid, tap it back.{" "}
        <strong className="font-semibold text-foreground">
          Every clean round adds one light
        </strong>{" "}
        — a browser cousin of the block-tapping span tasks memory labs have
        run since the seventies. Two wobbles and the run is over; your span
        decides your animal.
      </p>

      <div className="mt-6">
        <RecallTest />
        <AddToHomeScreen toolName="Recall" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        A game score on a phone is not a memory assessment, and this one
        doesn&rsquo;t pretend to be — if memory is genuinely worrying you or
        someone you love, that conversation belongs with a GP, not a grid.
        For the rest of us: span loves a good night&rsquo;s sleep, which is
        where the{" "}
        <Link
          href="/sleep-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          sleep calculator
        </Link>{" "}
        comes in. Then race{" "}
        <Link
          href="/performance-lab/reaction"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Reaction
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
