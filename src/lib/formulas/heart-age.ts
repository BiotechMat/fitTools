/**
 * Heart Age — AHA PREVENT base 10-year total-CVD risk, back-solved to a
 * "heart age" (METHODOLOGY.md §3.3). Pure functions, SI inputs.
 *
 * Model: Khan SS et al., "Development and Validation of the American Heart
 * Association's PREVENT Equations," Circulation 2024
 * (DOI 10.1161/CIRCULATIONAHA.123.067626). The base model (no HbA1c/UACR/SDI
 * enhancers) predicting 10-year risk of TOTAL cardiovascular disease, fit
 * separately by sex.
 *
 * Coefficients are transcribed from the open-source `preventr` package
 * (github.com/martingmayer/preventr, R/sysdata.rda → base_10yr,
 * columns female_total_cvd / male_total_cvd), which transcribes the AHA
 * supplement and is validated against the AHA online PREVENT calculator. Our
 * unit test reproduces preventr's own documented worked example (0.147) to the
 * digit.
 *
 * This is a population-level risk estimate, never a diagnosis (clinical
 * disclaimer, §1.5). ApoB and Lp(a) are NOT inputs to PREVENT and are shown
 * only as separate context alongside the result — never folded into this maths.
 */

export type Sex = "female" | "male";

export interface PreventTotalCvdCoefficients {
  age: number;
  nonHdl: number;
  hdl: number;
  sbpLt110: number;
  sbpGe110: number;
  diabetes: number;
  smoking: number;
  egfrLt60: number;
  egfrGe60: number;
  bpTreated: number;
  statin: number;
  bpTxSbpGe110: number;
  statinNonHdl: number;
  ageNonHdl: number;
  ageHdl: number;
  ageSbpGe110: number;
  ageDiabetes: number;
  ageSmoking: number;
  ageEgfrLt60: number;
  constant: number;
}

/**
 * Sex-specific betas for the base 10-year total-CVD model. BMI and its
 * age-interaction have published coefficients of exactly 0 for this endpoint
 * (they drive PREVENT's heart-failure model), so they are omitted here.
 */
export const PREVENT_TOTAL_CVD_10YR: Record<Sex, PreventTotalCvdCoefficients> = {
  female: {
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
  },
  male: {
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
  },
};

/** PREVENT is validated for adults aged 30–79 only. */
export const PREVENT_AGE_MIN = 30;
export const PREVENT_AGE_MAX = 79;

/** Cholesterol mg/dL → mmol/L (PREVENT works in mmol/L). */
export const cholMgDlToMmol = (mgDl: number): number => mgDl / 38.67;

export interface PreventInput {
  sex: Sex;
  ageYears: number;
  /** Total cholesterol, mmol/L. */
  totalCholMmol: number;
  /** HDL cholesterol, mmol/L. */
  hdlMmol: number;
  /** Systolic blood pressure, mmHg. */
  systolicBp: number;
  onBpMeds: boolean;
  onStatin: boolean;
  diabetes: boolean;
  currentSmoker: boolean;
  /** eGFR, mL/min/1.73m². */
  egfr: number;
}

