import { describe, expect, it } from "vitest";
import {
  waistToHeightRatio,
  waistToHipRatio,
  whrBand,
  whtrBand,
} from "@/lib/formulas/body-ratios";

/**
 * WHtR bands at 0.4/0.5/0.6 (0.5 = the global boundary value, Browning,
 * Hsieh & Ashwell 2010); WHR cut-offs ≥0.90 men / ≥0.85 women (WHO 2008).
 */

describe("waist-to-height ratio", () => {
  it("85 cm waist / 175 cm height → 0.4857", () => {
    expect(waistToHeightRatio(85, 175)).toBeCloseTo(85 / 175, 10);
  });

  it("bands split at 0.4, 0.5 and 0.6", () => {
    expect(whtrBand(0.39)).toBe("low");
    expect(whtrBand(0.4)).toBe("healthy");
    expect(whtrBand(0.499)).toBe("healthy");
    expect(whtrBand(0.5)).toBe("increased");
    expect(whtrBand(0.599)).toBe("increased");
    expect(whtrBand(0.6)).toBe("high");
  });

  it("rejects non-positive height", () => {
    expect(() => waistToHeightRatio(85, 0)).toThrow(RangeError);
  });
});

describe("waist-to-hip ratio", () => {
  it("85 cm waist / 98 cm hip → 0.8673", () => {
    expect(waistToHipRatio(85, 98)).toBeCloseTo(85 / 98, 10);
  });

  it("WHO cut-offs: ≥0.90 men, ≥0.85 women", () => {
    expect(whrBand(0.89, "male")).toBe("lower");
    expect(whrBand(0.9, "male")).toBe("raised");
    expect(whrBand(0.84, "female")).toBe("lower");
    expect(whrBand(0.85, "female")).toBe("raised");
  });

  it("rejects non-positive hip circumference", () => {
    expect(() => waistToHipRatio(85, 0)).toThrow(RangeError);
  });
});
