import { describe, expect, it } from "vitest";
import {
  cooperVo2max,
  heartRateRatioVo2max,
  rockportVo2max,
} from "@/lib/formulas/vo2max";

/**
 * Vectors computed from the published equations:
 * Cooper 1968: VO2max = (d − 504.9) / 44.73.
 * Kline 1987 (Rockport): 132.853 − 0.0769·lb − 0.3877·age + 6.315·sex
 *   − 3.2649·t − 0.1565·HR.
 * Uth 2004: 15.3 × HRmax/HRrest.
 */

describe("cooperVo2max", () => {
  it("2,400 m in 12 minutes → 42.37 ml/kg/min", () => {
    expect(cooperVo2max(2400)).toBeCloseTo((2400 - 504.9) / 44.73, 10);
    expect(cooperVo2max(2400)).toBeCloseTo(42.3675, 3);
  });

  it("inverts exactly: 504.9 + 44.73 × 50 metres → VO2max 50", () => {
    expect(cooperVo2max(504.9 + 44.73 * 50)).toBeCloseTo(50, 10);
  });
});

describe("rockportVo2max", () => {
  it("male, 30 y, 70 kg (154.32 lb), 13:00, HR 140 → ≈ 51.3", () => {
    const weightLb = 70 / 0.45359237;
    const expected =
      132.853 -
      0.0769 * weightLb -
      0.3877 * 30 +
      6.315 -
      3.2649 * 13 -
      0.1565 * 140;
    expect(
      rockportVo2max({
        sex: "male",
        ageYears: 30,
        weightKg: 70,
        walkTimeMin: 13,
        heartRateBpm: 140,
      }),
    ).toBeCloseTo(expected, 10);
    expect(expected).toBeCloseTo(51.31, 1);
  });

  it("female drops the 6.315 sex term", () => {
    const male = rockportVo2max({
      sex: "male",
      ageYears: 40,
      weightKg: 65,
      walkTimeMin: 15,
      heartRateBpm: 130,
    });
    const female = rockportVo2max({
      sex: "female",
      ageYears: 40,
      weightKg: 65,
      walkTimeMin: 15,
      heartRateBpm: 130,
    });
    expect(male - female).toBeCloseTo(6.315, 10);
  });
});

describe("heartRateRatioVo2max", () => {
  it("HRmax 190 / HRrest 60 → 48.45", () => {
    expect(heartRateRatioVo2max(190, 60)).toBeCloseTo(48.45, 10);
  });

  it("rejects non-positive resting heart rate", () => {
    expect(() => heartRateRatioVo2max(190, 0)).toThrow(RangeError);
  });
});
