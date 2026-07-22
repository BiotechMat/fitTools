export const DOTS_SLUG = "dots-calculator";

export const DOTS_LIMITS = {
  bodyweightKg: { min: 35, max: 210 },
  totalKg: { min: 1, max: 1500 },
} as const;

export const DOTS_DEFAULTS = {
  sex: "male",
  bodyweightKg: 93,
  totalKg: 700,
  event: "sbd",
  equipment: "raw",
} as const;
