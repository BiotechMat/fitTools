import { describe, expect, it } from "vitest";
import { validateIndexDefinition } from "@/lib/composite/index-engine";
import {
  METABOLIC_FITNESS_DEFINITION,
  metabolicFitnessIndex,
} from "@/lib/composite/metabolic-fitness";

describe("Metabolic Fitness index (§5.2)", () => {
  it("definition satisfies the §4.3 discipline", () => {
    expect(validateIndexDefinition(METABOLIC_FITNESS_DEFINITION)).toEqual({
      valid: true,
      problems: [],
    });
  });

  it("excellent metabolic profile scores high", () => {
    const r = metabolicFitnessIndex({
      timeInRangePercent: 92,
      cvPercent: 22,
      gmiPercent: 5.1,
      waistToHeight: 0.42,
      restingHr: 52,
    });
    expect(r.index).toBeGreaterThan(85);
    expect(r.reducedConfidence).toBe(false);
    expect(r.subScores).toHaveLength(5);
  });

  it("poor metabolic profile scores low", () => {
    const r = metabolicFitnessIndex({
      timeInRangePercent: 55,
      cvPercent: 44,
      gmiPercent: 7.2,
      waistToHeight: 0.58,
      restingHr: 85,
    });
    expect(r.index).toBeLessThan(20);
  });

  it("sub-score weights match the definition and sum to 100", () => {
    const r = metabolicFitnessIndex({
      timeInRangePercent: 70,
      cvPercent: 30,
      gmiPercent: 6,
      waistToHeight: 0.5,
      restingHr: 65,
    });
    expect(r.subScores.reduce((s, x) => s + x.effectiveWeight, 0)).toBeCloseTo(100, 6);
    expect(r.subScores.map((s) => s.key)).toEqual(["tir", "cv", "gmi", "whtr", "rhr"]);
  });
});
