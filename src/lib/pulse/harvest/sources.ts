/**
 * Pulse harvest — discovery sources & allowlist (PULSE.md §15.2).
 *
 * The backbone is PubMed E-utilities (free JSON API, one saved query per Pulse
 * category). A secondary web-search channel may add candidates, but ANY
 * candidate whose final URL host isn't on the allowlist is dropped — so open-web
 * noise (tabloid health desks, supplement-brand PR) can never reach a card.
 * Changing the allowlist is itself a reviewed change (this file is in the PR).
 */

import type { PulseCategory } from "../types.ts";

export const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

/**
 * Allowlisted host suffixes (§15.2). A candidate URL is accepted iff its host
 * ends with one of these. Kept deliberately tight: primary literature, the big
 * indexes, and reputable journal/press domains. Preprint servers are allowed
 * but their chunks must be labelled "preprint" in study.design (§15.4, enforced
 * by validateCorpus).
 */
export const HARVEST_ALLOWLIST: readonly string[] = [
  // Primary indexes / full text
  "pubmed.ncbi.nlm.nih.gov",
  "pmc.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "doi.org",
  // Major journals & publishers
  "nature.com",
  "science.org",
  "cell.com",
  "thelancet.com",
  "jamanetwork.com",
  "nejm.org",
  "bmj.com",
  "acpjournals.org",
  "ahajournals.org",
  "physiology.org",
  "mdpi.com",
  "frontiersin.org",
  "springer.com",
  "wiley.com",
  "tandfonline.com",
  "sciencedirect.com",
  "oup.com",
  "plos.org",
  // Preprint servers (must be labelled preprint — §15.4)
  "medrxiv.org",
  "biorxiv.org",
] as const;

/**
 * One PubMed esearch query per Pulse category (§15.2). Biased toward
 * higher-evidence designs (RCTs, meta-analyses) so the feed leans on the
 * sturdiest new work; the reviewer can still down-tier at the PR gate.
 */
export const PUBMED_QUERIES: readonly { category: PulseCategory; term: string }[] = [
  {
    category: "training",
    term: "(resistance training OR strength training OR hypertrophy) AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "cardio",
    term: "(aerobic exercise OR cardiorespiratory fitness OR VO2max) AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "nutrition",
    term: "(protein intake OR dietary pattern OR nutrition) AND exercise AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "supplements",
    term: "(creatine OR caffeine OR omega-3 OR vitamin D OR dietary supplement) AND exercise AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "recovery",
    term: "(sauna OR cold water immersion OR massage OR foam rolling OR recovery) AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "sleep",
    term: "(sleep quality OR sleep extension OR sleep hygiene) AND (exercise OR health) AND (randomized controlled trial OR meta-analysis)",
  },
  {
    category: "longevity",
    term: "(all-cause mortality OR healthspan OR biological ageing) AND (physical activity OR exercise) AND (cohort OR meta-analysis)",
  },
  {
    category: "physiology",
    term: "(cardiometabolic OR biomarker OR ApoB OR VO2) AND (exercise OR fitness) AND (randomized controlled trial OR cohort)",
  },
  {
    category: "mind",
    term: "(exercise OR physical activity) AND (depression OR anxiety OR cognition OR mood) AND (randomized controlled trial OR meta-analysis)",
  },
] as const;

/**
 * Mirror of the app's `PulseCategory` union as a plain value list. The runner
 * must stay alias-free (see types.ts), so we can't value-import PULSE_CATEGORIES;
 * the harvest unit test asserts this list equals the app's to catch any drift.
 */
export const HARVEST_CATEGORIES: readonly PulseCategory[] = [
  "training",
  "nutrition",
  "recovery",
  "sleep",
  "physiology",
  "supplements",
  "longevity",
  "cardio",
  "mind",
] as const;
