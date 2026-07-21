import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  CALORIES_BURNED_DEFAULTS,
  CALORIES_BURNED_LIMITS,
  CALORIES_BURNED_SLUG,
} from "@/registry/configs/calories-burned-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const caloriesBurnedInputsSchema = z.object({
  weightKg: limit(CALORIES_BURNED_LIMITS.weightKg),
  minutes: limit(CALORIES_BURNED_LIMITS.minutes),
  activityCode: z.string().regex(/^\d{5}$/),
});

export const caloriesBurnedConfig: ToolConfig = {
  slug: CALORIES_BURNED_SLUG,
  title: "Calories Burned Calculator — MET Method",
  valueLine:
    "Estimate the energy cost of any activity using the research-standard MET method and Compendium values.",
  metaDescription:
    "Free calories burned calculator using the MET method (kcal/min = MET × 3.5 × kg ÷ 200) with activity values from the Compendium of Physical Activities.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: caloriesBurnedInputsSchema,
  defaults: { ...CALORIES_BURNED_DEFAULTS },
  faq: [
    {
      q: "How are calories burned calculated?",
      a: "Each activity has a MET value — a multiple of resting metabolism — from the Compendium of Physical Activities. Energy is MET × 3.5 × bodyweight (kg) ÷ 200 per minute, the standard research formula.",
    },
    {
      q: "How accurate are MET estimates?",
      a: "They describe the average person doing the average version of the activity; individual efficiency, fitness and intensity easily move true burn ±20%. Treat results as planning estimates.",
    },
    {
      q: "Do fitter people burn fewer calories doing the same exercise?",
      a: "Slightly, at the same absolute pace — movement economy improves. But fitter people typically work at higher absolute intensities, which usually outweighs the efficiency gain.",
    },
    {
      q: "Why does my watch disagree?",
      a: "Wearables mix heart-rate models with motion data and their own proprietary corrections. Neither method is ground truth; consistency with one method matters more than the absolute number.",
    },
  ],
  related: ["tdee-calculator", "steps-to-calories-calculator", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Compendium of Physical Activities (Adult Compendium) — activity codes and MET values",
      url: "https://pacompendium.com/",
    },
    {
      label: "Ainsworth BE, et al. 2011 Compendium of Physical Activities. Med Sci Sports Exerc 2011;43:1575–1581",
      url: "https://pubmed.ncbi.nlm.nih.gov/21681120/",
    },
  ],
};
