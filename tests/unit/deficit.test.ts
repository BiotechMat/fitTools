import { describe, expect, it } from "vitest";
import {
  KCAL_PER_KG,
  MAX_DEFICIT_FRACTION,
  maxRecommendedDeficit,
  weeklyLossKg,
  weeksToTarget,
} from "@/lib/formulas/deficit";

/**
 * Calorie deficit / timeline (SPEC §7): 7700 kcal ≈ 1 kg heuristic
 * (Wishnofsky origin); recommended deficit capped at 25% of TDEE.
 */

describe("constants", () => {
  it("pins the 7700 kcal/kg heuristic and the 25% cap", () => {
    expect(KCAL_PER_KG).toBe(7700);
    expect(MAX_DEFICIT_FRACTION).toBe(0.25);
  });
});

describe("weeklyLossKg", () => {
  it("500 kcal/day ≈ 0.4545 kg/week", () => {
    expect(weeklyLossKg(500)).toBeCloseTo(3500 / 7700, 9);
  });

  it("1100 kcal/day = 1 kg/week exactly under the heuristic", () => {
    expect(weeklyLossKg(1100)).toBeCloseTo(1, 9);
  });

  it("zero deficit means zero loss", () => {
    expect(weeklyLossKg(0)).toBe(0);
  });
});

describe("weeksToTarget", () => {
  it("10 kg at 500 kcal/day = 22 weeks", () => {
    expect(weeksToTarget(10, 500)).toBeCloseTo(22, 9);
  });

  it("5 kg at 770 kcal/day = 50/7 weeks", () => {
    expect(weeksToTarget(5, 770)).toBeCloseTo(38500 / 5390, 9);
  });

  it("returns Infinity for a zero deficit", () => {
    expect(weeksToTarget(5, 0)).toBe(Infinity);
  });
});

describe("maxRecommendedDeficit", () => {
  it("caps at 25% of TDEE", () => {
    expect(maxRecommendedDeficit(2500)).toBeCloseTo(625, 9);
    expect(maxRecommendedDeficit(2000)).toBeCloseTo(500, 9);
    expect(maxRecommendedDeficit(3200)).toBeCloseTo(800, 9);
  });
});
