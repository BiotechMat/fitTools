/** Client-safe constants for the calorie-deficit calculator. */

export const DEFICIT_SLUG = "calorie-deficit-calculator";

export const DEFICIT_LIMITS = {
  tdeeKcal: { min: 1200, max: 6000 },
  dailyDeficitKcal: { min: 100, max: 2000 },
  targetLossKg: { min: 1, max: 100 },
} as const;

export const DEFICIT_DEFAULTS = {
  tdeeKcal: 2500,
  dailyDeficitKcal: 500,
  targetLossKg: 10,
} as const;
