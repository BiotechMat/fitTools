/**
 * Best-effort in-memory card cache (PULSE.md §4 caching note). Bounds LLM cost:
 * a generated card is reused for the same chunk within its TTL instead of
 * re-calling the model on every scroll. Serverless memory is ephemeral — that's
 * acceptable for v1; a shared cache (KV/Redis) is a later swap behind this
 * module's tiny surface.
 */

import type { PulseCard } from "./types";

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 500;

interface Entry {
  card: PulseCard;
  expires: number;
}

const store = new Map<string, Entry>();

export function getCachedCard(chunkId: string, now = Date.now()): PulseCard | null {
  const entry = store.get(chunkId);
  if (!entry) return null;
  if (entry.expires <= now) {
    store.delete(chunkId);
    return null;
  }
  return entry.card;
}

export function setCachedCard(card: PulseCard, now = Date.now()): void {
  if (store.size >= MAX_ENTRIES) {
    // Evict the oldest-expiring entry — cheap bounded cleanup.
    let oldestKey: string | null = null;
    let oldestExp = Infinity;
    for (const [k, v] of store) {
      if (v.expires < oldestExp) {
        oldestExp = v.expires;
        oldestKey = k;
      }
    }
    if (oldestKey) store.delete(oldestKey);
  }
  store.set(card.chunkId, { card, expires: now + TTL_MS });
}

/** Test/ops helper. */
export function clearCardCache(): void {
  store.clear();
}
