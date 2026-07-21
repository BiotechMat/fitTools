export const BMR_SLUG = "bmr-calculator";

export const BMR_CALC_LIMITS = {
  ageYears: { min: 13, max: 100 },
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  bodyFatPercent: { min: 5, max: 60 },
} as const;

export const BMR_CALC_DEFAULTS = {
  sex: "male",
  ageYears: 30,
  weightKg: 80,
  heightCm: 175,
  formula: "mifflin",
} as const;
