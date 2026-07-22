/**
 * Running pace arithmetic and Riegel race prediction (SPEC §7):
 * T₂ = T₁ × (D₂/D₁)^1.06 (Riegel PS, American Scientist 1981). The
 * exponent assumes comparable training for both distances.
 */

export const RIEGEL_EXPONENT = 1.06;

export function paceSecPerKm(distanceM: number, totalSeconds: number): number {
  return totalSeconds / (distanceM / 1000);
}

export function timeForDistance(paceSecondsPerKm: number, distanceM: number): number {
  return paceSecondsPerKm * (distanceM / 1000);
}

export interface Split {
  distanceM: number;
  cumulativeSeconds: number;
}

/** Even-pace cumulative splits every `splitEveryM`, ending at the full distance. */
export function splitTimes(
  distanceM: number,
  totalSeconds: number,
  splitEveryM: number,
): Split[] {
  const splits: Split[] = [];
  for (let d = splitEveryM; d < distanceM; d += splitEveryM) {
    splits.push({
      distanceM: d,
      cumulativeSeconds: (totalSeconds * d) / distanceM,
    });
  }
  splits.push({ distanceM, cumulativeSeconds: totalSeconds });
  return splits;
}

export function riegelPredict(
  knownSeconds: number,
  knownDistanceM: number,
  targetDistanceM: number,
): number {
  return knownSeconds * (targetDistanceM / knownDistanceM) ** RIEGEL_EXPONENT;
}
