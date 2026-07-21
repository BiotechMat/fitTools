import type { Sex } from "@/lib/formulas/energy";

/**
 * US Navy circumference method (SPEC §7), cm inputs, log10. Source:
 * Hodgdon & Beckett 1984 (Naval Health Research Center). The UI presents a
 * ±3–4 percentage-point error band.
 */

export interface NavyBodyFatInput {
  sex: Sex;
  waistCm: number;
  neckCm: number;
  heightCm: number;
  /** Required for women; unused for men. */
  hipCm?: number;
}

export function navyBodyFatPercent({
  sex,
  waistCm,
  neckCm,
  heightCm,
  hipCm,
}: NavyBodyFatInput): number {
  if (heightCm <= 0) {
    throw new RangeError("Height must be positive");
  }
  if (sex === "male") {
    const girth = waistCm - neckCm;
    if (girth <= 0) {
      throw new RangeError("Waist must be larger than neck circumference");
    }
    return (
      495 /
        (1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(heightCm)) -
      450
    );
  }
  if (hipCm === undefined) {
    throw new RangeError("Hip circumference is required for women");
  }
  const girth = waistCm + hipCm - neckCm;
  if (girth <= 0) {
    throw new RangeError("Waist + hip must be larger than neck circumference");
  }
  return (
    495 /
      (1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(heightCm)) -
    450
  );
}
