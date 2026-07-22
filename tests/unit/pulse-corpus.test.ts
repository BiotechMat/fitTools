import { describe, expect, it } from "vitest";
import { groundingChunks, validateCorpus, chunksById } from "@/registry/pulse";

/**
 * The Pulse grounding corpus must satisfy the invariants Pulse owns (PULSE.md
 * §3.2): unique ids, a REAL source on every chunk (the anti-hallucination
 * anchor — §2.1), valid category, well-formed internal routes.
 */
describe("pulse grounding corpus", () => {
  it("passes structural validation", () => {
    expect(validateCorpus()).toEqual([]);
  });

  it("has at least one chunk and every chunk carries a source url", () => {
    expect(groundingChunks.length).toBeGreaterThan(0);
    for (const c of groundingChunks) {
      expect(c.source.url).toMatch(/^https?:\/\//);
      expect(c.source.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("indexes every chunk by id", () => {
    expect(chunksById.size).toBe(groundingChunks.length);
  });
});
