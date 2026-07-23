export const KETO_SLUG = "keto-calculator";

export const KETO_LIMITS = {
  ageYears: { min: 13, max: 100 },
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  netCarbsG: { min: 20, max: 50 },
  proteinGPerKg: { min: 1.6, max: 2.2 },
} as const;

export const KETO_DEFAULTS = {
  sex: "male",
  ageYears: 30,
  weightKg: 80,
  heightCm: 175,
  activity: "moderate",
  goal: "lose",
  netCarbsG: 25,
  proteinGPerKg: 1.8,
} as const;

export const KETO_GOAL_LABELS = {
  lose: "Lose fat (−20%)",
  maintain: "Maintain",
  gain: "Gain (+10%)",
} as const;
