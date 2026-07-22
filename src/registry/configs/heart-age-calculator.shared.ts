/** Client-safe constants for the Heart Age calculator (PREVENT, METHODOLOGY §3.3). */

export const HEART_AGE_SLUG = "heart-age-calculator";

/**
 * Plausible input ranges. Age is bounded to PREVENT's validated 30–79 window;
 * the rest are clinical plausibility bounds (SI units). ApoB and Lp(a) are
 * optional context inputs only — never used in the risk maths.
 */
export const HEART_AGE_LIMITS = {
  ageYears: { min: 30, max: 79 },
  totalCholMmol: { min: 2, max: 12 },
  hdlMmol: { min: 0.4, max: 4 },
  systolicBp: { min: 80, max: 220 },
  egfr: { min: 15, max: 150 },
  apoBmgDl: { min: 20, max: 250 },
  lpaNmol: { min: 0, max: 600 },
} as const;

/** Reference-range defaults (average middle-aged adult), SI units. */
export const HEART_AGE_DEFAULTS = {
  sex: "male",
  ageYears: 50,
  totalCholMmol: 5.2,
  hdlMmol: 1.3,
  systolicBp: 125,
  onBpMeds: false,
  onStatin: false,
  diabetes: false,
  currentSmoker: false,
  egfr: 95,
} as const;
