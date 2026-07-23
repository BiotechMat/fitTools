export const JUMP_SLUG = "vertical-jump-calculator";

export const JUMP_LIMITS = {
  jumpCm: { min: 10, max: 130 },
  massKg: { min: 30, max: 200 },
} as const;

export const JUMP_DEFAULTS = {
  jumpCm: 45,
  massKg: 80,
} as const;
