import { describe, expect, it } from "vitest";
import { adjustedFfmi, boerLeanBodyMass, ffmi } from "@/lib/formulas/body-composition";

/**
 * Boer LBM (SPEC §7): men 0.407W + 0.267H − 19.2; women 0.252W + 0.473H − 48.3.
 * FFMI (Kouri et al. 1995): FFM / h(m)²; adjusted = FFMI + 6.1 × (1.8 − h).
 * Vectors computed exactly from the published equations.
 */

describe("boerLeanBodyMass", () => {
  it("male 80 kg, 180 cm → 61.42 kg", () => {
    expect(boerLeanBodyMass({ sex: "male", weightKg: 80, heightCm: 180 })).toBeCloseTo(61.42, 9);
  });
  it("female 60 kg, 165 cm → 44.865 kg", () => {
    expect(boerLeanBodyMass({ sex: "female", weightKg: 60, heightCm: 165 })).toBeCloseTo(44.865, 9);
  });
  it("male 100 kg, 175 cm → 68.225 kg", () => {
    expect(boerLeanBodyMass({ sex: "male", weightKg: 100, heightCm: 175 })).toBeCloseTo(
      0.407 * 100 + 0.267 * 175 - 19.2,
      9,
    );
  });
});

describe("ffmi", () => {
  it("FFM 61.42 kg at 1.80 m → 18.956", () => {
    expect(ffmi(61.42, 180)).toBeCloseTo(61.42 / 3.24, 9);
  });
  it("FFM 65 kg at 1.70 m → 22.491", () => {
    expect(ffmi(65, 170)).toBeCloseTo(65 / 2.89, 9);
  });
  it("FFM 50 kg at 1.60 m → 19.531", () => {
    expect(ffmi(50, 160)).toBeCloseTo(50 / 2.56, 9);
  });
});

describe("adjustedFfmi", () => {
  it("adds 6.1 per metre below 1.80 m", () => {
    expect(adjustedFfmi(65, 170)).toBeCloseTo(65 / 2.89 + 6.1 * 0.1, 9);
  });
  it("no adjustment at exactly 1.80 m", () => {
    expect(adjustedFfmi(61.42, 180)).toBeCloseTo(ffmi(61.42, 180), 9);
  });
  it("negative adjustment above 1.80 m", () => {
    expect(adjustedFfmi(80, 190)).toBeCloseTo(80 / 3.61 + 6.1 * (1.8 - 1.9), 9);
  });
});
