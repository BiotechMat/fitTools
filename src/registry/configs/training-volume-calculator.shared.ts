export const VOLUME_SLUG = "training-volume-calculator";

export const VOLUME_LIMITS = {
  sets: { min: 0, max: 20 },
  reps: { min: 1, max: 50 },
  loadKg: { min: 0, max: 500 },
} as const;

export const VOLUME_DEFAULTS = {
  sets: 3,
  reps: 8,
  loadKg: 100,
} as const;

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
] as const;
