/** Client-safe constants for the BMI calculator. */

export const BMI_SLUG = "bmi-calculator";

export const BMI_LIMITS = {
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
} as const;

export const BMI_DEFAULTS = {
  weightKg: 80,
  heightCm: 175,
} as const;
