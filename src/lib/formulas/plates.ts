/**
 * Barbell plate loading (SPEC §7). Inventory counts are plates available
 * PER SIDE. When the exact per-side load is impossible, the plan resolves
 * to the nearest achievable total (ties go to the lower weight). A plain
 * greedy pass can miss achievable sums with sparse racks (e.g. 15 + 15
 * when a 20 blocks it), so achievable sums are enumerated exactly over the
 * bounded inventory — racks are small, so this stays trivial.
 */

export interface PlateStock {
  plateKg: number;
  perSide: number;
}

export interface PlatePlan {
  /** Heaviest-first plate list for one side of the bar. */
  perSide: number[];
  achievedKg: number;
  exact: boolean;
}

/** Scale kg to integer grams to keep map keys exact. */
const toGrams = (kg: number) => Math.round(kg * 1000);

export function planPlateLoad(
  targetKg: number,
  barKg: number,
  inventory: PlateStock[],
): PlatePlan {
  const perSideTargetG = Math.max(0, toGrams((targetKg - barKg) / 2));

  // Map achievable per-side sum (g) → composition. Among compositions for
  // the same sum, prefer the lexicographically heaviest descending stack —
  // exactly what heaviest-first greedy loads whenever greedy can reach the
  // sum (e.g. 40 kg/side → 25 + 15, never 20 + 20).
  const heavierStack = (a: number[], b: number[]): boolean => {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) return av > bv;
    }
    return false;
  };

  const sorted = [...inventory].sort((a, b) => b.plateKg - a.plateKg);
  let sums = new Map<number, number[]>([[0, []]]);
  for (const { plateKg, perSide } of sorted) {
    const plateG = toGrams(plateKg);
    const next = new Map(sums);
    for (const [sum, stack] of sums) {
      for (let count = 1; count <= perSide; count++) {
        const candidate = sum + plateG * count;
        const candidateStack = [...stack, ...Array<number>(count).fill(plateKg)];
        const existing = next.get(candidate);
        if (!existing || heavierStack(candidateStack, existing)) {
          next.set(candidate, candidateStack);
        }
      }
    }
    sums = next;
  }

  let bestSum = 0;
  for (const sum of sums.keys()) {
    const better =
      Math.abs(sum - perSideTargetG) < Math.abs(bestSum - perSideTargetG) ||
      (Math.abs(sum - perSideTargetG) === Math.abs(bestSum - perSideTargetG) &&
        sum < bestSum);
    if (better) bestSum = sum;
  }

  const perSide = sums.get(bestSum) ?? [];
  const achievedKg = barKg + (2 * bestSum) / 1000;
  return {
    perSide,
    achievedKg,
    exact: toGrams(achievedKg) === toGrams(targetKg),
  };
}
