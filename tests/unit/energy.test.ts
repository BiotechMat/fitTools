import { describe, expect, it } from "vitest";
import {
  ACTIVITY_FACTORS,
  fatFreeMassKg,
  harrisBenedictRevised,
  katchMcArdle,
  mifflinStJeor,
  tdee,
} from "@/lib/formulas/energy";

/**
 * Test vectors — SPEC §7 (BMR / TDEE).
 *
 * Mifflin–St Jeor (simplified form, as published in Mifflin MD, St Jeor ST,
 * et al. Am J Clin Nutr 1990;51:241–247):
 *   men:   10W + 6.25H − 5A + 5
 *   women: 10W + 6.25H − 5A − 161
 * The paper's full regression coefficients are 9.99W + 6.25H − 4.92A; the
 * simplified form above is the one the paper proposes for practice and the
 * one this site implements. Equation cross-checked against Endotext,
 * NCBI Bookshelf NBK278991 (Table 12).
 *
 * The 40-y male / 180 cm / 80 kg → 1730 kcal/day vector is a widely
 * reproduced published worked example and is exactly reproducible from the
 * equation: 800 + 1125 − 200 + 5 = 1730.
 */
describe("mifflinStJeor", () => {
  it("matches the published worked example (male 80 kg, 180 cm, 40 y → 1730)", () => {
    expect(
      mifflinStJeor({ sex: "male", weightKg: 80, heightCm: 180, ageYears: 40 }),
    ).toBeCloseTo(1730, 9);
  });

  it("male 70 kg, 175 cm, 25 y → 1673.75", () => {
    expect(
      mifflinStJeor({ sex: "male", weightKg: 70, heightCm: 175, ageYears: 25 }),
    ).toBeCloseTo(1673.75, 9);
  });

  it("male 100 kg, 190 cm, 55 y → 1917.5", () => {
    expect(
      mifflinStJeor({ sex: "male", weightKg: 100, heightCm: 190, ageYears: 55 }),
    ).toBeCloseTo(1917.5, 9);
  });

  it("female 60 kg, 165 cm, 30 y → 1320.25", () => {
    expect(
      mifflinStJeor({ sex: "female", weightKg: 60, heightCm: 165, ageYears: 30 }),
    ).toBeCloseTo(1320.25, 9);
  });

  it("female 55 kg, 160 cm, 45 y → 1164", () => {
    expect(
      mifflinStJeor({ sex: "female", weightKg: 55, heightCm: 160, ageYears: 45 }),
    ).toBeCloseTo(1164, 9);
  });

  it("female 70 kg, 170 cm, 35 y → 1426.5", () => {
    expect(
      mifflinStJeor({ sex: "female", weightKg: 70, heightCm: 170, ageYears: 35 }),
    ).toBeCloseTo(1426.5, 9);
  });
});

/**
 * Katch–McArdle: BMR = 370 + 21.6 × FFM(kg).
 * Vectors computed exactly from the equation.
 */
describe("katchMcArdle", () => {
  it("FFM 70 kg → 1882", () => {
    expect(katchMcArdle(70)).toBeCloseTo(1882, 9);
  });

  it("FFM 50 kg → 1450", () => {
    expect(katchMcArdle(50)).toBeCloseTo(1450, 9);
  });

  it("FFM 62.5 kg → 1720", () => {
    expect(katchMcArdle(62.5)).toBeCloseTo(1720, 9);
  });
});

describe("fatFreeMassKg", () => {
  it("90 kg at 20% body fat → 72 kg FFM", () => {
    expect(fatFreeMassKg(90, 20)).toBeCloseTo(72, 9);
  });

  it("60 kg at 25% body fat → 45 kg FFM", () => {
    expect(fatFreeMassKg(60, 25)).toBeCloseTo(45, 9);
  });

  it("chains into Katch–McArdle (90 kg, 20% → 1925.2)", () => {
    expect(katchMcArdle(fatFreeMassKg(90, 20))).toBeCloseTo(1925.2, 9);
  });
});

/**
 * Revised Harris–Benedict (Roza & Shizgal, Am J Clin Nutr 1984):
 *   men:   88.362 + 13.397W + 4.799H − 5.677A
 *   women: 447.593 + 9.247W + 3.098H − 4.330A
 * Vectors computed exactly from the published coefficients.
 */
describe("harrisBenedictRevised", () => {
  it("male 80 kg, 180 cm, 40 y → 1796.862", () => {
    expect(
      harrisBenedictRevised({ sex: "male", weightKg: 80, heightCm: 180, ageYears: 40 }),
    ).toBeCloseTo(1796.862, 6);
  });

  it("male 70 kg, 175 cm, 25 y → 1724.052", () => {
    expect(
      harrisBenedictRevised({ sex: "male", weightKg: 70, heightCm: 175, ageYears: 25 }),
    ).toBeCloseTo(1724.052, 6);
  });

  it("female 60 kg, 165 cm, 30 y → 1383.683", () => {
    expect(
      harrisBenedictRevised({ sex: "female", weightKg: 60, heightCm: 165, ageYears: 30 }),
    ).toBeCloseTo(1383.683, 6);
  });

  it("female 55 kg, 160 cm, 45 y → 1257.008", () => {
    expect(
      harrisBenedictRevised({ sex: "female", weightKg: 55, heightCm: 160, ageYears: 45 }),
    ).toBeCloseTo(1257.008, 6);
  });
});

/**
 * TDEE = BMR × activity factor {1.2, 1.375, 1.55, 1.725, 1.9} (SPEC §7).
 */
describe("tdee", () => {
  it("exposes exactly the five spec activity factors", () => {
    expect(Object.values(ACTIVITY_FACTORS).sort((a, b) => a - b)).toEqual([
      1.2, 1.375, 1.55, 1.725, 1.9,
    ]);
  });

  it("sedentary: 1673.75 × 1.2 → 2008.5", () => {
    expect(tdee(1673.75, ACTIVITY_FACTORS.sedentary)).toBeCloseTo(2008.5, 9);
  });

  it("moderate: 1730 × 1.55 → 2681.5", () => {
    expect(tdee(1730, ACTIVITY_FACTORS.moderate)).toBeCloseTo(2681.5, 9);
  });

  it("very active: 1320.25 × 1.9 → 2508.475", () => {
    expect(tdee(1320.25, ACTIVITY_FACTORS.veryActive)).toBeCloseTo(2508.475, 9);
  });
});
