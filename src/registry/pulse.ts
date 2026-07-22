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
 * Seed coverage note: this initial corpus is grounded only in sources already
 * present in the repo (the cold-water and sauna recovery clusters, and the
 * ApoB/Lp(a) glossary entries), so it currently spans recovery / cardio /
 * longevity / physiology. Growing it into the other categories is the E5 content
 * cadence (PULSE.md §3.3) and each new chunk must bring its own primary source.
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
  }
  return problems;
}

export const chunksById: ReadonlyMap<string, GroundingChunk> = new Map(
  groundingChunks.map((c) => [c.id, c]),
);
