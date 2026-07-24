/**
 * Central-adiposity ratios (SPEC §7 extension, 2026-07-23). Pure
 * functions, SI units (cm). Round at display time.
 *
 * - Waist-to-height ratio bands follow the Ashwell boundary evidence:
 *   0.5 as the global "take action" boundary (Browning, Hsieh & Ashwell
 *   2010, Nutr Res Rev 23:247–269), with 0.4 and 0.6 as the conventional
 *   chart edges below/above.
 * - Waist-to-hip ratio cut-offs are the WHO expert-consultation values:
 *   substantially increased metabolic risk at ≥ 0.90 (men) / ≥ 0.85
 *   (women) (WHO 2008 report).
 */

import type { Sex } from "@/lib/formulas/energy";

export function waistToHeightRatio(waistCm: number, heightCm: number): number {
  if (heightCm <= 0) throw new RangeError("Height must be positive");
  return waistCm / heightCm;
}

export type WhtrBand = "low" | "healthy" | "increased" | "high";

/** Band boundaries 0.4 / 0.5 / 0.6 (Ashwell chart; 0.5 = boundary value). */
export function whtrBand(ratio: number): WhtrBand {
  if (ratio < 0.4) return "low";
  if (ratio < 0.5) return "healthy";
  if (ratio < 0.6) return "increased";
  return "high";
}

export function waistToHipRatio(waistCm: number, hipCm: number): number {
  if (hipCm <= 0) throw new RangeError("Hip circumference must be positive");
  return waistCm / hipCm;
}

export type WhrBand = "lower" | "raised";

/** WHO 2008 cut-offs: ≥ 0.90 men / ≥ 0.85 women = substantially increased risk. */
export function whrBand(ratio: number, sex: Sex): WhrBand {
  const cutoff = sex === "male" ? 0.9 : 0.85;
  return ratio >= cutoff ? "raised" : "lower";
}
