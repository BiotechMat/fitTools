import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { WATER_DEFAULTS, WATER_LIMITS, WATER_SLUG } from "@/registry/configs/water-intake-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const waterInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  exerciseHours: limit(WATER_LIMITS.exerciseHours),
  sweatRateLPerHour: limit(WATER_LIMITS.sweatRateLPerHour),
});

export const waterConfig: ToolConfig = {
  slug: WATER_SLUG,
  title: "Water Intake Calculator: Daily Hydration Guideline",
  valueLine:
    "A daily water guideline anchored on the European Food Safety Authority's adequate intakes, not hydration folklore.",
  metaDescription:
    "Free water intake calculator based on EFSA adequate intakes (2.0 L women / 2.5 L men total water) with an exercise allowance from published sweat-rate ranges.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: waterInputsSchema,
  defaults: { ...WATER_DEFAULTS },
  faq: [
    {
      q: "How much water should I drink a day?",
      a: "EFSA's adequate intakes are 2.0 L/day for women and 2.5 L/day for men of total water, which includes the 20 to 30% that typically comes from food. This is a guideline for temperate conditions, not a prescription.",
    },
    {
      q: "Is the 8-glasses-a-day rule real?",
      a: "It has no clear scientific origin. The EFSA figures used here are the closest thing to an evidence-based European reference, and thirst remains a genuinely useful signal for most healthy people.",
    },
    {
      q: "How much extra should I drink when training?",
      a: "Sweat rates typically run from about 0.5 to 2 litres per hour depending on intensity, climate and the individual (ACSM position stand). The calculator adds your chosen rate times your training hours.",
    },
    {
      q: "Can I drink too much water?",
      a: "Yes, drinking far beyond losses can dilute blood sodium (hyponatraemia), which is dangerous. Spread intake through the day and let thirst guide you during long exercise.",
    },
  ],
  related: ["tdee-calculator", "calories-burned-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "EFSA Panel on Dietetic Products. Scientific Opinion on Dietary Reference Values for water. EFSA Journal 2010;8(3):1459",
      url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1459",
    },
    {
      label: "Sawka MN, et al. ACSM position stand: exercise and fluid replacement. Med Sci Sports Exerc 2007;39:377-390",
      url: "https://pubmed.ncbi.nlm.nih.gov/17277604/",
    },
  ],
};
