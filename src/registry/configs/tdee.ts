import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  TDEE_DEFAULTS,
  TDEE_LIMITS,
  TDEE_SLUG,
} from "@/registry/configs/tdee.shared";

export const tdeeInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  ageYears: z.number().min(TDEE_LIMITS.ageYears.min).max(TDEE_LIMITS.ageYears.max),
  weightKg: z.number().min(TDEE_LIMITS.weightKg.min).max(TDEE_LIMITS.weightKg.max),
  heightCm: z.number().min(TDEE_LIMITS.heightCm.min).max(TDEE_LIMITS.heightCm.max),
  activity: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  formula: z.enum(["mifflin", "katch", "harris"]),
  bodyFatPercent: z
    .number()
    .min(TDEE_LIMITS.bodyFatPercent.min)
    .max(TDEE_LIMITS.bodyFatPercent.max)
    .optional(),
});

export type TdeeInputs = z.infer<typeof tdeeInputsSchema>;

export const tdeeConfig: ToolConfig = {
  slug: TDEE_SLUG,
  title: "TDEE Calculator: Total Daily Energy Expenditure",
  valueLine:
    "Estimate the calories you burn per day from your stats and activity level, using peer-reviewed equations.",
  metaDescription:
    "Estimate your total daily energy expenditure (TDEE) and BMR with the Mifflin-St Jeor, Katch-McArdle or revised Harris-Benedict equations. Free, no sign-up.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: tdeeInputsSchema,
  defaults: { ...TDEE_DEFAULTS },
  faq: [
    {
      q: "What is TDEE?",
      a: "TDEE (total daily energy expenditure) is an estimate of the total calories you burn per day. It combines your basal metabolic rate, the energy your body uses at rest, with an activity multiplier that accounts for exercise and daily movement.",
    },
    {
      q: "Which TDEE formula is most accurate?",
      a: "For most people the Mifflin-St Jeor equation is the best-validated starting point, which is why this calculator uses it by default. If you know your body-fat percentage from a reliable measurement, the Katch-McArdle equation may give a better estimate because it works from lean mass.",
    },
    {
      q: "What is the difference between BMR and TDEE?",
      a: "BMR (basal metabolic rate) is the energy your body uses at complete rest to keep basic functions running. TDEE is BMR multiplied by an activity factor, so it estimates everything you burn in a normal day, including exercise and everyday movement.",
    },
    {
      q: "How do I use TDEE to lose or gain weight?",
      a: "Your TDEE is an estimate of maintenance calories. Eating consistently below it tends to produce weight loss and eating above it tends to produce weight gain. Because it is only an estimate, track your weight over a few weeks and adjust intake based on what actually happens.",
    },
    {
      q: "Which activity level should I pick?",
      a: "Choose based on your whole week, not your best day. Most people with desk jobs who train three to five times a week fall under moderate activity. If your weight is not moving the way the estimate predicts, adjust the activity level down or up rather than assuming the formula is wrong.",
    },
    {
      q: "How accurate is a TDEE calculator?",
      a: "Prediction equations are typically within about 10% of measured values for most healthy adults, but individual results vary with genetics, body composition and daily movement. Treat the number as a starting estimate to refine with real-world tracking, not a precise measurement.",
    },
  ],
  related: ["macro-calculator", "calorie-deficit-calculator", "bmi-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr 1990;51:241-247",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    },
    {
      label: "Roza AM, Shizgal HM. The Harris Benedict equation reevaluated. Am J Clin Nutr 1984;40:168-182",
      url: "https://pubmed.ncbi.nlm.nih.gov/6741850/",
    },
    {
      label: "Endotext: Obesity, dietary treatment (Mifflin-St Jeor equation reference table)",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK278991/table/diet-treatment-obes.table12est/",
    },
  ],
};
