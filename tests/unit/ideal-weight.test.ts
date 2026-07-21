import { describe, expect, it } from "vitest";
import { idealWeightRange, idealWeights } from "@/lib/formulas/ideal-weight";

/**
 * Ideal weight (SPEC §7): Devine, Robinson, Miller, Hamwi — all defined as
 * a base weight plus kg per inch over 5 ft. Coefficients per Pai &
 * Paloucek, Ann Pharmacother 2000 (the canonical review of these
 * equations):
 *   Devine   men 50.0 + 2.3/in   women 45.5 + 2.3/in
 *   Robinson men 52.0 + 1.9/in   women 49.0 + 1.7/in
 *   Miller   men 56.2 + 1.41/in  women 53.1 + 1.36/in
 *   Hamwi    men 48.0 + 2.7/in   women 45.5 + 2.2/in
 */

describe("idealWeights — male 177.8 cm (5 ft 10 in)", () => {
  const weights = idealWeights({ sex: "male", heightCm: 177.8 });

  it("Devine → 73 kg", () => {
    expect(weights.devine).toBeCloseTo(73, 9);
  });
  it("Robinson → 71 kg", () => {
    expect(weights.robinson).toBeCloseTo(71, 9);
  });
  it("Miller → 70.3 kg", () => {
    expect(weights.miller).toBeCloseTo(70.3, 9);
  });
  it("Hamwi → 75 kg", () => {
    expect(weights.hamwi).toBeCloseTo(75, 9);
  });
});

describe("idealWeights — female 165.1 cm (5 ft 5 in)", () => {
  const weights = idealWeights({ sex: "female", heightCm: 165.1 });

  it("Devine → 57 kg", () => {
    expect(weights.devine).toBeCloseTo(57, 9);
  });
  it("Robinson → 57.5 kg", () => {
    expect(weights.robinson).toBeCloseTo(57.5, 9);
  });
  it("Miller → 59.9 kg", () => {
    expect(weights.miller).toBeCloseTo(59.9, 9);
  });
  it("Hamwi → 56.5 kg", () => {
    expect(weights.hamwi).toBeCloseTo(56.5, 9);
  });
});

describe("idealWeightRange", () => {
  it("reports the min and max across the four formulas", () => {
    const range = idealWeightRange({ sex: "male", heightCm: 177.8 });
    expect(range.minKg).toBeCloseTo(70.3, 9);
    expect(range.maxKg).toBeCloseTo(75, 9);
  });

  it("at exactly 5 ft the base weights apply", () => {
    const weights = idealWeights({ sex: "male", heightCm: 152.4 });
    expect(weights.devine).toBeCloseTo(50, 9);
    expect(weights.hamwi).toBeCloseTo(48, 9);
  });

  it("throws below 5 ft where the formulas are undefined", () => {
    expect(() => idealWeights({ sex: "male", heightCm: 150 })).toThrow(RangeError);
  });
});
