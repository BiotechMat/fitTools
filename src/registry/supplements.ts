/**
 * Supplement database (CONTENT-reference.md §4). Non-promotional,
 * evidence-tiered, cited reference pages — the same honest house style as the
 * peptides section, applied to the crowded supplement space. These are the
 * NEUTRAL evidence pages; any commercial "best X" pages live separately
 * (CONTENT.md §4) and are not built here.
 *
 * Single source of truth: drives routing, the /supplements hub, sitemap,
 * JSON-LD and the reciprocal cross-links to calculators and glossary terms.
 */

import type { FaqEntry, Source } from "@/registry/types";
import type { EvidenceBasis, EvidenceTier } from "@/registry/peptides";

export interface SupplementEntry {
  slug: string;
  name: string;
  aka?: string[];
  /** Headline evidence for the supplement's main fitness claim. */
  headlineTier: EvidenceTier;
  headlineBasis: EvidenceBasis;
  /** One-line identity, for the hub list and meta description. */
  short: string;
  metaDescription: string;
  /** Rendered as a SafetyCallout when present (§4.6). */
  safety?: { title: string; points: string[] };
  relatedSupplements: string[];
  relatedTools: string[];
  faq: FaqEntry[];
  sources: Source[];
}

export const SUPPLEMENTS_LAST_REVIEWED = "2026-07-22";

const ISSN_CREATINE =
  "https://doi.org/10.1186/s12970-017-0173-z";
const ISSN_PROTEIN =
  "https://doi.org/10.1186/s12970-017-0177-8";
const ISSN_CAFFEINE =
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7777221/";
const ISSN_BETA_ALANINE =
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4501114/";

