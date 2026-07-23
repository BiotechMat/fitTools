import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { allTools } from "@/registry/tools";
import { PulseDaily } from "@/components/pulse/PulseDaily";
import { TodayGames } from "@/components/today/TodayGames";
import { TodayReruns } from "@/components/today/TodayReruns";
import { TodayStreak } from "@/components/today/TodayStreak";

/**
 * /today — the single daily surface (TODAY.md). Pure composition of loops
 * that already exist: the site-wide streak, the Pulse fact of the day, the
 * daily games' status, and due-a-re-run chips from local history. Personal
 * and duplicated-content by design, so like /dashboard it is noindexed and
 * stays out of the sitemap; /pulse and /daily remain the canonical homes.
 */
export const metadata: Metadata = {
  title: "Today — your daily minute",
  description:
    "Your streak, the fact of the day, today's game and anything due a fresh run — one page, one minute, saved on this device only.",
  robots: { index: false, follow: false },
};

// Server-derived slug → title map for the re-run chips: the full registry
// (with its Zod schemas) must never enter a client bundle (README, SPEC §13).
const rerunTools = allTools.map(({ slug, title }) => ({ slug, title }));

export default function TodayPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Today", path: "/today" },
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
        <span>Today</span>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">
          <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-background">
            Today
          </span>
        </h1>
        <p className="mt-3 max-w-prose text-muted">
          One page, one minute: your streak, the fact of the day, today&rsquo;s
          game, and anything due a fresh run. All of it saves on this device
          only.
        </p>
      </header>

      <div className="mt-6">
        <TodayStreak />
      </div>

      <section aria-label="Fact of the day" className="mt-8">
        <h2 className="font-display text-xl uppercase">Fact of the day</h2>
        <div className="mt-3">
          <PulseDaily />
        </div>
        <p className="-mt-2 text-sm text-muted">
          Want more?{" "}
          <Link href="/pulse" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
            The full Pulse feed
          </Link>{" "}
          keeps going.
        </p>
      </section>

      <section aria-label="Today's games" className="mt-8">
        <h2 className="font-display text-xl uppercase">Today&rsquo;s games</h2>
        <div className="mt-3">
          <TodayGames />
        </div>
      </section>

      <TodayReruns tools={rerunTools} />

      <p className="mt-10 border-t border-border pt-4 text-sm text-muted">
        Looking for the bigger picture?{" "}
        <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
          Your numbers
        </Link>{" "}
        has every saved result in one place.
      </p>
    </div>
  );
}
