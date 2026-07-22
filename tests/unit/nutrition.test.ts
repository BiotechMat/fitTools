import { describe, expect, it } from "vitest";
import {
  KCAL_PER_G_CARB,
  KCAL_PER_G_FAT,
  KCAL_PER_G_PROTEIN,
  macroSplit,
} from "@/lib/formulas/nutrition";

/**
 * Macro calculator (SPEC §7): protein 1.6–2.2 g/kg (default 1.8; Morton et
 * al., Br J Sports Med 2018), fat 20–35% of kcal (default 25%), carbs =
 * remainder. Energy densities are the Atwater general factors
 * (4/9/4 kcal per g).
 */

describe("Atwater factors", () => {
  it("uses 4/9/4 kcal per gram", () => {
    expect(KCAL_PER_G_PROTEIN).toBe(4);
    expect(KCAL_PER_G_FAT).toBe(9);
    expect(KCAL_PER_G_CARB).toBe(4);
  });
});

describe("macroSplit", () => {
  it("2500 kcal, 80 kg, 1.8 g/kg protein, 25% fat", () => {
    const split = macroSplit({
      kcalTarget: 2500,
      weightKg: 80,
      proteinGPerKg: 1.8,
      fatPercent: 25,
    });
    expect(split.protein.grams).toBeCloseTo(144, 9);
    expect(split.protein.kcal).toBeCloseTo(576, 9);
    expect(split.fat.kcal).toBeCloseTo(625, 9);
    expect(split.fat.grams).toBeCloseTo(69.4444444444, 6);
    expect(split.carbs.kcal).toBeCloseTo(1299, 9);
    expect(split.carbs.grams).toBeCloseTo(324.75, 9);
  });

  it("2000 kcal, 60 kg, 2.2 g/kg protein, 35% fat", () => {
    const split = macroSplit({
      kcalTarget: 2000,
      weightKg: 60,
      proteinGPerKg: 2.2,
      fatPercent: 35,
    });
    expect(split.protein.grams).toBeCloseTo(132, 9);
    expect(split.protein.kcal).toBeCloseTo(528, 9);
    expect(split.fat.kcal).toBeCloseTo(700, 9);
    expect(split.fat.grams).toBeCloseTo(77.7777777778, 6);
    expect(split.carbs.kcal).toBeCloseTo(772, 9);
    expect(split.carbs.grams).toBeCloseTo(193, 9);
  });

  it("macro kcal always sums to the target when the split is feasible", () => {
    const split = macroSplit({
      kcalTarget: 1800,
      weightKg: 70,
      proteinGPerKg: 1.6,
      fatPercent: 20,
    });
    expect(split.protein.kcal + split.fat.kcal + split.carbs.kcal).toBeCloseTo(
      1800,
      9,
    );
    expect(split.feasible).toBe(true);
  });

  it("flags an infeasible split (protein + fat exceed the kcal target)", () => {
    const split = macroSplit({
      kcalTarget: 1200,
      weightKg: 100,
      proteinGPerKg: 2.2,
      fatPercent: 35,
    });
    // 880 kcal protein + 420 kcal fat = 1300 > 1200 target.
    expect(split.carbs.kcal).toBeCloseTo(-100, 9);
    expect(split.feasible).toBe(false);
  });
});
