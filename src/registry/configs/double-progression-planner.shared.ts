export const PROGRESSION_SLUG = "double-progression-planner";

export const PROGRESSION_LIMITS = {
  repRangeMin: { min: 1, max: 20 },
  repRangeMax: { min: 2, max: 30 },
  sets: { min: 1, max: 10 },
  currentLoadKg: { min: 1, max: 500 },
  incrementKg: { min: 0.5, max: 10 },
} as const;

export const PROGRESSION_DEFAULTS = {
  repRangeMin: 6,
  repRangeMax: 8,
  sets: 3,
  currentLoadKg: 50,
  incrementKg: 2.5,
} as const;
