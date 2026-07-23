/**
 * Pulse selection & ordering (PULSE.md §5). Pure, deterministic (seeded), and
 * node-testable — mirrors the pure-core split in `history.ts`.
 *
 * Chosen model: engagement-weighted, but the anti-bubble guardrails are part of
 * the contract, not optional polish (PULSE.md §5.3):
 *   1. diversity floor  — no more than `maxRun` consecutive same-category cards;
 *   2. novelty injection — a fixed fraction of picks ignore affinity entirely;
 *   3. no-repeat window  — recently-seen chunks are excluded until the pool is
 *      exhausted, then reset;
 *   4. cold start        — with no affinity, this reduces to a seeded shuffle;
 *   5. bounded influence — affinity only ever *tilts* via a capped weight, so
 *      the floor and novelty rules always bind.
 */

import type { GroundingChunk, PulseCategory } from "./types";

export interface SelectOptions {
  /** Restrict to these categories (the filter bar). Empty/undefined = all. */
  categories?: PulseCategory[];
  /** How many chunks to select. */
  count: number;
  /** Chunk ids the client has seen recently (excluded until pool exhausts). */
  seen?: Iterable<string>;
  /** Per-category affinity in roughly [-1, 1]. Missing = neutral (cold start). */
  affinity?: Partial<Record<PulseCategory, number>>;
  /** Deterministic seed. */
  seed: number;
  /** Fraction of picks drawn ignoring affinity (default 0.3). */
  noveltyFraction?: number;
  /** Max consecutive cards from one category (default 2). */
  maxRun?: number;
  /** Cap on how much affinity can tilt weighting (default 0.6). */
  affinityCap?: number;
  /** Restrict to fresh (recent-discovery) chunks — the "New" chip (PULSE.md §15.5). */
  freshOnly?: boolean;
  /** Reference time for freshness decay. Injectable for tests; default now. */
  nowMs?: number;
  /** Cap on how much recency can tilt weighting, mirroring affinityCap (default 0.6). */
  freshnessCap?: number;
  /** Freshness half-life in days — boost halves every this many days (default 7). */
  freshHalfLifeDays?: number;
  /** Guaranteed fresh picks per batch while unseen fresh chunks exist (default 2). */
  freshReserve?: number;
}

/** A chunk counts as fresh only when explicitly tagged and dated (PULSE.md §15.4). */
function isFreshChunk(c: GroundingChunk): boolean {
  return c.kind === "fresh" && typeof c.addedAt === "string";
}

/**
 * Recency tilt for a fresh chunk: 1.0 on its added-day, halving every
 * `halfLifeDays`, → ~0 by 30 days (PULSE.md §15.5). Capped like affinity so the
 * §5.3 diversity floor and novelty injection always bind. Evergreen chunks and
 * undated/unparseable ones contribute 0 (back-compatible).
 */
function freshnessTilt(
  c: GroundingChunk,
  nowMs: number,
  cap: number,
  halfLifeDays: number,
): number {
  if (!isFreshChunk(c) || !c.addedAt) return 0;
  const added = Date.parse(c.addedAt);
  if (Number.isNaN(added)) return 0;
  const ageDays = Math.max(0, (nowMs - added) / 86_400_000);
  return cap * Math.pow(0.5, ageDays / halfLifeDays);
}

/** Small, fast, seedable PRNG (mulberry32) — deterministic for tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/**
 * Select and order chunks to ground. Weighted sampling (not strict top-N) so
 * the feed stays lively, with the §5.3 guardrails enforced during the draw.
 */
