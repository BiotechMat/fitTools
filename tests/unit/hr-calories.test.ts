import { describe, expect, it } from "vitest";
import { kcalPerMinute, sessionKcal } from "@/lib/formulas/hr-calories";

/**
 * Keytel et al. 2005 equations (kJ/min ÷ 4.184 → kcal/min):
 * men:   −55.0969 + 0.6309·HR + 0.1988·kg + 0.2017·age
 * women: −20.4022 + 0.4472·HR − 0.1263·kg + 0.074·age
 */

describe("kcalPerMinute", () => {
  it("male, HR 140, 80 kg, 30 y → 13.19 kcal/min", () => {
    const kj = -55.0969 + 0.6309 * 140 + 0.1988 * 80 + 0.2017 * 30;
    expect(
      kcalPerMinute({ sex: "male", heartRateBpm: 140, weightKg: 80, ageYears: 30 }),
    ).toBeCloseTo(kj / 4.184, 10);
    expect(kj / 4.184).toBeCloseTo(13.189, 3);
  });

  it("female, HR 140, 65 kg, 30 y → 8.66 kcal/min", () => {
    const kj = -20.4022 + 0.4472 * 140 - 0.1263 * 65 + 0.074 * 30;
    expect(
      kcalPerMinute({ sex: "female", heartRateBpm: 140, weightKg: 65, ageYears: 30 }),
    ).toBeCloseTo(kj / 4.184, 10);
    expect(kj / 4.184).toBeCloseTo(8.656, 3);
  });

  it("clamps the out-of-model low-HR region to zero instead of going negative", () => {
    expect(
      kcalPerMinute({ sex: "male", heartRateBpm: 60, weightKg: 60, ageYears: 20 }),
    ).toBe(0);
  });
});

describe("sessionKcal", () => {
  it("male, HR 140, 80 kg, 30 y for 30 min → ≈ 396 kcal", () => {
    expect(
      sessionKcal(
        { sex: "male", heartRateBpm: 140, weightKg: 80, ageYears: 30 },
        30,
      ),
    ).toBeCloseTo(395.68, 1);
  });
});
