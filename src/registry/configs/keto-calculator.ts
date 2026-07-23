import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  KETO_DEFAULTS,
  KETO_LIMITS,
  KETO_SLUG,
} from "@/registry/configs/keto-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const ketoInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  ageYears: limit(KETO_LIMITS.ageYears),
  weightKg: limit(KETO_LIMITS.weightKg),
  heightCm: limit(KETO_LIMITS.heightCm),
  activity: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  netCarbsG: limit(KETO_LIMITS.netCarbsG),
  proteinGPerKg: limit(KETO_LIMITS.proteinGPerKg),
});

export const ketoConfig: ToolConfig = {
  slug: KETO_SLUG,
  title: "Keto Macro Calculator",
  valueLine:
    "Ketogenic macros without the mysticism: energy from Mifflin–St Jeor, carbs capped, protein evidence-based, fat fills the rest.",
  metaDescription:
    "Free keto macro calculator: calories from the Mifflin–St Jeor equation and your activity level, net carbs capped at 20–50 g, protein from the evidence-based g/kg range, fat as the remainder.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: ketoInputsSchema,
  defaults: { ...KETO_DEFAULTS },
  faq: [
    {
      q: "How many carbs on a keto diet?",
      a: "Ketogenic diets are conventionally defined by restricting carbohydrate to roughly 20–50 g of net carbs per day — low enough that most people shift towards fat and ketone metabolism. This calculator lets you set the cap anywhere in that range.",
    },
    {
      q: "How is protein set on keto?",
      a: "The same way as on any diet: from body weight using the evidence-based range of about 1.6–2.2 g/kg for people who train. Very-low-protein versions of keto are unnecessary for ketosis and cost you muscle.",
    },
    {
      q: "Why does fat get whatever calories remain?",
      a: "Because carbs are fixed in grams and protein is set by body weight, fat is the adjustable energy lever — it fills the gap between those two and your calorie target. That's the arithmetic of the diet, not a claim that fat is magic.",
    },
    {
      q: "Is keto better for fat loss?",
      a: "The ISSN's review of diet types concludes that widely different approaches — low-fat through ketogenic — produce similar body-composition results when calories and protein are matched. Choose it for adherence and preference, not metabolic magic.",
    },
    {
      q: "What are net carbs?",
      a: "Total carbohydrate minus fibre. Fibre isn't absorbed as glucose, so keto carb caps are usually counted as net carbs — that's the number this calculator asks for.",
    },
  ],
  related: ["macro-calculator", "tdee-calculator", "calorie-deficit-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr 1990;51:241–247",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    },
    {
      label: "Aragon AA, Schoenfeld BJ, et al. International Society of Sports Nutrition position stand: diets and body composition. J Int Soc Sports Nutr 2017;14:16",
      url: "https://link.springer.com/article/10.1186/s12970-017-0174-y",
    },
    {
      label: "Morton RW, et al. Protein supplementation meta-analysis — the 1.6–2.2 g/kg range. Br J Sports Med 2018;52:376–384",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
  ],
};
