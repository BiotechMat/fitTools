export const CREATINE_SLUG = "creatine-calculator";

export const CREATINE_CALC_LIMITS = {
  weightKg: { min: 30, max: 300 },
} as const;

export const CREATINE_CALC_DEFAULTS = {
  weightKg: 80,
} as const;
