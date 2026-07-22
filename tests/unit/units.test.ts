import { describe, expect, it } from "vitest";
import {
  CM_PER_INCH,
  KG_PER_LB,
  LB_PER_STONE,
  cmToFeetInches,
  cmToInches,
  feetInchesToCm,
  inchesToCm,
  kgToLb,
  kgToStonesLb,
  lbToKg,
  stonesLbToKg,
} from "@/lib/units";

// SPEC §4: conversions are exact — 1 lb = 0.45359237 kg; 1 in = 2.54 cm.
// Both factors are international yard-and-pound definitions (exact by treaty).

describe("conversion constants", () => {
  it("uses the exact international definitions", () => {
    expect(KG_PER_LB).toBe(0.45359237);
    expect(CM_PER_INCH).toBe(2.54);
    expect(LB_PER_STONE).toBe(14);
  });
});

describe("mass conversions", () => {
  it("converts pounds to kilograms exactly", () => {
    expect(lbToKg(1)).toBe(0.45359237);
    expect(lbToKg(220)).toBeCloseTo(99.7903214, 7);
    expect(lbToKg(0)).toBe(0);
  });

  it("converts kilograms to pounds", () => {
    expect(kgToLb(0.45359237)).toBeCloseTo(1, 12);
    expect(kgToLb(100)).toBeCloseTo(220.46226218487758, 9);
  });

  it("round-trips mass without drift beyond float epsilon", () => {
    for (const lb of [1, 132.3, 220.5, 315]) {
      expect(kgToLb(lbToKg(lb))).toBeCloseTo(lb, 10);
    }
  });

  it("converts stones + pounds to kilograms (UK weights)", () => {
    // 11 st 4 lb = 158 lb = 71.66759446 kg
    expect(stonesLbToKg(11, 4)).toBeCloseTo(71.66759446, 7);
    expect(stonesLbToKg(0, 14)).toBeCloseTo(stonesLbToKg(1, 0), 12);
  });

  it("converts kilograms to stones + pounds", () => {
    const { stones, pounds } = kgToStonesLb(71.66759446);
    expect(stones).toBe(11);
    expect(pounds).toBeCloseTo(4, 6);
  });
});

describe("length conversions", () => {
  it("converts inches to centimetres exactly", () => {
    expect(inchesToCm(1)).toBe(2.54);
    expect(inchesToCm(70)).toBeCloseTo(177.8, 12);
  });

  it("converts centimetres to inches", () => {
    expect(cmToInches(2.54)).toBeCloseTo(1, 12);
    expect(cmToInches(177.8)).toBeCloseTo(70, 12);
  });

  it("converts feet + inches to centimetres", () => {
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 12);
    expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88, 12);
  });

  it("converts centimetres to feet + inches", () => {
    const { feet, inches } = cmToFeetInches(177.8);
    expect(feet).toBe(5);
    expect(inches).toBeCloseTo(10, 9);
  });

  it("handles the 12-inch carry at whole-foot boundaries", () => {
    // 182.88 cm is exactly 6 ft; must not report 5 ft 12 in
    const { feet, inches } = cmToFeetInches(182.88);
    expect(feet).toBe(6);
    expect(inches).toBeCloseTo(0, 9);
  });
});
