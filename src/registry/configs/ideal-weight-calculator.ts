import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  IDEAL_WEIGHT_DEFAULTS,
  IDEAL_WEIGHT_LIMITS,
  IDEAL_WEIGHT_SLUG,
} from "@/registry/configs/ideal-weight-calculator.shared";

export const idealWeightInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  heightCm: z
    .number()
    .min(IDEAL_WEIGHT_LIMITS.heightCm.min)
    .max(IDEAL_WEIGHT_LIMITS.heightCm.max),
});

export const idealWeightConfig: ToolConfig = {
  slug: IDEAL_WEIGHT_SLUG,
  title: "Ideal Weight Calculator: Devine, Robinson, Miller & Hamwi",
  valueLine:
    "See the range four historical formulas give for your height, and why none of them is a target to chase.",
  metaDescription:
    "Free ideal weight calculator reporting the range across the Devine, Robinson, Miller and Hamwi formulas, framed honestly as historical estimating equations rather than health targets.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: idealWeightInputsSchema,
  defaults: { ...IDEAL_WEIGHT_DEFAULTS },
  faq: [
    {
      q: "What is my ideal weight for my height?",
      a: "There is no single scientific 'ideal' weight. This tool reports the range produced by four historical formulas (Devine, Robinson, Miller and Hamwi), which typically spread across several kilograms for the same height, and that spread is itself the honest answer.",
    },
    {
      q: "Where do these formulas come from?",
      a: "They were devised between the 1960s and 1980s, mostly for drug-dose estimation rather than health guidance. The Devine formula, for example, was published in 1974 to standardise medication dosing, and the others followed as refinements against insurance height-weight tables.",
    },
    {
      q: "Why do the four formulas disagree?",
      a: "Each was fitted to different reference data with different assumptions, and all reduce body composition to height and sex alone. Two people of the same height with different builds can both be perfectly healthy at weights outside these ranges.",
    },
    {
      q: "Should I try to reach the weight shown?",
      a: "No, treat it as historical context, not a goal. Body composition, waist measurement and health markers tracked with your GP say far more about health than matching a 50-year-old dosing formula.",
    },
  ],
  related: ["bmi-calculator", "body-fat-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Pai MP, Paloucek FP. The origin of the \"ideal\" body weight equations. Ann Pharmacother 2000;34:1066-1069",
      url: "https://pubmed.ncbi.nlm.nih.gov/10981254/",
    },
    {
      label:
        "Robinson JD, et al. Determination of ideal body weight for drug dosage calculations. Am J Hosp Pharm 1983;40:1016-1019 (original coefficients implemented here)",
      url: "https://pubmed.ncbi.nlm.nih.gov/6869387/",
    },
  ],
};
