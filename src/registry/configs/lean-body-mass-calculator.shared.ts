export const LBM_SLUG = "lean-body-mass-calculator";

export const LBM_LIMITS = {
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  bodyFatPercent: { min: 5, max: 60 },
} as const;

export const LBM_DEFAULTS = {
  sex: "male",
  weightKg: 80,
  heightCm: 180,
} as const;
