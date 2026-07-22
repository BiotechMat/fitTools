import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { MACRO_DEFAULTS, MACRO_LIMITS, MACRO_SLUG } from "@/registry/configs/macro-calculator.shared";

const limit = (range: { min: number; max: number }) =>
  z.number().min(range.min).max(range.max);

export const macroInputsSchema = z.object({
  kcalTarget: limit(MACRO_LIMITS.kcalTarget),
  weightKg: limit(MACRO_LIMITS.weightKg),
  proteinGPerKg: limit(MACRO_LIMITS.proteinGPerKg),
  fatPercent: limit(MACRO_LIMITS.fatPercent),
});

export const macroConfig: ToolConfig = {
  slug: MACRO_SLUG,
  title: "Macro Calculator — Protein, Fat & Carb Targets",
  valueLine:
    "Split your daily calories into protein, fat and carbohydrate targets built on published intake ranges.",
  metaDescription:
    "Free macro calculator: set protein by bodyweight (1.6–2.2 g/kg, per Morton et al. 2018), choose a fat percentage, and get gram and calorie targets for each macro.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: macroInputsSchema,
  defaults: { ...MACRO_DEFAULTS },
  faq: [
    {
      q: "How much protein should I eat to build muscle?",
      a: "A 2018 systematic review of 49 trials found that benefits for muscle growth plateau around 1.6 g of protein per kilogram of bodyweight per day, with roughly 2.2 g/kg as a sensible upper bound during a diet. This calculator defaults to 1.8 g/kg, in the middle of that evidence-based range.",
    },
    {
      q: "How is the calorie split calculated?",
      a: "Protein is set first from your bodyweight, fat is set as a percentage of your calorie target (20–35%), and carbohydrate fills the remaining calories. Grams are converted using the standard Atwater factors: 4 kcal per gram for protein and carbohydrate, 9 kcal per gram for fat.",
    },
    {
      q: "Why do my macros not add up to my calorie target elsewhere?",
      a: "Different calculators use different protein rules and rounding. This tool keeps the arithmetic exact until display, so protein, fat and carbohydrate calories always sum to your target when the split is feasible.",
    },
    {
      q: "Do I need to hit these numbers exactly?",
      a: "No. Macro targets are planning aids, not prescriptions. Staying within roughly 5–10 g of each target day to day is more than accurate enough for body-composition goals.",
    },
    {
      q: "What calorie target should I use?",
      a: "Start from your estimated maintenance calories — our TDEE calculator will give you that — then adjust down for fat loss or up for muscle gain before splitting into macros.",
    },
  ],
  related: ["tdee-calculator", "calorie-deficit-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label:
        "Morton RW, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength. Br J Sports Med 2018;52:376–384",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
    {
      label:
        "Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2005) — fat AMDR 20–35% of energy",
      url: "https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids",
    },
  ],
};
