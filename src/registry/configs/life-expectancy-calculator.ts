import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  LIFE_EXPECTANCY_DEFAULTS,
  LIFE_EXPECTANCY_SLUG,
} from "@/registry/configs/life-expectancy-calculator.shared";

export const lifeExpectancyInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  smoking: z.boolean().optional(),
  bmi: z.boolean().optional(),
  physicalActivity: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  diet: z.boolean().optional(),
});

export const lifeExpectancyConfig: ToolConfig = {
  slug: LIFE_EXPECTANCY_SLUG,
  title: "Healthy Lifestyle & Life Expectancy — The Evidence",
  valueLine:
    "See how five low-risk habits were linked to years of life in a large US study — a population finding, not a personal forecast.",
  metaDescription:
    "How five healthy-lifestyle factors related to life expectancy at 50 in the landmark Li 2018 study: people with all five lived, on average, 12–14 years longer than those with none. Population association, not a prediction.",
  hub: "recovery",
  tier: 2,
  inputsSchema: lifeExpectancyInputsSchema,
  defaults: { ...LIFE_EXPECTANCY_DEFAULTS },
  faq: [
    {
      q: "Can this predict how long I'll live?",
      a: "No — and it deliberately doesn't try to. It reports a population-level association from one large study: people who met more of five healthy-lifestyle factors lived, on average, longer. It says nothing about any individual's lifespan, which depends on genetics, luck, healthcare and much more.",
    },
    {
      q: "What are the five factors?",
      a: "Never smoking; a BMI of 18.5–24.9; at least 30 minutes a day of moderate-to-vigorous activity; moderate alcohol intake (5–15 g/day for women, 5–30 g/day for men); and a diet-quality score in the top 40%. They come directly from the Li et al. 2018 study.",
    },
    {
      q: "How big was the difference?",
      a: "At age 50, participants meeting all five factors had a projected life expectancy about 14.0 years longer (women) and 12.2 years longer (men) than those meeting none. Those are the study's headline endpoint figures.",
    },
    {
      q: "Why don't you show a number for 2, 3 or 4 factors?",
      a: "Because the study only published exact projected figures for the extremes — none and all five. It reported a graded relationship (more factors, more years) but didn't tabulate the in-between values, so showing a precise number for those would be inventing data.",
    },
    {
      q: "Does more alcohol mean more life?",
      a: "No. The 'moderate' band is narrow, and the study noted that both zero and higher intake carried more risk than moderate. Nothing here is a reason to start or increase drinking — the alcohol factor is one small part of a whole-lifestyle picture.",
    },
  ],
  related: ["bmi-calculator", "tdee-calculator", "phenotypic-age-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Li Y, et al. Impact of Healthy Lifestyle Factors on Life Expectancies in the US Population. Circulation 2018;138:345–355",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6207481/",
    },
  ],
};
