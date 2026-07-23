import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { STEPS_DEFAULTS, STEPS_LIMITS, STEPS_SLUG } from "@/registry/configs/steps-to-calories-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const stepsInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  heightCm: limit(STEPS_LIMITS.heightCm),
  weightKg: limit(STEPS_LIMITS.weightKg),
  steps: z.number().int().min(STEPS_LIMITS.steps.min).max(STEPS_LIMITS.steps.max),
  pace: z.enum(["casual", "moderate", "brisk"]),
});

export const stepsConfig: ToolConfig = {
  slug: STEPS_SLUG,
  title: "Steps to Calories Calculator",
  valueLine:
    "Convert your step count into distance and a rough calorie estimate, with the roughness stated honestly.",
  metaDescription:
    "Free steps-to-calories calculator: stride length from your height, distance from your steps, and energy from published walking MET values. Clearly labelled as a rough estimate.",
  hub: "nutrition",
  tier: 3,
  inputsSchema: stepsInputsSchema,
  defaults: { ...STEPS_DEFAULTS },
  faq: [
    {
      q: "How many calories does 10,000 steps burn?",
      a: "For most adults, somewhere between roughly 300 and 500 kcal depending on bodyweight, height and pace. This calculator shows the arithmetic behind that range rather than a single magic number.",
    },
    {
      q: "How is distance estimated from steps?",
      a: "Stride length is estimated at about 0.415 × height for men and 0.413 × height for women, then multiplied by your step count. Individual stride varies, which is one reason this is a rough estimate.",
    },
    {
      q: "Is 10,000 steps a day scientifically special?",
      a: "No, it began as a 1960s Japanese pedometer marketing campaign. Research shows health benefits accumulating well before 10,000 and continuing beyond it; more movement is simply better than less.",
    },
    {
      q: "Do these calories include what I'd burn anyway?",
      a: "The MET values include your resting metabolism, so don't add the full figure on top of your TDEE if your activity level already accounts for daily walking.",
    },
  ],
  related: ["calories-burned-calculator", "tdee-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Compendium of Physical Activities: walking MET values",
      url: "https://pacompendium.com/walking/",
    },
    {
      label: "Ainsworth BE, et al. Med Sci Sports Exerc 2011;43:1575-1581",
      url: "https://pubmed.ncbi.nlm.nih.gov/21681120/",
    },
  ],
};
