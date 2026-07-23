import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { SnakeOilGame } from "@/components/snakeoil/SnakeOilGame";

export const metadata: Metadata = {
  title: "Snake Oil: The Myth-Slicing Game",
  description:
    "Fitness claims fly; slice the myths, spare the truths. Every busted myth is backed by a real cited source. Free browser arcade, no sign-up, just receipts.",
  alternates: { canonical: "/snake-oil" },
};

export default function SnakeOilPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
    { name: "Snake Oil", path: "/snake-oil" },
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
        <span>Snake Oil</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Snake Oil
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The wellness expo has lost control of its stock and the claims are
        flying.{" "}
        <strong className="font-semibold text-foreground">
          Slice the myths, spare the truths
        </strong>,{" "}cut a true thing in half, or let a myth escape into the group chat,
        and it costs you. Knowing your evidence IS the reflex.
      </p>

      <div className="mt-6">
        <SnakeOilGame />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Snake Oil is a cartoon with receipts: every claim in it derives from a
        vetted item in our games registry, and the card at the end cites the
        real source behind whichever one got you. For the slower, weekly
        version of this argument, play{" "}
        <Link
          href="/daily"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          Myth or Fact?
        </Link>{" "}
        on the dailies page. Rather lift than litigate? Its sibling{" "}
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
