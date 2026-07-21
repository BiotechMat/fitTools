import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  CREATINE_CALC_DEFAULTS,
  CREATINE_CALC_LIMITS,
  CREATINE_SLUG,
} from "@/registry/configs/creatine-calculator.shared";

export const creatineInputsSchema = z.object({
  weightKg: z
    .number()
    .min(CREATINE_CALC_LIMITS.weightKg.min)
    .max(CREATINE_CALC_LIMITS.weightKg.max),
});

export const creatineConfig: ToolConfig = {
  slug: CREATINE_SLUG,
  title: "Creatine Calculator — Loading & Maintenance Dose",
  valueLine:
    "Loading and maintenance doses straight from the ISSN position stand — the most-studied supplement in sport.",
  metaDescription:
    "Free creatine dosage calculator: optional loading at 0.3 g/kg/day for 5–7 days and 3–5 g/day maintenance, per the ISSN position stand (Kreider 2017).",
  hub: "nutrition",
  tier: 3,
  inputsSchema: creatineInputsSchema,
  defaults: { ...CREATINE_CALC_DEFAULTS },
  faq: [
    {
      q: "Do I need to load creatine?",
      a: "No. Loading (0.3 g/kg/day for 5–7 days, split through the day) saturates muscle stores in about a week; a steady 3–5 g/day gets there in three to four weeks with identical end results.",
    },
    {
      q: "Is creatine safe?",
      a: "In healthy people it is among the most-studied and best-tolerated supplements in sports nutrition, per the ISSN position stand. Anyone with kidney disease or on relevant medication should speak to a doctor first.",
    },
    {
      q: "When should I take creatine?",
      a: "Timing matters little — daily consistency is what saturates and maintains muscle stores. Taking it with a meal is a convenient habit anchor.",
    },
    {
      q: "Which form of creatine is best?",
      a: "Creatine monohydrate. Other forms cost more without outperforming it in the published evidence.",
    },
  ],
  related: ["macro-calculator", "tdee-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Kreider RB, et al. ISSN position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr 2017;14:18",
      url: "https://pubmed.ncbi.nlm.nih.gov/28615996/",
    },
    {
      label: "Morton RW, et al. Br J Sports Med 2018;52:376–384 (training context)",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
  ],
};
