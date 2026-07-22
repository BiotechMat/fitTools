export const PACE_OF_AGING_SLUG = "pace-of-aging-index";

export const POA_LIMITS = {
  waistCm: { min: 40, max: 200 },
  heightCm: { min: 120, max: 250 },
  mvpaMinPerWeek: { min: 0, max: 2000 },
  sleepHours: { min: 3, max: 14 },
  restingHr: { min: 30, max: 120 },
  alcoholUnitsPerWeek: { min: 0, max: 100 },
  vo2max: { min: 15, max: 90 },
  gripKg: { min: 5, max: 100 },
  hrvMs: { min: 5, max: 200 },
} as const;

export const POA_DEFAULTS = {
  sex: "male",
  waistCm: 85,
  heightCm: 175,
  mvpaMinPerWeek: 200,
  sleepHours: 7.5,
  restingHr: 60,
  currentSmoker: false,
  alcoholUnitsPerWeek: 6,
} as const;
