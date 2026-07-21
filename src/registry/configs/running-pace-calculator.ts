import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { PACE_DEFAULTS, PACE_LIMITS, PACE_SLUG } from "@/registry/configs/running-pace-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const paceInputsSchema = z.object({
  distanceM: limit(PACE_LIMITS.distanceM),
  totalSeconds: limit(PACE_LIMITS.totalSeconds),
});

export const paceConfig: ToolConfig = {
  slug: PACE_SLUG,
  title: "Running Pace Calculator — Pace, Speed & Splits",
  valueLine:
    "Turn a distance and time into pace per kilometre and mile, speed, and even splits.",
  metaDescription:
    "Free running pace calculator: min/km and min/mile pace, speed, and kilometre splits for any distance from 400 m to ultra distances.",
  hub: "recovery",
  tier: 2,
  inputsSchema: paceInputsSchema,
  defaults: { ...PACE_DEFAULTS },
  faq: [
    {
      q: "How do I calculate my running pace?",
      a: "Divide your total time by the distance: a 50-minute 10 km is 5:00 per kilometre (about 8:03 per mile). This calculator does the conversion both ways and builds your splits.",
    },
    {
      q: "What is a good 5k or 10k pace?",
      a: "Recreational 5k times commonly span 20–35 minutes (4:00–7:00 /km). Pace is personal — the useful comparison is your own trend, not a global average.",
    },
    {
      q: "Should I run even splits?",
      a: "For most race distances, even or slightly negative splits (second half marginally faster) are the well-tested strategy. The splits table here assumes even pacing.",
    },
    {
      q: "How does pace translate to treadmill speed?",
      a: "Speed = 60 ÷ pace-in-minutes. A 5:00 /km pace is 12.0 km/h; the calculator shows the conversion for your own numbers.",
    },
  ],
  related: ["race-time-predictor", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Riegel PS. Athletic records and human endurance. American Scientist 1981;69:285–290 (endurance-pace relationship)",
      url: "https://www.jstor.org/stable/27850427",
    },
    {
      label: "Tanaka H, et al. J Am Coll Cardiol 2001;37:153–156 (intensity context)",
      url: "https://pubmed.ncbi.nlm.nih.gov/11153730/",
    },
  ],
};
