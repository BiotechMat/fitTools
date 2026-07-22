export const RACE_SLUG = "race-time-predictor";

export const RACE_LIMITS = {
  distanceM: { min: 800, max: 100000 },
  totalSeconds: { min: 120, max: 86400 },
} as const;

export const RACE_DEFAULTS = {
  distanceM: 10000,
  totalSeconds: 3000,
} as const;
