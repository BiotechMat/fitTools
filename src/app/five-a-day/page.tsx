import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { FiveADayGame } from "@/components/fiveaday/FiveADayGame";
import { parseArcadeResult, type SearchParams } from "@/lib/arcade-share";
import { gameMetadata } from "@/lib/arcade-metadata";

const COPY = {
  title: "Five a Day: The Produce-Slicing Game",
  description:
    "Fruit and veg fly. Swipe to slice them for portions, stack smoothie combos and plant-variety bonuses, and never touch the junk. Free browser arcade, no sign-up.",
  canonical: "/five-a-day",
  hero: "five-a-day",
} as const;

// Shared results carry ?portions=&plants= so the link unfurls as the score card.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return gameMetadata(COPY, parseArcadeResult("five-a-day", await searchParams));
}

export default function FiveADayPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
    { name: "Five a Day", path: "/five-a-day" },
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
        <span>Five a Day</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Five a Day
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The market stall has lost control of its stock.{" "}
        <strong className="font-semibold text-foreground">
          Slice the produce, never the junk
        </strong>
        . Every fruit and veg is a portion, multi-slices blend into smoothie
        bonuses, and trying a new plant pays extra. Drop three and
        it&rsquo;s compost. The cigarette is not food. You know this.
      </p>

      <div className="mt-6">
        <FiveADayGame />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Five a Day is a cartoon, not nutrition advice. No smoothie was ever
        made with a sword. For what actually goes into a balanced plate, the{" "}
        <Link
          href="/nutrition/reference"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          food reference
        </Link>{" "}
        has the real numbers, and the myth-busting this game once tried to do
        at swipe speed lives where reading has time:{" "}
        <Link
          href="/daily"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Myth or Fact?
        </Link>{" "}
        on the dailies page. Rather lift than chop? Its sibling{" "}
        <Link
          href="/max-out"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Max Out
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
