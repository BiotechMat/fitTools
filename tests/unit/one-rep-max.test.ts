import { describe, expect, it } from "vitest";
import {
  ONE_RM_FORMULAS,
  REP_VALIDITY_LIMIT,
  oneRepMax,
  percentTable,
} from "@/lib/formulas/one-rep-max";

/**
 * 1RM estimation (SPEC §7): Epley w(1 + r/30) default; Brzycki
 * w·36/(37 − r); Lombardi w·r^0.10; O'Conner w(1 + 0.025r). Valid for
 * r ≤ 10 (warn above). Vectors computed exactly from the formulas.
 */

describe("oneRepMax — 100 kg × 5", () => {
  it("Epley → 116.667", () => {
    expect(oneRepMax("epley", 100, 5)).toBeCloseTo(100 * (1 + 5 / 30), 9);
  });
  it("Brzycki → 112.5", () => {
    expect(oneRepMax("brzycki", 100, 5)).toBeCloseTo(112.5, 9);
  });
  it("Lombardi → 117.462", () => {
    expect(oneRepMax("lombardi", 100, 5)).toBeCloseTo(100 * 5 ** 0.1, 9);
  });
  it("O'Conner → 112.5", () => {
    expect(oneRepMax("oconner", 100, 5)).toBeCloseTo(112.5, 9);
  });
});

describe("oneRepMax — 60 kg × 10", () => {
  it("Epley → 80", () => {
    expect(oneRepMax("epley", 60, 10)).toBeCloseTo(80, 9);
  });
  it("Brzycki → 80", () => {
    expect(oneRepMax("brzycki", 60, 10)).toBeCloseTo(80, 9);
  });
  it("Lombardi → 75.536", () => {
    expect(oneRepMax("lombardi", 60, 10)).toBeCloseTo(60 * 10 ** 0.1, 9);
  });
  it("O'Conner → 75", () => {
    expect(oneRepMax("oconner", 60, 10)).toBeCloseTo(75, 9);
  });
});

describe("single-rep sets", () => {
  it("Brzycki and Lombardi return the lifted weight at 1 rep", () => {
    expect(oneRepMax("brzycki", 140, 1)).toBeCloseTo(140, 9);
    expect(oneRepMax("lombardi", 140, 1)).toBeCloseTo(140, 9);
  });
});

describe("validity limit", () => {
  it("is 10 reps (SPEC §7)", () => {
    expect(REP_VALIDITY_LIMIT).toBe(10);
  });

  it("exposes exactly the four spec formulas", () => {
    expect(Object.keys(ONE_RM_FORMULAS).sort()).toEqual([
      "brzycki",
      "epley",
      "lombardi",
      "oconner",
    ]);
  });
});

describe("percentTable", () => {
  it("spans 50–95% in 5% steps of the 1RM", () => {
    const table = percentTable(200);
    expect(table).toHaveLength(10);
    expect(table[0]).toEqual({ percent: 50, weight: 100 });
    expect(table[9]).toEqual({ percent: 95, weight: 190 });
    expect(table[5]).toEqual({ percent: 75, weight: 150 });
  });
});
