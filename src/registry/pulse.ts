/**
 * Pulse grounding corpus (PULSE.md §3). The vetted, sourced claims the Pulse
 * generator rephrases into fresh feed cards at runtime.
 *
 * This is NOT a bank of finished cards (PULSE.md §1.1): the served fact is
 * generated; each chunk exists to (a) keep the citation real — every `source`
 * here is copied verbatim from content already vetted elsewhere in this repo,
 * never model-invented and never guessed (CLAUDE.md) — and (b) carry the
 * cross-links into tools/content.
 *
 * Seed coverage note: the evergreen chunks are grounded in sources already
 * present in the repo (the cold-water and sauna recovery clusters, and the
 * ApoB/Lp(a) glossary entries), spanning training / recovery / mind / cardio /
 * longevity / physiology. The three fresh chunks (PULSE.md §15, `kind: "fresh"`)
 * are the F0 hand-authored recent-discovery seeds and extend coverage into
 * supplements and nutrition. Growing the corpus is the E5 content cadence
 * (PULSE.md §3.3) and each new chunk must bring its own primary source.
 *
 * Same single-source-of-truth pattern as the glossary / recovery / peptides
 * registries.
 */

import type { GroundingChunk } from "@/lib/pulse/types";
import { PULSE_CATEGORIES } from "@/lib/pulse/types";

export const PULSE_CORPUS_LAST_REVIEWED = "2026-07-22";

/** Real sources, copied verbatim from the vetted registries (do not edit URLs). */
const SRC = {
  cwiHypertrophy: {
    label:
      "Piñero A, et al. Throwing cold water on muscle growth: a systematic review with meta-analysis of post-exercise cold water immersion and resistance-training hypertrophy. Eur J Sport Sci 2024",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11235606/",
  },
  cwiWellbeing: {
    label: "Cold-water immersion on health and wellbeing: a systematic review and meta-analysis. PLOS One 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/",
  },
  saunaMortality: {
    label:
      "Laukkanen T, et al. Association between sauna bathing and fatal cardiovascular and all-cause mortality events. JAMA Intern Med 2015;175:542–548",
    url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
  },
  saunaReview: {
    label:
      "Laukkanen JA, Laukkanen T, Kunutsor SK. Cardiovascular and other health benefits of sauna bathing: a review of the evidence. Mayo Clin Proc 2018;93:1111–1121",
    url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
  },
  apob: {
    label:
      "American College of Cardiology. An Update on Lipoprotein(a) and ApoB, 2023 (context on ApoB in risk assessment)",
    url: "https://www.acc.org/Latest-in-Cardiology/Articles/2023/09/19/10/54/An-Update-on-Lipoprotein-a",
  },
  lpa: {
    label:
      "Koschinsky ML, et al. A focused update to the 2019 NLA scientific statement on use of lipoprotein(a) in clinical practice. J Clin Lipidol 2024",
    url: "https://www.lipidjournal.com/article/S1933-2874(24)00033-3/fulltext",
  },
} as const;

/**
 * Fresh-chunk sources (PULSE.md §15) — recent primary studies, each verified
 * against PubMed (the §15.2 discovery backbone): title, journal, DOI, sample
 * and population were read from the PubMed record / abstract, not from memory.
 * These are the F0 hand-authored seeds that prove the fresh-cards loop before
 * the ingestion pipeline exists (§15.7). `addedAt` on the chunk is the corpus
 * entry date, NOT the publication date — it drives the freshness decay.
 */
const FRESH_SRC = {
  creatineTiming: {
    label:
      "Acute Creatine Ingestion Before Resistance Training Enhances Strength Performance More than Ingestion During or After Training: A Randomized Crossover Pilot Trial. Nutrients 2026",
    url: "https://pubmed.ncbi.nlm.nih.gov/42280432/",
  },
  creatinePostmeno: {
    label:
      "Creatine monohydrate for lean mass, strength, and bone density in postmenopausal women: a systematic review and meta-analysis. J Int Soc Sports Nutr 2026",
    url: "https://pubmed.ncbi.nlm.nih.gov/42141930/",
  },
  proteinWomen: {
    label:
      "Effects of multi-ingredient protein supplementation combined with exercise on body composition and muscle fitness in healthy women: a systematic review with multilevel meta-analysis. Front Nutr 2025",
    url: "https://pubmed.ncbi.nlm.nih.gov/41256928/",
  },
} as const;

