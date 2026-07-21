export const CAFFEINE_SLUG = "caffeine-calculator";

export const CAFFEINE_LIMITS = {
  doseMg: { min: 10, max: 1000 },
  halfLifeH: { min: 1.5, max: 9.5 },
  thresholdMg: { min: 10, max: 200 },
} as const;

export const CAFFEINE_DEFAULTS = {
  doseMg: 200,
  halfLifeH: 5,
  thresholdMg: 50,
} as const;
