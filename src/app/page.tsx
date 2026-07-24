import Link from "next/link";
import { ThrowableTicker } from "@/components/effects/ThrowableTicker";
import { PulseHeroCard } from "@/components/pulse/PulseHeroCard";
import { SITE_NAME } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { tier4Tools, toolPath, toolsForHub } from "@/registry/tools";
import { ACTIVITY_FACTORS, mifflinStJeor, tdee } from "@/lib/formulas/energy";
import { oneRepMax } from "@/lib/formulas/one-rep-max";
import { hrMaxTanaka, hrZones } from "@/lib/formulas/heart-rate";
import { TDEE_DEFAULTS } from "@/registry/configs/tdee.shared";
import { ONE_RM_DEFAULTS } from "@/registry/configs/one-rep-max-calculator.shared";
import { MACRO_DEFAULTS } from "@/registry/configs/macro-calculator.shared";
import { HR_DEFAULTS } from "@/registry/configs/heart-rate-zone-calculator.shared";

const fmt = (value: number) => Math.round(value).toLocaleString("en-GB");

/**
 * "Start here" stats are computed from each tool's real formula at its
 * default inputs — never hand-written, so they can't drift from the tools
 * (DESIGN.md mockups §02: cards lead with the number).
 */
function startHereCards() {
  const tdeeKcal = tdee(
    mifflinStJeor({
      sex: TDEE_DEFAULTS.sex,
      weightKg: TDEE_DEFAULTS.weightKg,
      heightCm: TDEE_DEFAULTS.heightCm,
      ageYears: TDEE_DEFAULTS.ageYears,
    }),
    ACTIVITY_FACTORS[TDEE_DEFAULTS.activity],
  );
  const oneRm = oneRepMax("epley", ONE_RM_DEFAULTS.weight, ONE_RM_DEFAULTS.reps);
  const proteinG = MACRO_DEFAULTS.weightKg * MACRO_DEFAULTS.proteinGPerKg;
  const zone2 = hrZones(hrMaxTanaka(HR_DEFAULTS.ageYears))[1];

  return [
    {
      slug: "tdee-calculator",
      hub: "Fuel",
      chip: "bg-good-soft text-foreground",
      stat: fmt(tdeeKcal),
      unit: "kcal",
      name: "TDEE Calculator",
      blurb: "How much fuel you actually burn, before you cut, bulk or panic.",
    },
    {
      slug: "one-rep-max-calculator",
      hub: "Workout",
      chip: "bg-primary-soft text-foreground",
      stat: oneRm.toFixed(1).replace(/\.0$/, ""),
      unit: "kg",
      name: "One-Rep Max",
      blurb: "Big number energy, no spotter required. Epley, Brzycki & friends.",
    },
    {
      slug: "macro-calculator",
      hub: "Fuel",
      chip: "bg-good-soft text-foreground",
      stat: fmt(proteinG),
      unit: "g protein",
      name: "Macro Calculator",
      blurb: "Protein, carbs and fat targets that match the goal, not the influencer.",
    },
    {
      slug: "heart-rate-zone-calculator",
      hub: "Workout",
      chip: "bg-primary-soft text-foreground",
      stat: `Z2 ${fmt(zone2.lowerBpm)} to ${fmt(zone2.upperBpm)}`,
      unit: "bpm",
      name: "Heart-Rate Zones",
      blurb: "Five zones, one chart, zero guessing, Zone 2 included.",
    },
  ];
}

const TICKER_ITEMS = [
  "Backed by research",
  "Free to use, sign-in optional",
  "We show the math",
  "Know your numbers in seconds",
];

function TickerCopy({ toolCount }: { toolCount: number }) {
  return (
    <span className="ticker-copy px-2 font-mono text-xs font-bold uppercase tracking-[0.18em]">
      {[...TICKER_ITEMS, `${toolCount} tools & counting`].map((item) => (
        <span key={item}>
          {item}
          <span className="mx-4 text-primary-strong" aria-hidden="true">
            ●
          </span>
        </span>
      ))}
    </span>
  );
}

const HUB_STRIP = [
  { key: "strength", classes: "bg-primary-strong text-foreground" },
  { key: "nutrition", classes: "bg-fresh text-foreground" },
  { key: "recovery", classes: "bg-surface-deep text-foreground" },
] as const;

