/**
 * Site-wide daily phrasing store (PULSE.md §11.12, §14.1). One generation pass
 * per UTC day covers the WHOLE corpus, and every visitor is served from it —
 * LLM cost is a function of corpus size (a handful of Haiku-class calls a
 * day), never of traffic. Nothing a client sends can trigger a model call.
 *
 * Layers:
 *  - L1 — per-instance memo + in-flight dedup: one pass per instance per day
 *    even under concurrent first requests.
 *  - L2 — Next's data cache (`unstable_cache`): shared across serverless
 *    instances on Vercel, so the day's pass runs once site-wide and every
 *    visitor sees identical phrasing. Where no cache handler exists (unit
 *    tests, bare node) it degrades to L1.
 *  - Budget breaker — a hard cap on generation calls per instance per UTC
 *    day. Beyond it the feed serves vetted claims verbatim (never breaks), so
 *    a bug or abuse costs at most MAX_GENERATION_CALLS_PER_DAY calls.
 *
 * The day key includes a corpus fingerprint, so a deploy that adds or corrects
 * chunks re-generates immediately rather than serving stale phrasings.
 */

import { unstable_cache } from "next/cache";
import { groundingChunks } from "@/registry/pulse";
import { getGenerator } from "./generator";
import type { PulseGenerator } from "./generator";
import type { GroundingChunk } from "./types";

/** One phrasing per chunk for a given UTC day, keyed by chunkId. */
export type DayPhrasings = Record<string, { fact: string; detail?: string }>;

/** Chunks per Messages API call — the corpus is covered in ceil(n/25) calls. */
export const PHRASING_BATCH_SIZE = 25;

/**
 * Hard per-instance, per-UTC-day cap on generation calls — the cost circuit
 * breaker. Normal operation is ceil(corpus / PHRASING_BATCH_SIZE) calls a day
 * (≤4 at the 100-chunk v1 target); the headroom covers retries after
 * transient API failures.
 */
export const MAX_GENERATION_CALLS_PER_DAY = 40;

/** Wait between regeneration attempts after a failed pass (per instance). */
const FAILURE_BACKOFF_MS = 60_000;

/** Keep a day's entry readable slightly past its day, then let it expire. */
const SHARED_CACHE_REVALIDATE_S = 60 * 60 * 36;

export function phrasingDayKey(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Tiny stable string hash (djb2) — not security-sensitive. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function corpusFingerprint(chunks: readonly GroundingChunk[]): string {
  return `${chunks.length}-${hash(chunks.map((c) => `${c.id}:${c.claim}`).join("|"))}`;
}

/** Generation itself failed or was refused — distinct from the shared cache
 *  being unavailable, which falls back to a direct per-instance pass. */
class GenerationUnavailableError extends Error {}

interface SpendState {
  day: string;
  calls: number;
  warned: boolean;
}
let spend: SpendState = { day: "", calls: 0, warned: false };

function reserveCalls(n: number, now: number): boolean {
  const day = phrasingDayKey(now);
  if (spend.day !== day) spend = { day, calls: 0, warned: false };
  if (spend.calls + n > MAX_GENERATION_CALLS_PER_DAY) {
    if (!spend.warned) {
      console.warn(
        `[pulse] daily generation budget (${MAX_GENERATION_CALLS_PER_DAY} calls) reached — serving vetted claims verbatim until the next UTC day`,
      );
      spend.warned = true;
    }
    return false;
  }
  spend.calls += n;
  return true;
}

/**
 * One corpus-wide generation pass: batches of PHRASING_BATCH_SIZE, requested
 * in parallel. Throws when the budget is exhausted or nothing was generated,
 * so a failed pass is never cached as "today's phrasings" — a PARTIAL pass is
 * kept (chunks without a phrasing serve their vetted claim per-request).
 */
export async function generateDayPhrasings(
  chunks: readonly GroundingChunk[],
  generator: PulseGenerator,
  reserve: (calls: number) => boolean,
): Promise<DayPhrasings> {
  const batches: GroundingChunk[][] = [];
  for (let i = 0; i < chunks.length; i += PHRASING_BATCH_SIZE) {
    batches.push(chunks.slice(i, i + PHRASING_BATCH_SIZE));
  }
  if (batches.length === 0 || !reserve(batches.length)) {
    throw new GenerationUnavailableError("generation budget exhausted");
  }

  const results = await Promise.all(batches.map((batch) => generator.generate(batch)));
  const phrasings: DayPhrasings = {};
  for (const draft of results.flat()) {
    const fact = draft.fact?.trim();
    if (!fact) continue;
    phrasings[draft.chunkId] = { fact, detail: draft.detail?.trim() || undefined };
  }
  if (Object.keys(phrasings).length === 0) {
    throw new GenerationUnavailableError("generation produced no drafts");
  }
  return phrasings;
}

/** Seam for the cross-instance cache, injectable in tests. */
export interface SharedPhrasingStore {
  getOrGenerate(keyParts: string[], generate: () => Promise<DayPhrasings>): Promise<DayPhrasings>;
}

const nextDataCacheStore: SharedPhrasingStore = {
  getOrGenerate(keyParts, generate) {
    return unstable_cache(generate, keyParts, { revalidate: SHARED_CACHE_REVALIDATE_S })();
  },
};

let memo: { key: string; phrasings: DayPhrasings } | null = null;
let inflight: { key: string; promise: Promise<DayPhrasings | null> } | null = null;
let lastFailureAt = -Infinity;

export interface GetDayPhrasingsOptions {
  now?: number;
  chunks?: readonly GroundingChunk[];
  generator?: PulseGenerator;
  store?: SharedPhrasingStore;
}

/**
 * The day's site-wide phrasings, or null when generation is unavailable — no
 * API key, budget exhausted, or the API failed — in which case callers serve
 * vetted claims verbatim (degraded). Never throws.
 */
export async function getDayPhrasings(opts: GetDayPhrasingsOptions = {}): Promise<DayPhrasings | null> {
  const now = opts.now ?? Date.now();
  const generator = opts.generator ?? getGenerator();
  if (!generator.available) return null;

  const chunks = opts.chunks ?? groundingChunks;
  const key = `${phrasingDayKey(now)}/${corpusFingerprint(chunks)}`;

  if (memo?.key === key) return memo.phrasings;
  if (inflight?.key === key) return inflight.promise;
  if (now - lastFailureAt < FAILURE_BACKOFF_MS) return null;

  const store = opts.store ?? nextDataCacheStore;
  const generate = () => generateDayPhrasings(chunks, generator, (n) => reserveCalls(n, now));

  const promise = (async (): Promise<DayPhrasings | null> => {
    try {
      return await store.getOrGenerate(["pulse-phrasings", key], generate);
    } catch (err) {
      if (err instanceof GenerationUnavailableError) return null;
      // The shared cache itself is unavailable (no Next cache handler — unit
      // tests, bare node). Degrade to a direct per-instance pass.
      try {
        return await generate();
      } catch {
        return null;
      }
    }
  })();

  inflight = { key, promise };
  try {
    const phrasings = await promise;
    if (phrasings) memo = { key, phrasings };
    else lastFailureAt = now;
    return phrasings;
  } finally {
    if (inflight?.key === key) inflight = null;
  }
}

/** Test helper — clears memo, in-flight, backoff and budget state. */
export function resetPhrasingStateForTests(): void {
  memo = null;
  inflight = null;
  lastFailureAt = -Infinity;
  spend = { day: "", calls: 0, warned: false };
}
