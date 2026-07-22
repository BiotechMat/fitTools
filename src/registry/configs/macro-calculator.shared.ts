/** Client-safe constants for the macro calculator (no Zod here — SPEC §13 budget). */

export const MACRO_SLUG = "macro-calculator";

export const MACRO_LIMITS = {
  kcalTarget: { min: 1000, max: 10000 },
  weightKg: { min: 30, max: 300 },
  proteinGPerKg: { min: 1.6, max: 2.2 },
  fatPercent: { min: 20, max: 35 },
} as const;

export const MACRO_DEFAULTS = {
  kcalTarget: 2500,
  weightKg: 80,
  proteinGPerKg: 1.8,
  fatPercent: 25,
} as const;
