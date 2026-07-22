export const PACE_SLUG = "running-pace-calculator";

export const PACE_LIMITS = {
  distanceM: { min: 400, max: 100000 },
  totalSeconds: { min: 60, max: 86400 },
} as const;

export const PACE_DEFAULTS = {
  distanceM: 10000,
  totalSeconds: 3000,
} as const;

export const COMMON_DISTANCES = [
  { label: "5 km", meters: 5000 },
  { label: "10 km", meters: 10000 },
  { label: "Half marathon", meters: 21097.5 },
  { label: "Marathon", meters: 42195 },
] as const;
