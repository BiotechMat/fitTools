import type { Hub } from "@/registry/types";

export interface HubMeta {
  hub: Hub;
  title: string;
  description: string;
  path: string;
}

export const hubMeta: Record<Hub, HubMeta> = {
  nutrition: {
    hub: "nutrition",
    title: "Nutrition",
    description:
      "Calculators for energy needs, macros and body composition — every formula cited to its published source.",
    path: "/nutrition",
  },
  strength: {
    hub: "strength",
    title: "Strength",
    description:
      "Training calculators: one-rep max, plate loading, progression planning and strength standards.",
    path: "/strength",
  },
  recovery: {
    hub: "recovery",
    title: "Recovery",
    description:
      "Sleep, heart-rate and recovery calculators grounded in published research.",
    path: "/recovery",
  },
};
