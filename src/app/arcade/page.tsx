import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { BestChip } from "@/components/arcade/BestChip";

export const metadata: Metadata = {
  title: "Arcade — Quick Games With a Health-Nerd Twist",
  description:
    "Free browser arcade: Lifeline (the heartbeat flapper), Powerhouse (the mitochondria shooter) and the daily games. No sign-up, no lives to buy — just the retry loop, with the real calculators next door.",
  alternates: { canonical: "/arcade" },
};

/* Game roster: each card links a game page. localStorage keys must match
   the games' own BEST_KEY constants. */
const GAMES = [
  {
    href: "/lifeline",
    glyph: "♥",
    glyphClass: "bg-primary-strong text-background",
    name: "Lifeline",
    tag: "One button",
    blurb:
      "The heartbeat arcade. Tap to flap, thread the gaps, dodge the risk factors — your score is the age you reach.",
    storageKey: "fittools.lifeline.best",
    unit: "",
    cta: "Play Lifeline",
  },
  {
    href: "/powerhouse",
    glyph: "⚡",
    glyphClass: "bg-warning-border text-foreground",
    name: "Powerhouse",
    tag: "Autofire",
    blurb:
      "The mitochondria shooter. Blast the junk, stack real-life power-ups, climb the heart-rate zones to REDLINE. Score is ATP.",
    storageKey: "fittools.powerhouse.best",
    unit: "ATP",
    cta: "Play Powerhouse",
  },
] as const;

export default function ArcadePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Arcade", path: "/arcade" },
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Arcade</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Arcade
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Quick games with a health-nerd twist. No sign-up, no lives to buy,
        nothing tracked beyond the best score saved on your device — just the
        retry loop, with{" "}
        <strong className="font-semibold text-foreground">the real evidence next door</strong>{" "}
        when a run leaves you curious.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {GAMES.map((game) => (
          <article
            key={game.href}
            className="flex flex-col rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 -rotate-3 items-center justify-center rounded-xl border-2 border-foreground text-2xl font-bold ${game.glyphClass}`}
              >
                {game.glyph}
              </span>
              <div>
                <h2 className="font-display text-2xl uppercase">{game.name}</h2>
                <span className="inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  {game.tag}
                </span>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted">{game.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={game.href}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                {game.cta}
              </Link>
              <BestChip storageKey={game.storageKey} unit={game.unit} />
            </div>
          </article>
        ))}

        <article className="flex flex-col rounded-2xl border-2 border-foreground bg-surface-deep p-5 shadow-[4px_4px_0_0_var(--color-foreground)] sm:col-span-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 rotate-2 items-center justify-center rounded-xl border-2 border-foreground bg-good text-2xl font-bold text-background"
            >
              🎯
            </span>
            <div>
              <h2 className="font-display text-2xl uppercase">The dailies</h2>
              <span className="inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                New at midnight
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            <strong className="font-semibold text-foreground">Ballpark</strong> — guess a real
            fitness stat every day — and the weekly{" "}
            <strong className="font-semibold text-foreground">Myth or Fact?</strong> quiz. Every
            answer cites a real study, and streaks are a matter of honour.
          </p>
          <div className="mt-4">
            <Link
              href="/daily"
              className="riso-press inline-block rounded-full border-2 border-foreground bg-good px-5 py-2 text-sm font-bold text-background"
            >
              Play today&rsquo;s
            </Link>
          </div>
        </article>
      </div>

      <p className="mt-8 max-w-prose text-sm text-muted">
        The games are cartoons, not health advice. The numbers that actually
        mean something live in the{" "}
        <Link
          href="/#all-tools"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          calculators
        </Link>{" "}
        — every formula cited.
      </p>
    </div>
  );
}
