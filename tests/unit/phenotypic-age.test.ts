import { describe, expect, it } from "vitest";
import {
  CRP_FLOOR_MG_DL,
  PHENOAGE_COEFFICIENTS,
  albuminGDlToGL,
  creatinineMgDlToUmol,
  crpMgLToMgDl,
  glucoseMgDlToMmol,
  phenotypicAge,
} from "@/lib/formulas/phenotypic-age";

/**
 * Phenotypic Age (METHODOLOGY.md §3.1) — clinical 9-biomarker version.
 *
 * Coefficients transcribed verbatim from the authors' published code
 * (Levine lab, BioAge R package, phenoage_calc.R) and cross-checked
 * against Levine ME et al., Aging 2018;10:573–591 (the values printed in
 * METHODOLOGY.md agree to their stated rounding).
 *
 * Worked examples reproduce the authors' calculator exactly (same
 * constants). Each expected value was additionally confirmed by computing
 * the identical input through METHODOLOGY.md's independently-stated
 * general-Gompertz formulation — the two forms agree to 0.001 years.
 *
 * The Gompertz constant 1.51714 in the reference code equals
 * exp(120 × 0.0076927) − 1, confirming the code and the doc describe the
 * same model.
 */

// Reference: healthy 50-year-old, favourable markers → PhenoAge ~36.9.
const HEALTHY_50 = {
  ageYears: 50,
  albuminGPerL: 47,
  creatinineUmolPerL: 70,
  glucoseMmolPerL: 5.0,
  crpMgPerL: 1.0, // → 0.1 mg/dL
  lymphocytePercent: 35,
  mcvFl: 90,
  rdwPercent: 12.5,
  alpUPerL: 55,
  wbc10e9PerL: 5.5,
};

describe("PHENOAGE_COEFFICIENTS (verbatim from authors' code)", () => {
  it("matches the Levine lab BioAge phenoage_calc.R literals", () => {
    expect(PHENOAGE_COEFFICIENTS).toMatchObject({
      intercept: -19.90667,
      albumin: -0.03359355,
      creatinine: 0.009506491,
      glucose: 0.1953192,
      lnCrp: 0.09536762,
      lymphocyte: -0.01199984,
      mcv: 0.02676401,
      rdw: 0.3306156,
      alp: 0.001868778,
      wbc: 0.05542406,
      age: 0.08035356,
    });
  });
});

describe("phenotypicAge — worked examples", () => {
  it("healthy 50-year-old → 36.9215 years (younger than chronological)", () => {
    const result = phenotypicAge(HEALTHY_50);
    expect(result.phenotypicAge).toBeCloseTo(36.9215, 3);
    expect(result.deltaYears).toBeCloseTo(36.9215 - 50, 3);
  });

  it("65-year-old with poor markers → 81.1273 years (older than chronological)", () => {
    const result = phenotypicAge({
      ageYears: 65,
      albuminGPerL: 38,
      creatinineUmolPerL: 95,
      glucoseMmolPerL: 7.5,
      crpMgPerL: 5.0,
      lymphocytePercent: 18,
      mcvFl: 95,
      rdwPercent: 15.5,
      alpUPerL: 110,
      wbc10e9PerL: 8.5,
    });
    expect(result.phenotypicAge).toBeCloseTo(81.1273, 3);
    expect(result.deltaYears).toBeGreaterThan(0);
  });

  it("30-year-old with average markers → 24.0793 years", () => {
    const result = phenotypicAge({
      ageYears: 30,
      albuminGPerL: 45,
      creatinineUmolPerL: 75,
      glucoseMmolPerL: 5.2,
      crpMgPerL: 2.0,
      lymphocytePercent: 30,
      mcvFl: 88,
      rdwPercent: 13.0,
      alpUPerL: 65,
      wbc10e9PerL: 6.2,
    });
    expect(result.phenotypicAge).toBeCloseTo(24.0793, 3);
  });
});

describe("CRP floor (METHODOLOGY.md §3.1 — clamp before ln)", () => {
  it("floors CRP at 0.01 mg/dL so a reported 0 does not blow up", () => {
    expect(CRP_FLOOR_MG_DL).toBe(0.01);
    const result = phenotypicAge({
      ageYears: 30,
      albuminGPerL: 45,
      creatinineUmolPerL: 75,
      glucoseMmolPerL: 5.2,
      crpMgPerL: 0, // floored to 0.01 mg/dL
      lymphocytePercent: 30,
      mcvFl: 88,
      rdwPercent: 13.0,
      alpUPerL: 65,
      wbc10e9PerL: 6.2,
    });
    expect(Number.isFinite(result.phenotypicAge)).toBe(true);
    expect(result.phenotypicAge).toBeCloseTo(20.9107, 3);
  });

  it("CRP at exactly the floor equals CRP of zero", () => {
    const base = {
      ageYears: 40,
      albuminGPerL: 45,
      creatinineUmolPerL: 75,
      glucoseMmolPerL: 5.2,
      lymphocytePercent: 30,
      mcvFl: 88,
      rdwPercent: 13.0,
      alpUPerL: 65,
      wbc10e9PerL: 6.2,
    };
    expect(phenotypicAge({ ...base, crpMgPerL: 0 }).phenotypicAge).toBeCloseTo(
      phenotypicAge({ ...base, crpMgPerL: 0.1 }).phenotypicAge,
      9,
    );
  });
});

describe("US ↔ SI unit conversions produce identical results", () => {
  it("the healthy-50 example entered in US units matches the SI result", () => {
    // US-unit equivalents of HEALTHY_50.
    const albuminGDl = 4.7; // → 47 g/L
    const creatinineMgDl = 70 / 88.42; // → 70 µmol/L
    const glucoseMgDl = 5.0 * 18.0182; // → 5.0 mmol/L
    const crpMgDl = 0.1; // → 1.0 mg/L

    const fromUs = phenotypicAge({
      ...HEALTHY_50,
      albuminGPerL: albuminGDlToGL(albuminGDl),
      creatinineUmolPerL: creatinineMgDlToUmol(creatinineMgDl),
      glucoseMmolPerL: glucoseMgDlToMmol(glucoseMgDl),
      crpMgPerL: crpMgDl * 10,
    });
    expect(fromUs.phenotypicAge).toBeCloseTo(
      phenotypicAge(HEALTHY_50).phenotypicAge,
      6,
    );
  });

  it("conversion helpers are exact", () => {
    expect(albuminGDlToGL(4.7)).toBeCloseTo(47, 9);
    expect(creatinineMgDlToUmol(1)).toBeCloseTo(88.42, 9);
    expect(glucoseMgDlToMmol(90.091)).toBeCloseTo(90.091 / 18.0182, 9);
    expect(crpMgLToMgDl(10)).toBeCloseTo(1, 9);
  });
});
