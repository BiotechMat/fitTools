export const WHR_SLUG = "waist-to-hip-ratio-calculator";

export const WHR_LIMITS = {
  waistCm: { min: 40, max: 200 },
  hipCm: { min: 50, max: 220 },
} as const;

export const WHR_DEFAULTS = {
  sex: "male",
  waistCm: 85,
  hipCm: 98,
} as const;