export function selectChunks(
  pool: GroundingChunk[],
  opts: SelectOptions,
): GroundingChunk[] {
  const {
    categories,
    count,
    seed,
    noveltyFraction = 0.3,
    maxRun = 2,
    affinityCap = 0.6,
    freshOnly = false,
    nowMs = Date.now(),
    freshnessCap = 0.6,
    freshHalfLifeDays = 7,
    freshReserve = 2,
  } = opts;
  const seen = new Set(opts.seen ?? []);
  const affinity = opts.affinity ?? {};
  const rand = mulberry32(seed);

  const filterSet = categories && categories.length > 0 ? new Set(categories) : null;
  let candidates = pool.filter((c) => !filterSet || filterSet.has(c.category));
  // "New" chip (§15.5): restrict strictly to fresh chunks. If there are none,
  // the draw returns empty and the UI shows its "nothing new" state — honest,
  // rather than silently serving evergreen cards under the New tab.
  if (freshOnly) candidates = candidates.filter(isFreshChunk);

  // No-repeat window: drop seen, but if that empties the pool, reset (§5.3.3).
  const unseen = candidates.filter((c) => !seen.has(c.id));
  if (unseen.length > 0) candidates = unseen;

  const result: GroundingChunk[] = [];
  const used = new Set<string>();
  let runCategory: PulseCategory | null = null;
  let runLength = 0;
  let freshPicked = 0;

  const want = Math.min(count, candidates.length);
  for (let i = 0; i < want; i++) {
    // Novelty injection: some picks ignore affinity entirely (§5.3.2).
    const ignoreAffinity = rand() < noveltyFraction;

    let available = candidates.filter((c) => !used.has(c.id));

    // Fresh reserve (§15.5): guarantee up to `freshReserve` fresh picks per
    // batch. Only bites at the tail — if the remaining slots are all we have
    // left to satisfy the reserve, restrict to fresh (never to empty).
    const freshStillWanted = freshReserve - freshPicked;
    if (freshStillWanted > 0 && want - i <= freshStillWanted) {
      const fresh = available.filter(isFreshChunk);
      if (fresh.length > 0) available = fresh;
    }

    // Diversity floor: once a category has run `maxRun` in a row, exclude it if
    // any other category is still available (§5.3.1). Applied within whatever
    // the fresh reserve left, and never to empty.
    if (runCategory && runLength >= maxRun) {
      const others = available.filter((c) => c.category !== runCategory);
      if (others.length > 0) available = others;
    }
    if (available.length === 0) break;

    const pick = weightedSample(
      available,
      rand,
      ignoreAffinity ? {} : affinity,
      affinityCap,
      nowMs,
      freshnessCap,
      freshHalfLifeDays,
    );
    result.push(pick);
    used.add(pick.id);
    if (isFreshChunk(pick)) freshPicked += 1;

    if (pick.category === runCategory) {
      runLength += 1;
    } else {
      runCategory = pick.category;
      runLength = 1;
    }
  }
  return result;
}

function weightedSample(
  items: GroundingChunk[],
  rand: () => number,
  affinity: Partial<Record<PulseCategory, number>>,
  affinityCap: number,
  nowMs: number,
  freshnessCap: number,
  freshHalfLifeDays: number,
): GroundingChunk {
  // weight = base(1) + capped affinity tilt + capped recency tilt + jitter.
  // All strictly positive. Recency applies to everyone (editorial, not
  // personalisation), so it is NOT gated by novelty injection.
  const weights = items.map((c) => {
    const aff = clamp(affinity[c.category] ?? 0, -1, 1) * affinityCap;
    const fresh = freshnessTilt(c, nowMs, freshnessCap, freshHalfLifeDays);
    const jitter = rand() * 0.25;
    return Math.max(0.05, 1 + aff + fresh + jitter);
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Deterministic "fact of the day" pick (PULSE.md §7 PulseDaily) — same for every
 * visitor on a given local date, stable across reloads.
 */
export function dailyChunkIndex(dateISO: string, poolLength: number): number {
  if (poolLength <= 0) return 0;
  // Hash YYYY-MM-DD → index. Simple, stable, no deps.
  let h = 0;
  for (let i = 0; i < dateISO.length; i++) {
    h = (Math.imul(h, 31) + dateISO.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % poolLength;
}
