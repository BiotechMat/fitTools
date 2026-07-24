/**
 * The `arcade` namespace document (ACCOUNTS.md §6.2) — a sync adapter over
 * the games' existing scattered localStorage keys, NOT a replacement for
 * them. The games keep their zero-dependency storage exactly as shipped
 * (LIFELINE/POWERHOUSE/MAXOUT/FIVEADAY guardrail: works without
 * localStorage, no new coupling); this module collects those keys into one
 * versioned document for sync and distributes a merged document back,
 * **only ever raising** local numbers (a sync can never lower a best).
 *
 * Deliberately NOT synced (device-local by design): mute states, the ghost
 * replay samples (large, and "you vs you" is per-device), and the
 * ghost-off toggle. Daily bests sync bounded to the most recent 30 dates.
 */

export const ARCADE_BEST_KEYS: Record<string, string> = {
  lifeline: "fittools.lifeline.best",
  powerhouse: "fittools.powerhouse.best",
  maxout: "fittools.maxout.best",
  fiveaday: "fittools.fiveaday.best",
};

const LIFELINE_DAILY_PREFIX = "fittools.lifeline.daily.";
const LIFELINE_SKINS_KEY = "fittools.lifeline.skins";
const LIFELINE_SKIN_KEY = "fittools.lifeline.skin";
const DAILY_BEST_LIMIT = 30;

export interface ArcadeDoc {
  version: 1;
  /** Per-game best scores, keyed by game id. */
  bests: Record<string, number>;
  /** Lifeline per-day bests, keyed by ISO date (bounded to most recent 30). */
  dailyBests: Record<string, number>;
  /** Lifeline earned skin unlocks (earned, never bought — LIFELINE §3). */
  skins: string[];
  /** Selected skin — a preference, last-write-wins. */
  selectedSkin?: string;
}

const EMPTY: ArcadeDoc = { version: 1, bests: {}, dailyBests: {}, skins: [] };

function finitePositive(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : Number.NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function boundDailyBests(dailyBests: Record<string, number>): Record<string, number> {
  const dates = Object.keys(dailyBests).sort(); // ISO dates sort lexically
  const kept = dates.slice(-DAILY_BEST_LIMIT);
  const out: Record<string, number> = {};
  for (const d of kept) out[d] = dailyBests[d];
  return out;
}

/** Tolerant parse of a serialised arcade document. */
export function parseArcadeDoc(raw: string | null): ArcadeDoc {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1) return EMPTY;
    const bests: Record<string, number> = {};
    if (typeof r.bests === "object" && r.bests !== null) {
      for (const [k, v] of Object.entries(r.bests as Record<string, unknown>)) {
        const n = finitePositive(v);
        if (n !== null && k in ARCADE_BEST_KEYS) bests[k] = n;
      }
    }
    const dailyBests: Record<string, number> = {};
    if (typeof r.dailyBests === "object" && r.dailyBests !== null) {
      for (const [k, v] of Object.entries(r.dailyBests as Record<string, unknown>)) {
        const n = finitePositive(v);
        if (n !== null && /^\d{4}-\d{2}-\d{2}$/.test(k)) dailyBests[k] = n;
      }
    }
    const skins = Array.isArray(r.skins)
      ? r.skins.filter((s): s is string => typeof s === "string")
      : [];
    return {
      version: 1,
      bests,
      dailyBests: boundDailyBests(dailyBests),
      skins: [...new Set(skins)],
      ...(typeof r.selectedSkin === "string" ? { selectedSkin: r.selectedSkin } : {}),
    };
  } catch {
    return EMPTY;
  }
}

export function serializeArcadeDoc(doc: ArcadeDoc): string {
  return JSON.stringify(doc);
}

/**
 * Merge (ACCOUNTS §6.2): max per numeric key, union unlocks, overlay-wins
 * selected skin. Purely widening — a merge can only raise numbers.
 */
