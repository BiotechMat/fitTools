import { describe, expect, it } from "vitest";
import {
  foods,
  foodReferencePages,
  foodsForDiet,
  foodsByProtein,
  getFoodReferencePage,
} from "@/registry/food-reference";
import { getTool } from "@/registry/tools";

/**
 * Food-reference registry invariants (CONTENT-reference.md §5, §8). The shared
 * foods dataset must be sane and every reference page must cross-link to a real
 * calculator.
 */

describe("food dataset", () => {
  it("every food has positive, plausible per-100g values and a portion", () => {
    for (const f of foods) {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.proteinPer100g).toBeGreaterThanOrEqual(0);
      // No food exceeds ~90 g protein per 100 g.
      expect(f.proteinPer100g).toBeLessThan(90);
      expect(f.kcalPer100g).toBeGreaterThan(0);
      expect(f.kcalPer100g).toBeLessThan(950);
      expect(f.portion.grams).toBeGreaterThan(0);
    }
  });

  it("foodsByProtein is sorted high-to-low", () => {
    const sorted = foodsByProtein();
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1].proteinPer100g).toBeGreaterThanOrEqual(sorted[i].proteinPer100g);
    }
  });

  it("diet filtering nests correctly (vegan ⊆ vegetarian ⊆ omnivore)", () => {
    const vegan = foodsForDiet("vegan").length;
    const vegetarian = foodsForDiet("vegetarian").length;
    const omnivore = foodsForDiet("omnivore").length;
    expect(vegan).toBeLessThanOrEqual(vegetarian);
    expect(vegetarian).toBeLessThanOrEqual(omnivore);
    expect(omnivore).toBe(foods.length);
    // vegan list contains no meat/fish or dairy/egg foods
    expect(foodsForDiet("vegan").every((f) => f.suitableFor === "vegan")).toBe(true);
  });
});

describe("food reference pages", () => {
  it("has unique slugs and non-empty copy", () => {
    const slugs = foodReferencePages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of foodReferencePages) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.intro.length).toBeGreaterThan(0);
    }
  });

  it("every related-tool slug resolves to a registered tool", () => {
    for (const p of foodReferencePages) {
      for (const slug of p.relatedTools) {
        expect(getTool(slug), `${p.slug} → unknown tool ${slug}`).toBeDefined();
      }
    }
  });

  it("is resolvable by slug", () => {
    for (const p of foodReferencePages) {
      expect(getFoodReferencePage(p.slug)).toBe(p);
    }
  });
});
