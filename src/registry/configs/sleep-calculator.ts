import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { SLEEP_DEFAULTS, SLEEP_SLUG } from "@/registry/configs/sleep-calculator.shared";

export const sleepInputsSchema = z.object({
  wakeMinutes: z.number().int().min(0).max(1439),
});

export const sleepConfig: ToolConfig = {
  slug: SLEEP_SLUG,
  title: "Sleep Calculator — When To Go To Bed",
  valueLine:
    "Work back from your alarm in 90-minute sleep cycles to find bedtimes that avoid waking mid-cycle.",
  metaDescription:
    "Free sleep cycle calculator: enter your wake-up time and get bedtime options for 4, 5 or 6 full 90-minute cycles, including 15 minutes to fall asleep.",
  hub: "recovery",
  tier: 1,
  inputsSchema: sleepInputsSchema,
  defaults: { ...SLEEP_DEFAULTS },
  faq: [
    {
      q: "How many sleep cycles do I need?",
      a: "Five 90-minute cycles (7.5 hours of sleep) suits most adults, aligning with the widely recommended 7–9 hours. Four cycles is a short night to use sparingly; six is a full night many people do best on.",
    },
    {
      q: "Why 90-minute cycles?",
      a: "A full pass through light, deep and REM sleep averages roughly 90 minutes in adults. Waking at the end of a cycle, when sleep is lightest, tends to feel easier than an alarm landing in deep sleep mid-cycle.",
    },
    {
      q: "Is everyone's sleep cycle exactly 90 minutes?",
      a: "No — real cycles run from about 70 to 120 minutes, vary between people, and lengthen through the night. Treat these bedtimes as sensible starting points and nudge earlier or later based on how you feel on waking.",
    },
    {
      q: "Why does the calculator add 15 minutes?",
      a: "Most people take around 10–20 minutes to fall asleep, so the tool subtracts an extra 15 minutes so your first full cycle starts once you're actually asleep. If you routinely drop off faster or slower, shift the suggested bedtime accordingly.",
    },
    {
      q: "What if I can't fall asleep at the suggested time?",
      a: "Consistency beats precision: a regular sleep and wake time, a dark cool room, and winding down without screens matter more than hitting an exact minute. Persistent trouble sleeping is worth discussing with your GP.",
    },
  ],
  related: ["heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label:
        "Institute of Medicine. Sleep Disorders and Sleep Deprivation — Sleep Physiology (NREM–REM cycle length 70–120 minutes)",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK19956/",
    },
    {
      label:
        "Hirshkowitz M, et al. National Sleep Foundation's sleep time duration recommendations. Sleep Health 2015;1:40–43",
      url: "https://pubmed.ncbi.nlm.nih.gov/29073412/",
    },
  ],
};
