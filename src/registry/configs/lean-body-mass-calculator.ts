import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { LBM_DEFAULTS, LBM_LIMITS, LBM_SLUG } from "@/registry/configs/lean-body-mass-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const lbmInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  weightKg: limit(LBM_LIMITS.weightKg),
  heightCm: limit(LBM_LIMITS.heightCm),
  bodyFatPercent: limit(LBM_LIMITS.bodyFatPercent).optional(),
});

export const lbmConfig: ToolConfig = {
  slug: LBM_SLUG,
  title: "Lean Body Mass Calculator — Boer Formula",
  valueLine:
    "Estimate your fat-free mass from height and weight — or exactly, from a measured body-fat percentage.",
  metaDescription:
    "Free lean body mass calculator using the Boer formula, with an optional body-fat override for a direct calculation. Metric and imperial.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: lbmInputsSchema,
  defaults: { ...LBM_DEFAULTS },
  faq: [
    {
      q: "What is lean body mass?",
      a: "Lean body mass is everything that isn't fat: muscle, bone, organs and water. It drives most of your resting calorie burn, which is why it appears in equations like Katch–McArdle.",
    },
    {
      q: "How accurate is the Boer formula?",
      a: "It estimates LBM from height, weight and sex alone, so it reflects the average build for your size. If you know your body-fat percentage from a reliable measurement, the direct calculation (weight × (1 − body fat)) is better — enter it and this tool switches automatically.",
    },
    {
      q: "Why do clinicians care about lean body mass?",
      a: "Several drug doses and physiological estimates scale better with lean mass than total weight — the Boer formula was developed in that clinical context.",
    },
    {
      q: "How do I increase lean body mass?",
      a: "Progressive resistance training with adequate protein (roughly 1.6–2.2 g/kg/day) is the evidence-backed combination. Gains are gradual — think kilograms per year, not per week.",
    },
  ],
  related: ["ffmi-calculator", "body-fat-calculator", "bmr-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Boer P. Estimated lean body mass as an index for normalization of body fluid volumes in humans. Am J Physiol 1984;247:F632–636",
      url: "https://pubmed.ncbi.nlm.nih.gov/6496691/",
    },
    {
      label: "Morton RW, et al. Br J Sports Med 2018;52:376–384 (protein for lean-mass gain)",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
  ],
};
