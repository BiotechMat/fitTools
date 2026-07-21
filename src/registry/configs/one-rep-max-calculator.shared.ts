/** Client-safe constants for the 1RM calculator. */

export const ONE_RM_SLUG = "one-rep-max-calculator";

export const ONE_RM_LIMITS = {
  weight: { min: 1, max: 500 },
  reps: { min: 1, max: 20 },
} as const;

export const ONE_RM_DEFAULTS = {
  weight: 100,
  reps: 5,
  formula: "epley",
} as const;
