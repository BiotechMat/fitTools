/**
 * Daily ritual games registry (DAILY-GAMES.md §4). The hand-authored,
 * primary-sourced items for Ballpark (guess-the-stat) and Myth or Fact.
 *
 * Sourcing discipline (CLAUDE.md; mirrors the Pulse corpus): every `answer`,
 * bound and verdict is a figure the cited source directly supports, and every
 * `source` is copied verbatim from content already vetted elsewhere in this
 * repo (the recovery clusters, glossary, reference tables and tool configs) —
 * never guessed, never model-invented. The one number computed rather than
 * quoted (Tanaka max-HR at a stated age) is derived from the cited formula and
 * noted as such.
 *
 * Same single-source-of-truth pattern as the tools / glossary / pulse
 * registries: this drives the schedule, the archive pages, sitemap and
 * JSON-LD.
 */

import type { BallparkItem, MythItem } from "@/lib/daily/types";

export const DAILY_REGISTRY_LAST_REVIEWED = "2026-07-23";

/** Real sources, copied verbatim from the vetted registries (do not edit URLs). */
const SRC = {
  caffeineIOM: {
    label:
      "Institute of Medicine. Caffeine for the Sustainment of Mental Task Performance (2001), covering pharmacokinetics and the ~5 h average half-life",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK223808/",
  },
  caffeineEFSA: {
    label:
      "EFSA Panel on Dietetic Products. Scientific Opinion on the safety of caffeine. EFSA Journal 2015;13(5):4102",
    url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4102",
  },
  waterEFSA: {
    label:
      "EFSA Panel on Dietetic Products. Scientific Opinion on Dietary Reference Values for water. EFSA Journal 2010;8(3):1459",
    url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1459",
  },
  sleepIOM: {
    label:
      "Institute of Medicine. Sleep Disorders and Sleep Deprivation, Sleep Physiology (NREM-REM cycle length 70 to 120 minutes)",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK19956/",
  },
  sleepNSF: {
    label:
      "Hirshkowitz M, et al. National Sleep Foundation's sleep time duration recommendations. Sleep Health 2015;1:40-43",
    url: "https://pubmed.ncbi.nlm.nih.gov/29073412/",
  },
  tanaka: {
    label:
      "Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol 2001;37:153-156",
    url: "https://www.jacc.org/doi/10.1016/S0735-1097%2800%2901054-8",
  },
  proteinISSN: {
    label: "Jäger R, et al. ISSN position stand: protein and exercise. J Int Soc Sports Nutr 2017;14:20",
    url: "https://doi.org/10.1186/s12970-017-0177-8",
  },
  creatineISSN: {
    label:
      "Kreider RB, et al. ISSN position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr 2017;14:18",
    url: "https://pubmed.ncbi.nlm.nih.gov/28615996/",
  },
  saunaMortality: {
    label:
      "Laukkanen T, et al. Association between sauna bathing and fatal cardiovascular and all-cause mortality events. JAMA Intern Med 2015;175:542-548",
    url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
  },
  saunaReview: {
    label:
      "Laukkanen JA, Laukkanen T, Kunutsor SK. Cardiovascular and other health benefits of sauna bathing: a review of the evidence. Mayo Clin Proc 2018;93:1111-1121",
    url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
  },
  cwiHypertrophy: {
    label:
      "Piñero A, et al. Throwing cold water on muscle growth: a systematic review with meta-analysis of post-exercise cold water immersion and resistance-training hypertrophy. Eur J Sport Sci 2024",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11235606/",
  },
  cwiWellbeing: {
    label: "Cold-water immersion on health and wellbeing: a systematic review and meta-analysis. PLOS One 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/",
  },
  lpa: {
    label:
      "Koschinsky ML, et al. A focused update to the 2019 NLA scientific statement on use of lipoprotein(a) in clinical practice. J Clin Lipidol 2024",
    url: "https://www.lipidjournal.com/article/S1933-2874(24)00033-3/fulltext",
  },
  steps: {
    label: "Compendium of Physical Activities, walking MET values",
    url: "https://pacompendium.com/walking/",
  },
} as const;

