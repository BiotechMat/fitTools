/** Client-safe constants for the heart-rate zone calculator. */

export const HR_SLUG = "heart-rate-zone-calculator";

export const HR_LIMITS = {
  ageYears: { min: 13, max: 100 },
  restingHr: { min: 30, max: 100 },
} as const;

export const HR_DEFAULTS = {
  ageYears: 30,
} as const;
