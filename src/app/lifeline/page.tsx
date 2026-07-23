import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { LifelineGame } from "@/components/lifeline/LifelineGame";
import { parseArcadeResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Lifeline: The Heartbeat Arcade Game",
  description:
    "Tap to keep the heart beating, dodge the risk factors, and see what age you reach. One button, no sign-up, and when you're done, check your real heart age.",
  canonical: "/lifeline",
  hero: "lifeline",
} as const;

// Challenge links carry ?seed=&beat=&cause= — the same URL that replays the
// course also unfurls as the score card, so metadata reads the params.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseArcadeResult("lifeline", await searchParams));
}

export default function LifelinePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
    { name: "Lifeline", path: "/lifeline" },
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
        <span>Lifeline</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Lifeline
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        You are the heartbeat. Tap to flap, thread the gaps, dodge the risk
        factors, <strong className="font-semibold text-foreground">your score is the age you reach</strong>.
        Broccoli helps. The sofa does not.
      </p>

      <div className="mt-6">
        <LifelineGame />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Lifeline is a cartoon, not a health prediction. No arcade heart was
        consulted on your actual physiology. For the real number, built on the
        AHA PREVENT equations with every source cited, try the{" "}
        <Link
          href="/heart-age-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Heart Age calculator
        </Link>
        . And if one game a day is more your pace,{" "}
        <Link
          href="/daily"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          today&rsquo;s Ballpark
        </Link>{" "}
        is waiting. Prefer shooting the junk to dodging it?{" "}
        <Link
          href="/powerhouse"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Powerhouse
        </Link>{" "}
        hands the mitochondrion a blaster.
      </p>
    </div>
  );
}
