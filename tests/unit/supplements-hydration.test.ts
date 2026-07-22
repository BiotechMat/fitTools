import { describe, expect, it } from "vitest";
import {
  caffeineRemaining,
  hoursToThreshold,
} from "@/lib/formulas/caffeine";
import {
  creatineLoadingGramsPerDay,
  CREATINE_MAINTENANCE_G,
} from "@/lib/formulas/creatine";
import { dailyWaterLitres, EFSA_TOTAL_WATER_L } from "@/lib/formulas/water";

/**
 * Caffeine half-life (SPEC §7): C(t) = dose × 0.5^(t/t½), default t½ 5 h.
 * Creatine (ISSN position stand, Kreider 2017): loading 0.3 g/kg/day,
 * maintenance 3–5 g/day. Water: EFSA adequate intakes (2.0 L women /
 * 2.5 L men total water) + exercise allowance labelled as guideline.
 */

describe("caffeineRemaining", () => {
  it("200 mg after one half-life (5 h) → 100 mg", () => {
    expect(caffeineRemaining(200, 5, 5)).toBeCloseTo(100, 9);
  });
  it("200 mg after 10 h → 50 mg", () => {
    expect(caffeineRemaining(200, 10, 5)).toBeCloseTo(50, 9);
  });
  it("non-integer half-lives: 150 mg after 7 h at t½ 4.5 → 150×0.5^(7/4.5)", () => {
    expect(caffeineRemaining(150, 7, 4.5)).toBeCloseTo(150 * 0.5 ** (7 / 4.5), 9);
  });
});

describe("hoursToThreshold", () => {
  it("200 mg → 25 mg at t½ 5 h takes 15 h", () => {
    expect(hoursToThreshold(200, 25, 5)).toBeCloseTo(15, 9);
  });
  it("already below threshold → 0 h", () => {
    expect(hoursToThreshold(40, 50, 5)).toBe(0);
  });
});

describe("creatine", () => {
  it("loading: 0.3 g/kg/day (80 kg → 24 g/day)", () => {
    expect(creatineLoadingGramsPerDay(80)).toBeCloseTo(24, 9);
  });
  it("loading scales with bodyweight (60 kg → 18 g/day)", () => {
    expect(creatineLoadingGramsPerDay(60)).toBeCloseTo(18, 9);
  });
  it("maintenance is the ISSN 3–5 g/day range", () => {
    expect(CREATINE_MAINTENANCE_G).toEqual({ min: 3, max: 5 });
  });
});

describe("dailyWaterLitres", () => {
  it("EFSA adequate intakes are 2.0 L (women) and 2.5 L (men)", () => {
    expect(EFSA_TOTAL_WATER_L).toEqual({ female: 2.0, male: 2.5 });
  });

  it("base intake without exercise", () => {
    expect(dailyWaterLitres({ sex: "male", exerciseHours: 0, sweatRateLPerHour: 0.6 })).toBeCloseTo(2.5, 9);
    expect(dailyWaterLitres({ sex: "female", exerciseHours: 0, sweatRateLPerHour: 0.6 })).toBeCloseTo(2.0, 9);
  });

  it("adds sweat-rate × hours for exercise", () => {
    expect(
      dailyWaterLitres({ sex: "male", exerciseHours: 1.5, sweatRateLPerHour: 0.8 }),
    ).toBeCloseTo(2.5 + 1.2, 9);
  });
});
