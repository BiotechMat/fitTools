import Link from "next/link";
import { HeroEcg } from "@/components/effects/HeroEcg";

/**
 * Compact Pulse teaser for the homepage hero's right column. Deliberately
 * static and server-rendered — no data fetch, so it adds zero CLS and no client
 * JS to the hero (SPEC §13 budgets). Card language per DESIGN §6 (ink border,
 * hard shadow, rotated matcha novelty sticker); links into the full feed.
 * Carries the §8 ECG telemetry drift as its card background (pure SVG + CSS,
 * still no client JS); `isolate` keeps the negative-z trace above the card
 * fill, `overflow-hidden` clips it to the rounded border.
 */
const TEASER_TAGS = ["Recovery", "Longevity", "Nutrition", "Sleep"];

export function PulseHeroCard() {
  return (
    <div className="relative isolate flex flex-col gap-3 overflow-hidden rounded-xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]">
      <HeroEcg />
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl uppercase tracking-wide">Pulse Feed</span>
        <span className="-rotate-2 rounded-full border border-good bg-good-soft px-2 py-0.5 text-xs font-semibold text-good">
          New
        </span>
      </div>
      <p className="text-sm text-muted">
        An endless, source-checked feed of fitness, recovery and longevity facts, like the ones that click, save the keepers, filter to what you care
        about.
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-hidden="true">
        {TEASER_TAGS.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-surface-deep px-2 py-0.5 text-xs font-medium text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
      <Link
        href="/pulse"
        className="riso-press [--riso:2px] mt-1 inline-block self-start rounded-full border-2 border-foreground bg-primary-strong px-4 py-1.5 text-sm font-bold text-foreground"
      >
        Open Pulse →
      </Link>
    </div>
  );
}
