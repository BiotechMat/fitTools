export const CGM_SLUG = "cgm-metrics-calculator";

export const CGM_LIMITS = {
  /** Plausible glucose reading range, mmol/L (≈36–540 mg/dL). */
  glucoseMmol: { min: 2, max: 30 },
  minReadings: 2,
  maxReadings: 20000,
} as const;

export type CgmUnit = "mmol" | "mgdl";
