/**
 * Caffeine half-life (SPEC §7): C(t) = dose × 0.5^(t / t½). Default t½ is
 * 5 h with a user range of 1.5–9.5 h reflecting the wide individual
 * variation in caffeine metabolism.
 */

export const DEFAULT_HALF_LIFE_H = 5;
export const HALF_LIFE_RANGE_H = { min: 1.5, max: 9.5 };

export function caffeineRemaining(
  doseMg: number,
  hoursElapsed: number,
  halfLifeH: number,
): number {
  return doseMg * 0.5 ** (hoursElapsed / halfLifeH);
}

/** Hours until the remaining amount falls to the threshold (0 if already below). */
export function hoursToThreshold(
  doseMg: number,
  thresholdMg: number,
  halfLifeH: number,
): number {
  if (doseMg <= thresholdMg) return 0;
  return halfLifeH * Math.log2(doseMg / thresholdMg);
}
