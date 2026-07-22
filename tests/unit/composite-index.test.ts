import { describe, expect, it } from "vitest";
import {
  clampedLinear,
  computeIndex,
  validateIndexDefinition,
  zScoreToSubScore,
} from "@/lib/composite/index-engine";

/**
 * Composite-index engine (METHODOLOGY.md §4). Sub-scores are 0–100 (higher
 * = more favourable); weighted arithmetic mean → 0–100 index; missing
 * inputs renormalise the weights and flag reduced confidence.
 */

describe("clampedLinear sub-score mapping (§4.2)", () => {
  it("maps best→100 and worst→0 with linear interpolation between", () => {
    // Waist-to-height: 0.4 favourable (100), 0.6 unfavourable (0).
    expect(clampedLinear(0.4, { best: 0.4, worst: 0.6 })).toBeCloseTo(100, 9);
    expect(clampedLinear(0.6, { best: 0.4, worst: 0.6 })).toBeCloseTo(0, 9);
    expect(clampedLinear(0.5, { best: 0.4, worst: 0.6 })).toBeCloseTo(50, 9);
  });

  it("clamps outside the anchor range to 0..100", () => {
    expect(clampedLinear(0.3, { best: 0.4, worst: 0.6 })).toBe(100);
    expect(clampedLinear(0.7, { best: 0.4, worst: 0.6 })).toBe(0);
  });

  it("supports 'higher is better' anchors (best > worst)", () => {
    // Time in range: 90% best, 40% worst.
    expect(clampedLinear(90, { best: 90, worst: 40 })).toBeCloseTo(100, 9);
    expect(clampedLinear(40, { best: 90, worst: 40 })).toBeCloseTo(0, 9);
    expect(clampedLinear(65, { best: 90, worst: 40 })).toBeCloseTo(50, 9);
  });
});

describe("zScoreToSubScore (§5.3 personal-baseline scores)", () => {
  it("z of 0 (at baseline) → 50", () => {
    expect(zScoreToSubScore(0)).toBeCloseTo(50, 9);
  });
  it("favourable direction raises the score, clamped 0..100", () => {
    expect(zScoreToSubScore(2)).toBeGreaterThan(50);
    expect(zScoreToSubScore(-2)).toBeLessThan(50);
    expect(zScoreToSubScore(10)).toBeLessThanOrEqual(100);
    expect(zScoreToSubScore(-10)).toBeGreaterThanOrEqual(0);
  });
  it("inverted direction flips the sign", () => {
    expect(zScoreToSubScore(2, { higherIsBetter: false })).toBeLessThan(50);
  });
});

describe("computeIndex (§4.4 aggregation, §4.5 missing data)", () => {
  const inputs = [
    { key: "a", label: "A", score: 80, weight: 50, tier: "T1" as const },
    { key: "b", label: "B", score: 60, weight: 30, tier: "T2" as const },
    { key: "c", label: "C", score: 40, weight: 20, tier: "T2" as const },
  ];

  it("weighted arithmetic mean of sub-scores", () => {
    const r = computeIndex(inputs, 2)!;
    expect(r.index).toBeCloseTo((80 * 50 + 60 * 30 + 40 * 20) / 100, 9);
    expect(r.reducedConfidence).toBe(false);
    expect(r.usedWeightTotal).toBe(100);
  });

  it("renormalises weights across present inputs when one is missing", () => {
    const withMissing = [
      { ...inputs[0], score: 80 },
      { ...inputs[1], score: null },
      { ...inputs[2], score: 40 },
    ];
    const r = computeIndex(withMissing, 2)!;
    // Weights 50 and 20 renormalise to 50/70 and 20/70.
    expect(r.index).toBeCloseTo((80 * 50 + 40 * 20) / 70, 9);
    expect(r.reducedConfidence).toBe(true);
    expect(r.usedWeightTotal).toBe(70);
  });

  it("returns null below the minimum required inputs", () => {
    const mostlyMissing = [
      { ...inputs[0], score: 80 },
      { ...inputs[1], score: null },
      { ...inputs[2], score: null },
    ];
    expect(computeIndex(mostlyMissing, 2)).toBeNull();
  });

  it("reports effective (renormalised) weights per sub-score", () => {
    const r = computeIndex(inputs, 2)!;
    expect(r.subScores.reduce((s, x) => s + x.effectiveWeight, 0)).toBeCloseTo(100, 6);
  });
});

describe("validateIndexDefinition (§4.3 evidence-tier discipline)", () => {
  it("passes a well-formed definition", () => {
    expect(
      validateIndexDefinition([
        { key: "a", label: "A", weight: 30, tier: "T1" },
        { key: "b", label: "B", weight: 30, tier: "T1" },
        { key: "c", label: "C", weight: 25, tier: "T2" },
        { key: "d", label: "D", weight: 15, tier: "T2" },
      ]),
    ).toEqual({ valid: true, problems: [] });
  });

  it("fails when weights do not sum to 100", () => {
    const r = validateIndexDefinition([
      { key: "a", label: "A", weight: 40, tier: "T1" },
      { key: "b", label: "B", weight: 40, tier: "T1" },
    ]);
    expect(r.valid).toBe(false);
    expect(r.problems.join(" ")).toMatch(/sum to 100/i);
  });

  it("fails when a single input exceeds 30%", () => {
    const r = validateIndexDefinition([
      { key: "a", label: "A", weight: 35, tier: "T1" },
      { key: "b", label: "B", weight: 35, tier: "T1" },
      { key: "c", label: "C", weight: 30, tier: "T1" },
    ]);
    expect(r.valid).toBe(false);
    expect(r.problems.join(" ")).toMatch(/exceeds/i);
  });

  it("fails when a T3 input outweighs a T1 input", () => {
    const r = validateIndexDefinition([
      { key: "a", label: "A", weight: 25, tier: "T3" },
      { key: "b", label: "B", weight: 20, tier: "T1" },
      { key: "c", label: "C", weight: 30, tier: "T1" },
      { key: "d", label: "D", weight: 25, tier: "T2" },
    ]);
    expect(r.valid).toBe(false);
    expect(r.problems.join(" ")).toMatch(/tier/i);
  });
});
