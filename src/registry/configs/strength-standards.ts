import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  STANDARDS_DEFAULTS,
  STANDARDS_LIMITS,
  STANDARDS_SLUG,
} from "@/registry/configs/strength-standards.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const standardsInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  bodyweightKg: limit(STANDARDS_LIMITS.bodyweightKg),
  lift: z.enum(["backSquat", "benchPress", "deadlift"]),
  oneRepMaxKg: limit(STANDARDS_LIMITS.oneRepMaxKg),
});

export const standardsConfig: ToolConfig = {
  slug: STANDARDS_SLUG,
  title: "Strength Standards: How Strong Are You?",
  valueLine:
    "See where your squat, bench or deadlift sits on published strength standards for your sex and bodyweight.",
  metaDescription:
    "Free strength standards tool: classify your squat, bench press or deadlift from physically active to elite using Kilgore's published performance standards tables.",
  hub: "strength",
  tier: 2,
  inputsSchema: standardsInputsSchema,
  defaults: { ...STANDARDS_DEFAULTS },
  faq: [
    {
      q: "Where do these strength standards come from?",
      a: "From Lon Kilgore's published performance standards tables (2023), built from scientific data, drug-tested classic/raw competition results and decades of coaching observation. We use the kilogram tables for the 20 to 29 age band.",
    },
    {
      q: "What do the levels mean?",
      a: "They mark stages of training progression (physically active, beginner, intermediate, advanced and elite): reasonable expectations at each stage, not averages of the general population.",
    },
    {
      q: "I'm older or younger than 20 to 29: do these apply?",
      a: "Kilgore's full tables span ages 15 to 89 and expectations fall with age; this page anchors on the 20 to 29 band. Treat your classification as slightly conservative if you're well outside it, and see the source PDF for your exact band.",
    },
    {
      q: "Why does my classification differ from other sites?",
      a: "There is no single official standard, and different sites derive bands from different data. We cite our source and its derivation openly so you know exactly what you're being compared against.",
    },
  ],
  related: ["one-rep-max-calculator", "dots-calculator", "plate-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Kilgore L. Strength Standard Tables (© 2023, Kilgore Academy)",
      url: "https://lonkilgore.com/resources/Lon_Kilgore_Strength_Standard_Tables-Copyright-2023.pdf",
    },
    {
      label: "Kilgore L. Resources page (full tables, ages 15 to 89, further lifts)",
      url: "https://lonkilgore.com/resources/",
    },
  ],
};
