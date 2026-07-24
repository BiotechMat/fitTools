/**
 * The `prefs` namespace document (ACCOUNTS.md §6.2) — a sync adapter over
 * the existing unit-preference key so metric/imperial follows the account
 * across devices. Last-write-wins (the engine passes the newer document as
 * overlay). The unit key stores a raw "metric"/"imperial" string (not JSON)
 * and UnitInput listens for its own change event — this adapter preserves
 * both exactly (no caller changes, per the HistoryProvider-seam promise).
 */

const UNITS_KEY = "fittools:units";
const UNITS_CHANGE_EVENT = "fittools:units-change";

export type UnitSystem = "metric" | "imperial";

export interface PrefsDoc {
  version: 1;
  units?: UnitSystem;
}

const EMPTY: PrefsDoc = { version: 1 };

function isUnitSystem(v: unknown): v is UnitSystem {
  return v === "metric" || v === "imperial";
}

/** Tolerant parse of a serialised prefs document. */
export function parsePrefsDoc(raw: string | null): PrefsDoc {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1) return EMPTY;
    return { version: 1, ...(isUnitSystem(r.units) ? { units: r.units } : {}) };
  } catch {
    return EMPTY;
  }
}

export function serializePrefsDoc(doc: PrefsDoc): string {
  return JSON.stringify(doc);
}

/** Last-write-wins per field; overlay is the newer document. */
export function mergePrefsDocs(base: PrefsDoc, overlay: PrefsDoc): PrefsDoc {
  const units = overlay.units ?? base.units;
  return { version: 1, ...(units !== undefined ? { units } : {}) };
}

/** Snapshot the device's current preferences. */
export function collectPrefsDoc(): PrefsDoc {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(UNITS_KEY);
    return { version: 1, ...(isUnitSystem(raw) ? { units: raw } : {}) };
  } catch {
    return EMPTY;
  }
}

/** Adopt a merged document locally, firing UnitInput's own change event. */
export function distributePrefsDoc(doc: PrefsDoc): void {
  if (typeof window === "undefined") return;
  try {
    if (doc.units !== undefined) {
      const current = window.localStorage.getItem(UNITS_KEY);
      if (current !== doc.units) {
        window.localStorage.setItem(UNITS_KEY, doc.units);
        window.dispatchEvent(new Event(UNITS_CHANGE_EVENT));
      }
    }
  } catch {
    // storage unavailable — preference stays session-local
  }
}

export const PREFS_CHANGE_EVENTS = [UNITS_CHANGE_EVENT];
