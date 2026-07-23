/**
 * Pulse batch endpoint (PULSE.md §5–§6). POST → a batch of grounded, generated
 * fact cards for the endless scroll (and the daily hero).
 *
 * Server-side generation is permitted under SPEC §2 (AI-API features "where a
 * feature genuinely needs them, behind explicit consent, a documented
 * data-protection posture, and their own threat model"). This endpoint's
 * data-protection posture is deliberately minimal: the ONLY inputs are a
 * non-personal category filter, a count, and opaque chunk ids the client has
 * already seen. No personal or health data is sent to the model — the model
 * only ever sees the site's own vetted grounding claims. Nothing to store, so
 * no consent gate beyond the site default.
 *
 * Degrades gracefully: with no generator configured (no API key), the vetted
 * claims are served verbatim as cards (`degraded: true`).
 *
 * COST POSTURE (PULSE.md §11.12 / §14.1): generation is SITE-WIDE, not
 * per-request. Cards are assembled from the day's shared phrasing store —
 * one corpus-wide pass per UTC day — so nothing in a request body can trigger
 * a Messages API call, and LLM cost is bounded by corpus size, not traffic.
 */

import { NextResponse } from "next/server";
import { chunksById, groundingChunks } from "@/registry/pulse";
import { buildCardsFromChunks, buildCardsFromDrafts } from "@/lib/pulse/generator";
import { getDayPhrasings } from "@/lib/pulse/phrasings";
import type { DayPhrasings } from "@/lib/pulse/phrasings";
import { dailyChunkIndex, selectChunks } from "@/lib/pulse/rank";
import { isPulseCategory } from "@/lib/pulse/types";
import type { GeneratedCardDraft, GroundingChunk, PulseBatchResponse, PulseCategory } from "@/lib/pulse/types";

// The first request of a UTC day pays for the corpus-wide generation pass
// (a few parallel Haiku calls); give it headroom beyond the platform default.
export const maxDuration = 30;

const MAX_COUNT = 12;
const DEFAULT_COUNT = 6;

interface RequestBody {
  categories?: unknown;
  count?: unknown;
  seen?: unknown;
  affinity?: unknown;
  seed?: unknown;
  daily?: unknown;
  freshOnly?: unknown;
}

/** Days within which the daily hero prefers a fresh chunk (PULSE.md §15.5). */
const DAILY_FRESH_WINDOW_DAYS = 7;

function parseCategories(v: unknown): PulseCategory[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isPulseCategory);
}

function parseAffinity(v: unknown): Partial<Record<PulseCategory, number>> {
  const out: Partial<Record<PulseCategory, number>> = {};
  if (typeof v !== "object" || v === null) return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (isPulseCategory(k) && typeof val === "number" && Number.isFinite(val)) {
      out[k] = Math.max(-1, Math.min(1, val));
    }
  }
  return out;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    // empty/invalid body → sensible defaults
  }

  // The day's site-wide phrasings; null → degraded (no key, budget spent, or
  // API failure) and every card serves its vetted claim verbatim.
  const phrasings = await getDayPhrasings();
  const degraded = phrasings === null;

  // Daily hero: one deterministic, date-seeded card. Prefers a recently-added
  // fresh chunk when one exists (§15.5), still stable per UTC day for everyone
  // — and phrased identically for everyone, since phrasing is day-keyed too.
  if (body.daily === true) {
    const dailyPool = recentFreshChunks();
    const pool = dailyPool.length > 0 ? dailyPool : groundingChunks;
    const chunk = pool[dailyChunkIndex(todayISO(), pool.length)];
    const cards = chunk ? cardsForChunks([chunk.id], phrasings) : [];
    return NextResponse.json({ cards, degraded } satisfies PulseBatchResponse);
  }

  const categories = parseCategories(body.categories);
  const count = clampCount(body.count);
  const seen = Array.isArray(body.seen) ? body.seen.filter((s): s is string => typeof s === "string") : [];
  const affinity = parseAffinity(body.affinity);
  const seed = typeof body.seed === "number" && Number.isFinite(body.seed) ? body.seed : Date.now();
  const freshOnly = body.freshOnly === true;

  const selected = selectChunks(groundingChunks, { categories, count, seen, affinity, seed, freshOnly });
  const cards = cardsForChunks(selected.map((c) => c.id), phrasings);

  return NextResponse.json({ cards, degraded } satisfies PulseBatchResponse);
}

/** Fresh chunks added within the daily-hero window (PULSE.md §15.5). */
function recentFreshChunks() {
  const cutoff = Date.now() - DAILY_FRESH_WINDOW_DAYS * 86_400_000;
  return groundingChunks.filter((c) => {
    if (c.kind !== "fresh" || !c.addedAt) return false;
    const added = Date.parse(c.addedAt);
    return !Number.isNaN(added) && added >= cutoff;
  });
}

function clampCount(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : DEFAULT_COUNT;
  return Math.max(1, Math.min(MAX_COUNT, n));
}

/**
 * Assemble cards for an ordered list of chunk ids from the day's site-wide
 * phrasings; any chunk without a phrasing serves its vetted claim verbatim.
 * Pure lookup — no model call ever happens on the request path, so client
 * input (seen/seed/count) cannot create LLM cost. Order is preserved, and
 * `buildCardsFromDrafts` stays the §1.1 enforcement point (real source
 * attached server-side, unknown chunkIds dropped).
 */
function cardsForChunks(orderedIds: string[], phrasings: DayPhrasings | null): PulseBatchResponse["cards"] {
  const drafts: GeneratedCardDraft[] = [];
  const verbatim: GroundingChunk[] = [];

  for (const id of orderedIds) {
    const chunk = chunksById.get(id);
    if (!chunk) continue;
    const phrasing = phrasings?.[id];
    if (phrasing) drafts.push({ chunkId: id, fact: phrasing.fact, detail: phrasing.detail });
    else verbatim.push(chunk);
  }

  const byChunk = new Map<string, PulseBatchResponse["cards"][number]>();
  for (const card of buildCardsFromDrafts(drafts, chunksById)) byChunk.set(card.chunkId, card);
  for (const card of buildCardsFromChunks(verbatim)) byChunk.set(card.chunkId, card);

  return orderedIds.map((id) => byChunk.get(id)).filter((c) => c !== undefined);
}
