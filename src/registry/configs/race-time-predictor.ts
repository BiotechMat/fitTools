import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { RACE_DEFAULTS, RACE_LIMITS, RACE_SLUG } from "@/registry/configs/race-time-predictor.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const raceInputsSchema = z.object({
  distanceM: limit(RACE_LIMITS.distanceM),
  totalSeconds: limit(RACE_LIMITS.totalSeconds),
});

export const raceConfig: ToolConfig = {
  slug: RACE_SLUG,
  title: "Race Time Predictor — Riegel Formula",
  valueLine:
    "Predict your 5k to marathon times from one recent race, using Riegel's endurance formula — assumptions stated.",
  metaDescription:
    "Free race time predictor using the Riegel formula (T₂ = T₁ × (D₂/D₁)^1.06): predictions for 5k, 10k, half marathon and marathon from any recent result.",
  hub: "recovery",
  tier: 2,
  inputsSchema: raceInputsSchema,
  defaults: { ...RACE_DEFAULTS },
  faq: [
    {
      q: "How accurate are race time predictions?",
      a: "Good within neighbouring distances (10k from a 5k, half from a 10k) for runners with appropriate training. Marathon predictions from short races are systematically optimistic unless you have genuine endurance volume behind you.",
    },
    {
      q: "What is the Riegel formula?",
      a: "T₂ = T₁ × (D₂ ÷ D₁)^1.06 — published by Peter Riegel in 1981 from analysis of record performances across endurance sports. The 1.06 exponent captures how pace naturally slows as distance doubles.",
    },
    {
      q: "Why is my marathon prediction too fast?",
      a: "The formula assumes you're as trained for the target distance as the known one. Without marathon-specific mileage, glycogen limits and fatigue bite harder than the exponent expects — treat marathon predictions as a best case.",
    },
    {
      q: "Which race should I base predictions on?",
      a: "Your most recent all-out effort, ideally within the last couple of months and at a distance adjacent to the target. A fresh 10k predicts a half marathon far better than a year-old 5k.",
    },
  ],
  related: ["running-pace-calculator", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Riegel PS. Athletic records and human endurance. American Scientist 1981;69:285–290",
      url: "https://www.jstor.org/stable/27850427",
    },
    {
      label: "Vickers AJ, Vertosick EA. An empirical study of race times in recreational endurance runners. BMC Sports Sci Med Rehabil 2016;8:26 (accuracy context)",
      url: "https://pubmed.ncbi.nlm.nih.gov/27547402/",
    },
  ],
};
