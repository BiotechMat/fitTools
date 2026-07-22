import { describe, expect, it } from "vitest";
import { dotsScore, ipfGlScore, wilksScore } from "@/lib/formulas/powerlifting";

/**
 * Powerlifting scores (SPEC §7): coefficients pulled from the
 * OpenPowerlifting codebase (see src/data/powerlifting-coefficients.json).
 *
 * DOTS regression vectors are OpenPowerlifting's OWN computed scores for
 * known lifter entries (openpowerlifting.org lifter pages, retrieved
 * 2026-07-21) — 11 entries, exceeding the spec's ≥5 requirement.
 */

// OPL lifter pages display bodyweight rounded to 1 dp while points are
// computed from the exact recorded weight, so entries can differ by up to
// ~±0.5 points. A ±0.6 window still catches any coefficient error, which
// would shift scores by tens of points.
const expectDots = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThan(0.6);

describe("dotsScore — regression against OpenPowerlifting (male, John Haack)", () => {
  it.each([
    [99.3, 1012.5, 625.12],
    [98.7, 1015, 628.33],
    [87.7, 1010.5, 662.12],
    [96.1, 990, 620.26],
    [87.2, 1013, 665.75],
    [93.4, 1043.5, 662.39],
  ])("bw %s kg, total %s kg → %s DOTS", (bw, total, expected) => {
    expectDots(dotsScore("male", bw, total), expected);
  });
});

describe("dotsScore — regression against OpenPowerlifting (female, Agata Sitko)", () => {
  it.each([
    [63.4, 612.5, 655.79],
    [68.5, 545, 557.93],
    [71.1, 635, 636.6],
    [68.4, 628, 643.38],
    [72.4, 135, 134.0],
  ])("bw %s kg, total %s kg → %s DOTS", (bw, total, expected) => {
    expectDots(dotsScore("female", bw, total), expected);
  });
});

describe("dotsScore — bodyweight clamps", () => {
  it("clamps below 40 kg to the 40 kg coefficient", () => {
    expect(dotsScore("male", 30, 500)).toBeCloseTo(dotsScore("male", 40, 500), 9);
  });
  it("clamps male bodyweight above 210 kg", () => {
    expect(dotsScore("male", 250, 500)).toBeCloseTo(dotsScore("male", 210, 500), 9);
  });
});

describe("wilksScore — consistency with OPL coefficients", () => {
  // Wilks vectors are computed from the OPL-sourced polynomial itself
  // (consistency checks); DOTS above carries the independent regression.
  it("male coefficient decreases as bodyweight rises", () => {
    const light = wilksScore("male", 60, 500);
    const heavy = wilksScore("male", 120, 500);
    expect(light).toBeGreaterThan(heavy);
  });

  it("same total, same bodyweight: women score higher (smaller denominator)", () => {
    expect(wilksScore("female", 60, 400)).toBeGreaterThan(wilksScore("male", 60, 400));
  });

  it("male 90 kg total 700 lands in the plausible Wilks range (420–470)", () => {
    const score = wilksScore("male", 90, 700);
    expect(score).toBeGreaterThan(420);
    expect(score).toBeLessThan(470);
  });
});

describe("ipfGlScore", () => {
  it("returns 0 below the 35 kg bodyweight floor", () => {
    expect(ipfGlScore("male", 30, 500, "sbd", "raw")).toBe(0);
  });

  it("100 GL points corresponds to the reference performance", () => {
    // By construction GL = total × 100 / (A − B·e^(−C·bw)); at any bw a
    // total equal to the denominator scores exactly 100.
    const bw = 93;
    const denominator = 1199.72839 - 1025.18162 * Math.exp(-0.00921 * bw);
    expect(ipfGlScore("male", bw, denominator, "sbd", "raw")).toBeCloseTo(100, 9);
  });

  it("equipped and raw use different parameter sets", () => {
    expect(ipfGlScore("male", 93, 700, "sbd", "equipped")).not.toBeCloseTo(
      ipfGlScore("male", 93, 700, "sbd", "raw"),
      3,
    );
  });

  it("bench-only uses the bench parameter set", () => {
    const bench = ipfGlScore("female", 63, 120, "bench", "raw");
    expect(bench).toBeGreaterThan(0);
    expect(bench).not.toBeCloseTo(ipfGlScore("female", 63, 120, "sbd", "raw"), 3);
  });
});
