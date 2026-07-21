/**
 * Heart-rate zones (SPEC §7). HRmax via Tanaka et al. 2001 (208 − 0.7·age);
 * 220 − age retained only as the legacy comparison. With a resting HR the
 * zones use the Karvonen heart-rate-reserve method:
 * THR = (HRmax − RHR) × intensity + RHR. Five zones, 50–100% in 10% steps.
 */

export function hrMaxTanaka(ageYears: number): number {
  return 208 - 0.7 * ageYears;
}

export function hrMaxLegacy(ageYears: number): number {
  return 220 - ageYears;
}

export function karvonenTargetHr(
  hrMax: number,
  restingHr: number,
  intensity: number,
): number {
  return (hrMax - restingHr) * intensity + restingHr;
}

export interface HrZone {
  zone: 1 | 2 | 3 | 4 | 5;
  /** Lower bound of the intensity band (fraction of HRmax or HRR). */
  lowerIntensity: number;
  upperIntensity: number;
  lowerBpm: number;
  upperBpm: number;
}

const ZONE_BOUNDS: [number, number][] = [
  [0.5, 0.6],
  [0.6, 0.7],
  [0.7, 0.8],
  [0.8, 0.9],
  [0.9, 1.0],
];

/**
 * Five-zone table. With restingHr, bounds use Karvonen (heart-rate
 * reserve); without, plain %HRmax.
 */
export function hrZones(hrMax: number, restingHr?: number): HrZone[] {
  const toBpm =
    restingHr === undefined
      ? (intensity: number) => hrMax * intensity
      : (intensity: number) => karvonenTargetHr(hrMax, restingHr, intensity);
  return ZONE_BOUNDS.map(([lower, upper], i) => ({
    // Cast justification: `i` ranges over the five ZONE_BOUNDS entries, so
    // i + 1 is always 1–5; TypeScript can't narrow arithmetic to the union.
    zone: (i + 1) as HrZone["zone"],
    lowerIntensity: lower,
    upperIntensity: upper,
    lowerBpm: toBpm(lower),
    upperBpm: toBpm(upper),
  }));
}
