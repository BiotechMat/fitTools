/** Client-safe constants for the plate-loading calculator. */

export const PLATE_SLUG = "plate-calculator";

export const PLATE_LIMITS = {
  targetKg: { min: 10, max: 500 },
} as const;

export const PLATE_DEFAULTS = {
  targetKg: 100,
  barKg: 20,
} as const;
