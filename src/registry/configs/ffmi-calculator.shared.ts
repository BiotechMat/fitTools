export const FFMI_SLUG = "ffmi-calculator";

export const FFMI_LIMITS = {
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  bodyFatPercent: { min: 5, max: 60 },
} as const;

export const FFMI_DEFAULTS = {
  weightKg: 80,
  heightCm: 180,
  bodyFatPercent: 15,
} as const;
