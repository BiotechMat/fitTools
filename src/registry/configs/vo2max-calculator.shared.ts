export const VO2MAX_SLUG = "vo2max-calculator";

export const VO2MAX_LIMITS = {
  cooperDistanceM: { min: 800, max: 5000 },
  ageYears: { min: 13, max: 100 },
  weightKg: { min: 30, max: 300 },
  walkTimeMin: { min: 8, max: 30 },
  walkHeartRateBpm: { min: 60, max: 220 },
  hrMaxBpm: { min: 120, max: 220 },
  hrRestBpm: { min: 30, max: 110 },
} as const;

export const VO2MAX_DEFAULTS = {
  method: "cooper",
  sex: "male",
  cooperDistanceM: 2400,
  ageYears: 30,
  weightKg: 70,
  walkTimeMin: 13,
  walkHeartRateBpm: 140,
  hrMaxBpm: 190,
  hrRestBpm: 60,
} as const;