export default function HomePage() {
  const hubsWithTools = Object.values(hubMeta)
    .map((meta) => ({ meta, tools: toolsForHub(meta.hub) }))
    .filter(({ tools }) => tools.length > 0);
  const peptideTools = tier4Tools();
  const toolCount =
    hubsWithTools.reduce((sum, { tools }) => sum + tools.length, 0) +
    peptideTools.length;
  const cards = startHereCards();

  return (
    <div>
      <section className="grid gap-6 py-8 lg:grid-cols-[1.7fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {toolCount} calculators · every formula cited · free to use
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase sm:text-5xl">
            Evidence-based{" "}
            <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-foreground">
              fitness
            </span>
          </h1>
          <p className="mt-3 max-w-prose text-lg text-muted">
            {SITE_NAME} builds every calculator on published, peer-reviewed
            formulas, with the sources cited on the page, so you can check our
            working.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/heart-age-calculator"
              className="rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-foreground riso-press"
            >
              Find your heart age
            </Link>
            <Link
              href="#all-tools"
              className="rounded-full border-2 border-foreground bg-surface px-5 py-2 font-bold riso-press"
            >
              Browse all tools
            </Link>
            <Link
              href="/arcade"
              className="rounded-full border-2 border-foreground bg-good px-5 py-2 font-bold text-background riso-press"
            >
              Play in the Arcade ⚡
            </Link>
          </div>
        </div>
        <PulseHeroCard />
      </section>

      <div
        role="img"
        className="overflow-hidden rounded-xl border-2 border-foreground bg-foreground py-2 text-background"
        aria-label={`${TICKER_ITEMS.join(". ")}. ${toolCount} tools and counting.`}
      >
        <ThrowableTicker>
          <TickerCopy toolCount={toolCount} />
          <TickerCopy toolCount={toolCount} />
        </ThrowableTicker>
      </div>

      <section className="py-8" aria-labelledby="start-here">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="start-here" className="font-display text-2xl uppercase">
            Start with the big four
          </h2>
          <Link
            href="#all-tools"
            className="text-sm font-semibold text-primary underline underline-offset-2"
          >
            All {toolCount} tools →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((card) => (
            <li
              key={card.slug}
              className="riso-press relative rounded-2xl border-2 border-foreground bg-surface p-4"
            >
              <span
                className={`inline-block rounded-full border border-foreground px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${card.chip}`}
              >
                {card.hub}
              </span>
              <p className="mt-3 font-display text-2xl uppercase tabular-nums sm:text-3xl">
                {card.stat}{" "}
                <span className="font-mono text-sm normal-case text-muted">
                  {card.unit}
                </span>
              </p>
              <h3 className="mt-1 font-bold">
                <Link href={`/${card.slug}`} className="hover:text-primary">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {card.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">{card.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-8" aria-labelledby="bloodtest-cta">
        <Link
          href="/blood-test"
          className="flex flex-col gap-4 rounded-2xl border-2 border-foreground bg-lime p-5 text-foreground riso-press sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
              New · coming soon
            </p>
            <h2 id="bloodtest-cta" className="mt-1 font-display text-2xl uppercase">
              Know your numbers, at-home blood test
            </h2>
            <p className="mt-1 max-w-prose text-sm">
              Test the biomarkers behind your heart, metabolic and biological age.
              Results flow straight into your dashboard and auto-fill the calculators
              that use them.
            </p>
          </div>
          <span className="shrink-0 self-start rounded-full border-2 border-foreground bg-surface px-5 py-2 font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)] sm:self-auto">
            Explore the panel &rarr;
          </span>
        </Link>
      </section>

      <section className="pt-6" aria-labelledby="daily-cta">
        <Link
          href="/daily"
          className="flex flex-col gap-4 rounded-2xl border-2 border-foreground bg-primary-strong p-5 text-foreground riso-press sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
              New · a fresh one every day
            </p>
            <h2 id="daily-cta" className="mt-1 font-display text-2xl uppercase">
              Play today&rsquo;s Ballpark
            </h2>
            <p className="mt-1 max-w-prose text-sm">
              Guess a real, cited fitness stat in one move, then test yourself on the
              weekly myth-buster quiz. Build a streak, learn the numbers.
            </p>
          </div>
          <span className="shrink-0 self-start rounded-full border-2 border-foreground bg-surface px-5 py-2 font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)] sm:self-auto">
            Play today &rarr;
          </span>
        </Link>
      </section>

      <section aria-label="Browse categories" className="pt-8 pb-4">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {HUB_STRIP.map(({ key, classes }) => {
            const entry = hubsWithTools.find(({ meta }) => meta.hub === key);
            if (!entry) return null;
            return (
              <li key={key}>
                <Link
                  href={entry.meta.path}
                  className={`flex min-h-24 flex-col justify-end rounded-2xl border-2 border-foreground p-4 riso-press ${classes}`}
                >
                  <span className="font-display text-xl uppercase">
                    {entry.meta.title}
                  </span>
                  <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">
                    {entry.tools.length} {entry.tools.length === 1 ? "tool" : "tools"}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/calculators"
              className="flex min-h-24 flex-col justify-end rounded-2xl border-2 border-foreground bg-good p-4 text-background riso-press"
            >
              <span className="font-display text-xl uppercase">All calculators</span>
              <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">
                {toolCount} tools, one index
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <div id="all-tools" className="scroll-mt-8">
        {hubsWithTools.map(({ meta, tools }) => (
          <section key={meta.hub} className="py-4" aria-labelledby={`hub-${meta.hub}`}>
            <h2 id={`hub-${meta.hub}`} className="font-display text-2xl uppercase">
              <Link href={meta.path} className="hover:text-primary">
                {meta.title}
              </Link>
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted">{meta.description}</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {tools.map((tool) => (
                <li
                  key={tool.slug}
                  className="riso-press relative rounded-2xl border-2 border-foreground bg-surface p-4"
                >
                  <Link
                    href={`/${tool.slug}`}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    {tool.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="py-4" aria-labelledby="hub-peptides">
          <h2 id="hub-peptides" className="font-display text-2xl uppercase">
            <Link href="/learn/peptides" className="hover:text-primary">
              Peptides
            </Link>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            The evidence-tiered peptides reference, plus its calculator,
            arithmetic only on values you supply, with an enhanced disclaimer
            and no advertising.
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {peptideTools.map((tool) => (
              <li
                key={tool.slug}
                className="riso-press relative rounded-2xl border-2 border-foreground bg-surface p-4"
              >
                <Link
                  href={toolPath(tool)}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {tool.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
