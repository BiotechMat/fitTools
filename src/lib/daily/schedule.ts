/**
 * Deterministic daily scheduling (DAILY-GAMES.md §5). Pure and node-testable.
 *
 * The same puzzle for everyone on a given calendar day, knowable in advance,
 * with no repeats until the pool is exhausted. Item for day N = a seeded
 * permutation of the pool indexed by N, so the sequence never changes
 * retroactively when new items are appended to the tail.
 *
 * Reuses `mulberry32` from the Pulse ranker — the repo's one small seeded PRNG
 * (no new dependency, CLAUDE.md).
 */

import { mulberry32 } from "@/lib/pulse/rank";

/** Launch epoch (UTC midnight). Puzzle #0 is this day. */
export const BALLPARK_EPOCH = "2026-01-01";

/** Whole days between two ISO dates (YYYY-MM-DD), UTC, non-negative-safe. */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.floor((to - from) / 86_400_000);
}

/** The local calendar date as YYYY-MM-DD (the player's day, not UTC). */
export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO-8601 week number (weeks starting Monday) — for the weekly Myth game. */
export function isoWeekNumber(dateISO: string): number {
  const d = new Date(`${dateISO}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 0;
  // Shift to the Thursday of this week, then count weeks from year start.
  const day = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

/** Absolute ISO-week index from a fixed origin — monotonic, for scheduling. */
export function absoluteWeekIndex(dateISO: string): number {
  return Math.floor(daysBetween(BALLPARK_EPOCH, dateISO) / 7);
}

/**
 * A Fisher-Yates shuffle of [0..n) seeded by `block`, giving a stable
 * permutation of item indices for that block of the schedule. Appending items
 * grows n; earlier blocks with the old n are unaffected because each block
 * reshuffles the full current pool deterministically from its own seed.
 */
function seededPermutation(n: number, block: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(block * 2654435761 + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Pick the index into `poolLength` for puzzle number `n`, cycling through a
 * fresh seeded permutation each time the pool is exhausted (no repeats within
 * a cycle; §5 no-repeat).
 */
export function scheduledIndex(poolLength: number, n: number): number {
  if (poolLength <= 0) return 0;
  const cycle = Math.floor(n / poolLength);
  const offset = ((n % poolLength) + poolLength) % poolLength;
  return seededPermutation(poolLength, cycle)[offset];
}

/** Ballpark puzzle number for a date (days since epoch; clamped at 0). */
export function ballparkPuzzleNumber(dateISO: string): number {
  return Math.max(0, daysBetween(BALLPARK_EPOCH, dateISO));
}

/** The scheduled Ballpark item index for a date. */
export function ballparkIndexForDate(poolLength: number, dateISO: string): number {
  return scheduledIndex(poolLength, ballparkPuzzleNumber(dateISO));
}

/** Myth puzzle number for a date (weeks since epoch; clamped at 0). */
export function mythPuzzleNumber(dateISO: string): number {
  return Math.max(0, absoluteWeekIndex(dateISO));
}

/** The scheduled Myth item indices (a set of `count`) for a date's week. */
export function mythIndicesForDate(poolLength: number, dateISO: string, count: number): number[] {
  if (poolLength <= 0) return [];
  const week = mythPuzzleNumber(dateISO);
  const perm = seededPermutation(poolLength, week + 100_000); // distinct seed space from ballpark
  const want = Math.min(count, poolLength);
  return perm.slice(0, want);
}

/** Is the given date a Monday? Myth or Fact refreshes weekly on Mondays (§3.2). */
export function isMonday(dateISO: string): boolean {
  const d = new Date(`${dateISO}T00:00:00Z`);
  return d.getUTCDay() === 1;
}
