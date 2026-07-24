import { describe, expect, it } from "vitest";
import {
  VIGIL,
  VIGIL_SECONDS,
  vigilScore,
  vigilSequence,
  vigilShareText,
  vigilTier,
} from "@/lib/lab/vigil";
import { mulberry32 } from "@/lib/lifeline";

describe("the digit stream (PERFORMANCE-LAB.md §4.8)", () => {
  it("deals exactly the quota of 3s, never early, never adjacent", () => {
    for (const seed of [1, 7, 42, 999]) {
      const seq = vigilSequence(mulberry32(seed));
      expect(seq).toHaveLength(VIGIL.trials);
      expect(seq.filter((d) => d === VIGIL.noGo)).toHaveLength(VIGIL.threes);
      expect(seq.slice(0, 3)).not.toContain(VIGIL.noGo);
      for (let i = 1; i < seq.length; i++) {
        if (seq[i] === VIGIL.noGo) expect(seq[i - 1]).not.toBe(VIGIL.noGo);
      }
      for (const d of seq) {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });

  it("runs about ninety seconds — the short form is the point", () => {
    expect(VIGIL_SECONDS).toBeGreaterThanOrEqual(75);
    expect(VIGIL_SECONDS).toBeLessThanOrEqual(95);
  });

  it("is deterministic for a given seed", () => {
    expect(vigilSequence(mulberry32(5))).toEqual(vigilSequence(mulberry32(5)));
  });
});

describe("scoring", () => {
  it("counts commissions (tapped a 3) and omissions (missed a go)", () => {
    const seq = [1, 3, 5, 3, 7];
    //            tap  tap  no  no  tap  → commission at idx1, omission at idx2
    const score = vigilScore(seq, [true, true, false, false, true]);
    expect(score.commissions).toBe(1);
    expect(score.omissions).toBe(1);
    expect(score.pct).toBe(60); // 3 of 5 correct
  });

  it("a perfect run is 100, an untouched run only scores the withholds", () => {
    const seq = [1, 3, 5];
    expect(vigilScore(seq, [true, false, true]).pct).toBe(100);
    const untouched = vigilScore(seq, [false, false, false]);
    expect(untouched.pct).toBe(33);
    expect(untouched.omissions).toBe(2);
  });
});

describe("the focus ladder", () => {
  it("runs MONK MODE → TAB HOARDER with no gaps", () => {
    expect(vigilTier(100).name).toBe("MONK MODE");
    expect(vigilTier(97).name).toBe("DEEP WORK");
    expect(vigilTier(92).name).toBe("FOCUSED");
    expect(vigilTier(85).name).toBe("HUMAN");
    expect(vigilTier(75).name).toBe("SQUIRREL");
    expect(vigilTier(65).name).toBe("DOOMSCROLLER");
    expect(vigilTier(40).name).toBe("TAB HOARDER");
    for (let pct = 1; pct <= 100; pct++) {
      expect(vigilTier(pct).name).not.toBe("UNRATED");
      expect(vigilTier(pct).blurb.length).toBeGreaterThan(4);
    }
  });
});

describe("the share block", () => {
  it("carries the percentage, the window and the kicker", () => {
    const text = vigilShareText(94);
    expect(text).toContain("THE LAB · VIGIL");
    expect(text).toContain("94%");
    expect(text).toContain(`${VIGIL_SECONDS} seconds`);
    expect(text).toContain("FOCUSED");
    expect(text).toContain("The 3 is always waiting.");
  });
});
