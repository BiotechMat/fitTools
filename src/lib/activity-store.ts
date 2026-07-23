/**
 * Site-wide activity store — the "showed up today" streak (TODAY.md §5).
 * One generous umbrella run satisfied by any meaningful action anywhere on
 * the site: banking a calculator result, completing a daily game, or
 * liking/saving a Pulse fact. Per-surface streaks (the daily games') keep
 * their own meaning; this one measures the ritual of turning up at all —
 * multiple parallel guilt loops are exactly what ROADMAP §2.4 forbids.
 *
 * Same local-first, guarded, sync-ready pattern as `history.ts`,
 * `daily-store.ts` and `pulse-store.ts`: a pure node-testable core plus a
 * thin localStorage wrapper, versioned and tolerant-parsed, so an E0 account
 * can adopt the document server-side without changing callers. Streak rules
 * are the shared core in `streak.ts` — one ruleset, every surface.
 */

import { localDateISO, daysBetween } from "@/lib/daily/schedule";
import { EMPTY_RUN, MAX_FREEZES, advanceRun, type StreakRun } from "@/lib/streak";

export const ACTIVITY_STORAGE_KEY = "fittools.activity.v1";
export const ACTIVITY_CHANGE_EVENT = "fittools:activity-change";

/** Where the day's credit came from — presentational checklist only. */
export type ActivitySource = "calc" | "daily" | "pulse";

const SOURCES: readonly ActivitySource[] = ["calc", "daily", "pulse"];

export interface ActivityStore {
  version: 1;
  streak: StreakRun;
  /** The local day `todayDone` refers to (null until anything ever counts). */
  todayDate: string | null;
  /** Which sources counted on `todayDate` — drives the "what counted" ticks. */
  todayDone: ActivitySource[];
}

function structuredEmpty(): ActivityStore {
  return { version: 1, streak: { ...EMPTY_RUN }, todayDate: null, todayDone: [] };
}

/* ------------------------------------------------------------------ */
/* Pure core.                                                          */
/* ------------------------------------------------------------------ */

function parseRun(v: unknown): StreakRun {
  if (typeof v !== "object" || v === null) return { ...EMPTY_RUN };
  const r = v as Record<string, unknown>;
  const num = (x: unknown): number =>
    typeof x === "number" && Number.isFinite(x) ? Math.max(0, Math.floor(x)) : 0;
  return {
    current: num(r.current),
    best: num(r.best),
    freezes: Math.min(MAX_FREEZES, num(r.freezes)),
    last: typeof r.last === "string" ? r.last : null,
  };
}

/** Tolerant parse: corrupt/foreign storage degrades to empty, never throws. */
export function parseActivityStore(raw: string | null): ActivityStore {
  if (raw === null) return structuredEmpty();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return structuredEmpty();
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1) return structuredEmpty();
    const todayDone = Array.isArray(r.todayDone)
      ? r.todayDone.filter((s): s is ActivitySource => SOURCES.includes(s as ActivitySource))
      : [];
    return {
      version: 1,
      streak: parseRun(r.streak),
      todayDate: typeof r.todayDate === "string" ? r.todayDate : null,
      todayDone,
    };
  } catch {
    return structuredEmpty();
  }
}

export function serializeActivityStore(store: ActivityStore): string {
  return JSON.stringify(store);
}

/**
 * Count an action from `source` on `dateISO`. Pure. The run advances per the
 * shared rules (idempotent within a day); the checklist rolls over to the new
 * day on its first action and accumulates sources within the day. A backdated
 * action never rewrites the current day's checklist.
 */
export function markActive(
  store: ActivityStore,
  source: ActivitySource,
  dateISO: string,
): ActivityStore {
  const streak = advanceRun(store.streak, dateISO);
  let { todayDate, todayDone } = store;
  if (todayDate === dateISO) {
    if (!todayDone.includes(source)) todayDone = [...todayDone, source];
  } else if (todayDate === null || daysBetween(todayDate, dateISO) > 0) {
    todayDate = dateISO;
    todayDone = [source];
  }
  return { version: 1, streak, todayDate, todayDone };
}

/** Whether `source` already counted on `dateISO` (for the checklist ticks). */
export function isDoneOn(store: ActivityStore, source: ActivitySource, dateISO: string): boolean {
  return store.todayDate === dateISO && store.todayDone.includes(source);
}

/* ------------------------------------------------------------------ */
/* Browser storage wrapper — guarded exactly like history.ts.          */
/* ------------------------------------------------------------------ */

export function readActivityStore(): ActivityStore {
  if (typeof window === "undefined") return structuredEmpty();
  try {
    return parseActivityStore(window.localStorage.getItem(ACTIVITY_STORAGE_KEY));
  } catch {
    return structuredEmpty();
  }
}

/** Raw string read for useSyncExternalStore (stable snapshot). */
export function readRawActivityStore(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function subscribeActivityStore(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(ACTIVITY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ACTIVITY_CHANGE_EVENT, onChange);
  };
}

export function writeActivityStore(store: ActivityStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, serializeActivityStore(store));
    window.dispatchEvent(new Event(ACTIVITY_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/**
 * Count an action from `source` today. The one call the rest of the app
 * makes; storage failure degrades silently — a streak is never worth a
 * broken surface.
 */
export function markActiveToday(source: ActivitySource): void {
  if (typeof window === "undefined") return;
  writeActivityStore(markActive(readActivityStore(), source, localDateISO()));
}