export const ballparkItems: BallparkItem[] = [
  {
    id: "caffeine-half-life",
    question: "On average, how many hours does it take for the caffeine in a coffee to drop to half?",
    answer: 5,
    unit: "hours",
    sliderMin: 1,
    sliderMax: 12,
    context:
      "Caffeine's average half-life is about five hours, so a 2 pm coffee still leaves a meaningful dose at bedtime, though genetics swing this from under two to over nine hours.",
    tier: "well-supported",
    basis: "human",
    source: SRC.caffeineIOM,
    relatedTool: "/caffeine-calculator",
    relatedContent: "/glossary/hrv",
    lastReviewed: "2026-07-23",
  },
  {
    id: "caffeine-safe-ceiling",
    question: "What daily caffeine intake does EFSA consider safe for most healthy adults?",
    answer: 400,
    unit: "mg",
    sliderMin: 50,
    sliderMax: 800,
    context:
      "EFSA judges up to about 400 mg a day safe for healthy adults, roughly four cups of coffee. Pregnancy and heart conditions change that calculus.",
    tier: "well-supported",
    basis: "human",
    source: SRC.caffeineEFSA,
    relatedTool: "/caffeine-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "efsa-water-men",
    question: "What is EFSA's adequate daily total-water intake for men, in litres?",
    answer: 2.5,
    unit: "L",
    sliderMin: 1,
    sliderMax: 4,
    context:
      "EFSA sets adequate total water at 2.5 L/day for men and 2.0 L for women, and that includes the 20 to 30% most people get from food, not just what you drink.",
    tier: "well-supported",
    basis: "human",
    source: SRC.waterEFSA,
    relatedTool: "/water-intake-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "sleep-cycle-length",
    question: "Roughly how many minutes does one full sleep cycle last, on average?",
    answer: 90,
    unit: "minutes",
    sliderMin: 40,
    sliderMax: 150,
    context:
      "A full pass through light, deep and REM sleep averages about 90 minutes in adults, though real cycles run anywhere from 70 to 120 minutes and lengthen through the night.",
    tier: "well-supported",
    basis: "human",
    source: SRC.sleepIOM,
    relatedTool: "/sleep-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "adult-sleep-minimum",
    question: "What is the lower end of the recommended nightly sleep range for adults, in hours?",
    answer: 7,
    unit: "hours",
    sliderMin: 4,
    sliderMax: 12,
    context:
      "The National Sleep Foundation recommends 7 to 9 hours for adults; 7 is the floor most people should aim to clear, not a target to skim.",
    tier: "well-supported",
    basis: "human",
    source: SRC.sleepNSF,
    relatedTool: "/sleep-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "max-hr-at-40",
    question: "Using the modern age-predicted formula, what is the estimated maximum heart rate at age 40, in bpm?",
    answer: 180,
    unit: "bpm",
    sliderMin: 150,
    sliderMax: 210,
    context:
      "The Tanaka equation (208 − 0.7 × age) gives 180 bpm at 40, more accurate across ages than the older '220 − age' rule of thumb.",
    tier: "well-supported",
    basis: "human",
    source: SRC.tanaka,
    relatedTool: "/heart-rate-zone-calculator",
    relatedContent: "/reference/heart-rate-zones-by-age",
    lastReviewed: "2026-07-23",
  },
  {
    id: "protein-upper-target",
    question: "For building muscle, what is the well-supported upper daily protein target, in grams per kg of bodyweight?",
    answer: 2.2,
    unit: "g/kg",
    sliderMin: 0.5,
    sliderMax: 3.5,
    context:
      "Roughly 1.6 to 2.2 g of protein per kg per day is well supported for muscle; beyond about 2.2 there's little added benefit for most people.",
    tier: "well-supported",
    basis: "human",
    source: SRC.proteinISSN,
    relatedTool: "/macro-calculator",
    relatedContent: "/reference/protein-targets-by-bodyweight",
    lastReviewed: "2026-07-23",
  },
  {
    id: "creatine-maintenance",
    question: "What is the standard daily creatine maintenance dose, at the higher end, in grams?",
    answer: 5,
    unit: "g",
    sliderMin: 1,
    sliderMax: 15,
    context:
      "A steady 3 to 5 g a day saturates and maintains muscle creatine stores, with no loading phase required, just consistency.",
    tier: "well-supported",
    basis: "human",
    source: SRC.creatineISSN,
    relatedTool: "/creatine-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "sauna-sessions-benefit",
    question: "In the Finnish cohort studies, how many sauna sessions a week were linked to the largest drop in mortality?",
    answer: 7,
    unit: "sessions",
    sliderMin: 1,
    sliderMax: 14,
    context:
      "The benefit tracked with frequency: 4 to 7 sessions a week showed the strongest association with lower cardiovascular and all-cause mortality, though the data are observational, not proof of cause.",
    tier: "well-supported",
    basis: "human",
    source: SRC.saunaMortality,
    relatedContent: "/recovery/sauna-therapy",
    lastReviewed: "2026-07-23",
  },
  {
    id: "lpa-genetic-share",
    question: "Roughly what percentage of your lipoprotein(a) level is set by your genes?",
    answer: 85,
    unit: "%",
    sliderMin: 0,
    sliderMax: 100,
    context:
      "Lp(a) is about 80 to 90% genetically determined and stays fairly stable through life, so a single test can flag lifelong risk that standard cholesterol misses.",
    tier: "well-supported",
    basis: "human",
    source: SRC.lpa,
    relatedTool: "/heart-age-calculator",
    relatedContent: "/glossary/lp-a",
    lastReviewed: "2026-07-23",
  },
];

