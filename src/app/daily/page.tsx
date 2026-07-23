import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { DailyHub } from "@/components/daily/DailyHub";
import { DailyFavicon } from "@/components/effects/DailyFavicon";

export const metadata: Metadata = {
  title: "Daily — Ballpark & Myth or Fact, Cited Fitness Games",
  description:
    "A one-a-day guess-the-stat game and a weekly myth-buster quiz, every answer backed by a real study. Build a streak, learn the numbers, share your score.",
  alternates: { canonical: "/daily" },
};

export default function DailyPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Daily", path: "/daily" },
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Daily</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Daily</h1>
      <p className="mt-2 max-w-prose text-muted">
        One quick game a day. Guess a real fitness or health stat in{" "}
        <strong className="font-semibold text-foreground">Ballpark</strong>, then test what you
        know against the myths in the weekly{" "}
        <strong className="font-semibold text-foreground">Myth or Fact?</strong> quiz. Every answer
        cites a real study — so you leave knowing the number, not just guessing it.
      </p>

      <div className="mt-6">
        <DailyHub />
      </div>

      <p className="mt-8 text-sm text-muted">
        Need something twitchier? The{" "}
        <Link
          href="/arcade"
          className="font-semibold text-primary underline underline-offset-2 hover:text-foreground"
        >
          Arcade
        </Link>{" "}
        has{" "}
        <Link
          href="/lifeline"
          className="font-semibold text-primary underline underline-offset-2 hover:text-foreground"
        >
          Lifeline
        </Link>
        , our one-button heartbeat flapper, and{" "}
        <Link
          href="/powerhouse"
          className="font-semibold text-primary underline underline-offset-2 hover:text-foreground"
        >
          Powerhouse
        </Link>
        , the mitochondria shooter.
      </p>
      <DailyFavicon />
    </div>
  );
}
