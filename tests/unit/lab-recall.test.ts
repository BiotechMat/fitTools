import { describe, expect, it } from "vitest";
import {
  RECALL,
  extendSequence,
  recallBlocks,
  recallShareText,
  recallTier,
  sequenceFor,
} from "@/lib/lab/recall";
import { mulberry32 } from "@/lib/lifeline";

describe("the sequence (PERFORMANCE-LAB.md §4.2)", () => {
  it("deals the asked length from the nine pads, no doubles in a row", () => {
    const rng = mulberry32(11);
    for (let len = RECALL.startLength; len <= 12; len++) {
      const seq = sequenceFor(rng, len);
      expect(seq).toHaveLength(len);
      for (const pad of seq) {
        expect(pad).toBeGreaterThanOrEqual(0);
        expect(pad).toBeLessThan(RECALL.pads);
      }
      for (let i = 1; i < seq.length; i++) {
        expect(seq[i]).not.toBe(seq[i - 1]);
      }
    }
  });

  it("extends by exactly one, never doubling the last light", () => {
    const rng = mulberry32(23);
    let seq = sequenceFor(rng, RECALL.startLength);
    for (let i = 0; i < 200; i++) {
      const grown = extendSequence(rng, seq);
      expect(grown).toHaveLength(seq.length + 1);
      expect(grown.slice(0, seq.length)).toEqual(seq);
      expect(grown[grown.length - 1]).not.toBe(seq[seq.length - 1]);
      seq = grown;
    }
  });

  it("is deterministic for a given seed — a shared daily grid stays cheap", () => {
    expect(sequenceFor(mulberry32(5), 7)).toEqual(sequenceFor(mulberry32(5), 7));
  });
});

describe("the animal ladder", () => {
  it("climbs goldfish → mainframe and never skips a span", () => {
    expect(recallTier(3).name).toBe("GOLDFISH");
    expect(recallTier(4).name).toBe("HAMSTER");
    expect(recallTier(5).name).toBe("PIGEON");
    expect(recallTier(6).name).toBe("HUMAN");
    expect(recallTier(7).name).toBe("CROW");
    expect(recallTier(8).name).toBe("DOLPHIN");
    expect(recallTier(9).name).toBe("ELEPHANT");
    expect(recallTier(10).name).toBe("GRANDMASTER");
    expect(recallTier(12).name).toBe("MAINFRAME");
    for (let span = 0; span <= 20; span++) {
      expect(recallTier(span).blurb.length).toBeGreaterThan(4);
    }
  });
});

describe("the share block", () => {
  it("one green per level cleared, capped so legends stay one line", () => {
    expect(recallBlocks(RECALL.startLength)).toBe("🟩");
    expect(recallBlocks(8)).toBe("🟩".repeat(6));
    expect(recallBlocks(2)).toBe("");
    expect(recallBlocks(99).length).toBeLessThanOrEqual("🟩".repeat(12).length);
  });

  it("carries the span, the animal and the kicker", () => {
    const text = recallShareText(8);
    expect(text).toContain("THE LAB · RECALL");
    expect(text).toContain("Span 8");
    expect(text).toContain("DOLPHIN");
    expect(text).toContain("Read it once.");
  });
});
