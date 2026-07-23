import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { MaxOutGame } from "@/components/maxout/MaxOutGame";

export const metadata: Metadata = {
  title: "Max Out: The One-Rep-Max Timing Game",
  description:
    "Tap when the needle crosses the green, lock the rep, load the bar. Chalk up, earn the belt, chase seven plates a side. Free browser lifting arcade, no sign-up.",
  alternates: { canonical: "/max-out" },
};

export default function MaxOutPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
    { name: "Max Out", path: "/max-out" },
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
        <span>Max Out</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Max Out
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The bar is loaded and the needle is moving. Tap inside the green
        window to lock the rep,{" "}
        <strong className="font-semibold text-foreground">
          every clean one adds plates
        </strong>
        , and the window only gets meaner. Perfect streaks earn chalk and the
        belt. Five plates a side is a flex. Seven is legend.
      </p>

      <div className="mt-6">
        <MaxOutGame />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Max Out is a cartoon, not a training plan. No needle can judge a real
        lift, and nothing here measures you. For your actual one-rep max,
        estimated from any set with the formulas cited, try the{" "}
        <Link
          href="/one-rep-max-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          One-Rep Max calculator
        </Link>
        , then see where it lands on the{" "}
        <Link
          href="/strength-standards"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          strength standards
        </Link>
        . Prefer slicing misinformation to lifting it? Its sibling{" "}
        <Link
          href="/snake-oil"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Snake Oil
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
