/**
 * Per-namespace merge functions for account sync (ACCOUNTS.md §6).
 *
 * Pure and node-testable. Each merge takes two parsed documents and returns
 * one, implementing the first-sign-in union strategies the feature docs
 * specify (history.ts rules; DASHBOARD §5; DAILY-GAMES §8; PULSE §6) — and
 * the same functions resolve the conditional-write conflict path (a 409 from
 * a stale writer re-pulls, re-merges here, re-pushes; ACCOUNTS §6.1).
 *
 * Convention: `merge*(base, overlay)`. Set unions and maxima are symmetric;
 * where a single value must win an exact-key tie (a vitals document with no
 * timestamps, an affinity vector), **overlay wins** — callers pass the more
 * recently updated document as `overlay`. Both sides are already
 * tolerant-parsed by their stores, so corrupt input degrades to empty before
 * it reaches here and a merge can only ever widen, never throw.
 */

import {
  HISTORY_LIMIT_PER_TOOL,
  upsertResult,
  type HistoryFile,
  type StoredResult,
} from "@/lib/history";
import {
  upsertBiomarkerReading,
  upsertMetricPoint,
  type BiomarkerReading,
  type DashboardProfile,
  type MetricPoint,
  type ProfileVitals,
} from "@/lib/dashboard-store";
import { MAX_FREEZES, type DailyStore, type StreakState } from "@/lib/daily-store";
import type { PulseStore } from "@/lib/pulse-store";

/* ------------------------------------------------------------------ */
/* history — union by (tool, local day), latest of day wins, capped.   */
/* ------------------------------------------------------------------ */

/**
 * Union two history files. Entries from both sides are replayed in
 * chronological order through the store's own `upsertResult`, so the
 * existing same-local-day-replace and per-tool cap (30) rules apply
 * unchanged and `latestBefore`'s end-first scan stays correct.
 */
export function mergeHistory(base: HistoryFile, overlay: HistoryFile): HistoryFile {
  const all: StoredResult[] = [...base.results, ...overlay.results].sort(
    (a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt),
  );
  let merged: HistoryFile = { version: 1, results: [] };
  for (const entry of all) merged = upsertResult(merged, entry);
  return merged;
}

export const HISTORY_MERGE_CAP = HISTORY_LIMIT_PER_TOOL;

/* ------------------------------------------------------------------ */
/* dashboard — vitals by updatedAt; metrics/biomarkers unioned.        */
/* ------------------------------------------------------------------ */

function newerVitals(base: ProfileVitals, overlay: ProfileVitals): ProfileVitals {
  const baseAt = base.updatedAt ? Date.parse(base.updatedAt) : Number.NaN;
  const overlayAt = overlay.updatedAt ? Date.parse(overlay.updatedAt) : Number.NaN;
  if (Number.isNaN(overlayAt) && Number.isNaN(baseAt)) {
    // Neither side stamped — keep whichever carries data, overlay on a tie.
    return Object.keys(overlay).length > 0 ? overlay : base;
  }
  if (Number.isNaN(overlayAt)) return base;
  if (Number.isNaN(baseAt)) return overlay;
  return overlayAt >= baseAt ? overlay : base;
}

/**
 * Union two dashboard profiles. Vitals: the more recently `updatedAt`-stamped
 * side wins whole (DASHBOARD §6.2 — vitals are one coherent record, not
 * per-field). Metric points: replayed chronologically through
 * `upsertMetricPoint` (same-local-day replace + per-metric cap). Biomarkers:
 * union by (marker, takenAt), overlay winning exact-key ties — the array is
 * empty pre-A4, but the merge must not lose data if it ever isn't.
 */
export function mergeDashboard(
  base: DashboardProfile,
  overlay: DashboardProfile,
): DashboardProfile {
  const points: MetricPoint[] = [...base.metrics, ...overlay.metrics].sort(
    (a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt),
  );
  let merged: DashboardProfile = {
    version: 1,
    profile: newerVitals(base.profile, overlay.profile),
    metrics: [],
    biomarkers: [],
  };
  for (const point of points) merged = upsertMetricPoint(merged, point);
  const readings: BiomarkerReading[] = [...base.biomarkers, ...overlay.biomarkers];
  for (const reading of readings) merged = upsertBiomarkerReading(merged, reading);
  return merged;
}

/* ------------------------------------------------------------------ */
/* daily — union results; streak maxima; larger freeze balance.        */
/* ------------------------------------------------------------------ */

function laterDateISO(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a >= b ? a : b; // ISO YYYY-MM-DD compares lexically
}

function mergeStreak(base: StreakState, overlay: StreakState): StreakState {
  return {
    current: Math.max(base.current, overlay.current),
    best: Math.max(base.best, overlay.best),
    freezes: Math.min(MAX_FREEZES, Math.max(base.freezes, overlay.freezes)),
    lastPlayed: laterDateISO(base.lastPlayed, overlay.lastPlayed),
  };
}

/**
 * Union two daily stores (DAILY-GAMES §8): results union by key (overlay wins
 * an exact-key tie — the puzzles are deterministic, so a tie is the same
 * result anyway), `max(current, best)` on the streak, the larger freeze
 * balance (capped), and the later lastPlayed.
 */
export function mergeDaily(base: DailyStore, overlay: DailyStore): DailyStore {
  return {
    version: 1,
    results: { ...base.results, ...overlay.results },
    streak: mergeStreak(base.streak, overlay.streak),
  };
}

/* ------------------------------------------------------------------ */
/* pulse — monotonic set unions; overlay-wins affinity.                */
/* ------------------------------------------------------------------ */

const PULSE_SEEN_LIMIT = 200; // mirrors pulse-store's bound

function unionOrdered(base: string[], overlay: string[]): string[] {
  const seen = new Set(base);
  const merged = [...base];
  for (const id of overlay) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }
  return merged;
}

/**
 * Union two pulse stores (PULSE §6): likes and saves are monotonic sets
 * (union, base order first); the seen-set unions bounded to the store's most
 * recent 200; affinity is last-write-wins per category with overlay winning
 * (callers pass the newer document as overlay).
 */
export function mergePulse(base: PulseStore, overlay: PulseStore): PulseStore {
  return {
    version: 1,
    likes: unionOrdered(base.likes, overlay.likes),
    saves: unionOrdered(base.saves, overlay.saves),
    seen: unionOrdered(base.seen, overlay.seen).slice(-PULSE_SEEN_LIMIT),
    affinity: { ...base.affinity, ...overlay.affinity },
  };
}
