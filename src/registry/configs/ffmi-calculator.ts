import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { FFMI_DEFAULTS, FFMI_LIMITS, FFMI_SLUG } from "@/registry/configs/ffmi-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const ffmiInputsSchema = z.object({
  weightKg: limit(FFMI_LIMITS.weightKg),
  heightCm: limit(FFMI_LIMITS.heightCm),
  bodyFatPercent: limit(FFMI_LIMITS.bodyFatPercent),
});

export const ffmiConfig: ToolConfig = {
  slug: FFMI_SLUG,
  title: "FFMI Calculator: Fat-Free Mass Index",
  valueLine:
    "Gauge how much muscle you carry for your height, with the height-adjusted index from the original research.",
  metaDescription:
    "Free FFMI calculator (fat-free mass index) with the Kouri height adjustment, the muscularity metric from the classic study of steroid-free bodybuilders.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: ffmiInputsSchema,
  defaults: { ...FFMI_DEFAULTS },
  faq: [
    {
      q: "What is a good FFMI?",
      a: "Around 18 to 20 is typical for untrained men, 20 to 22 reflects serious training, and values above roughly 25 were rare among drug-free athletes in the original research. Women average about 2.5 to 3 points lower.",
    },
    {
      q: "Is 25 FFMI really a natural limit?",
      a: "It's a statistical observation, not a law. In Kouri's sample of drug-free bodybuilders, FFMI rarely exceeded 25. Outliers exist, but the further above 25, the rarer the physique.",
    },
    {
      q: "Why adjust FFMI for height?",
      a: "Raw FFMI drifts slightly downward for taller people. The published adjustment (+6.1 × (1.8 − height in metres)) normalises everyone to a 1.8 m reference, making comparisons fairer.",
    },
    {
      q: "How accurate is my FFMI?",
      a: "Exactly as accurate as your body-fat estimate, since errors pass straight through. A ±3-point body-fat error moves FFMI by roughly ±1 point.",
    },
  ],
  related: ["body-fat-calculator", "lean-body-mass-calculator", "bmi-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Kouri EM, Pope HG, Katz DL, Oliva P. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med 1995;5:223-228",
      url: "https://pubmed.ncbi.nlm.nih.gov/7496846/",
    },
    {
      label: "Hodgdon JA, Beckett MB. Naval Health Research Center Report 84-11, 1984 (body-fat input method)",
      url: "https://apps.dtic.mil/sti/citations/ADA143890",
    },
  ],
};
