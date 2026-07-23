/**
 * Daily games local store (DAILY-GAMES.md §8). Results + a played-streak with
 * freezes. Same local-first, guarded, sync-ready pattern as `history.ts` and
 * `pulse-store.ts`: a pure, node-testable core plus a thin localStorage
 * wrapper, versioned and tolerant-parsed, keyed by stable ids so an E0 account
 * can adopt the document server-side without changing callers.
 *
 * Streak rules (DAILY-GAMES.md §6, ROADMAP §2.4): played-streak, not
 * perfect-streak — showing up counts, the score doesn't. A single missed day
 * is bridged by an earned freeze (one per completed week, capped); a longer
 * gap resets to a warm day-one, never a loss screen.
 */

import { daysBetween } from "@/lib/daily/schedule";
import type { DailyResult } from "@/lib/daily/types";

export const DAILY_STORAGE_KEY = "fittools.daily.v1";
export const DAILY_CHANGE_EVENT = "fittools:daily-change";

/** Freeze cap — long absences always reset to warm re-entry (§6). */
export const MAX_FREEZES = 3;
/** Days of streak that earn one freeze. */
const FREEZE_EARN_EVERY = 7;

export interface StreakState {
  current: number;
  best: number;
  freezes: number;
  /** ISO date (YYYY-MM-DD) of the last day the daily game was played. */
  lastPlayed: string | null;
}

export interface DailyStore {
  version: 1;
  /** Keyed by a stable per-game/day key (see `ballparkKey` / `mythKey`). */
  results: Record<string, DailyResult>;
  streak: StreakState;
}

const EMPTY_STREAK: StreakState = { current: 0, best: 0, freezes: 0, lastPlayed: null };

export function ballparkKey(dateISO: string): string {
  return `ballpark:${dateISO}`;
}
export function mythKey(weekPuzzle: number): string {
  return `myth:w${weekPuzzle}`;
}

/* ------------------------------------------------------------------ */
/* Pure core.                                                          */
/* ------------------------------------------------------------------ */

function isDailyResult(v: unknown): v is DailyResult {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.game === "ballpark") {
    return typeof r.puzzle === "number" && typeof r.tier === "string";
  }
  if (r.game === "myth") {
    return typeof r.puzzle === "number" && typeof r.correct === "number" && typeof r.total === "number";
  }
  return false;
}

function parseStreak(v: unknown): StreakState {
  if (typeof v !== "object" || v === null) return { ...EMPTY_STREAK };
  const r = v as Record<string, unknown>;
  const num = (x: unknown, min = 0): number =>
    typeof x === "number" && Number.isFinite(x) ? Math.max(min, Math.floor(x)) : 0;
  return {
    current: num(r.current),
    best: num(r.best),
    freezes: Math.min(MAX_FREEZES, num(r.freezes)),
    lastPlayed: typeof r.lastPlayed === "string" ? r.lastPlayed : null,
  };
}

/** Tolerant parse: corrupt/foreign storage degrades to empty, never throws. */
export function parseDailyStore(raw: string | null): DailyStore {
  if (raw === null) return structuredEmpty();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return structuredEmpty();
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1) return structuredEmpty();
    const results: Record<string, DailyResult> = {};
    if (typeof r.results === "object" && r.results !== null) {
      for (const [k, val] of Object.entries(r.results as Record<string, unknown>)) {
        if (isDailyResult(val)) results[k] = val;
      }
    }
    return { version: 1, results, streak: parseStreak(r.streak) };
  } catch {
    return structuredEmpty();
  }
}

function structuredEmpty(): DailyStore {
  return { version: 1, results: {}, streak: { ...EMPTY_STREAK } };
}

export function serializeDailyStore(store: DailyStore): string {
  return JSON.stringify(store);
}

export function hasPlayed(store: DailyStore, key: string): boolean {
  return key in store.results;
}

export function getResult(store: DailyStore, key: string): DailyResult | undefined {
  return store.results[key];
}

/**
 * Advance the streak for a daily play on `dateISO` (DAILY-GAMES.md §6). Pure.
 * - same day already played  → unchanged (idempotent);
 * - consecutive day          → +1;
 * - single missed day(s) within the freeze balance → bridged, freezes spent;
 * - larger gap               → warm reset to 1.
 * A completed week (crossing a multiple of 7) earns one freeze, capped.
 */
export function advanceStreak(streak: StreakState, dateISO: string): StreakState {
  if (streak.lastPlayed === dateISO) return streak; // already counted today

  let current: number;
  let freezes = streak.freezes;

  if (streak.lastPlayed === null) {
    current = 1;
  } else {
    const gap = daysBetween(streak.lastPlayed, dateISO);
    if (gap <= 0) {
      // A play dated on/before the last play — don't rewrite history.
      return streak;
    }
    const missed = gap - 1;
    if (missed === 0) {
      current = streak.current + 1; // consecutive
    } else if (missed <= freezes) {
      current = streak.current + 1; // bridge the gap with earned freezes
      freezes -= missed;
    } else {
      current = 1; // warm re-entry
    }
  }

  const best = Math.max(streak.best, current);
  // Earn a freeze each time the streak completes another week.
  if (current > 0 && current % FREEZE_EARN_EVERY === 0) {
    freezes = Math.min(MAX_FREEZES, freezes + 1);
  }
  return { current, best, freezes, lastPlayed: dateISO };
}

/**
 * Record a result and (for the daily Ballpark game) advance the streak. Myth
 * is weekly and does not drive the daily streak. Pure.
 */
export function recordResult(store: DailyStore, key: string, result: DailyResult, dateISO: string): DailyStore {
  const results = { ...store.results, [key]: result };
  const streak = result.game === "ballpark" ? advanceStreak(store.streak, dateISO) : store.streak;
  return { version: 1, results, streak };
}

/* ------------------------------------------------------------------ */
/* Browser storage wrapper — guarded exactly like history.ts.          */
/* ------------------------------------------------------------------ */

export function readDailyStore(): DailyStore {
  if (typeof window === "undefined") return structuredEmpty();
  try {
    return parseDailyStore(window.localStorage.getItem(DAILY_STORAGE_KEY));
  } catch {
    return structuredEmpty();
  }
}

/** Raw string read for useSyncExternalStore (stable snapshot). */
export function readRawDailyStore(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DAILY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function subscribeDailyStore(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(DAILY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DAILY_CHANGE_EVENT, onChange);
  };
}

export function writeDailyStore(store: DailyStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, serializeDailyStore(store));
    window.dispatchEvent(new Event(DAILY_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/** Read-modify-write helper for the common case. */
export function updateDailyStore(fn: (store: DailyStore) => DailyStore): DailyStore {
  const next = fn(readDailyStore());
  writeDailyStore(next);
  return next;
}
