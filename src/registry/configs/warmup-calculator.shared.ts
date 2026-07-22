export const WARMUP_SLUG = "warmup-calculator";

export const WARMUP_LIMITS = {
  workSetKg: { min: 20, max: 500 },
} as const;

export const WARMUP_DEFAULTS = {
  workSetKg: 100,
  barKg: 20,
} as const;
