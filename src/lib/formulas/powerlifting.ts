import type { Sex } from "@/lib/formulas/energy";
import coefficients from "@/data/powerlifting-coefficients.json";

/**
 * Powerlifting scores (SPEC §7). Coefficients pulled verbatim from the
 * OpenPowerlifting codebase into src/data/powerlifting-coefficients.json
 * (source URLs recorded there); DOTS is regression-tested against OPL's
 * own computed scores for 11 known lifter entries.
 */

export type GlEvent = "sbd" | "bench";
export type GlEquipment = "raw" | "equipped";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** DOTS: total × 500 / (a·bw⁴ + b·bw³ + c·bw² + d·bw + e), bw clamped. */
export function dotsScore(sex: Sex, bodyweightKg: number, totalKg: number): number {
  const { a, b, c, d, e, minBw, maxBw } = coefficients.dots[sex];
  const bw = clamp(bodyweightKg, minBw, maxBw);
  const denominator = a * bw ** 4 + b * bw ** 3 + c * bw ** 2 + d * bw + e;
  return (totalKg * 500) / denominator;
}

/** Original Wilks: total × 500 / (a + b·bw + c·bw² + d·bw³ + e·bw⁴ + f·bw⁵). */
export function wilksScore(sex: Sex, bodyweightKg: number, totalKg: number): number {
  const { a, b, c, d, e, f, minBw, maxBw } = coefficients.wilks[sex];
  const bw = clamp(bodyweightKg, minBw, maxBw);
  const denominator =
    a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5;
  return (totalKg * 500) / denominator;
}

/** IPF GL points: total × 100 / (A − B·e^(−C·bw)); 0 below the 35 kg floor. */
export function ipfGlScore(
  sex: Sex,
  bodyweightKg: number,
  totalKg: number,
  event: GlEvent,
  equipment: GlEquipment,
): number {
  if (bodyweightKg < coefficients.ipfGl.minBw || totalKg <= 0) return 0;
  const { a, b, c } = coefficients.ipfGl[event][equipment][sex];
  const denominator = a - b * Math.exp(-c * bodyweightKg);
  if (denominator <= 0) return 0;
  return Math.max(0, (totalKg * 100) / denominator);
}
