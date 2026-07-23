import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_GENERATION_CALLS_PER_DAY,
  PHRASING_BATCH_SIZE,
  generateDayPhrasings,
  getDayPhrasings,
  phrasingDayKey,
  resetPhrasingStateForTests,
} from "@/lib/pulse/phrasings";
import type { SharedPhrasingStore } from "@/lib/pulse/phrasings";
import type { PulseGenerator } from "@/lib/pulse/generator";
import type { GroundingChunk } from "@/lib/pulse/types";

function makeChunk(i: number): GroundingChunk {
  return {
    id: `chunk-${i}`,
    claim: `Vetted claim number ${i}.`,
    category: "training",
    tags: ["test"],
    tier: "well-supported",
    source: { label: `Source ${i}`, url: `https://example.org/${i}` },
  };
}

const chunks = Array.from({ length: 60 }, (_, i) => makeChunk(i));

/** Generator that rephrases every supplied chunk, recording batch sizes. */
function fakeGenerator(): PulseGenerator & { batchSizes: number[] } {
  const impl = {
    available: true as const,
    batchSizes: [] as number[],
    async generate(supplied: GroundingChunk[]) {
      impl.batchSizes.push(supplied.length);
      return supplied.map((c) => ({ chunkId: c.id, fact: `Rephrased: ${c.claim}` }));
    },
  };
  return impl;
}

/** Generator that always fails the way the real one does — resolving []. */
function failingGenerator(): PulseGenerator & { calls: number } {
  const impl = {
    available: true as const,
    calls: 0,
    async generate() {
      impl.calls += 1;
      return [];
    },
  };
  return impl;
}

/** Pass-through store (no shared cache), counting lookups. */
function passthroughStore(): SharedPhrasingStore & { lookups: string[][] } {
  const impl = {
    lookups: [] as string[][],
    getOrGenerate(keyParts: string[], generate: () => ReturnType<SharedPhrasingStore["getOrGenerate"]>) {
      impl.lookups.push(keyParts);
      return generate();
    },
  };
  return impl;
}

const DAY1 = Date.UTC(2026, 6, 23, 8, 0, 0);

beforeEach(() => resetPhrasingStateForTests());

/**
 * The §14.1 cost contract: generation is one bounded corpus-wide pass per UTC
 * day, shared site-wide — cost scales with corpus size, never with traffic.
 */
describe("generateDayPhrasings", () => {
  it("covers the corpus in batches of PHRASING_BATCH_SIZE", async () => {
    const gen = fakeGenerator();
    const phrasings = await generateDayPhrasings(chunks, gen, () => true);
    expect(gen.batchSizes).toEqual([PHRASING_BATCH_SIZE, PHRASING_BATCH_SIZE, 10]);
    expect(Object.keys(phrasings)).toHaveLength(60);
    expect(phrasings["chunk-0"].fact).toBe("Rephrased: Vetted claim number 0.");
  });

  it("reserves exactly one budget call per batch", async () => {
    const reserved: number[] = [];
    await generateDayPhrasings(chunks, fakeGenerator(), (n) => {
      reserved.push(n);
      return true;
    });
    expect(reserved).toEqual([3]);
  });

  it("throws when the budget is refused, before any model call", async () => {
    const gen = fakeGenerator();
    await expect(generateDayPhrasings(chunks, gen, () => false)).rejects.toThrow();
    expect(gen.batchSizes).toHaveLength(0);
  });

  it("throws when generation yields nothing, so a failed pass is never cached", async () => {
    await expect(generateDayPhrasings(chunks, failingGenerator(), () => true)).rejects.toThrow();
  });

  it("drops empty facts but keeps the rest of the pass (partial success)", async () => {
    const gen: PulseGenerator = {
      available: true,
      async generate(supplied: GroundingChunk[]) {
        return supplied.map((c, i) => ({ chunkId: c.id, fact: i === 0 ? "   " : `ok ${c.id}` }));
      },
    };
    const phrasings = await generateDayPhrasings(chunks.slice(0, 3), gen, () => true);
    expect(Object.keys(phrasings)).toHaveLength(2);
  });
});

