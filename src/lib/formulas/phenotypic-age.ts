/**
 * Phenotypic Age — clinical 9-biomarker biological-age estimate
 * (METHODOLOGY.md §3.1). Pure function, SI inputs.
 *
 * Source: Levine ME et al., "An epigenetic biomarker of aging for lifespan
 * and healthspan," Aging 2018;10:573–591 (the clinical Phenotypic Age,
 * originally Levine 2013). Coefficients transcribed verbatim from the
 * authors' published implementation — Levine lab BioAge R package,
 * phenoage_calc.R — and cross-checked against the values in METHODOLOGY.md.
 *
 * The model is a mortality score under a Gompertz proportional-hazards
 * model, back-transformed to the age at which population-average mortality
 * matches. Output is "associated with" outcomes at population level; it is
 * an estimate, never a diagnosis (see §1.2, §1.5 — clinical disclaimer).
 */

export const PHENOAGE_COEFFICIENTS = {
  intercept: -19.90667,
  albumin: -0.03359355, // g/L
  creatinine: 0.009506491, // µmol/L
  glucose: 0.1953192, // mmol/L
  lnCrp: 0.09536762, // ln(CRP in mg/dL)
  lymphocyte: -0.01199984, // %
  mcv: 0.02676401, // fL
  rdw: 0.3306156, // %
  alp: 0.001868778, // U/L
  wbc: 0.05542406, // 10⁹/L
  age: 0.08035356, // years
} as const;

/**
 * Gompertz constant from the reference code. Equals exp(120 × γ) − 1 for
 * γ = 0.0076927 (verified), so the code and METHODOLOGY.md's general form
 * describe the same model.
 */
const GOMPERTZ_NUM = 1.51714;
const GAMMA = 0.007692696;

// Back-transformation constants (reference code, full precision).
const BA_INTERCEPT = 141.50225;
const BA_NUM = -0.0055305;
const BA_DENOM = 0.090165;

/**
 * CRP is clamped to this floor (mg/dL) before the natural log so a
 * reported CRP of 0 doesn't produce −∞ (METHODOLOGY.md §3.1). Surfaced
 * on-page.
 */
export const CRP_FLOOR_MG_DL = 0.01;

export interface PhenoAgeInput {
  ageYears: number;
  albuminGPerL: number;
  creatinineUmolPerL: number;
  glucoseMmolPerL: number;
  /** CRP in mg/L (common lab unit); converted to mg/dL internally. */
  crpMgPerL: number;
  lymphocytePercent: number;
  mcvFl: number;
  rdwPercent: number;
  alpUPerL: number;
  wbc10e9PerL: number;
}

export interface PhenoAgeResult {
  phenotypicAge: number;
  /** phenotypicAge − chronological age. Negative = biologically younger. */
  deltaYears: number;
  /** 10-year (120-month) mortality score from the Gompertz model (0–1). */
  mortalityScore: number;
  linearCombination: number;
}

export function phenotypicAge(input: PhenoAgeInput): PhenoAgeResult {
  const c = PHENOAGE_COEFFICIENTS;
  const crpMgDl = Math.max(CRP_FLOOR_MG_DL, input.crpMgPerL / 10);
  const lnCrp = Math.log(crpMgDl);

  const xb =
    c.intercept +
    c.albumin * input.albuminGPerL +
    c.creatinine * input.creatinineUmolPerL +
    c.glucose * input.glucoseMmolPerL +
    c.lnCrp * lnCrp +
    c.lymphocyte * input.lymphocytePercent +
    c.mcv * input.mcvFl +
    c.rdw * input.rdwPercent +
    c.alp * input.alpUPerL +
    c.wbc * input.wbc10e9PerL +
    c.age * input.ageYears;

  const mortalityScore = 1 - Math.exp((-GOMPERTZ_NUM * Math.exp(xb)) / GAMMA);
  const phenoAge =
    Math.log(BA_NUM * Math.log(1 - mortalityScore)) / BA_DENOM + BA_INTERCEPT;

  return {
    phenotypicAge: phenoAge,
    deltaYears: phenoAge - input.ageYears,
    mortalityScore,
    linearCombination: xb,
  };
}

// Exact US → SI conversions for the clinical markers (METHODOLOGY.md §3.1).
export const albuminGDlToGL = (gDl: number): number => gDl * 10;
export const creatinineMgDlToUmol = (mgDl: number): number => mgDl * 88.42;
export const glucoseMgDlToMmol = (mgDl: number): number => mgDl / 18.0182;
export const crpMgLToMgDl = (mgL: number): number => mgL / 10;
