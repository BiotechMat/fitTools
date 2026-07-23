import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  MF_DEFAULTS,
  MF_LIMITS,
  METABOLIC_FITNESS_SLUG,
} from "@/registry/configs/metabolic-fitness-index.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const metabolicFitnessInputsSchema = z.object({
  timeInRangePercent: limit(MF_LIMITS.timeInRangePercent),
  cvPercent: limit(MF_LIMITS.cvPercent),
  gmiPercent: limit(MF_LIMITS.gmiPercent),
  waistCm: limit(MF_LIMITS.waistCm),
  heightCm: limit(MF_LIMITS.heightCm),
  restingHr: limit(MF_LIMITS.restingHr),
});

export const metabolicFitnessConfig: ToolConfig = {
  slug: METABOLIC_FITNESS_SLUG,
  title: "Metabolic Fitness Index: Open, Transparent Score",
  valueLine:
    "A transparent 0 to 100 metabolic score from your CGM metrics, waist-to-height and resting heart rate, with the full formula and weights shown.",
  metaDescription:
    "Free open-methodology Metabolic Fitness Index: combines time in range, glucose variability, GMI, waist-to-height and resting heart rate into a transparent 0 to 100 score with a full sub-score breakdown. Not a medical test.",
  hub: "recovery",
  tier: 3,
  inputsSchema: metabolicFitnessInputsSchema,
  defaults: { ...MF_DEFAULTS },
  faq: [
    {
      q: "What is the Metabolic Fitness Index?",
      a: "It's an open, transparent composite score (0 to 100) that combines five self-tracking metabolic markers into one number, with the full formula, weights and evidence tiers shown on the page. Unlike the scores inside proprietary wearables, nothing is hidden, and you can reconstruct exactly how it was calculated.",
    },
    {
      q: "Where do I get the inputs?",
      a: "Time in range, glucose variability (%CV) and GMI come from a CGM, and our CGM metrics calculator computes them from your readings. Waist and height you can measure with a tape; resting heart rate comes from a morning pulse or a wearable.",
    },
    {
      q: "Is a high score good?",
      a: "Higher is more favourable by the index's design. But it is a self-tracking construct, not a medical test. It has not been validated against health outcomes, and it can't diagnose anything. Use it to track your own trend over time.",
    },
    {
      q: "Why these five inputs and weights?",
      a: "The weights and evidence tiers are published on the page and follow our open methodology: no single input dominates, and each is tagged by strength of evidence. Time in range, variability and average glucose carry the most weight; waist-to-height and resting heart rate round out the picture.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Everything is computed in your browser and nothing is stored or transmitted.",
    },
  ],
  related: ["cgm-metrics-calculator", "phenotypic-age-calculator", "bmi-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Battelino T, et al. International consensus on time in range. Diabetes Care 2019 (TIR / %CV anchors)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Battelino+international+consensus+time+in+range+2019",
    },
    {
      label:
        "Ashwell M, Gibson S. Waist-to-height ratio as an indicator of early health risk (0.5 boundary)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Ashwell+waist+to+height+ratio+0.5",
    },
  ],
};
