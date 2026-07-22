/** Client-safe constants for the Phenotypic Age calculator. */

export const PHENOAGE_SLUG = "phenotypic-age-calculator";

/**
 * Plausible clinical ranges (SI), enforced by the Zod schema and the
 * client (METHODOLOGY.md §2 — reject out-of-range, never silently clamp,
 * except the documented CRP floor which is handled in the formula).
 */
export const PHENOAGE_LIMITS = {
  ageYears: { min: 18, max: 100 },
  albuminGPerL: { min: 20, max: 60 },
  creatinineUmolPerL: { min: 20, max: 400 },
  glucoseMmolPerL: { min: 2, max: 30 },
  crpMgPerL: { min: 0, max: 200 },
  lymphocytePercent: { min: 1, max: 80 },
  mcvFl: { min: 60, max: 120 },
  rdwPercent: { min: 8, max: 30 },
  alpUPerL: { min: 10, max: 500 },
  wbc10e9PerL: { min: 1, max: 30 },
} as const;

/** Reference-range defaults (mid healthy adult), SI units. */
export const PHENOAGE_DEFAULTS = {
  ageYears: 45,
  albuminGPerL: 45,
  creatinineUmolPerL: 80,
  glucoseMmolPerL: 5.2,
  crpMgPerL: 1.0,
  lymphocytePercent: 30,
  mcvFl: 90,
  rdwPercent: 13,
  alpUPerL: 65,
  wbc10e9PerL: 6,
} as const;
