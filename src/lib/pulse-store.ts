/**
 * Pulse local store (PULSE.md §6). Likes, saves, the seen-set, and the local
 * per-category affinity that tilts ordering (§5.1). Same local-first, guarded,
 * sync-ready pattern as `history.ts`: a pure node-testable core plus a thin
 * localStorage wrapper. Keyed by stable chunk/card ids and versioned, so an E0
 * account can adopt the document server-side without changing callers.
 *
 * Privacy contract (PULSE.md §5.1): dwell is aggregated on-device into the
 * affinity vector via `applyEngagement` and immediately discarded — raw timings
 * are never stored here and never sent anywhere (no dwell analytics event).
 */

import { PULSE_CATEGORIES } from "@/lib/pulse/types";
import type { PulseCategory } from "@/lib/pulse/types";

export const PULSE_STORAGE_KEY = "fittools.pulse.v1";
export const PULSE_CHANGE_EVENT = "fittools:pulse-change";
const SEEN_LIMIT = 200;
const AFFINITY_CAP = 1;

export interface PulseStore {
  version: 1;
  likes: string[];
  saves: string[];
  seen: string[];
  affinity: Partial<Record<PulseCategory, number>>;
}

const EMPTY: PulseStore = { version: 1, likes: [], saves: [], seen: [], affinity: {} };

/** How much each signal nudges category affinity (bounded EMA-style step). */
const ENGAGEMENT_STEP: Record<string, number> = {
  like: 0.15,
  save: 0.15,
  expand: 0.06,
  source: 0.06,
  dwellLong: 0.04, // implicit-positive; raw dwell time is never stored
  scrollPast: -0.03, // implicit-negative
};

function clampAffinity(x: number): number {
  return Math.max(-AFFINITY_CAP, Math.min(AFFINITY_CAP, x));
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === "string");
}

/** Tolerant parse: corrupt/foreign storage degrades to empty, never throws. */
export function parsePulseStore(raw: string | null): PulseStore {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1) return EMPTY;
    const affinity: Partial<Record<PulseCategory, number>> = {};
    if (typeof r.affinity === "object" && r.affinity !== null) {
      for (const [k, val] of Object.entries(r.affinity as Record<string, unknown>)) {
        if ((PULSE_CATEGORIES as readonly string[]).includes(k) && typeof val === "number" && Number.isFinite(val)) {
          affinity[k as PulseCategory] = clampAffinity(val);
        }
      }
    }
    return {
      version: 1,
      likes: isStringArray(r.likes) ? r.likes : [],
      saves: isStringArray(r.saves) ? r.saves : [],
      seen: isStringArray(r.seen) ? r.seen.slice(-SEEN_LIMIT) : [],
      affinity,
    };
  } catch {
    return EMPTY;
  }
}

export function serializePulseStore(store: PulseStore): string {
  return JSON.stringify(store);
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleLike(store: PulseStore, id: string): PulseStore {
  return { ...store, likes: toggle(store.likes, id) };
}

export function toggleSave(store: PulseStore, id: string): PulseStore {
  return { ...store, saves: toggle(store.saves, id) };
}

export function isLiked(store: PulseStore, id: string): boolean {
  return store.likes.includes(id);
}

export function isSaved(store: PulseStore, id: string): boolean {
  return store.saves.includes(id);
}

/** Record a card as seen (by chunk id), bounded to the most recent SEEN_LIMIT. */
export function recordSeen(store: PulseStore, chunkId: string): PulseStore {
  const seen = [...store.seen.filter((s) => s !== chunkId), chunkId].slice(-SEEN_LIMIT);
  return { ...store, seen };
}

/**
 * Fold an engagement signal into the category affinity (§5.1). Dwell arrives
 * already reduced to `dwellLong` / `scrollPast` — the caller must never pass raw
 * timings, and none are stored.
 */
export function applyEngagement(
  store: PulseStore,
  category: PulseCategory,
  kind: keyof typeof ENGAGEMENT_STEP,
): PulseStore {
  const step = ENGAGEMENT_STEP[kind] ?? 0;
  const current = store.affinity[category] ?? 0;
  return {
    ...store,
    affinity: { ...store.affinity, [category]: clampAffinity(current + step) },
  };
}

/* ------------------------------------------------------------------ */
/* Browser storage wrapper — guarded exactly like history.ts.          */
/* ------------------------------------------------------------------ */

export function readPulseStore(): PulseStore {
  if (typeof window === "undefined") return EMPTY;
  try {
    return parsePulseStore(window.localStorage.getItem(PULSE_STORAGE_KEY));
  } catch {
    return EMPTY;
  }
}

/** Raw string read for useSyncExternalStore (stable snapshot). Mirrors history.ts. */
export function readRawPulseStore(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PULSE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Subscribe to same-tab and cross-tab store changes (for useSyncExternalStore). */
export function subscribePulseStore(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(PULSE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PULSE_CHANGE_EVENT, onChange);
  };
}

export function writePulseStore(store: PulseStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PULSE_STORAGE_KEY, serializePulseStore(store));
    window.dispatchEvent(new Event(PULSE_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/** Read-modify-write helper for the common case. */
export function updatePulseStore(fn: (store: PulseStore) => PulseStore): PulseStore {
  const next = fn(readPulseStore());
  writePulseStore(next);
  return next;
}
