/**
 * Unit conversions (SPEC §4, §6).
 *
 * Canonical internal units are SI (kg, cm). Conversion happens only at the
 * display/input layer. Factors are the exact international yard-and-pound
 * definitions: 1 lb = 0.45359237 kg and 1 in = 2.54 cm.
 */

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;
export const LB_PER_STONE = 14;
export const INCHES_PER_FOOT = 12;

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function stonesLbToKg(stones: number, pounds: number): number {
  return lbToKg(stones * LB_PER_STONE + pounds);
}

export function kgToStonesLb(kg: number): { stones: number; pounds: number } {
  const totalLb = kgToLb(kg);
  const stones = Math.floor(totalLb / LB_PER_STONE);
  return { stones, pounds: totalLb - stones * LB_PER_STONE };
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return inchesToCm(feet * INCHES_PER_FOOT + inches);
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cmToInches(cm);
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = totalInches - feet * INCHES_PER_FOOT;
  // Float error can leave inches at 11.9999…; carry so we never show 5 ft 12 in.
  if (INCHES_PER_FOOT - inches < 1e-9) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}