export const supplements: SupplementEntry[] = [
  {
    slug: "creatine-monohydrate",
    name: "Creatine monohydrate",
    aka: ["Creatine"],
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "The most-researched, best-evidenced supplement for strength and muscle.",
    metaDescription:
      "Creatine monohydrate, honestly reviewed: what it is, the strong human evidence for strength and muscle, who it suits, practical notes and safety — with primary sources.",    relatedSupplements: ["whey-protein", "beta-alanine"],
    relatedTools: ["creatine-calculator", "training-volume-calculator"],
    faq: [
      {
        q: "Does creatine actually work?",
        a: "Yes — it is the most robustly supported sports supplement there is. A large body of human trials and the ISSN position stand conclude creatine monohydrate reliably improves high-intensity performance and, with training, gains in strength and lean mass.",
      },
      {
        q: "Do I need to load creatine?",
        a: "No. Loading (a higher dose for ~5–7 days) simply fills muscle stores faster. Taking a standard daily amount reaches the same saturation within a few weeks, with less chance of stomach upset.",
      },
      {
        q: "Is creatine safe?",
        a: "In healthy people it has one of the strongest safety records of any supplement across decades of study. It draws a little water into muscle, so early weight can rise slightly. Anyone with kidney disease should check with their doctor first.",
      },
      {
        q: "Which form is best?",
        a: "Plain creatine monohydrate. The fancier, pricier forms have not been shown to beat it, and it is the form nearly all the research used.",
      },
    ],
    sources: [
      {
        label:
          "Kreider RB, et al. ISSN position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr 2017;14:18",
        url: ISSN_CREATINE,
      },
    ],
  },
  {
    slug: "whey-protein",
    name: "Whey protein",
    aka: ["Protein powder"],
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "A convenient protein source that supports muscle when your total intake falls short.",
    metaDescription:
      "Whey and protein powder, evidence-first: what it is, the well-established role of total protein in muscle growth, who actually benefits, practical notes and the ISSN position stand.",    relatedSupplements: ["creatine-monohydrate", "caffeine"],
    relatedTools: ["macro-calculator", "tdee-calculator"],
    faq: [
      {
        q: "Do I need protein powder?",
        a: "Not necessarily. What matters for muscle is hitting your daily protein target; powder is simply a convenient, cost-effective way to do that if whole foods leave you short. If you already reach your target from food, it adds little.",
      },
      {
        q: "How much protein do I need?",
        a: "For people training for muscle, roughly 1.6–2.2 g per kg of bodyweight per day is a well-supported range. Spreading it across meals is sensible, but total daily intake is the main driver.",
      },
      {
        q: "Whey or plant protein?",
        a: "Both work. Whey is a complete, rapidly-digested protein with plenty of leucine; good plant blends (e.g. pea and rice) can match it when total protein and leucine are adequate.",
      },
      {
        q: "Is whey just for building muscle?",
        a: "Its main evidence-based role is helping you reach protein targets, which supports muscle retention and growth. It is a food, not a magic powder — the benefit comes from the protein, not the brand.",
      },
    ],
    sources: [
      {
        label:
          "Jäger R, et al. ISSN position stand: protein and exercise. J Int Soc Sports Nutr 2017;14:20",
        url: ISSN_PROTEIN,
      },
    ],
  },
  {
    slug: "caffeine",
    name: "Caffeine",
    headlineTier: "well-supported",
    headlineBasis: "human",
    short: "A genuinely effective, well-studied performance and focus aid.",
    metaDescription:
      "Caffeine for performance, evidence-first: the strong human data for endurance and some strength, timing and dose context, tolerance, and safety — with the ISSN position stand.",
    safety: {
      title: "Safety — caffeine",
      points: [
        "High intakes cause jitters, raised heart rate, anxiety, gut upset and disrupted sleep; its long half-life (~5 h) means afternoon doses linger.",
        "People who are pregnant, or who have heart-rhythm, blood-pressure or anxiety conditions, should be cautious and seek medical advice.",
        "Concentrated caffeine powders are easy to overdose dangerously — measure by scale, never by scoop.",
      ],
    },
    relatedSupplements: ["beta-alanine", "citrulline-malate"],
    relatedTools: ["caffeine-calculator"],
    faq: [
      {
        q: "Does caffeine improve performance?",
        a: "Yes. It is one of the few supplements with strong, consistent evidence, especially for endurance, and with useful effects on strength-endurance, alertness and perceived effort. The ISSN position stand rates it clearly ergogenic.",
      },
      {
        q: "When should I take it before training?",
        a: "Effects typically build over 30–60 minutes and it has a long half-life (around 5 hours), so late-day doses can disrupt sleep. Our caffeine calculator estimates how much is left in your system over time.",
      },
      {
        q: "Does tolerance build up?",
        a: "Regular users adapt somewhat, and habitual intake blunts the acute kick. Some people cycle it or keep training doses separate from daily coffee, though the performance benefit persists for most.",
      },
      {
        q: "How much is too much?",
        a: "Performance doses are individual and lower than many assume. High intakes cause jitters, raised heart rate, anxiety and poor sleep. People who are pregnant, or who have heart rhythm or blood-pressure conditions, should be especially cautious and seek medical advice.",
      },
    ],
    sources: [
      {
        label:
          "Guest NS, et al. ISSN position stand: caffeine and exercise performance. J Int Soc Sports Nutr 2021;18:1",
        url: ISSN_CAFFEINE,
      },
    ],
  },
  {
    slug: "beta-alanine",
    name: "Beta-alanine",
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "Modestly boosts high-intensity efforts lasting roughly one to four minutes.",
    metaDescription:
      "Beta-alanine, honestly reviewed: how it raises muscle carnosine, the specific efforts it helps (and doesn't), the harmless tingle, practical notes and the ISSN position stand.",    relatedSupplements: ["creatine-monohydrate", "caffeine"],
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "What does beta-alanine do?",
        a: "It raises muscle carnosine, which buffers the acid build-up that limits sustained high-intensity effort. The ISSN position stand supports a small but real benefit for exercise lasting roughly 1–4 minutes.",
      },
      {
        q: "Why does it make me tingle?",
        a: "That harmless skin tingle (paraesthesia) is a well-known, temporary effect of larger single doses. Splitting the daily amount into smaller doses reduces it. It is not a sign of it 'working'.",
      },
      {
        q: "Will it help my one-rep max?",
        a: "Probably not much. Its benefit is specific to sustained high-intensity efforts, not single maximal lifts or long steady endurance, so keep expectations matched to that window.",
      },
      {
        q: "How long until it works?",
        a: "It works by gradually loading muscle carnosine over several weeks of consistent daily use — it is not an acute pre-workout effect, so timing around a session doesn't matter.",
      },
    ],
    sources: [
      {
        label:
          "Trexler ET, et al. ISSN position stand: Beta-Alanine. J Int Soc Sports Nutr 2015;12:30",
        url: ISSN_BETA_ALANINE,
      },
    ],
  },
  {
    slug: "citrulline-malate",
    name: "Citrulline malate",
    aka: ["L-citrulline"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A popular pump ingredient with some, but inconsistent, performance evidence.",
    metaDescription:
      "Citrulline malate, evidence-first: the nitric-oxide/pump rationale, the mixed human data on training volume and soreness, who it may suit, and practical notes.",    relatedSupplements: ["caffeine", "beta-alanine"],
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Does citrulline malate work?",
        a: "The evidence is promising but inconsistent. Some trials show a few extra reps or reduced soreness; others show nothing. It is a reasonable 'might help a little' ingredient, not a proven performance booster.",
      },
      {
        q: "What is the 'pump'?",
        a: "Citrulline raises nitric oxide, which can increase blood flow and the transient muscle 'pump'. The pump itself is largely cosmetic and short-lived; whether it drives extra growth is unproven.",
      },
      {
        q: "Citrulline or arginine?",
        a: "Citrulline actually raises blood arginine more effectively than supplementing arginine directly, because of how each is absorbed — which is why citrulline is the more common choice.",
      },
      {
        q: "Is it the same as what's in pre-workouts?",
        a: "It is one of the more credible pre-workout ingredients, though products vary widely in dose. Many under-dose it relative to the amounts used in studies.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: citrulline / citrulline malate and resistance-exercise performance (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=citrulline+malate+resistance+exercise+performance",
      },
    ],
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    aka: ["Withania somnifera"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "An adaptogen with early human data for stress and, more tentatively, strength.",
    metaDescription:
      "Ashwagandha, honestly reviewed: the preliminary human evidence for stress, sleep and strength, the small-study caveats, who should be cautious, and safety.",
    safety: {
      title: "Safety — ashwagandha",
      points: [
        "Avoid if pregnant or breastfeeding. Caution with thyroid conditions, autoimmune disease, or sedative and thyroid medications — it can interact.",
        "There are rare reports of liver injury; stop and seek medical advice if you notice jaundice, dark urine or abdominal pain.",
        "As a herbal product, purity and dose vary between brands; this is educational information, not a recommendation to take it.",
      ],
    },
    relatedSupplements: [],
    relatedTools: ["recovery-readiness-index"],
    faq: [
      {
        q: "Does ashwagandha reduce stress?",
        a: "Several small randomised trials report reductions in stress and cortisol, which is the most-studied claim. The trials are small and often industry-funded, so treat it as promising rather than proven.",
      },
      {
        q: "Does it build muscle or strength?",
        a: "A few small studies suggest modest gains in strength and recovery alongside training, but the evidence base is thin and not yet convincing on its own. It is not in the league of creatine.",
      },
      {
        q: "Who should avoid it?",
        a: "People who are pregnant, have thyroid conditions or autoimmune disease, or take sedatives or thyroid medication should be cautious and seek medical advice — there are rare reports of liver issues too.",
      },
      {
        q: "How long to see effects?",
        a: "Most stress studies ran for around 8 weeks of daily use, so any effect builds over time rather than acutely.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: Withania somnifera (ashwagandha) — randomised trials on stress, sleep and strength",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=ashwagandha+randomized+controlled+trial+stress+OR+strength",
      },
    ],
  },
];

