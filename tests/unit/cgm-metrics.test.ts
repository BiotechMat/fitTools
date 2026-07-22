import { describe, expect, it } from "vitest";
import {
  GMI_INTERCEPT,
  GMI_SLOPE,
  TIR_HIGH_MMOL,
  TIR_LOW_MMOL,
  cgmMetrics,
  gmiFromMeanMgDl,
  mgDlToMmol,
  mmolToMgDl,
} from "@/lib/formulas/cgm";

/**
 * CGM metabolic metrics (METHODOLOGY.md §3.5). Standardised, safe-to-state
 * consensus metrics:
 * - GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL) — Bergenstal 2018.
 * - %CV = SD / mean × 100 (consensus stability target < 36%) — Battelino 2019.
 * - Time in range = % of readings in 70–180 mg/dL (3.9–10.0 mmol/L).
 * Canonical internal unit is mmol/L; GMI converts to mg/dL internally.
 */

describe("GMI (Bergenstal 2018)", () => {
  it("uses the published coefficients", () => {
    expect(GMI_INTERCEPT).toBe(3.31);
    expect(GMI_SLOPE).toBe(0.02392);
  });

  it("mean glucose 150 mg/dL → GMI 6.898% (published worked example)", () => {
    expect(gmiFromMeanMgDl(150)).toBeCloseTo(6.898, 3);
  });

  it("mean glucose 100 mg/dL → GMI 5.702%", () => {
    expect(gmiFromMeanMgDl(100)).toBeCloseTo(3.31 + 0.02392 * 100, 9);
  });

  it("mean glucose 200 mg/dL → GMI 8.094%", () => {
    expect(gmiFromMeanMgDl(200)).toBeCloseTo(8.094, 3);
  });
});

describe("unit conversions", () => {
  it("mmol/L ↔ mg/dL uses 18.0182", () => {
    expect(mmolToMgDl(5)).toBeCloseTo(90.091, 3);
    expect(mgDlToMmol(90.091)).toBeCloseTo(5, 6);
  });
});

describe("TIR bounds", () => {
  it("uses the consensus 3.9–10.0 mmol/L range", () => {
    expect(TIR_LOW_MMOL).toBe(3.9);
    expect(TIR_HIGH_MMOL).toBe(10.0);
  });
});

describe("cgmMetrics — aggregate", () => {
  // Readings in mmol/L.
  const readings = [5.0, 6.0, 7.0, 8.0, 9.0, 11.0, 3.5, 5.5, 6.5, 7.5];

  it("computes mean glucose in both units", () => {
    const m = cgmMetrics(readings);
    const meanMmol = readings.reduce((a, b) => a + b, 0) / readings.length;
    expect(m.meanMmol).toBeCloseTo(meanMmol, 9);
    expect(m.meanMgDl).toBeCloseTo(mmolToMgDl(meanMmol), 9);
  });

  it("computes %CV from the sample SD", () => {
    const m = cgmMetrics(readings);
    const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
    const variance =
      readings.reduce((a, b) => a + (b - mean) ** 2, 0) / (readings.length - 1);
    const sd = Math.sqrt(variance);
    expect(m.cvPercent).toBeCloseTo((sd / mean) * 100, 9);
  });

  it("flags stability against the 36% target", () => {
    expect(cgmMetrics([5, 5.1, 4.9, 5.05, 4.95]).cvStable).toBe(true);
    expect(cgmMetrics([3, 12, 4, 11, 5]).cvStable).toBe(false);
  });

  it("computes GMI from mean glucose", () => {
    const m = cgmMetrics(readings);
    expect(m.gmi).toBeCloseTo(gmiFromMeanMgDl(m.meanMgDl), 9);
  });

  it("time in range: 8 of 10 readings in 3.9–10.0 → 80%", () => {
    // 11.0 (above) and 3.5 (below) are the two out of range.
    const m = cgmMetrics(readings);
    expect(m.timeInRangePercent).toBeCloseTo(80, 9);
    expect(m.timeAbovePercent).toBeCloseTo(10, 9);
    expect(m.timeBelowPercent).toBeCloseTo(10, 9);
  });

  it("range boundaries are inclusive (3.9 and 10.0 count as in-range)", () => {
    const m = cgmMetrics([3.9, 10.0, 5.0]);
    expect(m.timeInRangePercent).toBeCloseTo(100, 9);
  });

  it("throws on fewer than two readings (SD undefined)", () => {
    expect(() => cgmMetrics([5])).toThrow(RangeError);
  });
});
