import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { SwitchTest } from "@/components/lab/SwitchTest";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";
import { parseLabResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Switch: The Mental Flexibility Test",
  description:
    "Colour? Shape? The rule keeps flipping and your brain pays for every flip in milliseconds — the switch cost. Shapeshifter or BSOD: free browser flexibility test, no sign-up.",
  canonical: "/performance-lab/switch",
  hero: "lab-switch",
} as const;

// Shared results carry ?cost=&err= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseLabResult("lab-switch", await searchParams));
}

export default function SwitchPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Performance Lab", path: "/performance-lab" },
    { name: "Switch", path: "/performance-lab/switch" },
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
        <span>Switch</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Switch
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Every card is a coloured shape and the banner decides what counts —
        COLOUR? or SHAPE?{" "}
        <strong className="font-semibold text-foreground">
          The rule keeps flipping, and your brain pays for every flip
        </strong>{" "}
        in milliseconds. That toll is the switch cost, the measure cognitive
        scientists have used since the nineties for how fast a mind changes
        gears.
      </p>

      <div className="mt-6">
        <SwitchTest />
        <AddToHomeScreen toolName="Switch" />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Everyone pays a switch cost — the interesting number is yours across
        the week, not once. It grows with fatigue and shrinks a little with
        practice, which makes the{" "}
        <Link
          href="/sleep-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          sleep calculator
        </Link>{" "}
        the honest companion tool, and the{" "}
        <Link
          href="/glossary"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          glossary
        </Link>{" "}
        has the vocabulary if &ldquo;task switching&rdquo; sent you curious.
        Race{" "}
        <Link
          href="/performance-lab/vigil"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Vigil
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
