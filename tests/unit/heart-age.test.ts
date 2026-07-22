import { describe, expect, it } from "vitest";
import {
  HEART_AGE_REFERENCE,
  PREVENT_AGE_MAX,
  PREVENT_AGE_MIN,
  PREVENT_TOTAL_CVD_10YR,
  cholMgDlToMmol,
  heartAge,
  preventTotalCvdRisk10yr,
} from "@/lib/formulas/heart-age";

/**
 * Heart Age — AHA PREVENT base 10-year total-CVD model (METHODOLOGY.md §3.3).
 *
 * Coefficients transcribed from the open-source `preventr` package
 * (github.com/martingmayer/preventr, R/sysdata.rda → base_10yr,
 * female_total_cvd / male_total_cvd), which transcribes the AHA PREVENT
 * supplement and is validated against the AHA online PREVENT calculator.
 *
 * The locked worked example below reproduces preventr's own documented
 * output (0.147) to the digit, giving the chain
 *   AHA calculator ≈ preventr (author-validated) ≈ this implementation.
 *
 * Cholesterol mg/dL → mmol/L uses ÷38.67. BMI carries a coefficient of
 * exactly 0 for the total-CVD endpoint (it drives PREVENT's heart-failure
 * model), so it is intentionally not an input here.
 */

// preventr documented example: 50yo woman, TC 200 mg/dL, HDL 45, SBP 160
// treated, diabetic, non-smoker, eGFR 90 (BMI 35, irrelevant) → 14.7%.
const PREVENTR_EXAMPLE = {
  sex: "female" as const,
  ageYears: 50,
  totalCholMmol: cholMgDlToMmol(200),
  hdlMmol: cholMgDlToMmol(45),
  systolicBp: 160,
  onBpMeds: true,
  onStatin: false,
  diabetes: true,
  currentSmoker: false,
  egfr: 90,
};

describe("PREVENT_TOTAL_CVD_10YR coefficients (verbatim from preventr base_10yr)", () => {
  it("matches the female total-CVD column exactly", () => {
    expect(PREVENT_TOTAL_CVD_10YR.female).toEqual({
      age: 0.793933,
      nonHdl: 0.030524,
      hdl: -0.160686,
      sbpLt110: -0.2394,
      sbpGe110: 0.360078,
      diabetes: 0.86676,
      smoking: 0.536074,
      egfrLt60: 0.604592,
      egfrGe60: 0.043377,
      bpTreated: 0.315167,
      statin: -0.147765,
      bpTxSbpGe110: -0.066361,
      statinNonHdl: 0.119788,
      ageNonHdl: -0.081972,
      ageHdl: 0.030677,
      ageSbpGe110: -0.094635,
      ageDiabetes: -0.27057,
      ageSmoking: -0.078715,
      ageEgfrLt60: -0.163781,
      constant: -3.307728,
    });
  });

  it("matches the male total-CVD column exactly", () => {
    expect(PREVENT_TOTAL_CVD_10YR.male).toEqual({
      age: 0.768853,
      nonHdl: 0.073617,
      hdl: -0.095443,
      sbpLt110: -0.434735,
      sbpGe110: 0.336266,
      diabetes: 0.769286,
      smoking: 0.438687,
      egfrLt60: 0.537898,
      egfrGe60: 0.016483,
      bpTreated: 0.288879,
      statin: -0.133735,
      bpTxSbpGe110: -0.047592,
      statinNonHdl: 0.150273,
      ageNonHdl: -0.051787,
      ageHdl: 0.019117,
      ageSbpGe110: -0.104948,
      ageDiabetes: -0.225195,
      ageSmoking: -0.089507,
      ageEgfrLt60: -0.15437,
      constant: -3.031168,
    });
  });
});

