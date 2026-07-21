/** Client-safe constants for the ideal-weight calculator. */

export const IDEAL_WEIGHT_SLUG = "ideal-weight-calculator";

export const IDEAL_WEIGHT_LIMITS = {
  /** Formulas are undefined below 5 ft (152.4 cm). */
  heightCm: { min: 152.4, max: 250 },
} as const;

export const IDEAL_WEIGHT_DEFAULTS = {
  sex: "male",
  heightCm: 175,
} as const;
