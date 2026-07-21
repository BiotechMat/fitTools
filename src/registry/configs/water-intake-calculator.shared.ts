export const WATER_SLUG = "water-intake-calculator";

export const WATER_LIMITS = {
  exerciseHours: { min: 0, max: 6 },
  sweatRateLPerHour: { min: 0.3, max: 2.0 },
} as const;

export const WATER_DEFAULTS = {
  sex: "male",
  exerciseHours: 0,
  sweatRateLPerHour: 0.6,
} as const;