describe("preventTotalCvdRisk10yr — worked examples", () => {
  it("LOCK: reproduces preventr's documented example → 0.147", () => {
    expect(preventTotalCvdRisk10yr(PREVENTR_EXAMPLE)).toBeCloseTo(0.1468, 4);
  });

  it("60yo male smoker, untreated SBP 130, TC 210/HDL 40, eGFR 80 → ~10.7%", () => {
    expect(
      preventTotalCvdRisk10yr({
        sex: "male",
        ageYears: 60,
        totalCholMmol: cholMgDlToMmol(210),
        hdlMmol: cholMgDlToMmol(40),
        systolicBp: 130,
        onBpMeds: false,
        onStatin: false,
        diabetes: false,
        currentSmoker: true,
        egfr: 80,
      }),
    ).toBeCloseTo(0.10688, 4);
  });

  it("40yo woman, near-optimal factors → ~0.6%", () => {
    expect(
      preventTotalCvdRisk10yr({
        sex: "female",
        ageYears: 40,
        totalCholMmol: cholMgDlToMmol(170),
        hdlMmol: cholMgDlToMmol(55),
        systolicBp: 115,
        onBpMeds: false,
        onStatin: false,
        diabetes: false,
        currentSmoker: false,
        egfr: 100,
      }),
    ).toBeCloseTo(0.00625, 4);
  });

  it("70yo male, every risk factor adverse → ~44%", () => {
    expect(
      preventTotalCvdRisk10yr({
        sex: "male",
        ageYears: 70,
        totalCholMmol: cholMgDlToMmol(240),
        hdlMmol: cholMgDlToMmol(35),
        systolicBp: 170,
        onBpMeds: true,
        onStatin: true,
        diabetes: true,
        currentSmoker: true,
        egfr: 55,
      }),
    ).toBeCloseTo(0.44078, 4);
  });

  it("risk rises with age, all else equal", () => {
    const base = {
      sex: "male" as const,
      totalCholMmol: cholMgDlToMmol(200),
      hdlMmol: cholMgDlToMmol(50),
      systolicBp: 130,
      onBpMeds: false,
      onStatin: false,
      diabetes: false,
      currentSmoker: false,
      egfr: 90,
    };
    expect(preventTotalCvdRisk10yr({ ...base, ageYears: 60 })).toBeGreaterThan(
      preventTotalCvdRisk10yr({ ...base, ageYears: 40 }),
    );
  });
});

describe("heartAge — optimal-reference back-solve", () => {
  it("a person at exactly the optimal reference profile has heart age = actual age", () => {
    const result = heartAge({
      sex: "male",
      ageYears: 45,
      ...HEART_AGE_REFERENCE,
    });
    expect(result.heartAge).toBeCloseTo(45, 1);
    expect(result.clampedAt).toBeNull();
  });

  it("the diabetic treated 50yo woman has an older heart (≈76)", () => {
    const result = heartAge(PREVENTR_EXAMPLE);
    expect(result.heartAge).toBeCloseTo(76.4, 1);
    expect(result.deltaYears).toBeGreaterThan(0);
  });

  it("near-optimal 40yo woman has heart age ≈ her age", () => {
    const result = heartAge({
      sex: "female",
      ageYears: 40,
      totalCholMmol: cholMgDlToMmol(170),
      hdlMmol: cholMgDlToMmol(55),
      systolicBp: 115,
      onBpMeds: false,
      onStatin: false,
      diabetes: false,
      currentSmoker: false,
      egfr: 100,
    });
    expect(result.heartAge).toBeCloseTo(41.3, 1);
  });

  it("very high risk clamps at the top of the valid window (79)", () => {
    const result = heartAge({
      sex: "male",
      ageYears: 70,
      totalCholMmol: cholMgDlToMmol(240),
      hdlMmol: cholMgDlToMmol(35),
      systolicBp: 170,
      onBpMeds: true,
      onStatin: true,
      diabetes: true,
      currentSmoker: true,
      egfr: 55,
    });
    expect(result.heartAge).toBe(PREVENT_AGE_MAX);
    expect(result.clampedAt).toBe("max");
  });
});

describe("cholMgDlToMmol", () => {
  it("uses the ÷38.67 factor", () => {
    expect(cholMgDlToMmol(200)).toBeCloseTo(5.17197, 4);
    expect(cholMgDlToMmol(38.67)).toBeCloseTo(1, 6);
  });
});

describe("valid-range constants", () => {
  it("exposes the PREVENT 30–79 age window", () => {
    expect(PREVENT_AGE_MIN).toBe(30);
    expect(PREVENT_AGE_MAX).toBe(79);
  });
});
