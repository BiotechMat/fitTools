"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  ballparkKey,
  getResult,
  hasPlayed,
  parseDailyStore,
  readRawDailyStore,
  recordResult,
  subscribeDailyStore,
  updateDailyStore,
} from "@/lib/daily-store";
import { ballparkIndexForDate, ballparkPuzzleNumber, localDateISO } from "@/lib/daily/schedule";
import { defaultGuess, scoreGuess } from "@/lib/daily/score";
import { ballparkShareText, shareText } from "@/lib/daily/share";
import { TIER_META, type BallparkResult, type ClosenessTier } from "@/lib/daily/types";
import { ballparkItems } from "@/registry/daily";
import { BallparkSlider } from "./BallparkSlider";
import { RevealPanel } from "./RevealPanel";

const SHARE_WINDOW_DAYS = 7;

/** Collect the closeness tiers for the last `days` calendar days (oldest→newest). */
function recentTiers(store: ReturnType<typeof parseDailyStore>, today: string, days: number): ClosenessTier[] {
  const out: ClosenessTier[] = [];
  const base = new Date(`${today}T00:00:00Z`);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    const r = getResult(store, ballparkKey(d));
    if (r && r.game === "ballpark") out.push(r.tier);
  }
  return out;
}

/**
 * Ballpark — the daily guess-the-stat (DAILY-GAMES.md §3.1). Deterministic per
 * local date, one guess a day, locked after playing. Registry ships in the
 * bundle (§5), so this is pure client state — no API.
 */
export function Ballpark() {
  // Compute the local date after mount to avoid an SSR/CSR hydration mismatch
  // (§9): the puzzle depends on the visitor's calendar day, not the server's.
  const today = useMountedDate();
  const rawStore = useSyncExternalStore(subscribeDailyStore, readRawDailyStore, () => null);
  const store = useMemo(() => parseDailyStore(rawStore), [rawStore]);

  if (!today) {
    // Reserve height (zero CLS) until the local date is known.
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-deep" aria-hidden="true" />;
  }

  const puzzle = ballparkPuzzleNumber(today);
  const item = ballparkItems[ballparkIndexForDate(ballparkItems.length, today)];
  const key = ballparkKey(today);
  const played = hasPlayed(store, key);
  const storedTier = (getResult(store, key) as BallparkResult | undefined)?.tier ?? null;

  return (
    <BallparkGame
      key={key}
      item={item}
      puzzle={puzzle}
      today={today}
      alreadyPlayed={played}
      storedTier={storedTier}
      recent={recentTiers(store, today, SHARE_WINDOW_DAYS)}
      storeKey={key}
    />
  );
}

/** The interactive round. Keyed on the day so a new day remounts it cleanly. */
function BallparkGame({
  item,
  puzzle,
  today,
  alreadyPlayed,
  storedTier,
  recent,
  storeKey,
}: {
  item: (typeof ballparkItems)[number];
  puzzle: number;
  today: string;
  alreadyPlayed: boolean;
  storedTier: ClosenessTier | null;
  recent: ClosenessTier[];
  storeKey: string;
}) {
  const [guess, setGuess] = useState(() => defaultGuess(item, puzzle));
  const [justPlayedTier, setJustPlayedTier] = useState<ClosenessTier | null>(null);

  const revealed = alreadyPlayed || justPlayedTier !== null;
  const tier = justPlayedTier ?? storedTier;

  const submit = () => {
    const scored = scoreGuess(item, guess);
    const result: BallparkResult = { game: "ballpark", puzzle, tier: scored };
    updateDailyStore((s) => recordResult(s, storeKey, result, today));
    setJustPlayedTier(scored);
    trackEvent({ name: "daily_game_played", params: { game: "ballpark", result: scored } });
  };

  const share = () => {
    // Include today's fresh tier even if the store snapshot in `recent` predates it.
    const tiers = alreadyPlayed || recent.length > 0 ? recent : [];
    const withToday = justPlayedTier && tiers[tiers.length - 1] !== justPlayedTier ? [...tiers, justPlayedTier] : tiers;
    void shareText(ballparkShareText(puzzle, withToday.length > 0 ? withToday : tier ? [tier] : []));
    trackEvent({ name: "daily_game_shared", params: { game: "ballpark" } });
  };

  return (
    <section
      aria-labelledby="ballpark-heading"
      className="rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)] sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h2 id="ballpark-heading" className="font-display text-xl uppercase">
          Ballpark
        </h2>
        <span className="font-mono text-xs text-muted">#{puzzle}</span>
      </div>
      <p className="mt-2 text-lg font-medium">{item.question}</p>

      <div className="mt-5">
        <BallparkSlider item={item} value={guess} onChange={setGuess} disabled={revealed} />
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={submit}
          className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 font-semibold text-background hover:bg-primary-strong"
        >
          Lock in my guess
        </button>
      ) : (
        <>
          {tier ? (
            <div className="mt-5 flex items-center gap-2" role="status" aria-live="polite">
              <span className="text-2xl" aria-hidden="true">
                {TIER_META[tier].emoji}
              </span>
              <span className="font-display text-2xl uppercase">{TIER_META[tier].label}</span>
              {alreadyPlayed && !justPlayedTier ? (
                <span className="ml-2 text-sm text-muted">— you already played today</span>
              ) : null}
            </div>
          ) : null}

          <RevealPanel item={item} animate={justPlayedTier !== null} />

          <button
            type="button"
            onClick={share}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 font-semibold hover:bg-surface-deep"
          >
            <span aria-hidden="true">↗</span> Share result
          </button>
          <p className="mt-2 text-xs text-muted">Shares your score grid only — never the answer. Come back tomorrow for the next one.</p>
        </>
      )}
    </section>
  );
}

/** null until mounted, then the visitor's local YYYY-MM-DD. */
function useMountedDate(): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => localDateISO(),
    () => null,
  );
}
