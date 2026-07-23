import { describe, expect, it } from "vitest";
import { foods } from "@/registry/food-reference";
import { itemGrams, plateTotals } from "@/lib/tools/plate";

const chicken = foods.find((f) => f.name.startsWith("Chicken breast"));

describe("plate totals (MICROTOOLS.md §5)", () => {
  it("computes a hand-checked portion from the registry", () => {
    // Chicken breast: 31 g protein / 165 kcal per 100 g, 120 g portion.
    expect(chicken).toBeDefined();
    if (!chicken) return;
    const totals = plateTotals([{ food: chicken, portions: 1 }]);
    expect(totals.totalGrams).toBe(120);
    expect(totals.proteinG).toBe(Math.round((31 * 120) / 100));
    expect(totals.kcal).toBe(Math.round((165 * 120) / 100));
  });

  it("scales with portion multipliers and sums items", () => {
    if (!chicken) return;
    expect(itemGrams({ food: chicken, portions: 2 })).toBe(240);
    const double = plateTotals([{ food: chicken, portions: 2 }]);
    const single = plateTotals([{ food: chicken, portions: 1 }]);
    expect(double.totalGrams).toBe(single.totalGrams * 2);
    const empty = plateTotals([]);
    expect(empty).toEqual({ kcal: 0, proteinG: 0, totalGrams: 0 });
  });
});