export const groundingChunks: GroundingChunk[] = [
  {
    id: "cwi-blunts-hypertrophy",
    claim:
      "Cold-water immersion done soon after resistance training can blunt muscle-growth (hypertrophy) adaptations, so it is best kept away from sessions where building muscle is the goal.",
    category: "training",
    tags: ["cold-water", "recovery", "hypertrophy"],
    tier: "well-supported",
    basis: "human",
    source: SRC.cwiHypertrophy,
    relatedContent: "/recovery/cold-water-immersion",
  },
  {
    id: "cwi-no-single-temperature",
    claim:
      "There is no single evidence-based prescription for cold plunge temperature or duration; colder and longer is not automatically better, and starting conservatively is the sensible approach.",
    category: "recovery",
    tags: ["cold-water", "protocol"],
    tier: "preliminary",
    basis: "human",
    source: SRC.cwiWellbeing,
    relatedContent: "/recovery/cold-water-immersion",
  },
  {
    id: "cwi-wellbeing-preliminary",
    claim:
      "Evidence that cold-water immersion improves mood and general wellbeing is still preliminary — promising but far weaker than the marketing around ice baths implies.",
    category: "mind",
    tags: ["cold-water", "mood", "wellbeing"],
    tier: "preliminary",
    basis: "human",
    source: SRC.cwiWellbeing,
    relatedContent: "/recovery/cold-water-immersion",
  },
  {
    id: "sauna-cv-mortality",
    claim:
      "In large Finnish cohort studies, frequent sauna use (around 4–7 sessions a week) is associated with substantially lower cardiovascular and all-cause mortality — a strong association, though observational rather than proven cause.",
    category: "longevity",
    tags: ["sauna", "cardiovascular", "mortality"],
    tier: "well-supported",
    basis: "human",
    source: SRC.saunaMortality,
    relatedContent: "/recovery/sauna-therapy",
  },
  {
    id: "sauna-blood-pressure",
    claim:
      "Beyond the observational mortality data, randomised trials show sauna bathing produces acute reductions in blood pressure.",
    category: "cardio",
    tags: ["sauna", "blood-pressure"],
    tier: "well-supported",
    basis: "human",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
  },
  {
    id: "sauna-infrared-not-equivalent",
    claim:
      "The strong cardiovascular and mortality evidence comes from traditional Finnish saunas; infrared saunas have a smaller research base, so those findings should not be assumed to transfer directly.",
    category: "recovery",
    tags: ["sauna", "infrared"],
    tier: "preliminary",
    basis: "human",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
  },
  {
    id: "sauna-not-detox",
    claim:
      "Sauna 'detox' claims are marketing — the liver and kidneys handle that — and the weight lost in a session is water that returns on rehydration; the credible benefits are cardiovascular and relaxation-related.",
    category: "recovery",
    tags: ["sauna", "myth", "detox"],
    tier: "marketing-claim",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
  },
  {
    id: "apob-counts-particles",
    claim:
      "ApoB counts the number of atherogenic (potentially artery-clogging) particles in your blood directly, because there is one ApoB molecule per particle — which can make it a more precise cardiovascular-risk marker than standard LDL cholesterol alone.",
    category: "physiology",
    tags: ["apob", "cardiovascular", "biomarker"],
    tier: "well-supported",
    basis: "human",
    source: SRC.apob,
    relatedContent: "/glossary/apob",
    relatedTool: "/heart-age-calculator",
  },
  {
    id: "lpa-mostly-genetic",
    claim:
      "Lipoprotein(a) is roughly 80–90% genetically determined and stays fairly stable through life, so a single measurement can flag lifelong elevated cardiovascular risk that standard cholesterol testing misses.",
    category: "longevity",
    tags: ["lp-a", "genetics", "cardiovascular"],
    tier: "well-supported",
    basis: "human",
    source: SRC.lpa,
    relatedContent: "/glossary/lp-a",
    relatedTool: "/heart-age-calculator",
  },

  // ── Fresh cards (PULSE.md §15) — recent-discovery seeds, F0 hand-authored ──
  {
    id: "fresh-creatine-timing-pre-workout",
    claim:
      "A small pilot trial suggests that taking creatine just before a resistance-training session may support slightly greater same-day strength than taking it during or after — early, exploratory evidence rather than a firm recommendation.",
    category: "supplements",
    tags: ["creatine", "timing", "strength"],
    tier: "preliminary",
    basis: "human",
    source: FRESH_SRC.creatineTiming,
    relatedContent: "/supplements/creatine-monohydrate",
    kind: "fresh",
    addedAt: "2026-07-23",
    caveat:
      "A pilot crossover trial in just 11 active men, measuring single-session strength; the authors call it exploratory and say it needs confirming in larger, placebo-controlled studies.",
    study: {
      doi: "10.3390/nu18111789",
      journal: "Nutrients",
      design: "Pilot RCT (crossover)",
      n: 11,
      population: "physically active men",
    },
  },
  {
    id: "fresh-creatine-postmenopausal-muscle",
    claim:
      "A 2026 meta-analysis in postmenopausal women found that creatine (around 5 g a day) alongside resistance training produced small but real gains in lean mass and leg strength, with no change in bone density and no safety signals.",
    category: "longevity",
    tags: ["creatine", "menopause", "strength", "ageing"],
    tier: "well-supported",
    basis: "human",
    source: FRESH_SRC.creatinePostmeno,
    relatedContent: "/supplements/creatine-monohydrate",
    kind: "fresh",
    addedAt: "2026-07-23",
    caveat:
      "Pooled from seven trials (608 women, median 38 weeks). Gains were modest — about 0.4 kg lean mass — and appeared mainly at ≥5 g a day with training; several trials had some risk-of-bias concerns, and bone density did not move.",
    study: {
      doi: "10.1080/15502783.2026.2668435",
      journal: "J Int Soc Sports Nutr",
      design: "Meta-analysis (7 RCTs)",
      n: 608,
      population: "postmenopausal women",
    },
  },
  {
    id: "fresh-protein-supplement-women-body-comp",
    claim:
      "In a 2025 meta-analysis of nine trials in women, pairing a protein supplement with exercise gave small but significant gains in fat-free mass, muscle size and strength — but made no difference to fat mass or body-fat percentage.",
    category: "nutrition",
    tags: ["protein", "body-composition", "women"],
    tier: "preliminary",
    basis: "human",
    source: FRESH_SRC.proteinWomen,
    relatedContent: "/supplements/whey-protein",
    kind: "fresh",
    addedAt: "2026-07-23",
    caveat:
      "Nine trials, 408 women aged 18–73. Muscle effects were small (about 0.45 kg fat-free mass) and there was no effect on fat loss; the authors call for more high-quality trials.",
    study: {
      doi: "10.3389/fnut.2025.1678433",
      journal: "Front Nutr",
      design: "Meta-analysis (9 RCTs)",
      n: 408,
      population: "healthy women 18–73",
    },
  },
];

