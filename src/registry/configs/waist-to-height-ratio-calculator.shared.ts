export const WHTR_SLUG = "waist-to-height-ratio-calculator";

export const WHTR_LIMITS = {
  waistCm: { min: 40, max: 200 },
  heightCm: { min: 120, max: 250 },
} as const;

export const WHTR_DEFAULTS = {
  waistCm: 85,
  heightCm: 175,
} as const;
