import { describe, expect, it } from "vitest";
import { kcalBurned, kcalPerMinute } from "@/lib/formulas/calories-burned";
import { stepsToCalories, strideLengthM } from "@/lib/formulas/steps";
import mets from "@/data/mets.json";

/**
 * MET method (SPEC §7): kcal/min = MET × 3.5 × kg / 200. Steps: stride ≈
 * 0.415 × height (men) / 0.413 × height (women), then walking MET estimate.
 */

describe("kcalPerMinute", () => {
  it("MET 8, 70 kg → 9.8 kcal/min", () => {
    expect(kcalPerMinute(8, 70)).toBeCloseTo(9.8, 9);
  });
  it("MET 3.5, 80 kg → 4.9 kcal/min", () => {
    expect(kcalPerMinute(3.5, 80)).toBeCloseTo(4.9, 9);
  });
  it("MET 9.8 swimming, 60 kg → 10.29 kcal/min", () => {
    expect(kcalPerMinute(9.8, 60)).toBeCloseTo((9.8 * 3.5 * 60) / 200, 9);
  });
});

describe("kcalBurned", () => {
  it("MET 8, 70 kg, 30 min → 294 kcal", () => {
    expect(kcalBurned(8, 70, 30)).toBeCloseTo(294, 9);
  });
});

describe("mets data", () => {
  it("ships compendium codes with sources", () => {
    expect(mets.activities.length).toBeGreaterThanOrEqual(20);
    for (const activity of mets.activities) {
      expect(activity.code).toMatch(/^\d{5}$/);
      expect(activity.met).toBeGreaterThan(0);
    }
    expect(mets.sources.length).toBeGreaterThanOrEqual(2);
  });
});

describe("strideLengthM", () => {
  it("male 180 cm → 0.747 m", () => {
    expect(strideLengthM("male", 180)).toBeCloseTo(0.747, 9);
  });
  it("female 165 cm → 0.68145 m", () => {
    expect(strideLengthM("female", 165)).toBeCloseTo(0.413 * 1.65, 9);
  });
});

describe("stepsToCalories", () => {
  it("10,000 steps, male 180 cm, 80 kg, moderate pace", () => {
    // Distance = 10000 × 0.747 = 7470 m; at 4.8 km/h → 93.375 min;
    // MET 3.8 → kcal/min = 3.8 × 3.5 × 80 / 200 = 5.32 → 496.755 kcal.
    const result = stepsToCalories({
      sex: "male",
      heightCm: 180,
      weightKg: 80,
      steps: 10000,
      pace: "moderate",
    });
    expect(result.distanceM).toBeCloseTo(7470, 6);
    expect(result.durationMinutes).toBeCloseTo(93.375, 3);
    expect(result.kcal).toBeCloseTo(496.755, 2);
  });

  it("zero steps → zero everything", () => {
    const result = stepsToCalories({
      sex: "female",
      heightCm: 165,
      weightKg: 60,
      steps: 0,
      pace: "casual",
    });
    expect(result.kcal).toBe(0);
    expect(result.distanceM).toBe(0);
  });

  it("brisk pace burns more per step than casual (higher MET, less time)", () => {
    const casual = stepsToCalories({
      sex: "male",
      heightCm: 180,
      weightKg: 80,
      steps: 10000,
      pace: "casual",
    });
    const brisk = stepsToCalories({
      sex: "male",
      heightCm: 180,
      weightKg: 80,
      steps: 10000,
      pace: "brisk",
    });
    // Same distance; brisk covers it in less time at higher MET.
    expect(brisk.durationMinutes).toBeLessThan(casual.durationMinutes);
    expect(brisk.distanceM).toBeCloseTo(casual.distanceM, 6);
  });
});