/**
 * Structural validation of the corpus (PULSE.md §3.2). Runs as a unit test.
 * Returns the list of problems; empty means valid. Deep cross-link existence is
 * enforced by the individual registries; here we assert the invariants Pulse
 * itself owns — unique ids, a real source on every chunk, valid category, and
 * well-formed internal routes.
 */
export function validateCorpus(chunks: GroundingChunk[] = groundingChunks): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const dois = new Set<string>();
  for (const c of chunks) {
    if (seen.has(c.id)) problems.push(`duplicate chunk id: ${c.id}`);
    seen.add(c.id);
    if (!c.claim.trim()) problems.push(`${c.id}: empty claim`);
    if (!c.source?.url?.trim()) problems.push(`${c.id}: missing source url`);
    if (!c.source?.label?.trim()) problems.push(`${c.id}: missing source label`);
    if (!(PULSE_CATEGORIES as readonly string[]).includes(c.category)) {
      problems.push(`${c.id}: invalid category ${c.category}`);
    }
    if (c.relatedTool && !c.relatedTool.startsWith("/")) {
      problems.push(`${c.id}: relatedTool must be an absolute route`);
    }
    if (c.relatedContent && !c.relatedContent.startsWith("/")) {
      problems.push(`${c.id}: relatedContent must be an absolute route`);
    }

    // Fresh-chunk invariants (PULSE.md §15.4): a recent-discovery card must
    // carry its honesty line and its added-date, so it can never be dressed up
    // as settled science or escape the freshness decay.
    if (c.kind === "fresh") {
      if (!c.caveat?.trim()) problems.push(`${c.id}: fresh chunk missing caveat`);
      if (!c.addedAt || !/^\d{4}-\d{2}-\d{2}$/.test(c.addedAt)) {
        problems.push(`${c.id}: fresh chunk needs addedAt as YYYY-MM-DD`);
      } else if (Number.isNaN(Date.parse(c.addedAt))) {
        problems.push(`${c.id}: fresh chunk has an unparseable addedAt`);
      }
      // Preprints must say so (§15.4): a bioRxiv/medRxiv source without a
      // "preprint" design would read as peer-reviewed when it is not.
      const isPreprintUrl = /biorxiv\.org|medrxiv\.org/i.test(c.source?.url ?? "");
      if (isPreprintUrl && !/preprint/i.test(c.study?.design ?? "")) {
        problems.push(`${c.id}: preprint source must set study.design to note "preprint"`);
      }
    } else if (c.caveat || c.study || c.addedAt) {
      // Evergreen chunks don't carry fresh-only framing — catch mis-tagging.
      if (c.kind === undefined && (c.caveat || c.study)) {
        problems.push(`${c.id}: caveat/study set but kind is not "fresh"`);
      }
    }

    // DOIs are unique across the corpus (§15.4) — the same study covered by
    // several outlets must yield one chunk, not many.
    if (c.study?.doi) {
      const doi = c.study.doi.toLowerCase();
      if (dois.has(doi)) problems.push(`${c.id}: duplicate study.doi ${c.study.doi}`);
      dois.add(doi);
    }
  }
  return problems;
}

export const chunksById: ReadonlyMap<string, GroundingChunk> = new Map(
  groundingChunks.map((c) => [c.id, c]),
);
