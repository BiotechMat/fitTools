import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { BMI_DEFAULTS, BMI_LIMITS, BMI_SLUG } from "@/registry/configs/bmi-calculator.shared";

export const bmiInputsSchema = z.object({
  weightKg: z.number().min(BMI_LIMITS.weightKg.min).max(BMI_LIMITS.weightKg.max),
  heightCm: z.number().min(BMI_LIMITS.heightCm.min).max(BMI_LIMITS.heightCm.max),
});

export const bmiConfig: ToolConfig = {
  slug: BMI_SLUG,
  title: "BMI Calculator — Body Mass Index & WHO Category",
  valueLine:
    "Check your body mass index against the WHO adult categories — and understand where the number falls short.",
  metaDescription:
    "Free BMI calculator with WHO categories (underweight to obesity class III), metric and imperial inputs, and an honest explanation of BMI's limits for muscular and athletic builds.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: bmiInputsSchema,
  defaults: { ...BMI_DEFAULTS },
  faq: [
    {
      q: "What is a healthy BMI?",
      a: "For adults, the WHO classifies a BMI of 18.5 to 24.9 as the healthy-weight range, 25 to 29.9 as overweight, and 30 or above as obesity, split into classes I–III. These are population screening bands rather than individual diagnoses.",
    },
    {
      q: "How is BMI calculated?",
      a: "BMI is your weight in kilograms divided by your height in metres squared. A 80 kg person at 1.75 m has a BMI of 80 ÷ 1.75² ≈ 26.1.",
    },
    {
      q: "Is BMI accurate for muscular people?",
      a: "No — this is BMI's best-known weakness. It cannot tell muscle from fat, so muscular athletes are routinely classed as overweight or even obese despite low body fat. If you carry meaningful muscle, a body-fat estimate is a far better guide.",
    },
    {
      q: "Does BMI apply to children or during pregnancy?",
      a: "This calculator uses adult cut-offs and is not valid for children, teenagers or pregnancy. Children's BMI is assessed against age- and sex-specific growth charts by health professionals.",
    },
    {
      q: "Why do doctors still use BMI?",
      a: "At a population level BMI correlates well with health risk and is essentially free to measure, which makes it useful for screening. Its limits appear at the individual level, which is why results here are framed as an estimate to discuss with a professional, not a verdict.",
    },
  ],
  related: ["body-fat-calculator", "ideal-weight-calculator", "tdee-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label:
        "WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet 2004;363:157–163",
      url: "https://pubmed.ncbi.nlm.nih.gov/14726171/",
    },
    {
      label: "World Health Organization. Obesity and overweight — fact sheet",
      url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
    },
  ],
};
