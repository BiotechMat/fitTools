import { describe, expect, it } from "vitest";
import {
  concentrationMgPerMl,
  drawVolumeMl,
  syringeUnits,
} from "@/lib/formulas/reconstitution";

/**
 * Peptide reconstitution arithmetic (SPEC §7, Tier 4). Pure arithmetic on
 * user-supplied values only — no compound presets, no dosing suggestions.
 * concentration = vial mg ÷ diluent ml; draw = dose ÷ concentration;
 * U-100 syringe units = ml × 100.
 */

describe("concentrationMgPerMl", () => {
  it("5 mg into 2 ml → 2.5 mg/ml", () => {
    expect(concentrationMgPerMl(5, 2)).toBeCloseTo(2.5, 9);
  });
  it("10 mg into 3 ml → 3.333 mg/ml", () => {
    expect(concentrationMgPerMl(10, 3)).toBeCloseTo(10 / 3, 9);
  });
  it("throws on zero diluent", () => {
    expect(() => concentrationMgPerMl(5, 0)).toThrow(RangeError);
  });
});

describe("drawVolumeMl", () => {
  it("0.25 mg dose at 2.5 mg/ml → 0.1 ml", () => {
    expect(drawVolumeMl(0.25, 2.5)).toBeCloseTo(0.1, 9);
  });
  it("1 mg dose at 3.333 mg/ml → 0.3 ml", () => {
    expect(drawVolumeMl(1, 10 / 3)).toBeCloseTo(0.3, 9);
  });
  it("throws on zero concentration", () => {
    expect(() => drawVolumeMl(1, 0)).toThrow(RangeError);
  });
});

describe("syringeUnits (U-100)", () => {
  it("0.1 ml → 10 units", () => {
    expect(syringeUnits(0.1)).toBeCloseTo(10, 9);
  });
  it("0.3 ml → 30 units", () => {
    expect(syringeUnits(0.3)).toBeCloseTo(30, 9);
  });
  it("1 ml → 100 units", () => {
    expect(syringeUnits(1)).toBeCloseTo(100, 9);
  });
});

describe("end-to-end example", () => {
  it("5 mg vial, 2 ml water, 250 mcg dose → 0.1 ml = 10 units", () => {
    const concentration = concentrationMgPerMl(5, 2);
    const ml = drawVolumeMl(0.25, concentration);
    expect(syringeUnits(ml)).toBeCloseTo(10, 9);
  });
});
