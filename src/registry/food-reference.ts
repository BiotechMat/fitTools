/**
 * Nutrition / food reference (CONTENT-reference.md §5). A shared foods dataset
 * drives several bookmarkable table pages (protein content, calories, portions,
 * high-protein lists by diet) so the numbers stay consistent across views and
 * link into the macro/protein/TDEE calculators (§8).
 *
 * Values are approximate per-100g reference figures (rounded, mixed raw/cooked
 * as typically eaten) drawn from public food-composition data (USDA FoodData
 * Central). They are for general guidance, not precise dietary calculation.
 */

import type { FaqEntry } from "@/registry/types";

/** Most restrictive diet that can eat the food (vegan = everyone can). */
export type DietType = "vegan" | "vegetarian" | "omnivore";

export type FoodCategory =
  | "Meat & fish"
  | "Dairy & eggs"
  | "Legumes & pulses"
  | "Grains"
  | "Nuts & seeds"
  | "Vegetables & fruit";

export interface Food {
  name: string;
  category: FoodCategory;
  suitableFor: DietType;
  /** Grams of protein per 100 g. */
  proteinPer100g: number;
  /** Kilocalories per 100 g. */
  kcalPer100g: number;
  /** A typical serving, for the portion-size view. */
  portion: { label: string; grams: number };
}

export const FOOD_REFERENCE_LAST_REVIEWED = "2026-07-22";

