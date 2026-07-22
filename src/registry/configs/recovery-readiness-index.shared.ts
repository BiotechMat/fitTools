export const RECOVERY_READINESS_SLUG = "recovery-readiness-index";

export const RR_LIMITS = {
  hrvMs: { min: 5, max: 250 },
  restingHr: { min: 30, max: 120 },
  sleepHours: { min: 0, max: 14 },
  respRate: { min: 6, max: 30 },
} as const;

export const RR_DEFAULTS = {
  hrvMs: 58,
  hrvBaselineMs: 60,
  restingHr: 56,
  restingHrBaseline: 55,
  sleepHours: 7.5,
  sleepNeedHours: 8,
  respRate: 14,
  respRateBaseline: 14,
} as const;
