export const STEPS_SLUG = "steps-to-calories-calculator";

export const STEPS_LIMITS = {
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 30, max: 300 },
  steps: { min: 0, max: 100000 },
} as const;

export const STEPS_DEFAULTS = {
  sex: "male",
  heightCm: 175,
  weightKg: 80,
  steps: 10000,
  pace: "moderate",
} as const;