export const mythItems: MythItem[] = [
  {
    id: "myth-ice-bath-growth",
    statement: "An ice bath straight after lifting boosts muscle growth.",
    verdict: "myth",
    explanation:
      "A 2024 meta-analysis found cold-water immersion done soon after resistance training tends to blunt the muscle-growth response. If building muscle is the goal, separate the plunge from the session by several hours, or skip it that day.",
    tier: "well-supported",
    basis: "human",
    source: SRC.cwiHypertrophy,
    relatedContent: "/recovery/cold-water-immersion",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-sauna-detox",
    statement: "A sauna session detoxes your body and burns meaningful fat.",
    verdict: "myth",
    explanation:
      "Detox claims are marketing, since your liver and kidneys handle that, and the weight lost in a session is water that returns on rehydration. The credible benefits are cardiovascular and relaxation-related.",
    tier: "marketing-claim",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-infrared-equivalent",
    statement: "Infrared saunas have the same heart-health evidence as traditional ones.",
    verdict: "myth",
    explanation:
      "The strong cardiovascular and mortality evidence comes from traditional Finnish saunas. Infrared has a smaller, more condition-specific research base, so those findings shouldn't be assumed to transfer.",
    tier: "preliminary",
    basis: "human",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-eight-glasses",
    statement: "The 'eight glasses of water a day' rule is based on science.",
    verdict: "myth",
    explanation:
      "The 8×8 rule has no clear scientific origin. EFSA's adequate intakes (2.0 L women / 2.5 L men of total water, food included) are the closest evidence-based reference, and thirst remains a useful signal for most healthy people.",
    tier: "marketing-claim",
    source: SRC.waterEFSA,
    relatedTool: "/water-intake-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-10000-steps",
    statement: "10,000 steps a day is a scientifically derived health target.",
    verdict: "myth",
    explanation:
      "It began as a 1960s Japanese pedometer marketing slogan. Research shows benefits accumulating well before 10,000 steps and continuing beyond, so more movement is simply better than less, with no magic number.",
    tier: "marketing-claim",
    source: SRC.steps,
    relatedTool: "/steps-to-calories-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-creatine-loading",
    statement: "You have to load creatine for it to work.",
    verdict: "myth",
    explanation:
      "Loading (0.3 g/kg/day for 5 to 7 days) saturates muscle stores in about a week, but a steady 3 to 5 g/day gets to the identical end point in three to four weeks. Loading is optional, not required.",
    tier: "well-supported",
    basis: "human",
    source: SRC.creatineISSN,
    relatedTool: "/creatine-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-220-age",
    statement: "'220 minus your age' is the most accurate way to find your maximum heart rate.",
    verdict: "myth",
    explanation:
      "The 220 − age rule is a rough rule of thumb. The Tanaka equation (208 − 0.7 × age) is more accurate across ages, and individual maximums still vary either way.",
    tier: "well-supported",
    basis: "human",
    source: SRC.tanaka,
    relatedTool: "/heart-rate-zone-calculator",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-cwi-mood",
    statement: "It's well proven that cold plunges reliably improve your mood.",
    verdict: "myth",
    explanation:
      "The mood and wellbeing evidence for cold-water immersion is still preliminary, promising but far weaker than the marketing implies. Treat mood benefits as plausible, not established.",
    tier: "preliminary",
    basis: "human",
    source: SRC.cwiWellbeing,
    relatedContent: "/recovery/cold-water-immersion",
    lastReviewed: "2026-07-23",
  },
  {
    id: "myth-lpa-lifestyle",
    statement: "You can substantially lower your Lp(a) with diet and lifestyle.",
    verdict: "myth",
    explanation:
      "Lipoprotein(a) is roughly 80 to 90% genetically determined and stays fairly stable through life, largely unaffected by diet or lifestyle. That's exactly why one measurement is so informative.",
    tier: "well-supported",
    basis: "human",
    source: SRC.lpa,
    relatedTool: "/heart-age-calculator",
    relatedContent: "/glossary/lp-a",
    lastReviewed: "2026-07-23",
  },
];

