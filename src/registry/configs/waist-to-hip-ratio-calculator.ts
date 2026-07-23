import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  WHR_DEFAULTS,
  WHR_LIMITS,
  WHR_SLUG,
} from "@/registry/configs/waist-to-hip-ratio-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const whrInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  waistCm: limit(WHR_LIMITS.waistCm),
  hipCm: limit(WHR_LIMITS.hipCm),
});

export const whrConfig: ToolConfig = {
  slug: WHR_SLUG,
  title: "Waist-to-Hip Ratio Calculator: WHO Cut-offs",
  valueLine:
    "Where you carry weight matters: your waist-to-hip ratio against the WHO risk cut-offs.",
  metaDescription:
    "Free waist-to-hip ratio calculator using the WHO expert-consultation cut-offs, substantially increased metabolic risk at ≥ 0.90 for men and ≥ 0.85 for women.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: whrInputsSchema,
  defaults: { ...WHR_DEFAULTS },
  faq: [
    {
      q: "What is a healthy waist-to-hip ratio?",
      a: "The WHO expert consultation set the cut-offs for substantially increased metabolic risk at 0.90 or above for men and 0.85 or above for women, below those, risk attributable to fat distribution is considered lower.",
    },
    {
      q: "How do I measure waist and hips for this ratio?",
      a: "Waist: midway between the lowest rib and the top of the hip bone, after breathing out normally. Hips: around the widest part of the buttocks. Keep the tape level and snug, not tight, and use the same landmarks every time.",
    },
    {
      q: "Why does fat distribution matter?",
      a: "Abdominal (visceral) fat is more metabolically active than fat stored on the hips and thighs, and associates more strongly with cardiovascular disease and type 2 diabetes at any given BMI, which is exactly what this ratio screens for.",
    },
    {
      q: "Waist-to-hip or waist-to-height, which should I use?",
      a: "Both are simple central-adiposity screens. Waist-to-height has the simpler universal boundary (0.5) and needs one less measurement site; waist-to-hip is the classic WHO measure with sex-specific cut-offs. Tracking either consistently beats switching between them.",
    },
  ],
  related: [
    "waist-to-height-ratio-calculator",
    "bmi-calculator",
    "body-fat-calculator",
  ],
  monetization: { ads: true, affiliates: false },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Waist circumference and waist to hip ratio: report of a WHO expert consultation (2008)",
      url: "https://wkc.who.int/resources/publications/i/item/9789241501491",
    },
  ],
};
