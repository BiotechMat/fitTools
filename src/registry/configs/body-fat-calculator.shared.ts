/** Client-safe constants for the US Navy body-fat calculator. */

export const BODY_FAT_SLUG = "body-fat-calculator";

export const BODY_FAT_LIMITS = {
  heightCm: { min: 120, max: 250 },
  neckCm: { min: 20, max: 60 },
  waistCm: { min: 40, max: 200 },
  hipCm: { min: 50, max: 200 },
} as const;

export const BODY_FAT_DEFAULTS = {
  sex: "male",
  heightCm: 178,
  neckCm: 37,
  waistCm: 85,
  hipCm: 95,
} as const;

/** Error band presented with every result (SPEC §7). */
export const BODY_FAT_ERROR_BAND_PP = "±3–4";
