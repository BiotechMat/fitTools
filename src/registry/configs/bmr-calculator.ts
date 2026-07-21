import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { BMR_CALC_DEFAULTS, BMR_CALC_LIMITS, BMR_SLUG } from "@/registry/configs/bmr-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const bmrInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  ageYears: limit(BMR_CALC_LIMITS.ageYears),
  weightKg: limit(BMR_CALC_LIMITS.weightKg),
  heightCm: limit(BMR_CALC_LIMITS.heightCm),
  formula: z.enum(["mifflin", "katch", "harris"]),
  bodyFatPercent: limit(BMR_CALC_LIMITS.bodyFatPercent).optional(),
});

export const bmrConfig: ToolConfig = {
  slug: BMR_SLUG,
  title: "BMR Calculator — Basal Metabolic Rate",
  valueLine:
    "Estimate the calories your body burns at complete rest, using three published equations.",
  metaDescription:
    "Free BMR calculator using Mifflin–St Jeor (default), Katch–McArdle and revised Harris–Benedict equations, with clear guidance on which to trust.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: bmrInputsSchema,
  defaults: { ...BMR_CALC_DEFAULTS },
  faq: [
    {
      q: "What is BMR?",
      a: "Basal metabolic rate is the energy your body uses at complete rest for basic functions — breathing, circulation, cell maintenance. It typically makes up 60–75% of the calories most people burn in a day.",
    },
    {
      q: "What is the difference between BMR and TDEE?",
      a: "BMR is resting energy only; TDEE multiplies it by an activity factor to estimate your full daily burn. Use TDEE for calorie planning, and BMR to understand the baseline underneath it.",
    },
    {
      q: "Which BMR formula is most accurate?",
      a: "Mifflin–St Jeor is the best validated for most adults and is the default here. Katch–McArdle can edge ahead if you know your body-fat percentage from a reliable measurement.",
    },
    {
      q: "Can I eat below my BMR?",
      a: "Eating below BMR is not automatically dangerous, but it usually signals an overly aggressive deficit. Sustainable fat-loss targets sit between BMR and TDEE — and large deficits deserve professional supervision.",
    },
  ],
  related: ["tdee-calculator", "macro-calculator", "lean-body-mass-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Mifflin MD, St Jeor ST, et al. Am J Clin Nutr 1990;51:241–247",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    },
    {
      label: "Roza AM, Shizgal HM. Am J Clin Nutr 1984;40:168–182",
      url: "https://pubmed.ncbi.nlm.nih.gov/6741850/",
    },
  ],
};
