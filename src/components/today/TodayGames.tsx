"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  ballparkKey,
  getResult,
  mythKey,
  parseDailyStore,
  readRawDailyStore,
  subscribeDailyStore,
} from "@/lib/daily-store";
import { localDateISO, mythPuzzleNumber } from "@/lib/daily/schedule";
import { TIER_META } from "@/lib/daily/types";

/**
 * Compact played/unplayed status for today's games (TODAY.md §6.3). The games
 * themselves stay on /daily — this block is a doorway, not a second mount, so
 * /today stays light and the games surface keeps one canonical home.
 */

const playCta =
  "shrink-0 rounded-full border-2 border-foreground bg-lime px-3 py-1 text-sm font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]";
const doneChip =
  "shrink-0 inline-flex items-center gap-1 rounded-full border border-good bg-good-soft px-3 py-1 text-sm font-medium text-good";

export function TodayGames() {
  const raw = useSyncExternalStore(subscribeDailyStore, readRawDailyStore, () => null);
  const store = useMemo(() => parseDailyStore(raw), [raw]);
  const today = localDateISO();

  const ballpark = getResult(store, ballparkKey(today));
  const myth = getResult(store, mythKey(mythPuzzleNumber(today)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
        <div>
          <p className="font-semibold">Ballpark</p>
          <p className="text-sm text-muted">Guess today&rsquo;s stat — every answer cites a study.</p>
        </div>
        {ballpark?.game === "ballpark" ? (
          <span className={doneChip}>
            <span aria-hidden="true">{TIER_META[ballpark.tier].emoji}</span>
            {TIER_META[ballpark.tier].label} ✓
          </span>
        ) : (
          <Link href="/daily" className={playCta}>
            Play
          </Link>
        )}
      </div>

      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
        <div>
          <p className="font-semibold">Myth or Fact?</p>
          <p className="text-sm text-muted">The weekly quiz — five claims, honest verdicts.</p>
        </div>
        {myth?.game === "myth" ? (
          <span className={doneChip}>
            {myth.correct}/{myth.total} this week ✓
          </span>
        ) : (
          <Link href="/daily" className={playCta}>
            Play
          </Link>
        )}
      </div>
    </div>
  );
}
