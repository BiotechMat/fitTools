/**
 * Shared streak rules — the one ruleset for every "showed up" run on the
 * site (DAILY-GAMES.md §6, ROADMAP §2.4, DESIGN.md §6): showing up counts,
 * the score doesn't; a missed day is bridged by an earned freeze or warmly
 * reset, never punished. Extracted from the daily-games store so the
 * site-wide activity streak (TODAY.md §5) runs on exactly the same rules.
 * Pure and node-testable. `daysBetween` comes from the daily schedule module
 * — the repo's one date-maths home (UTC-day based).
 */

import { daysBetween } from "@/lib/daily/schedule";

/** Freeze cap — long absences always reset to warm re-entry. */
export const MAX_FREEZES = 3;
/** Days of streak that earn one freeze. */
export const FREEZE_EARN_EVERY = 7;

export interface StreakRun {
  current: number;
  best: number;
  freezes: number;
  /** ISO date (YYYY-MM-DD) of the last counted day; null = never counted. */
  last: string | null;
}

export const EMPTY_RUN: StreakRun = { current: 0, best: 0, freezes: 0, last: null };

/**
 * Advance the run for an action on `dateISO`. Pure.
 * - same day already counted → unchanged (idempotent);
 * - consecutive day          → +1;
 * - missed day(s) within the freeze balance → bridged, freezes spent;
 * - larger gap               → warm reset to 1.
 * A completed week (crossing a multiple of 7) earns one freeze, capped.
 */
export function advanceRun(run: StreakRun, dateISO: string): StreakRun {
  if (run.last === dateISO) return run; // already counted today

  let current: number;
  let freezes = run.freezes;

  if (run.last === null) {
    current = 1;
  } else {
    const gap = daysBetween(run.last, dateISO);
    if (gap <= 0) {
      // An action dated on/before the last counted day — don't rewrite history.
      return run;
    }
    const missed = gap - 1;
    if (missed === 0) {
      current = run.current + 1; // consecutive
    } else if (missed <= freezes) {
      current = run.current + 1; // bridge the gap with earned freezes
      freezes -= missed;
    } else {
      current = 1; // warm re-entry
    }
  }

  const best = Math.max(run.best, current);
  // Earn a freeze each time the streak completes another week.
  if (current > 0 && current % FREEZE_EARN_EVERY === 0) {
    freezes = Math.min(MAX_FREEZES, freezes + 1);
  }
  return { current, best, freezes, last: dateISO };
}

/**
 * Whether the run is still alive seen from `todayISO` — i.e. acting today
 * would extend it rather than reset it. Drives display only: a lapsed run
 * shows warm re-entry copy, never a countdown or a loss state (DESIGN.md §6).
 */
export function runAlive(run: StreakRun, todayISO: string): boolean {
  if (run.last === null || run.current === 0) return false;
  const gap = daysBetween(run.last, todayISO);
  if (gap < 0) return false;
  return gap - 1 <= run.freezes;
}
