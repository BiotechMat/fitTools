import { describe, expect, it } from "vitest";
import { dailyChunkIndex, selectChunks } from "@/lib/pulse/rank";
import type { GroundingChunk, PulseCategory } from "@/lib/pulse/types";

function chunk(id: string, category: PulseCategory): GroundingChunk {
  return {
    id,
    claim: `claim ${id}`,
    category,
    tags: [],
    tier: "preliminary",
    source: { label: "x", url: "https://example.com" },
  };
}

function pool(category: PulseCategory, n: number, prefix: string): GroundingChunk[] {
  return Array.from({ length: n }, (_, i) => chunk(`${prefix}-${i}`, category));
}

/** A fresh chunk added `ageDays` ago relative to `nowMs`. */
function freshChunk(
  id: string,
  category: PulseCategory,
  addedAt: string,
): GroundingChunk {
  return { ...chunk(id, category), kind: "fresh", addedAt, caveat: "small study" };
}

const NOW = Date.parse("2026-07-23T00:00:00Z");
const daysAgo = (n: number): string =>
  new Date(NOW - n * 86_400_000).toISOString().slice(0, 10);

describe("selectChunks — PULSE.md §5 guardrails", () => {
  it("respects the requested count", () => {
    const p = [...pool("recovery", 20, "r")];
    expect(selectChunks(p, { count: 6, seed: 1 })).toHaveLength(6);
  });

  it("cold start is deterministic for a given seed", () => {
    const p = [...pool("recovery", 10, "r"), ...pool("training", 10, "t")];
    const a = selectChunks(p, { count: 8, seed: 42 }).map((c) => c.id);
    const b = selectChunks(p, { count: 8, seed: 42 }).map((c) => c.id);
    expect(a).toEqual(b);
  });

  it("enforces the diversity floor when other categories are available", () => {
    // Both categories over-supplied so neither exhausts within the draw.
    const p = [...pool("recovery", 8, "r"), ...pool("training", 8, "t")];
    const ids = selectChunks(p, { count: 8, seed: 7, maxRun: 2 });
    let run = 1;
    for (let i = 1; i < ids.length; i++) {
      run = ids[i].category === ids[i - 1].category ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(2);
    }
  });

  it("excludes seen chunks while unseen remain (no-repeat window)", () => {
    const p = pool("recovery", 10, "r");
    const seen = ["r-0", "r-1", "r-2"];
    const ids = selectChunks(p, { count: 5, seed: 3, seen }).map((c) => c.id);
    for (const s of seen) expect(ids).not.toContain(s);
  });

  it("resets when every chunk has been seen (pool exhausted)", () => {
    const p = pool("recovery", 4, "r");
    const seen = p.map((c) => c.id);
    // All seen → the window resets rather than returning nothing.
    expect(selectChunks(p, { count: 3, seed: 9, seen }).length).toBeGreaterThan(0);
  });

  it("honours the category filter", () => {
    const p = [...pool("recovery", 5, "r"), ...pool("training", 5, "t")];
    const ids = selectChunks(p, { count: 5, seed: 2, categories: ["training"] });
    expect(ids.every((c) => c.category === "training")).toBe(true);
  });
});