export const supplementsBySlug: ReadonlyMap<string, SupplementEntry> = new Map(
  supplements.map((s) => [s.slug, s]),
);

export function getSupplement(slug: string): SupplementEntry | undefined {
  return supplementsBySlug.get(slug);
}

/** Tier ordering for the hub — lead with the strongest evidence (§4). */
const TIER_ORDER: Record<EvidenceTier, number> = {
  "well-supported": 0,
  preliminary: 1,
  "marketing-claim": 2,
};

export function supplementsByTier(): [EvidenceTier, SupplementEntry[]][] {
  const tiers: EvidenceTier[] = ["well-supported", "preliminary", "marketing-claim"];
  return tiers
    .map((tier): [EvidenceTier, SupplementEntry[]] => [
      tier,
      supplements
        .filter((s) => s.headlineTier === tier)
        .sort((a, b) => a.name.localeCompare(b.name, "en-GB")),
    ])
    .filter(([, list]) => list.length > 0)
    .sort(([a], [b]) => TIER_ORDER[a] - TIER_ORDER[b]);
}

export function resolveRelatedSupplements(slugs: string[]): SupplementEntry[] {
  return slugs.flatMap((slug) => {
    const s = supplementsBySlug.get(slug);
    return s ? [s] : [];
  });
}
