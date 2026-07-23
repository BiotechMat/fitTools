import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  HR_CALORIES_DEFAULTS,
  HR_CALORIES_LIMITS,
  HR_CALORIES_SLUG,
} from "@/registry/configs/calories-burned-by-heart-rate.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const hrCaloriesInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  heartRateBpm: limit(HR_CALORIES_LIMITS.heartRateBpm),
  weightKg: limit(HR_CALORIES_LIMITS.weightKg),
  ageYears: limit(HR_CALORIES_LIMITS.ageYears),
  durationMin: limit(HR_CALORIES_LIMITS.durationMin),
});

export const hrCaloriesConfig: ToolConfig = {
  slug: HR_CALORIES_SLUG,
  title: "Calories Burned by Heart Rate Calculator",
  valueLine:
    "Estimate a session's energy burn from your average heart rate, the same published model many wearables build on.",
  metaDescription:
    "Free calculator for calories burned from average heart rate, using the Keytel 2005 equations (sex, age, weight and heart rate) developed on steady-state aerobic exercise.",
  hub: "recovery",
  tier: 2,
  inputsSchema: hrCaloriesInputsSchema,
  defaults: { ...HR_CALORIES_DEFAULTS },
  faq: [
    {
      q: "How does heart rate estimate calories burned?",
      a: "During steady aerobic exercise, heart rate rises roughly linearly with oxygen use, and oxygen use maps to energy expenditure. The Keytel equations capture that relationship from sex, age, weight and heart rate, no VO2max test needed.",
    },
    {
      q: "How accurate is this estimate?",
      a: "Group-level accuracy is good for steady cardio, but individual error can be meaningful, fitness level shifts the heart-rate/energy relationship. Treat the number as a consistent estimate for comparing your own sessions, not a precise measurement.",
    },
    {
      q: "Why does it need my average heart rate?",
      a: "The model assumes a steady working heart rate, so use the session average from your watch or chest strap. For intervals the average blurs the picture, the estimate degrades as work gets less steady.",
    },
    {
      q: "Why does the calculator warn at low heart rates?",
      a: "The equations were developed on exercise at roughly 90 bpm and above; below that the linear fit breaks down (it can even go negative), so numbers in that region aren't meaningful and we say so rather than showing one.",
    },
    {
      q: "Does this work for weight training?",
      a: "Poorly, lifting spikes heart rate for reasons other than oxygen demand (pressor response), so heart-rate-based estimates overshoot. The MET-based calories-burned calculator is the better tool there.",
    },
  ],
  related: [
    "calories-burned-calculator",
    "heart-rate-zone-calculator",
    "tdee-calculator",
  ],
  monetization: { ads: true, affiliates: false },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Keytel LR, Goedecke JH, Noakes TD, et al. Prediction of energy expenditure from heart rate monitoring during submaximal exercise. J Sports Sci 2005;23:289-297",
      url: "https://www.semanticscholar.org/paper/Prediction-of-energy-expenditure-from-heart-rate-Keytel-Goedecke/2f647f62e650bf7df32546e541af3cf155297749",
    },
  ],
};
