import { describe, expect, it } from "vitest";
import { navyBodyFatPercent } from "@/lib/formulas/body-fat";

/**
 * US Navy circumference method (SPEC §7), cm inputs, log10:
 * men:   495 / (1.0324 − 0.19077·log10(waist − neck) + 0.15456·log10(height)) − 450
 * women: 495 / (1.29579 − 0.35004·log10(waist + hip − neck) + 0.22100·log10(height)) − 450
 * Source: Hodgdon & Beckett 1984. Vectors computed exactly from the
 * published coefficients; ±3–4 pp error band is presented in the UI.
 */

describe("navyBodyFatPercent — men", () => {
  it("waist 85, neck 37, height 178 → ≈17.20%", () => {
    expect(
      navyBodyFatPercent({ sex: "male", waistCm: 85, neckCm: 37, heightCm: 178 }),
    ).toBeCloseTo(17.204, 2);
  });

  it("waist 100, neck 40, height 180 → ≈25.16%", () => {
    expect(
      navyBodyFatPercent({ sex: "male", waistCm: 100, neckCm: 40, heightCm: 180 }),
    ).toBeCloseTo(25.159, 2);
  });

  it("throws when waist ≤ neck (log argument must be positive)", () => {
    expect(() =>
      navyBodyFatPercent({ sex: "male", waistCm: 36, neckCm: 37, heightCm: 178 }),
    ).toThrow(RangeError);
  });
});

describe("navyBodyFatPercent — women", () => {
  it("waist 75, hip 95, neck 33, height 165 → ≈26.92%", () => {
    expect(
      navyBodyFatPercent({
        sex: "female",
        waistCm: 75,
        hipCm: 95,
        neckCm: 33,
        heightCm: 165,
      }),
    ).toBeCloseTo(26.917, 2);
  });

  it("throws when waist + hip ≤ neck", () => {
    expect(() =>
      navyBodyFatPercent({
        sex: "female",
        waistCm: 10,
        hipCm: 20,
        neckCm: 33,
        heightCm: 165,
      }),
    ).toThrow(RangeError);
  });

  it("requires a hip measurement for women", () => {
    expect(() =>
      navyBodyFatPercent({ sex: "female", waistCm: 75, neckCm: 33, heightCm: 165 }),
    ).toThrow(RangeError);
  });
});
