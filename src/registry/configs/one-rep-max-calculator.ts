import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  ONE_RM_DEFAULTS,
  ONE_RM_LIMITS,
  ONE_RM_SLUG,
} from "@/registry/configs/one-rep-max-calculator.shared";

export const oneRmInputsSchema = z.object({
  weight: z.number().min(ONE_RM_LIMITS.weight.min).max(ONE_RM_LIMITS.weight.max),
  reps: z.number().int().min(ONE_RM_LIMITS.reps.min).max(ONE_RM_LIMITS.reps.max),
  formula: z.enum(["epley", "brzycki", "lombardi", "oconner"]),
});

export const oneRmConfig: ToolConfig = {
  slug: ONE_RM_SLUG,
  title: "One-Rep Max Calculator — Epley, Brzycki & More",
  valueLine:
    "Estimate your one-rep max from any set of ten reps or fewer, with a working-weight percentage table.",
  metaDescription:
    "Free 1RM calculator using the Epley, Brzycki, Lombardi and O'Conner formulas, with a 50–95% of 1RM loading table for programming your training.",
  hub: "strength",
  tier: 1,
  inputsSchema: oneRmInputsSchema,
  defaults: { ...ONE_RM_DEFAULTS },
  faq: [
    {
      q: "How accurate are 1RM calculators?",
      a: "For sets of ten reps or fewer, published comparisons find estimates typically land within a few percent of a tested max, with correlations above 0.95. Accuracy drops as reps rise, which is why this tool warns beyond ten reps.",
    },
    {
      q: "Which 1RM formula is best?",
      a: "Epley is the most widely used and is the default here. Brzycki tends to agree closely at low reps; differences between formulas grow with higher-rep sets, so we show the formula name with every estimate.",
    },
    {
      q: "Do I ever need to test my true 1RM?",
      a: "Not unless you compete in a strength sport. An estimated max is accurate enough for setting training percentages, without the injury risk and fatigue cost of a true maximal attempt.",
    },
    {
      q: "How do I use the percentage table?",
      a: "Most strength programmes prescribe working sets as a percentage of 1RM — for example 5 reps at 75–85%. Read your estimated max, then take the row for the percentage your programme calls for.",
    },
    {
      q: "Why does my estimate differ between exercises?",
      a: "Rep-to-max relationships vary by lift and by lifter — deadlifts in particular are commonly underestimated by prediction equations. Calibrate against how each lift actually feels rather than transferring one lift's estimate to another.",
    },
  ],
  related: ["plate-calculator", "strength-standards", "dots-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label:
        "LeSuer DA, et al. The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. J Strength Cond Res 1997;11:211–213",
      url: "https://www.semanticscholar.org/paper/The-Accuracy-of-Prediction-Equations-for-Estimating-LeSuer-Mccormick/e2c1cba24a3a4fb342f29dacf21b73226b51ad22",
    },
    {
      label: "Brzycki M. Strength testing — predicting a one-rep max from reps-to-fatigue. JOPERD 1993;64:88–90",
      url: "https://www.tandfonline.com/doi/abs/10.1080/07303084.1993.10606684",
    },
  ],
};