describe("selectChunks — fresh cards (PULSE.md §15.5)", () => {
  it("surfaces a chunk more often when it is fresh than when evergreen", () => {
    // Same target id in two otherwise-identical pools — fresh in one, evergreen
    // in the other — so the only difference is the freshness tilt. Comparison
    // isolates the boost from pool size (a capped tilt is deliberately modest).
    const withFresh = [freshChunk("t", "nutrition", daysAgo(0)), ...pool("nutrition", 8, "e")];
    const withEver = [chunk("t", "nutrition"), ...pool("nutrition", 8, "e")];
    const rate = (p: GroundingChunk[]) => {
      let hits = 0;
      for (let seed = 0; seed < 300; seed++) {
        // count=1, reserve off, no novelty — the pick is purely weight-driven.
        if (selectChunks(p, { count: 1, seed, nowMs: NOW, freshReserve: 0, noveltyFraction: 0 })[0].id === "t") {
          hits += 1;
        }
      }
      return hits;
    };
    expect(rate(withFresh)).toBeGreaterThan(rate(withEver));
  });

  it("decays: a 30-day-old fresh chunk barely beats evergreen", () => {
    const recent = [freshChunk("fresh-new", "nutrition", daysAgo(0)), ...pool("nutrition", 20, "e")];
    const old = [freshChunk("fresh-old", "nutrition", daysAgo(30)), ...pool("nutrition", 20, "e")];
    const count = (p: GroundingChunk[], id: string) => {
      let hits = 0;
      for (let seed = 0; seed < 200; seed++) {
        if (selectChunks(p, { count: 1, seed, nowMs: NOW, freshReserve: 0, noveltyFraction: 0 })[0].id === id) hits += 1;
      }
      return hits;
    };
    expect(count(recent, "fresh-new")).toBeGreaterThan(count(old, "fresh-old"));
  });

  it("freshOnly restricts strictly to fresh chunks", () => {
    const p = [...pool("nutrition", 5, "e"), freshChunk("fresh-0", "nutrition", daysAgo(1))];
    const ids = selectChunks(p, { count: 6, seed: 1, nowMs: NOW, freshOnly: true });
    expect(ids.every((c) => c.kind === "fresh")).toBe(true);
    expect(ids).toHaveLength(1);
  });

  it("freshOnly with no fresh chunks returns empty (honest 'nothing new')", () => {
    const p = pool("nutrition", 5, "e");
    expect(selectChunks(p, { count: 6, seed: 1, nowMs: NOW, freshOnly: true })).toHaveLength(0);
  });

  it("guarantees the fresh reserve when fresh chunks exist", () => {
    // Many evergreens, a couple of fresh; reserve should force at least 2 fresh in.
    const p = [
      ...pool("recovery", 20, "e"),
      freshChunk("f-0", "nutrition", daysAgo(2)),
      freshChunk("f-1", "sleep", daysAgo(3)),
      freshChunk("f-2", "training", daysAgo(4)),
    ];
    const ids = selectChunks(p, { count: 8, seed: 5, nowMs: NOW, freshReserve: 2 });
    const freshCount = ids.filter((c) => c.kind === "fresh").length;
    expect(freshCount).toBeGreaterThanOrEqual(2);
  });

  it("the diversity floor still binds with the freshness boost active", () => {
    // Two categories over-supplied, plus fresh chunks — maxRun must still hold.
    const p = [
      ...pool("recovery", 8, "r"),
      ...pool("training", 8, "t"),
      freshChunk("f-0", "recovery", daysAgo(0)),
      freshChunk("f-1", "training", daysAgo(0)),
    ];
    const ids = selectChunks(p, { count: 10, seed: 7, nowMs: NOW, maxRun: 2 });
    let run = 1;
    for (let i = 1; i < ids.length; i++) {
      run = ids[i].category === ids[i - 1].category ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(2);
    }
  });

  it("evergreen-only pools are unaffected (back-compatible)", () => {
    const p = pool("recovery", 10, "r");
    const withNow = selectChunks(p, { count: 5, seed: 3, nowMs: NOW }).map((c) => c.id);
    const withoutNow = selectChunks(p, { count: 5, seed: 3 }).map((c) => c.id);
    expect(withNow).toEqual(withoutNow);
  });
});

describe("dailyChunkIndex", () => {
  it("is stable for the same date and in range", () => {
    expect(dailyChunkIndex("2026-07-22", 10)).toBe(dailyChunkIndex("2026-07-22", 10));
    expect(dailyChunkIndex("2026-07-22", 10)).toBeGreaterThanOrEqual(0);
    expect(dailyChunkIndex("2026-07-22", 10)).toBeLessThan(10);
  });

  it("handles an empty pool", () => {
    expect(dailyChunkIndex("2026-07-22", 0)).toBe(0);
  });
});
