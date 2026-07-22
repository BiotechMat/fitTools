/**
 * Reference tables & charts (CONTENT-reference.md §7). Static "look it up"
 * tables that complement — not duplicate — the interactive calculators, each
 * generated from the SAME formula module the calculator uses (so the numbers
 * always agree) and linking to its calculator counterpart (§8).
 */

import type { FaqEntry, Source } from "@/registry/types";

export type ReferenceView = "hr-zones" | "protein-targets" | "plate-loading";

export interface ReferenceTablePage {
  slug: string;
  title: string;
  short: string;
  intro: string;
  howToRead: string;
  view: ReferenceView;
  relatedTools: string[];
  sources: Source[];
  faq: FaqEntry[];
}

export const REFERENCE_TABLES_LAST_REVIEWED = "2026-07-22";

export const referenceTablePages: ReferenceTablePage[] = [
  {
    slug: "heart-rate-zones-by-age",
    title: "Heart Rate Zones by Age",
    short: "The five training heart-rate zones in beats per minute, by age.",
    intro:
      "Your training heart-rate zones fall as your maximum heart rate declines with age. This chart lists the five zones in beats per minute for each age, using the Tanaka estimate of maximum heart rate (208 − 0.7 × age).",
    howToRead:
      "Find your age, read across for each zone's beats-per-minute range. Zone 2 is the comfortable, conversational aerobic band most endurance work should live in; zones 4–5 are hard intervals. For a personalised version that can also use your resting heart rate (the Karvonen method), use the calculator.",
    view: "hr-zones",
    relatedTools: ["heart-rate-zone-calculator"],
    sources: [
      {
        label:
          "Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol 2001;37:153–156",
        url: "https://www.jacc.org/doi/10.1016/S0735-1097%2800%2901054-8",
      },
    ],
    faq: [
      {
        q: "Which max-heart-rate formula is this?",
        a: "The Tanaka equation (208 − 0.7 × age), which is more accurate across ages than the older 220 − age rule of thumb. Individual maximums still vary, so treat the numbers as a starting guide.",
      },
      {
        q: "How do I use resting heart rate?",
        a: "Factoring in resting heart rate (the Karvonen or heart-rate-reserve method) personalises the zones. This static chart uses percentage of maximum heart rate; the calculator can do both.",
      },
    ],
  },
  {
    slug: "protein-targets-by-bodyweight",
    title: "Daily Protein Targets by Bodyweight",
    short: "How much protein per day at 1.6, 1.8 and 2.2 g per kg, by bodyweight.",
    intro:
      "For building or keeping muscle, roughly 1.6–2.2 g of protein per kg of bodyweight per day is well supported. This chart gives the daily grams at the low, middle and high end of that range for a range of bodyweights.",
    howToRead:
      "Find your bodyweight and read across. 1.6 g/kg is a sensible floor for active people; the higher end (2.2 g/kg) suits a muscle-building phase or a calorie deficit, where more protein helps preserve muscle. Spread it across the day, but total daily intake matters most.",
    view: "protein-targets",
    relatedTools: ["macro-calculator", "tdee-calculator"],
    sources: [
      {
        label:
          "Jäger R, et al. ISSN position stand: protein and exercise. J Int Soc Sports Nutr 2017;14:20",
        url: "https://doi.org/10.1186/s12970-017-0177-8",
      },
    ],
    faq: [
      {
        q: "Is more protein always better?",
        a: "No. Beyond roughly 2.2 g per kg there's little added benefit for muscle for most people. The range here covers the useful span; go higher only for specific reasons and not at the expense of overall diet quality.",
      },
    ],
  },
  {
    slug: "plate-loading-chart",
    title: "Barbell Plate Loading Chart",
    short: "What plates to put on each side of a 20 kg barbell for common loads.",
    intro:
      "A quick chart of how to load a standard 20 kg Olympic barbell to common total weights — the plates you put on each side. It saves the mental arithmetic mid-session.",
    howToRead:
      "Find the total weight (including the 20 kg bar) and load the listed plates on each side. For odd totals, non-standard bars or a limited plate rack, the plate calculator works out the exact nearest loadable weight.",
    view: "plate-loading",
    relatedTools: ["plate-calculator", "one-rep-max-calculator"],
    sources: [],
    faq: [
      {
        q: "Does this include the bar?",
        a: "Yes — totals include a standard 20 kg (44 lb) Olympic barbell. Subtract the bar and halve the remainder to get the load per side, which is what the chart shows.",
      },
    ],
  },
];

export const referenceTablesBySlug: ReadonlyMap<string, ReferenceTablePage> = new Map(
  referenceTablePages.map((p) => [p.slug, p]),
);

export function getReferenceTablePage(slug: string): ReferenceTablePage | undefined {
  return referenceTablesBySlug.get(slug);
}
