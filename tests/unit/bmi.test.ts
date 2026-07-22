import { describe, expect, it } from "vitest";
import { bmi, bmiCategory } from "@/lib/formulas/bmi";

/**
 * BMI (SPEC §7): kg/m² with WHO categories. Cutoffs from the WHO
 * classification (underweight < 18.5; 18.5–24.9; 25–29.9; obesity classes
 * I ≥ 30, II ≥ 35, III ≥ 40).
 */

describe("bmi", () => {
  it("80 kg at 175 cm → 26.1224…", () => {
    expect(bmi(80, 175)).toBeCloseTo(80 / 1.75 ** 2, 9);
  });

  it("70 kg at 175 cm → 22.857…", () => {
    expect(bmi(70, 175)).toBeCloseTo(22.8571428571, 6);
  });

  it("58 kg at 160 cm → 22.65625", () => {
    expect(bmi(58, 160)).toBeCloseTo(22.65625, 9);
  });
});

describe("bmiCategory (WHO)", () => {
  it.each([
    [16.5, "underweight"],
    [18.4, "underweight"],
    [18.5, "healthy weight"],
    [22, "healthy weight"],
    [24.9, "healthy weight"],
    [25, "overweight"],
    [29.9, "overweight"],
    [30, "obesity class I"],
    [34.9, "obesity class I"],
    [35, "obesity class II"],
    [39.9, "obesity class II"],
    [40, "obesity class III"],
    [45, "obesity class III"],
  ] as const)("classifies BMI %s as %s", (value, expected) => {
    expect(bmiCategory(value)).toBe(expected);
  });
});