export const foods: Food[] = [
  // Meat & fish (omnivore)
  { name: "Chicken breast (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 31, kcalPer100g: 165, portion: { label: "1 breast", grams: 120 } },
  { name: "Turkey breast (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 29, kcalPer100g: 135, portion: { label: "1 serving", grams: 120 } },
  { name: "Lean beef mince, 5% (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 26, kcalPer100g: 170, portion: { label: "1 serving", grams: 125 } },
  { name: "Salmon (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 25, kcalPer100g: 208, portion: { label: "1 fillet", grams: 130 } },
  { name: "Tuna, canned in water", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 26, kcalPer100g: 116, portion: { label: "1 small tin", grams: 100 } },
  { name: "Cod (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 23, kcalPer100g: 105, portion: { label: "1 fillet", grams: 140 } },
  { name: "Prawns (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 24, kcalPer100g: 99, portion: { label: "1 serving", grams: 100 } },
  { name: "Pork loin (cooked)", category: "Meat & fish", suitableFor: "omnivore", proteinPer100g: 27, kcalPer100g: 145, portion: { label: "1 chop", grams: 120 } },

  // Dairy & eggs (vegetarian)
  { name: "Egg (whole)", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 13, kcalPer100g: 155, portion: { label: "1 large egg", grams: 50 } },
  { name: "Greek yoghurt (low-fat)", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 10, kcalPer100g: 59, portion: { label: "1 pot", grams: 170 } },
  { name: "Cottage cheese", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 11, kcalPer100g: 98, portion: { label: "1 serving", grams: 100 } },
  { name: "Cheddar cheese", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 25, kcalPer100g: 402, portion: { label: "1 matchbox", grams: 30 } },
  { name: "Whole milk", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 3.4, kcalPer100g: 61, portion: { label: "1 glass", grams: 200 } },
  { name: "Skimmed milk", category: "Dairy & eggs", suitableFor: "vegetarian", proteinPer100g: 3.6, kcalPer100g: 35, portion: { label: "1 glass", grams: 200 } },

  // Legumes & pulses (vegan)
  { name: "Lentils (cooked)", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 9, kcalPer100g: 116, portion: { label: "1 serving", grams: 150 } },
  { name: "Chickpeas (cooked)", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 9, kcalPer100g: 164, portion: { label: "1 serving", grams: 150 } },
  { name: "Black beans (cooked)", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 9, kcalPer100g: 132, portion: { label: "1 serving", grams: 150 } },
  { name: "Kidney beans (cooked)", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 9, kcalPer100g: 127, portion: { label: "1 serving", grams: 150 } },
  { name: "Firm tofu", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 12, kcalPer100g: 120, portion: { label: "1/2 block", grams: 150 } },
  { name: "Tempeh", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 19, kcalPer100g: 192, portion: { label: "1 serving", grams: 100 } },
  { name: "Edamame", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 11, kcalPer100g: 121, portion: { label: "1 serving", grams: 100 } },
  { name: "Baked beans", category: "Legumes & pulses", suitableFor: "vegan", proteinPer100g: 5, kcalPer100g: 94, portion: { label: "1/2 tin", grams: 200 } },

  // Grains (vegan)
  { name: "Oats (dry)", category: "Grains", suitableFor: "vegan", proteinPer100g: 13, kcalPer100g: 379, portion: { label: "1 serving", grams: 50 } },
  { name: "Quinoa (cooked)", category: "Grains", suitableFor: "vegan", proteinPer100g: 4.4, kcalPer100g: 120, portion: { label: "1 serving", grams: 150 } },
  { name: "Brown rice (cooked)", category: "Grains", suitableFor: "vegan", proteinPer100g: 2.6, kcalPer100g: 112, portion: { label: "1 serving", grams: 150 } },
  { name: "Wholemeal bread", category: "Grains", suitableFor: "vegan", proteinPer100g: 9, kcalPer100g: 247, portion: { label: "1 slice", grams: 40 } },
  { name: "Pasta (cooked)", category: "Grains", suitableFor: "vegan", proteinPer100g: 5, kcalPer100g: 131, portion: { label: "1 serving", grams: 180 } },

  // Nuts & seeds (vegan)
  { name: "Peanut butter", category: "Nuts & seeds", suitableFor: "vegan", proteinPer100g: 25, kcalPer100g: 588, portion: { label: "1 tbsp", grams: 16 } },
  { name: "Almonds", category: "Nuts & seeds", suitableFor: "vegan", proteinPer100g: 21, kcalPer100g: 579, portion: { label: "1 handful", grams: 28 } },
  { name: "Peanuts", category: "Nuts & seeds", suitableFor: "vegan", proteinPer100g: 26, kcalPer100g: 567, portion: { label: "1 handful", grams: 28 } },
  { name: "Pumpkin seeds", category: "Nuts & seeds", suitableFor: "vegan", proteinPer100g: 30, kcalPer100g: 559, portion: { label: "1 handful", grams: 28 } },
  { name: "Chia seeds", category: "Nuts & seeds", suitableFor: "vegan", proteinPer100g: 17, kcalPer100g: 486, portion: { label: "1 tbsp", grams: 12 } },

  // Vegetables & fruit (vegan)
  { name: "Broccoli", category: "Vegetables & fruit", suitableFor: "vegan", proteinPer100g: 2.8, kcalPer100g: 34, portion: { label: "1 serving", grams: 90 } },
  { name: "Spinach", category: "Vegetables & fruit", suitableFor: "vegan", proteinPer100g: 2.9, kcalPer100g: 23, portion: { label: "1 handful", grams: 30 } },
  { name: "Potato (boiled)", category: "Vegetables & fruit", suitableFor: "vegan", proteinPer100g: 2, kcalPer100g: 77, portion: { label: "1 medium", grams: 150 } },
  { name: "Banana", category: "Vegetables & fruit", suitableFor: "vegan", proteinPer100g: 1.1, kcalPer100g: 89, portion: { label: "1 medium", grams: 120 } },
  { name: "Avocado", category: "Vegetables & fruit", suitableFor: "vegan", proteinPer100g: 2, kcalPer100g: 160, portion: { label: "1/2 avocado", grams: 100 } },
];

/** Which food views exist as their own reference pages. */
export type FoodView = "protein" | "calorie" | "portion" | "high-protein";

export interface FoodReferencePage {
  slug: string;
  title: string;
  short: string;
  intro: string;
  view: FoodView;
  relatedTools: string[];
  faq: FaqEntry[];
}

export const foodReferencePages: FoodReferencePage[] = [
  {
    slug: "protein-content-of-foods",
    title: "Protein Content of Common Foods",
    short: "How much protein is in everyday foods, per 100 g, ranked highest first.",
    intro:
      "A quick-reference table of the protein in common foods, per 100 g, ranked from highest. Use it to build meals that hit your protein target, then work out that target with the calculators below.",
    view: "protein",
    relatedTools: ["macro-calculator", "tdee-calculator"],
    faq: [
      {
        q: "How much protein do I need a day?",
        a: "For people training for muscle, roughly 1.6 to 2.2 g per kg of bodyweight per day is well supported. Work out your figure with the macro calculator; total daily intake matters more than any single food.",
      },
      {
        q: "Are these values exact?",
        a: "No, they are rounded, approximate per-100 g reference figures from public food-composition data. Real foods vary by cut, brand and cooking, so treat them as a guide.",
      },
    ],
  },
  {
    slug: "high-protein-foods",
    title: "High-Protein Foods by Diet",
    short: "The best protein sources for omnivore, vegetarian and vegan diets.",
    intro:
      "The highest-protein foods from this dataset, grouped by the diet that can eat them. Vegan sources suit everyone; vegetarian adds dairy and eggs; the omnivore list adds meat and fish.",
    view: "high-protein",
    relatedTools: ["macro-calculator"],
    faq: [
      {
        q: "Can you get enough protein on a vegan diet?",
        a: "Yes. Tofu, tempeh, edamame, lentils, beans and seeds are all solid sources; the main difference is that plant proteins are often slightly less complete, so eating a variety across the day covers the bases.",
      },
      {
        q: "What's the most protein-dense choice?",
        a: "Per calorie, lean meats, fish, egg whites and low-fat dairy top the list; among plants, tofu, tempeh and seitan (wheat protein) are the densest. Nuts and seeds are protein-rich but calorie-dense.",
      },
    ],
  },
  {
    slug: "calorie-reference",
    title: "Calorie Reference for Common Foods",
    short: "Calories per 100 g of common foods, grouped by food type.",
    intro:
      "Calories per 100 g for common foods, grouped by type, with protein alongside. Handy for sanity-checking a meal against the daily energy target from your TDEE.",
    view: "calorie",
    relatedTools: ["tdee-calculator", "calorie-deficit-calculator"],
    faq: [
      {
        q: "How many calories should I eat?",
        a: "That depends on your goal and your total daily energy expenditure (TDEE). Estimate yours with the TDEE calculator, then eat below it to lose fat or above it to gain.",
      },
    ],
  },
  {
    slug: "portion-sizes",
    title: "Common Portion Sizes",
    short: "Typical serving sizes and the protein and calories they provide.",
    intro:
      "What a normal portion of each food actually looks like, and the protein and calories it delivers, a more realistic view than per-100 g figures for planning meals.",
    view: "portion",
    relatedTools: ["macro-calculator", "tdee-calculator"],
    faq: [
      {
        q: "Why use portions instead of per 100 g?",
        a: "Per-100 g figures are great for comparing foods, but you eat portions. Seeing the protein and calories in a realistic serving makes it easier to plan a day's meals.",
      },
    ],
  },
];

export const foodPagesBySlug: ReadonlyMap<string, FoodReferencePage> = new Map(
  foodReferencePages.map((p) => [p.slug, p]),
);

export function getFoodReferencePage(slug: string): FoodReferencePage | undefined {
  return foodPagesBySlug.get(slug);
}

const DIET_RANK: Record<DietType, number> = { vegan: 0, vegetarian: 1, omnivore: 2 };

/** Foods a given diet can eat (vegan can eat vegan; omnivore can eat all). */
export function foodsForDiet(diet: DietType): Food[] {
  return foods.filter((f) => DIET_RANK[f.suitableFor] <= DIET_RANK[diet]);
}

export function foodsByProtein(): Food[] {
  return [...foods].sort((a, b) => b.proteinPer100g - a.proteinPer100g);
}
