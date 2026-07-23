export const HR_CALORIES_SLUG = "calories-burned-by-heart-rate";

export const HR_CALORIES_LIMITS = {
  heartRateBpm: { min: 60, max: 220 },
  weightKg: { min: 30, max: 300 },
  ageYears: { min: 13, max: 100 },
  durationMin: { min: 5, max: 300 },
} as const;

/** The Keytel model was fitted on steady aerobic work — warn below this. */
export const HR_MODEL_FLOOR_BPM = 90;

export const HR_CALORIES_DEFAULTS = {
  sex: "male",
  heartRateBpm: 140,
  weightKg: 80,
  ageYears: 30,
  durationMin: 30,
} as const;
