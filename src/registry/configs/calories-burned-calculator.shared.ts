export const CALORIES_BURNED_SLUG = "calories-burned-calculator";

export const CALORIES_BURNED_LIMITS = {
  weightKg: { min: 30, max: 300 },
  minutes: { min: 1, max: 600 },
} as const;

export const CALORIES_BURNED_DEFAULTS = {
  weightKg: 80,
  minutes: 30,
  activityCode: "12050",
} as const;
