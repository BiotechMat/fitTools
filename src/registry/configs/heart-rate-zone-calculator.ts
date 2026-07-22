import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  HR_DEFAULTS,
  HR_LIMITS,
  HR_SLUG,
} from "@/registry/configs/heart-rate-zone-calculator.shared";

export const hrInputsSchema = z.object({
  ageYears: z.number().min(HR_LIMITS.ageYears.min).max(HR_LIMITS.ageYears.max),
  restingHr: z
    .number()
    .min(HR_LIMITS.restingHr.min)
    .max(HR_LIMITS.restingHr.max)
    .optional(),
});

export const hrConfig: ToolConfig = {
  slug: HR_SLUG,
  title: "Heart Rate Zone Calculator — Tanaka & Karvonen",
  valueLine:
    "Build your five training zones from a research-backed maximum heart rate — personalised further if you know your resting HR.",
  metaDescription:
    "Free heart rate zone calculator using the Tanaka equation (208 − 0.7 × age) and the Karvonen heart-rate-reserve method, with a full five-zone training table.",
  hub: "recovery",
  tier: 1,
  inputsSchema: hrInputsSchema,
  defaults: { ...HR_DEFAULTS },
  faq: [
    {
      q: "How do I calculate my maximum heart rate?",
      a: "This tool uses the Tanaka equation (208 − 0.7 × age), which was derived from over 18,000 subjects and outperforms the older 220 − age rule, especially past age 40. Both are estimates — measured maxima vary by ten or more beats either side.",
    },
    {
      q: "What are the five heart-rate zones?",
      a: "Zones 1–5 span 50–100% of your maximum (or of heart-rate reserve if you enter a resting HR): very easy recovery, easy aerobic, steady aerobic, threshold, and maximal work. Most endurance training time belongs in zones 1–2.",
    },
    {
      q: "What is the Karvonen method?",
      a: "Karvonen anchors zones to your heart-rate reserve — the span between resting and maximum — rather than raw percentages of max. Adding your resting heart rate makes zones noticeably better matched to your actual fitness.",
    },
    {
      q: "How do I find my resting heart rate?",
      a: "Measure on waking, before coffee or getting up: count your pulse for 60 seconds, or read it from a watch or strap averaged over several mornings. Typical adult values run from the 50s to low 70s; endurance athletes often sit lower.",
    },
    {
      q: "Why does my watch show different zones?",
      a: "Devices mix different HRmax formulas, reserve methods and zone boundaries, so small disagreements are normal. Whichever scheme you use, consistency matters more than the exact cut-offs.",
    },
  ],
  related: ["sleep-calculator", "tdee-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol 2001;37:153–156",
      url: "https://pubmed.ncbi.nlm.nih.gov/11153730/",
    },
    {
      label: "Karvonen MJ, Kentala E, Mustala O. The effects of training on heart rate: a longitudinal study. Ann Med Exp Biol Fenn 1957;35:307–315",
      url: "https://pubmed.ncbi.nlm.nih.gov/13470504/",
    },
  ],
};
