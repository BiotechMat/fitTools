import type { Food } from "@/registry/food-reference";

/**
 * Plate builder totals (MICROTOOLS.md §5) — pure portion maths over the
 * food registry. kcal and protein only: that's what the registry records,
 * and we don't invent a carb/fat split.
 */

export interface PlateItem {
  food: Food;
  /** Portion multiplier: 0.5, 1, 1.5, 2 … */
  portions: number;
}

export interface PlateTotals {
  kcal: number;
  proteinG: number;
  totalGrams: number;
}

export function itemGrams(item: PlateItem): number {
  return item.food.portion.grams * item.portions;
}

export function plateTotals(items: PlateItem[]): PlateTotals {
  let kcal = 0;
  let proteinG = 0;
  let totalGrams = 0;
  for (const item of items) {
    const grams = itemGrams(item);
    totalGrams += grams;
    kcal += (item.food.kcalPer100g * grams) / 100;
    proteinG += (item.food.proteinPer100g * grams) / 100;
  }
  return {
    kcal: Math.round(kcal),
    proteinG: Math.round(proteinG),
    totalGrams: Math.round(totalGrams),
  };
}
