import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PROGRESSION_DEFAULTS,
  PROGRESSION_LIMITS,
  PROGRESSION_SLUG,
} from "@/registry/configs/double-progression-planner.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const progressionInputsSchema = z
  .object({
    repRangeMin: z.number().int().min(PROGRESSION_LIMITS.repRangeMin.min).max(PROGRESSION_LIMITS.repRangeMin.max),
    repRangeMax: z.number().int().min(PROGRESSION_LIMITS.repRangeMax.min).max(PROGRESSION_LIMITS.repRangeMax.max),
    sets: z.number().int().min(PROGRESSION_LIMITS.sets.min).max(PROGRESSION_LIMITS.sets.max),
    currentLoadKg: limit(PROGRESSION_LIMITS.currentLoadKg),
    incrementKg: limit(PROGRESSION_LIMITS.incrementKg),
  })
  .refine((v) => v.repRangeMax > v.repRangeMin, {
    message: "Top of the rep range must exceed the bottom",
  });

export const progressionConfig: ToolConfig = {
  slug: PROGRESSION_SLUG,
  title: "Double Progression Planner",
  valueLine:
    "Enter last session's sets and get next session's exact prescription: the classic rep-range progression, automated.",
  metaDescription:
    "Free double progression planner: hit the top of your rep range on every set to add load and reset reps; otherwise repeat the load and chase reps. Clear next-session prescriptions.",
  hub: "strength",
  tier: 2,
  inputsSchema: progressionInputsSchema,
  defaults: { ...PROGRESSION_DEFAULTS },
  faq: [
    {
      q: "What is double progression?",
      a: "You progress two variables in sequence: first reps within a fixed range at a fixed load, then load. Only when every set reaches the top of the range does the weight go up and reps reset to the bottom.",
    },
    {
      q: "Why use double progression instead of adding weight every session?",
      a: "Session-to-session load jumps stall quickly outside the beginner phase. Adding reps between load increases creates smaller, sustainable steps, especially with dumbbells and machines where jumps are coarse.",
    },
    {
      q: "What rep range should I use?",
      a: "Common choices are 6 to 8 or 8 to 12 for most compound and accessory work. Narrower ranges progress load faster; wider ranges give more room to grind out rep progress.",
    },
    {
      q: "What if I can't complete the bottom of the range?",
      a: "The load was raised too soon or recovery is lacking. Repeat the load, or drop back one increment, rather than grinding failed sessions.",
    },
  ],
  related: ["one-rep-max-calculator", "training-volume-calculator", "warmup-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Schoenfeld BJ, et al. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. J Strength Cond Res 2017;31:3508-3523",
      url: "https://pubmed.ncbi.nlm.nih.gov/28834797/",
    },
    {
      label: "Morton RW, et al. Br J Sports Med 2018;52:376-384",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
  ],
};
