import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { WARMUP_DEFAULTS, WARMUP_LIMITS, WARMUP_SLUG } from "@/registry/configs/warmup-calculator.shared";

export const warmupInputsSchema = z.object({
  workSetKg: z.number().min(WARMUP_LIMITS.workSetKg.min).max(WARMUP_LIMITS.workSetKg.max),
  barKg: z.union([z.literal(10), z.literal(15), z.literal(20)]),
});

export const warmupConfig: ToolConfig = {
  slug: WARMUP_SLUG,
  title: "Warm-Up Sets Calculator — Barbell Ramp",
  valueLine:
    "A sensible ramp to your first work set — bar, 40%, 60%, 80% — rounded to weights you can actually load.",
  metaDescription:
    "Free warm-up set calculator: a bar ×10, 40% ×5, 60% ×3, 80% ×1 ramp to your first work set, every step rounded to plate-loadable weights.",
  hub: "strength",
  tier: 2,
  inputsSchema: warmupInputsSchema,
  defaults: { ...WARMUP_DEFAULTS },
  faq: [
    {
      q: "How should I warm up for barbell lifts?",
      a: "Ramp from the empty bar to your first work set in a few progressively heavier, progressively shorter sets — this tool uses bar ×10, then 40% ×5, 60% ×3 and 80% ×1 of your work weight.",
    },
    {
      q: "Why do warm-up reps decrease as weight increases?",
      a: "Early sets groove technique and raise tissue temperature; later sets prime the nervous system for heavy load without accumulating fatigue that would tax your work sets.",
    },
    {
      q: "Do I need more warm-up for heavier lifts?",
      a: "Stronger lifters often insert extra steps above 80% (e.g. 90% ×1) because their jumps are larger in absolute terms. Add a step if the last jump feels big; the percentages are a template, not a law.",
    },
    {
      q: "Should I warm up the same for every exercise?",
      a: "The first heavy movement of the day needs the full ramp. Later exercises sharing similar muscles usually need only one or two feeder sets.",
    },
  ],
  related: ["plate-calculator", "one-rep-max-calculator", "double-progression-planner"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "IPF Technical Rules — plate denominations used for load rounding",
      url: "https://www.powerlifting.sport/rules/codes/info/technical-rules",
    },
    {
      label: "LeSuer DA, et al. J Strength Cond Res 1997;11:211–213 (percentage-of-max context)",
      url: "https://www.semanticscholar.org/paper/The-Accuracy-of-Prediction-Equations-for-Estimating-LeSuer-Mccormick/e2c1cba24a3a4fb342f29dacf21b73226b51ad22",
    },
  ],
};