/** PREVENT linear predictor (log-odds) for the base 10-year total-CVD model. */
function linearPredictor(input: PreventInput): number {
  const c = PREVENT_TOTAL_CVD_10YR[input.sex];
  const nonHdlMmol = input.totalCholMmol - input.hdlMmol;

  // Centred / splined predictors, exactly as in the PREVENT supplement.
  const age = (input.ageYears - 55) / 10;
  const nonHdl = nonHdlMmol - 3.5;
  const hdl = (input.hdlMmol - 1.3) / 0.3;
  const sbpLt110 = (Math.min(input.systolicBp, 110) - 110) / 20;
  const sbpGe110 = (Math.max(input.systolicBp, 110) - 130) / 20;
  const egfrLt60 = (Math.min(input.egfr, 60) - 60) / -15;
  const egfrGe60 = (Math.max(input.egfr, 60) - 90) / -15;
  const dm = input.diabetes ? 1 : 0;
  const smk = input.currentSmoker ? 1 : 0;
  const bpTx = input.onBpMeds ? 1 : 0;
  const statin = input.onStatin ? 1 : 0;

  return (
    c.age * age +
    c.nonHdl * nonHdl +
    c.hdl * hdl +
    c.sbpLt110 * sbpLt110 +
    c.sbpGe110 * sbpGe110 +
    c.diabetes * dm +
    c.smoking * smk +
    c.egfrLt60 * egfrLt60 +
    c.egfrGe60 * egfrGe60 +
    c.bpTreated * bpTx +
    c.statin * statin +
    c.bpTxSbpGe110 * (bpTx * sbpGe110) +
    c.statinNonHdl * (statin * nonHdl) +
    c.ageNonHdl * (age * nonHdl) +
    c.ageHdl * (age * hdl) +
    c.ageSbpGe110 * (age * sbpGe110) +
    c.ageDiabetes * (age * dm) +
    c.ageSmoking * (age * smk) +
    c.ageEgfrLt60 * (age * egfrLt60) +
    c.constant
  );
}

/** Predicted 10-year total-CVD risk, 0–1. */
export function preventTotalCvdRisk10yr(input: PreventInput): number {
  const lp = linearPredictor(input);
  return Math.exp(lp) / (1 + Math.exp(lp));
}

/**
 * Optimal reference risk-factor profile (same sex) used to define heart age:
 * the healthiest plausible values, holding everything but age fixed. Chosen
 * and documented on-page — total chol 170 / HDL 55 mg/dL, SBP 110 untreated,
 * non-smoker, non-diabetic, normal renal function, no statin.
 */
export const HEART_AGE_REFERENCE = {
  totalCholMmol: cholMgDlToMmol(170),
  hdlMmol: cholMgDlToMmol(55),
  systolicBp: 110,
  onBpMeds: false,
  onStatin: false,
  diabetes: false,
  currentSmoker: false,
  egfr: 100,
} as const;

function referenceRisk(sex: Sex, ageYears: number): number {
  return preventTotalCvdRisk10yr({ sex, ageYears, ...HEART_AGE_REFERENCE });
}

export interface HeartAgeResult {
  /** Predicted 10-year total-CVD risk, 0–1. */
  risk10yr: number;
  /** Age at which the optimal reference profile carries the same risk. */
  heartAge: number;
  /** heartAge − chronological age. Positive = older heart. */
  deltaYears: number;
  /** Set when the solution falls outside the valid 30–79 window. */
  clampedAt: "min" | "max" | null;
}

/**
 * Heart age: the age at which someone with the optimal reference profile has
 * the same predicted 10-year total-CVD risk as this person. Solved by
 * bisection over the model's valid 30–79 window (reference risk is monotone in
 * age), clamped at the ends.
 */
export function heartAge(input: PreventInput): HeartAgeResult {
  const risk10yr = preventTotalCvdRisk10yr(input);

  const riskAtMin = referenceRisk(input.sex, PREVENT_AGE_MIN);
  const riskAtMax = referenceRisk(input.sex, PREVENT_AGE_MAX);

  if (risk10yr <= riskAtMin) {
    return {
      risk10yr,
      heartAge: PREVENT_AGE_MIN,
      deltaYears: PREVENT_AGE_MIN - input.ageYears,
      clampedAt: "min",
    };
  }
  if (risk10yr >= riskAtMax) {
    return {
      risk10yr,
      heartAge: PREVENT_AGE_MAX,
      deltaYears: PREVENT_AGE_MAX - input.ageYears,
      clampedAt: "max",
    };
  }

  let lo = PREVENT_AGE_MIN;
  let hi = PREVENT_AGE_MAX;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (referenceRisk(input.sex, mid) < risk10yr) lo = mid;
    else hi = mid;
  }
  const solved = Math.round(((lo + hi) / 2) * 10) / 10;

  return {
    risk10yr,
    heartAge: solved,
    deltaYears: solved - input.ageYears,
    clampedAt: null,
  };
}
