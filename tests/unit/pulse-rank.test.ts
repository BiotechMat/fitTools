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
