import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PACE_OF_AGING_SLUG,
  POA_DEFAULTS,
  POA_LIMITS,
} from "@/registry/configs/pace-of-aging-index.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const paceOfAgingInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  waistCm: limit(POA_LIMITS.waistCm),
  heightCm: limit(POA_LIMITS.heightCm),
  mvpaMinPerWeek: limit(POA_LIMITS.mvpaMinPerWeek),
  sleepHours: limit(POA_LIMITS.sleepHours),
  restingHr: limit(POA_LIMITS.restingHr),
  currentSmoker: z.boolean(),
  alcoholUnitsPerWeek: limit(POA_LIMITS.alcoholUnitsPerWeek),
  vo2max: limit(POA_LIMITS.vo2max).optional(),
  gripKg: limit(POA_LIMITS.gripKg).optional(),
  hrvMs: limit(POA_LIMITS.hrvMs).optional(),
});

export const paceOfAgingConfig: ToolConfig = {
  slug: PACE_OF_AGING_SLUG,
  title: "Pace of Aging Index: Open Lifestyle-Trajectory Score",
  valueLine:
    "A transparent 0 to 100 lifestyle-trajectory score from habits and simple measures: you versus your own potential, not a biological age.",
  metaDescription:
    "Free open-methodology Pace of Aging Index: a transparent 0 to 100 lifestyle-trajectory score from fitness, activity, waist-to-height, sleep, heart rate and habits, with a full sub-score breakdown. Not a biological age or medical test.",
  hub: "recovery",
  tier: 3,
  inputsSchema: paceOfAgingInputsSchema,
  defaults: { ...POA_DEFAULTS },
  faq: [
    {
      q: "Is this my biological age?",
      a: "No, deliberately not. It's a transparent lifestyle-trajectory score built from modifiable habits and simple measures. It shows how your current lifestyle stacks up, framed as levers you can change, not a claim about your cells' age.",
    },
    {
      q: "What is the 'pace' number?",
      a: "A centred display of the same 0 to 100 index, roughly 0.8 (favourable) to 1.2 (less favourable). It's just another way to read the score, where lower suggests a lifestyle trajectory tracking younger. It's a display transform, not a separate hidden model.",
    },
    {
      q: "Do I need a VO2max, grip or HRV number?",
      a: "No. Those three inputs are optional, so enter them only if you know them from a test or wearable. Leave them blank and the score renormalises across what you did provide, flagging reduced confidence. It never guesses a value.",
    },
    {
      q: "Why is cardio fitness optional here?",
      a: "Cardiorespiratory fitness carries real weight in the methodology, but our dedicated fitness-age tool is on hold pending a source we can verify. Rather than estimate it unreliably, we let you enter a known VO2max or skip it.",
    },
    {
      q: "Is this a medical test?",
      a: "No. It's a transparent self-tracking index, not validated against health outcomes and not a diagnosis. Everything is computed in your browser.",
    },
  ],
  related: ["phenotypic-age-calculator", "metabolic-fitness-index", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label: "WHO Guidelines on physical activity and sedentary behaviour, 2020 (150 to 300 min/week MVPA)",
      url: "https://www.who.int/publications/i/item/9789240015128",
    },
    {
      label: "Ashwell M, Gibson S. Waist-to-height ratio and early health risk (0.5 boundary)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Ashwell+waist+to+height+ratio+0.5",
    },
  ],
};
