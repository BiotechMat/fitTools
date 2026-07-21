import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  MUSCLE_GROUPS,
  VOLUME_DEFAULTS,
  VOLUME_LIMITS,
  VOLUME_SLUG,
} from "@/registry/configs/training-volume-calculator.shared";

/** Validates one exercise row; the UI manages a list of up to 20 rows. */
export const volumeInputsSchema = z.object({
  muscle: z.enum(MUSCLE_GROUPS),
  sets: z.number().int().min(VOLUME_LIMITS.sets.min).max(VOLUME_LIMITS.sets.max),
  reps: z.number().int().min(VOLUME_LIMITS.reps.min).max(VOLUME_LIMITS.reps.max),
  loadKg: z.number().min(VOLUME_LIMITS.loadKg.min).max(VOLUME_LIMITS.loadKg.max),
});

export const volumeConfig: ToolConfig = {
  slug: VOLUME_SLUG,
  title: "Training Volume Calculator — Tonnage & Weekly Sets",
  valueLine:
    "Add up your session tonnage and weekly hard sets per muscle — the two volume numbers worth tracking.",
  metaDescription:
    "Free training volume calculator: per-exercise tonnage (sets × reps × load) and weekly hard-set counts per muscle group, the volume measure used in hypertrophy research.",
  hub: "strength",
  tier: 2,
  inputsSchema: volumeInputsSchema,
  defaults: {
    muscle: "chest",
    sets: VOLUME_DEFAULTS.sets,
    reps: VOLUME_DEFAULTS.reps,
    loadKg: VOLUME_DEFAULTS.loadKg,
  },
  faq: [
    {
      q: "What counts as a hard set?",
      a: "A set taken close to failure — within about 4 reps in reserve. Warm-ups don't count. Weekly hard sets per muscle is the volume currency most hypertrophy research uses.",
    },
    {
      q: "How many sets per muscle per week do I need?",
      a: "Meta-analyses find growth from as little as 4 weekly sets, with more volume producing more growth up to a point — commonly 10–20 hard sets per muscle for trained lifters. Start lower and add only when progress stalls.",
    },
    {
      q: "What is tonnage and does it matter?",
      a: "Tonnage is sets × reps × load summed across exercises. It tracks total mechanical work and is useful for comparing sessions of similar exercises — but a heavy deadlift session and a high-rep arm day aren't comparable by tonnage alone.",
    },
    {
      q: "Do sets for compound lifts count for every muscle involved?",
      a: "Common practice counts direct movers fully and secondary muscles as half, though conventions differ. This tool counts each entry toward the single muscle you assign it — keep your own convention consistent.",
    },
  ],
  related: ["double-progression-planner", "one-rep-max-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci 2017;35:1073–1082",
      url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
    },
    {
      label: "Baz-Valle E, et al. A systematic review of the effects of different resistance training volumes on muscle hypertrophy. J Hum Kinet 2022;81:199–210",
      url: "https://pubmed.ncbi.nlm.nih.gov/35291645/",
    },
  ],
};
