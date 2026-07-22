export const METABOLIC_FITNESS_SLUG = "metabolic-fitness-index";

export const MF_LIMITS = {
  timeInRangePercent: { min: 0, max: 100 },
  cvPercent: { min: 5, max: 100 },
  gmiPercent: { min: 3, max: 15 },
  waistCm: { min: 40, max: 200 },
  heightCm: { min: 120, max: 250 },
  restingHr: { min: 30, max: 120 },
} as const;

export const MF_DEFAULTS = {
  timeInRangePercent: 75,
  cvPercent: 32,
  gmiPercent: 6.0,
  waistCm: 85,
  heightCm: 175,
  restingHr: 62,
} as const;
