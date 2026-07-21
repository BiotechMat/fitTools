import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PLATE_DEFAULTS,
  PLATE_LIMITS,
  PLATE_SLUG,
} from "@/registry/configs/plate-calculator.shared";

export const plateInputsSchema = z.object({
  targetKg: z.number().min(PLATE_LIMITS.targetKg.min).max(PLATE_LIMITS.targetKg.max),
  barKg: z.union([z.literal(10), z.literal(15), z.literal(20)]),
});

export const plateConfig: ToolConfig = {
  slug: PLATE_SLUG,
  title: "Barbell Plate Calculator — Load the Bar Right",
  valueLine:
    "Work out exactly which plates to put on each side of the bar, with the nearest loadable weight when your target isn't possible.",
  metaDescription:
    "Free barbell plate calculator: enter a target weight and bar, edit your plate inventory, and get the per-side stack — plus the nearest achievable load when the exact weight can't be made.",
  hub: "strength",
  tier: 1,
  inputsSchema: plateInputsSchema,
  defaults: { ...PLATE_DEFAULTS },
  faq: [
    {
      q: "How do I calculate which plates to put on a barbell?",
      a: "Subtract the bar weight from your target, halve the remainder for the per-side load, then build that from the heaviest plates downwards. This calculator does exactly that, using only the plates you say your gym has.",
    },
    {
      q: "How much does a barbell weigh?",
      a: "A standard Olympic bar is 20 kg; common alternatives are 15 kg (frequently used as a women's competition bar) and 10 kg technique bars. Pick your bar in the calculator — it changes every answer.",
    },
    {
      q: "What if my target weight can't be loaded exactly?",
      a: "The tool shows the nearest weight your plates can actually make, whether just above or just below your target, and the stack to build it. When two loads are equally close it recommends the lighter one.",
    },
    {
      q: "Can I use this with pounds?",
      a: "The calculator works in kilograms, matching standard metric plate sets. Imperial plate inventories are planned alongside the site's wider imperial support.",
    },
  ],
  related: ["one-rep-max-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "IPF Technical Rules — standard competition plate denominations and bar weights",
      url: "https://www.powerlifting.sport/rules/codes/info/technical-rules",
    },
  ],
};
