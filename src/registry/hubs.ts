import type { Hub } from "@/registry/types";

export interface HubMeta {
  hub: Hub;
  title: string;
  description: string;
  path: string;
}

/**
 * Topic sections (SPEC §4; restructured 2026-07-23). Each section page leads
 * with its calculators and carries further content of its domain — food
 * reference under Nutrition, the exercise library under Workout, the
 * recovery guides under Recovery. The `strength` hub key is retained by the
 * tool configs; only its public face is "Workout".
 */
export const hubMeta: Record<Hub, HubMeta> = {
  nutrition: {
    hub: "nutrition",
    title: "Nutrition",
    description:
      "Calculators for energy needs, macros and body composition, plus quick food-reference tables, with every formula cited to its published source.",
    path: "/nutrition",
  },
  strength: {
    hub: "strength",
    title: "Workout",
    description:
      "Training calculators for one-rep max, plate loading, progression planning and strength standards, plus the exercise library.",
    path: "/workout",
  },
  recovery: {
    hub: "recovery",
    title: "Recovery",
    description:
      "Sleep, heart-rate and recovery calculators grounded in published research, plus evidence-tiered guides to recovery practices.",
    path: "/recovery",
  },
};