/**
 * Structural validation (DAILY-GAMES.md §4). Runs as a unit test. Returns the
 * list of problems; empty means valid. Deep cross-link existence is enforced
 * by the individual registries; here we assert the invariants the games own —
 * unique ids, a real source on every item, a scoreable slider, and well-formed
 * internal routes.
 */
export function validateDailyRegistry(
  ballpark: BallparkItem[] = ballparkItems,
  myth: MythItem[] = mythItems,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  const checkSource = (id: string, s: { label?: string; url?: string }) => {
    if (!s?.url?.trim()) problems.push(`${id}: missing source url`);
    if (!s?.label?.trim()) problems.push(`${id}: missing source label`);
  };
  const checkRoutes = (id: string, tool?: string, content?: string) => {
    if (tool && !tool.startsWith("/")) problems.push(`${id}: relatedTool must be an absolute route`);
    if (content && !content.startsWith("/")) {
      problems.push(`${id}: relatedContent must be an absolute route`);
    }
  };

  for (const b of ballpark) {
    if (seen.has(b.id)) problems.push(`duplicate id: ${b.id}`);
    seen.add(b.id);
    if (!b.question.trim()) problems.push(`${b.id}: empty question`);
    if (!b.context.trim()) problems.push(`${b.id}: empty context`);
    if (!Number.isFinite(b.answer)) problems.push(`${b.id}: non-finite answer`);
    if (!(b.sliderMin < b.answer && b.answer < b.sliderMax)) {
      problems.push(`${b.id}: answer ${b.answer} must lie strictly within (${b.sliderMin}, ${b.sliderMax})`);
    }
    if (b.logScale && b.sliderMin <= 0) {
      problems.push(`${b.id}: logScale requires sliderMin > 0`);
    }
    if (!b.unit.trim()) problems.push(`${b.id}: empty unit`);
    checkSource(b.id, b.source);
    checkRoutes(b.id, b.relatedTool, b.relatedContent);
  }

  for (const m of myth) {
    if (seen.has(m.id)) problems.push(`duplicate id: ${m.id}`);
    seen.add(m.id);
    if (!m.statement.trim()) problems.push(`${m.id}: empty statement`);
    if (!m.explanation.trim()) problems.push(`${m.id}: empty explanation`);
    if (m.verdict !== "myth" && m.verdict !== "fact") problems.push(`${m.id}: invalid verdict`);
    checkSource(m.id, m.source);
    checkRoutes(m.id, m.relatedTool, m.relatedContent);
  }

  return problems;
}

export const ballparkById: ReadonlyMap<string, BallparkItem> = new Map(
  ballparkItems.map((b) => [b.id, b]),
);
export const mythById: ReadonlyMap<string, MythItem> = new Map(mythItems.map((m) => [m.id, m]));