export function mergeArcadeDocs(base: ArcadeDoc, overlay: ArcadeDoc): ArcadeDoc {
  const bests: Record<string, number> = { ...base.bests };
  for (const [k, v] of Object.entries(overlay.bests)) {
    bests[k] = Math.max(bests[k] ?? 0, v);
  }
  const dailyBests: Record<string, number> = { ...base.dailyBests };
  for (const [k, v] of Object.entries(overlay.dailyBests)) {
    dailyBests[k] = Math.max(dailyBests[k] ?? 0, v);
  }
  const selected = overlay.selectedSkin ?? base.selectedSkin;
  return {
    version: 1,
    bests,
    dailyBests: boundDailyBests(dailyBests),
    skins: [...new Set([...base.skins, ...overlay.skins])],
    ...(selected !== undefined ? { selectedSkin: selected } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Collect / distribute over the games' own keys (guarded).            */
/* ------------------------------------------------------------------ */

/** Snapshot the games' current local state into one document. */
export function collectArcadeDoc(): ArcadeDoc {
  if (typeof window === "undefined") return EMPTY;
  try {
    const ls = window.localStorage;
    const bests: Record<string, number> = {};
    for (const [game, key] of Object.entries(ARCADE_BEST_KEYS)) {
      const n = finitePositive(ls.getItem(key));
      if (n !== null) bests[game] = n;
    }
    const dailyBests: Record<string, number> = {};
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (key !== null && key.startsWith(LIFELINE_DAILY_PREFIX)) {
        const date = key.slice(LIFELINE_DAILY_PREFIX.length);
        const n = finitePositive(ls.getItem(key));
        if (n !== null && /^\d{4}-\d{2}-\d{2}$/.test(date)) dailyBests[date] = n;
      }
    }
    let skins: string[] = [];
    const skinsRaw = ls.getItem(LIFELINE_SKINS_KEY);
    if (skinsRaw !== null) {
      try {
        const parsed: unknown = JSON.parse(skinsRaw);
        if (Array.isArray(parsed)) {
          skins = parsed.filter((s): s is string => typeof s === "string");
        }
      } catch {
        // corrupt skins list — leave empty
      }
    }
    const selected = ls.getItem(LIFELINE_SKIN_KEY);
    return {
      version: 1,
      bests,
      dailyBests: boundDailyBests(dailyBests),
      skins: [...new Set(skins)],
      ...(selected !== null ? { selectedSkin: selected } : {}),
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Write a merged document back into the games' keys. Numbers are written
 * only when they RAISE the local value; skins union in; the selected skin
 * is written only when no local selection exists (a local choice is the
 * freshest signal on this device).
 */
export function distributeArcadeDoc(doc: ArcadeDoc): void {
  if (typeof window === "undefined") return;
  try {
    const ls = window.localStorage;
    for (const [game, key] of Object.entries(ARCADE_BEST_KEYS)) {
      const incoming = doc.bests[game];
      if (incoming === undefined) continue;
      const local = finitePositive(ls.getItem(key)) ?? 0;
      if (incoming > local) ls.setItem(key, String(incoming));
    }
    for (const [date, incoming] of Object.entries(doc.dailyBests)) {
      const key = LIFELINE_DAILY_PREFIX + date;
      const local = finitePositive(ls.getItem(key)) ?? 0;
      if (incoming > local) ls.setItem(key, String(incoming));
    }
    if (doc.skins.length > 0) {
      let localSkins: string[] = [];
      const raw = ls.getItem(LIFELINE_SKINS_KEY);
      if (raw !== null) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localSkins = parsed.filter((s): s is string => typeof s === "string");
          }
        } catch {
          // corrupt — treat as none
        }
      }
      const union = [...new Set([...localSkins, ...doc.skins])];
      if (union.length !== localSkins.length) {
        ls.setItem(LIFELINE_SKINS_KEY, JSON.stringify(union));
      }
    }
    if (doc.selectedSkin !== undefined && ls.getItem(LIFELINE_SKIN_KEY) === null) {
      ls.setItem(LIFELINE_SKIN_KEY, doc.selectedSkin);
    }
  } catch {
    // storage unavailable — nothing to distribute; local play is unaffected
  }
}