describe("getDayPhrasings — site-wide sharing and cost bounds", () => {
  it("returns null with no generator configured (degraded, no calls)", async () => {
    const result = await getDayPhrasings({
      now: DAY1,
      chunks,
      generator: { available: false, generate: async () => [] },
      store: passthroughStore(),
    });
    expect(result).toBeNull();
  });

  it("generates once per day per instance — repeat requests are lookups, not calls", async () => {
    const gen = fakeGenerator();
    const store = passthroughStore();
    const first = await getDayPhrasings({ now: DAY1, chunks, generator: gen, store });
    const second = await getDayPhrasings({ now: DAY1 + 5_000, chunks, generator: gen, store });
    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(gen.batchSizes).toHaveLength(3); // one pass
    expect(store.lookups).toHaveLength(1); // memo short-circuits the second request
  });

  it("dedupes concurrent first requests into a single pass", async () => {
    const gen = fakeGenerator();
    const store = passthroughStore();
    const [a, b] = await Promise.all([
      getDayPhrasings({ now: DAY1, chunks, generator: gen, store }),
      getDayPhrasings({ now: DAY1, chunks, generator: gen, store }),
    ]);
    expect(a).not.toBeNull();
    expect(b).toBe(a);
    expect(gen.batchSizes).toHaveLength(3); // one pass, not two
  });

  it("keys the day store by UTC date — a new day regenerates", async () => {
    const gen = fakeGenerator();
    const store = passthroughStore();
    await getDayPhrasings({ now: DAY1, chunks, generator: gen, store });
    await getDayPhrasings({ now: DAY1 + 24 * 60 * 60 * 1000, chunks, generator: gen, store });
    expect(store.lookups).toHaveLength(2);
    expect(store.lookups[0][1]).not.toBe(store.lookups[1][1]);
    expect(store.lookups[0][1]).toContain(phrasingDayKey(DAY1));
  });

  it("keys the day store by corpus fingerprint — an edited claim regenerates", async () => {
    const gen = fakeGenerator();
    const store = passthroughStore();
    await getDayPhrasings({ now: DAY1, chunks, generator: gen, store });
    const corrected = [{ ...chunks[0], claim: "Corrected claim." }, ...chunks.slice(1)];
    await getDayPhrasings({ now: DAY1 + 1_000, chunks: corrected, generator: gen, store });
    expect(store.lookups).toHaveLength(2);
    expect(store.lookups[0][1]).not.toBe(store.lookups[1][1]);
  });

  it("backs off after a failed pass instead of retrying every request", async () => {
    const gen = failingGenerator();
    const store = passthroughStore();
    expect(await getDayPhrasings({ now: DAY1, chunks, generator: gen, store })).toBeNull();
    expect(gen.calls).toBe(3); // the one failed pass (3 batches)

    // 30s later: inside the backoff window — no new call.
    expect(await getDayPhrasings({ now: DAY1 + 30_000, chunks, generator: gen, store })).toBeNull();
    expect(gen.calls).toBe(3);

    // 61s later: retried.
    expect(await getDayPhrasings({ now: DAY1 + 61_000, chunks, generator: gen, store })).toBeNull();
    expect(gen.calls).toBe(6);
  });

  it("hard-stops at the daily call budget, then resets on the next UTC day", async () => {
    const gen = failingGenerator();
    const store = passthroughStore();
    const perPass = 3; // 60 chunks / 25 per batch
    const passes = Math.floor(MAX_GENERATION_CALLS_PER_DAY / perPass);

    let now = DAY1;
    for (let i = 0; i < passes + 5; i++) {
      await getDayPhrasings({ now, chunks, generator: gen, store });
      now += 61_000; // step past the failure backoff each time, same UTC day
    }
    // The breaker capped total spend regardless of how often we retried.
    expect(gen.calls).toBe(passes * perPass);
    expect(gen.calls).toBeLessThanOrEqual(MAX_GENERATION_CALLS_PER_DAY);

    // Next UTC day: the budget resets and generation is attempted again.
    await getDayPhrasings({ now: DAY1 + 24 * 60 * 60 * 1000, chunks, generator: gen, store });
    expect(gen.calls).toBe(passes * perPass + perPass);
  });

  it("degrades to a direct pass when the shared cache is unavailable", async () => {
    const gen = fakeGenerator();
    const brokenStore: SharedPhrasingStore = {
      getOrGenerate() {
        throw new Error("Invariant: incrementalCache missing");
      },
    };
    const result = await getDayPhrasings({ now: DAY1, chunks, generator: gen, store: brokenStore });
    expect(result).not.toBeNull();
    expect(Object.keys(result ?? {})).toHaveLength(60);
  });
});
