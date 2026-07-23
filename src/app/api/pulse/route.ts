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
 */

import { NextResponse } from "next/server";
import { chunksById, groundingChunks } from "@/registry/pulse";
import { getCachedCard, setCachedCard } from "@/lib/pulse/cache";
import {
  buildCardsFromChunks,
  buildCardsFromDrafts,
  getGenerator,
} from "@/lib/pulse/generator";
import { dailyChunkIndex, selectChunks } from "@/lib/pulse/rank";
import { isPulseCategory } from "@/lib/pulse/types";
import type { PulseBatchResponse, PulseCategory } from "@/lib/pulse/types";

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

  const generator = getGenerator();
  const degraded = !generator.available;

  // Daily hero: one deterministic, date-seeded card. Prefers a recently-added
  // fresh chunk when one exists (§15.5), still stable per UTC day for everyone.
  if (body.daily === true) {
    const dailyPool = recentFreshChunks();
    const pool = dailyPool.length > 0 ? dailyPool : groundingChunks;
    const chunk = pool[dailyChunkIndex(todayISO(), pool.length)];
    const cards = chunk ? await cardsForChunks([chunk.id]) : [];
    return NextResponse.json({ cards, degraded } satisfies PulseBatchResponse);
  }

  const categories = parseCategories(body.categories);
  const count = clampCount(body.count);
  const seen = Array.isArray(body.seen) ? body.seen.filter((s): s is string => typeof s === "string") : [];
  const affinity = parseAffinity(body.affinity);
  const seed = typeof body.seed === "number" && Number.isFinite(body.seed) ? body.seed : Date.now();
  const freshOnly = body.freshOnly === true;

  const selected = selectChunks(groundingChunks, { categories, count, seen, affinity, seed, freshOnly });
  const cards = await cardsForChunks(selected.map((c) => c.id));

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
 * Resolve cards for an ordered list of chunk ids: cache first, then a single
 * batched generation for the misses, then a vetted-claim fallback for anything
 * the model didn't return. Order is preserved.
 */
async function cardsForChunks(orderedIds: string[]): Promise<PulseBatchResponse["cards"]> {
  const generator = getGenerator();
  const byChunk = new Map<string, PulseBatchResponse["cards"][number]>();
  const misses: string[] = [];

  for (const id of orderedIds) {
    const cached = getCachedCard(id);
    if (cached) byChunk.set(id, cached);
    else misses.push(id);
  }

  if (misses.length > 0) {
    const missChunks = misses.map((id) => chunksById.get(id)).filter((c) => c !== undefined);

    if (generator.available) {
      const drafts = await generator.generate(missChunks);
      for (const card of buildCardsFromDrafts(drafts, chunksById)) {
        setCachedCard(card);
        byChunk.set(card.chunkId, card);
      }
    }

    // Vetted-claim fallback for any miss the generator didn't cover (no key, or
    // the model skipped it) — always sourced, never a blank card.
    const stillMissing = missChunks.filter((c) => !byChunk.has(c.id));
    for (const card of buildCardsFromChunks(stillMissing)) {
      byChunk.set(card.chunkId, card);
    }
  }

  return orderedIds.map((id) => byChunk.get(id)).filter((c) => c !== undefined);
}
