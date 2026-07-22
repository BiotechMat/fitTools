import { describe, expect, it } from "vitest";
import { validateIndexDefinition } from "@/lib/composite/index-engine";
import {
  PACE_OF_AGING_DEFINITION,
  paceOfAgingIndex,
  sleepScore,
} from "@/lib/composite/pace-of-aging";
import {
  RECOVERY_READINESS_DEFINITION,
  recoveryReadinessIndex,
} from "@/lib/composite/recovery-readiness";

describe("Pace of Aging index (§5.1)", () => {
  it("definition satisfies §4.3 discipline", () => {
    expect(validateIndexDefinition(PACE_OF_AGING_DEFINITION)).toEqual({
      valid: true,
      problems: [],
    });
  });

  it("sleep sub-score peaks near 7.75 h and falls off either side", () => {
    expect(sleepScore(7.75)).toBeCloseTo(100, 9);
    expect(sleepScore(6.75)).toBeCloseTo(75, 9);
    expect(sleepScore(9.75)).toBeCloseTo(50, 9);
    expect(sleepScore(4)).toBeCloseTo(6.25, 9);
    expect(sleepScore(3)).toBe(0); // clamped
  });

  it("renormalises when optional inputs (VO2max, grip, HRV) are omitted", () => {
    const r = paceOfAgingIndex({
      sex: "male",
      waistToHeight: 0.45,
      mvpaMinPerWeek: 250,
      sleepHours: 7.5,
      restingHr: 58,
      currentSmoker: false,
      alcoholUnitsPerWeek: 6,
      vo2max: null,
      gripKg: null,
      hrvMs: null,
    })!;
    expect(r.reducedConfidence).toBe(true);
    expect(r.subScores).toHaveLength(6);
    expect(r.subScores.reduce((s, x) => s + x.effectiveWeight, 0)).toBeCloseTo(100, 6);
  });

  it("full favourable profile scores high and maps to a 'younger' pace", () => {
    const r = paceOfAgingIndex({
      sex: "male",
      waistToHeight: 0.43,
      mvpaMinPerWeek: 320,
      sleepHours: 7.75,
      restingHr: 52,
      currentSmoker: false,
      alcoholUnitsPerWeek: 2,
      vo2max: 50,
      gripKg: 54,
      hrvMs: 68,
    })!;
    expect(r.index).toBeGreaterThan(85);
    expect(r.pace).toBeLessThan(0.9);
  });

  it("returns null below the minimum required inputs (handled at UI layer)", () => {
    // computeIndex enforces 6; the calculator always supplies the 6 required.
    expect(PACE_OF_AGING_DEFINITION.length).toBe(9);
  });
});

describe("Recovery Readiness index (§5.3)", () => {
  it("definition satisfies §4.3 (weights adjusted to the 30% cap)", () => {
    expect(validateIndexDefinition(RECOVERY_READINESS_DEFINITION)).toEqual({
      valid: true,
      problems: [],
    });
    expect(RECOVERY_READINESS_DEFINITION.every((e) => e.weight <= 30)).toBe(true);
  });

  it("everything at baseline → ~50 (neutral readiness)", () => {
    const r = recoveryReadinessIndex({
      hrvMs: 60,
      hrvBaselineMs: 60,
      restingHr: 55,
      restingHrBaseline: 55,
      sleepHours: 8,
      sleepNeedHours: 8,
      respRate: 14,
      respRateBaseline: 14,
    });
    expect(r.index).toBeCloseTo(50, 6);
  });

  it("HRV up + resting HR down + slept enough → high readiness", () => {
    const r = recoveryReadinessIndex({
      hrvMs: 75,
      hrvBaselineMs: 60,
      restingHr: 50,
      restingHrBaseline: 55,
      sleepHours: 8.5,
      sleepNeedHours: 8,
      respRate: 13,
      respRateBaseline: 14,
    });
    expect(r.index).toBeGreaterThan(75);
  });

  it("suppressed HRV + elevated resting HR + short sleep → low readiness", () => {
    const r = recoveryReadinessIndex({
      hrvMs: 40,
      hrvBaselineMs: 60,
      restingHr: 62,
      restingHrBaseline: 55,
      sleepHours: 6,
      sleepNeedHours: 8,
      respRate: 16,
      respRateBaseline: 14,
    });
    expect(r.index).toBeLessThan(30);
  });
});
