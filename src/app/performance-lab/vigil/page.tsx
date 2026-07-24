import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { VigilTest } from "@/components/lab/VigilTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Vigil: The Focus Test",
  description:
    "Ninety seconds of digits — tap every one except the 3. The withhold is the measure. Monk mode or tab hoarder: free browser focus test, no sign-up.",
  canonical: "/performance-lab/vigil",
  hero: "lab-vigil",
} as const;

// Shared results carry ?pct= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-vigil", await searchParams));
}

export default function VigilPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Vigil", path: "/performance-lab/vigil" },
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
        <span>Vigil</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Vigil
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Digits stream for ninety seconds and you tap every single one —{" "}
        <strong className="font-semibold text-foreground">
          except the 3
        </strong>
        . That&rsquo;s the whole trap: the tapping goes automatic, and the
        withhold is where focus lives. A browser short form of the sustained
        attention task vigilance researchers have used since the nineties.
        Find ninety undisturbed seconds first — a hidden tab abandons the run.
      </p>

      <div className="mt-6">
        <VigilTest />
        <AddToHomeScreen toolName="Vigil" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        A game score is not an attention assessment, and this one
        doesn&rsquo;t pretend to be — if focus is a genuine daily struggle,
        that conversation belongs with a professional, not a digit stream.
        For everyone else: sustained attention is the first thing sleep debt
        eats and one of the things slow breathing measurably steadies, which
        is why the{" "}
        <Link
          href="/sleep-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          sleep calculator
        </Link>{" "}
        and the{" "}
        <Link
          href="/recovery/breathwork"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          breathwork guide
        </Link>{" "}
        are next door. Then try{" "}
        <Link
          href="/performance-lab/switch"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Switch
        </Link>{" "}
        or head back to{" "}
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
