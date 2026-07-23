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
 * Seed coverage note: the evergreen chunks below are grounded in sources already
 * present in the repo (the cold-water and sauna recovery clusters, and the
 * ApoB/Lp(a) glossary entries), spanning training / recovery / mind / cardio /
 * longevity / physiology. Fresh (recent-discovery) chunks (PULSE.md §15,
 * `kind: "fresh"`) live in the `pulse-fresh.json` sidecar — the single home for
 * fresh cards and the harvest pipeline's append target (§15.7) — and currently
 * extend coverage into supplements and nutrition. Growing the corpus is the E5
 * content cadence (PULSE.md §3.3) and each new chunk must bring its own source.
 *
 * Same single-source-of-truth pattern as the glossary / recovery / peptides
 * registries.
 */

import type { GroundingChunk } from "@/lib/pulse/types";
import { PULSE_CATEGORIES } from "@/lib/pulse/types";
import freshChunksJson from "./pulse-fresh.json";

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
      "Laukkanen T, et al. Association between sauna bathing and fatal cardiovascular and all-cause mortality events. JAMA Intern Med 2015;175:542-548",
    url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
  },
  saunaReview: {
    label:
      "Laukkanen JA, Laukkanen T, Kunutsor SK. Cardiovascular and other health benefits of sauna bathing: a review of the evidence. Mayo Clin Proc 2018;93:1111-1121",
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

  // --- Supplement / nutrition position stands (verbatim from supplements.ts
  //     and daily.ts — specific papers backing the well-supported claims). ---
  issnCreatine: {
    label:
      "Kreider RB, et al. ISSN position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr 2017;14:18",
    url: "https://doi.org/10.1186/s12970-017-0173-z",
  },
  issnProtein: {
    label: "Jäger R, et al. ISSN position stand: protein and exercise. J Int Soc Sports Nutr 2017;14:20",
    url: "https://doi.org/10.1186/s12970-017-0177-8",
  },
  issnCaffeine: {
    label:
      "Guest NS, et al. ISSN position stand: caffeine and exercise performance. J Int Soc Sports Nutr 2021;18:1",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7777221/",
  },
  issnBetaAlanine: {
    label: "Trexler ET, et al. ISSN position stand: Beta-Alanine. J Int Soc Sports Nutr 2015;12:30",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4501114/",
  },
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
  steps: {
    label: "Compendium of Physical Activities, walking MET values",
    url: "https://pacompendium.com/walking/",
  },
  levinePhenoAge: {
    label:
      "Levine ME, et al. An epigenetic biomarker of aging for lifespan and healthspan. Aging 2018;10:573-591 (clinical Phenotypic Age)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/",
  },
  ahaPrevent: {
    label:
      "Khan SS, et al. Development and Validation of the American Heart Association's PREVENT Equations. Circulation 2024;149:430-449",
    url: "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.123.067626",
  },
  liLifestyle: {
    label:
      "Li Y, et al. Impact of Healthy Lifestyle Factors on Life Expectancies in the US Population. Circulation 2018;138:345-355",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6207481/",
  },
  mifflin: {
    label:
      "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr 1990;51:241-247",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },

  // --- Supplement evidence bases (verbatim from supplements.ts). These back
  //     the honest preliminary / marketing-claim cards, and every such chunk
  //     also links back to its full supplement page via relatedContent. ---
  suppBeetroot: {
    label:
      "PubMed: dietary nitrate / beetroot juice supplementation and endurance-exercise performance (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=dietary+nitrate+beetroot+juice+endurance+exercise+performance+review",
  },
  suppBicarb: {
    label:
      "PubMed: sodium bicarbonate supplementation and high-intensity exercise performance (position stands and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+bicarbonate+supplementation+high-intensity+exercise+performance",
  },
  suppElectrolytes: {
    label:
      "PubMed: sodium / electrolyte replacement, hydration and endurance-exercise performance",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=electrolyte+sodium+hydration+endurance+exercise+performance",
  },
  suppAshwagandha: {
    label:
      "PubMed: Withania somnifera (ashwagandha) randomised trials on stress, sleep and strength",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=ashwagandha+randomized+controlled+trial+stress+OR+strength",
  },
  suppVitaminD: {
    label:
      "PubMed: vitamin D status, supplementation and muscle function / athletic performance (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+D+supplementation+muscle+function+athletic+performance+review",
  },
  suppOmega3: {
    label:
      "PubMed: omega-3 (EPA/DHA) supplementation, muscle protein synthesis and exercise recovery",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=omega-3+EPA+DHA+muscle+protein+synthesis+recovery",
  },
  suppMagnesium: {
    label:
      "PubMed: magnesium supplementation, sleep, cramps and exercise performance",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+supplementation+sleep+OR+exercise+performance",
  },
  suppCollagen: {
    label:
      "PubMed: collagen peptide supplementation and tendon, joint and skin outcomes (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=collagen+peptide+supplementation+tendon+OR+joint+OR+skin",
  },
  suppMelatonin: {
    label:
      "PubMed: melatonin supplementation, sleep onset, jet lag and circadian timing (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+supplementation+sleep+jet+lag+circadian",
  },
  suppTartCherry: {
    label:
      "PubMed: tart cherry / Montmorency cherry supplementation, exercise recovery and sleep (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=tart+cherry+Montmorency+exercise+recovery+OR+sleep",
  },
  suppLTheanine: {
    label: "PubMed: L-theanine, caffeine, attention and cognition (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=L-theanine+caffeine+attention+cognition",
  },
  suppCurcumin: {
    label:
      "PubMed: curcumin supplementation, muscle soreness, recovery and joint/inflammation outcomes (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=curcumin+supplementation+muscle+soreness+OR+osteoarthritis",
  },
  suppGlucosamine: {
    label:
      "PubMed: glucosamine and chondroitin, joint pain and osteoarthritis (randomised trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=glucosamine+chondroitin+osteoarthritis+joint+pain+randomized",
  },
  suppIron: {
    label:
      "PubMed: iron deficiency, supplementation and endurance-exercise performance (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=iron+deficiency+supplementation+endurance+exercise+performance",
  },
  suppZinc: {
    label:
      "PubMed: zinc status and supplementation for immunity, testosterone and exercise (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=zinc+supplementation+immunity+OR+testosterone+exercise",
  },
  suppGreenTea: {
    label:
      "PubMed: green tea extract / EGCG on fat oxidation, weight loss and hepatotoxicity (reviews and case reports)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=green+tea+extract+EGCG+fat+oxidation+OR+hepatotoxicity",
  },
  suppGlycine: {
    label: "PubMed: glycine supplementation and sleep quality (trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=glycine+supplementation+sleep+quality",
  },
  suppHmb: {
    label:
      "PubMed: HMB (beta-hydroxy beta-methylbutyrate) supplementation, muscle mass and strength (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=HMB+beta-hydroxy-beta-methylbutyrate+muscle+strength",
  },
  suppBcaa: {
    label:
      "PubMed: branched-chain amino acids (BCAA) supplementation, muscle protein synthesis and hypertrophy (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=branched-chain+amino+acids+muscle+protein+synthesis+hypertrophy",
  },
  suppGlutamine: {
    label: "PubMed: glutamine supplementation, muscle, immunity and exercise (reviews and trials)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=glutamine+supplementation+muscle+OR+immunity+exercise",
  },
  suppTribulus: {
    label: "PubMed: Tribulus terrestris, testosterone and exercise performance (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=Tribulus+terrestris+testosterone+exercise+performance",
  },
  suppTestBooster: {
    label: "PubMed: 'testosterone booster' supplements, efficacy and safety (analyses and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=testosterone+booster+supplement+efficacy+safety",
  },
  suppFatBurner: {
    label:
      "PubMed: thermogenic 'fat burner' supplements, efficacy, ingredients and safety (reviews and analyses)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=thermogenic+fat+burner+supplement+efficacy+safety",
  },
  suppZma: {
    label:
      "PubMed: controlled trials of ZMA (zinc magnesium aspartate) supplementation, testosterone and strength",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=ZMA+zinc+magnesium+testosterone+strength",
  },
  suppPreWorkout: {
    label:
      "PubMed: multi-ingredient pre-workout supplements, performance evidence and ingredient dosing",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=multi-ingredient+pre-workout+supplement+performance",
  },

  // --- Recovery clusters (verbatim from recovery-content.ts). ---
  recCompression: {
    label:
      "PubMed: intermittent pneumatic compression and exercise recovery / delayed-onset muscle soreness (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+pneumatic+compression+exercise+recovery",
  },
  recMassageGuns: {
    label:
      "PubMed: percussive / vibration massage therapy, range of motion and muscle soreness (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=percussive+massage+therapy+range+of+motion+soreness",
  },
  recRedLight: {
    label:
      "PubMed: photobiomodulation and red light therapy for muscle recovery, skin and performance (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=photobiomodulation+red+light+therapy+muscle+recovery+OR+skin",
  },
  recSleepEnv: {
    label:
      "PubMed: bedroom environment and the effects of ambient temperature, light and noise on sleep (reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+environment+temperature+light+noise+review",
  },
  recBreathwork: {
    label:
      "PubMed: slow-paced breathing and breathwork for stress, heart-rate variability and wellbeing (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=slow+breathing+breathwork+stress+heart+rate+variability",
  },
  recFoamRolling: {
    label:
      "PubMed: foam rolling and self-myofascial release for range of motion and muscle soreness (trials and reviews)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=foam+rolling+self-myofascial+release+range+of+motion+soreness",
  },
} as const;

const evergreenChunks: GroundingChunk[] = [
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
      "Evidence that cold-water immersion improves mood and general wellbeing is still preliminary, promising but far weaker than the marketing around ice baths implies.",
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
      "In large Finnish cohort studies, frequent sauna use (around 4 to 7 sessions a week) is associated with substantially lower cardiovascular and all-cause mortality, a strong association, though observational rather than proven cause.",
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
      "Sauna 'detox' claims are marketing, since the liver and kidneys handle that, and the weight lost in a session is water that returns on rehydration; the credible benefits are cardiovascular and relaxation-related.",
    category: "recovery",
    tags: ["sauna", "myth", "detox"],
    tier: "marketing-claim",
    source: SRC.saunaReview,
    relatedContent: "/recovery/sauna-therapy",
  },
  {
    id: "apob-counts-particles",
    claim:
      "ApoB counts the number of atherogenic (potentially artery-clogging) particles in your blood directly, because there is one ApoB molecule per particle, which can make it a more precise cardiovascular-risk marker than standard LDL cholesterol alone.",
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
      "Lipoprotein(a) is roughly 80 to 90% genetically determined and stays fairly stable through life, so a single measurement can flag lifelong elevated cardiovascular risk that standard cholesterol testing misses.",
    category: "longevity",
    tags: ["lp-a", "genetics", "cardiovascular"],
    tier: "well-supported",
    basis: "human",
    source: SRC.lpa,
    relatedContent: "/glossary/lp-a",
    relatedTool: "/heart-age-calculator",
  },

  // ---------------------------------------------------------------------------
  // Corpus growth 2026-07-23 (PULSE.md §3.3 / STATUS §3 Phase 1). Harvested from
  // already-vetted repo content — the supplement database, the daily-games
  // registry's specific primary sources, the recovery clusters and the longevity
  // tool configs. Each claim is copied/condensed from that vetted content, keeps
  // its evidential hedging, and links back to the page it came from. Fills the
  // thin categories: supplements, nutrition and sleep.
  // ---------------------------------------------------------------------------

  // --- Supplements — the well-evidenced ones (ISSN position stands) ---
  {
    id: "creatine-most-evidenced",
    claim:
      "Creatine monohydrate is the most robustly supported sports supplement there is: a large body of human trials and the ISSN position stand agree it reliably improves high-intensity performance and, with training, gains in strength and lean mass.",
    category: "supplements",
    tags: ["creatine", "strength", "muscle"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnCreatine,
    relatedContent: "/supplements/creatine-monohydrate",
    relatedTool: "/creatine-calculator",
  },
  {
    id: "creatine-no-loading-needed",
    claim:
      "You don't need to 'load' creatine: a steady 3 to 5 g a day reaches the same muscle saturation within a few weeks that a loading phase reaches in about one, just with less chance of stomach upset.",
    category: "supplements",
    tags: ["creatine", "protocol"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnCreatine,
    relatedContent: "/supplements/creatine-monohydrate",
    relatedTool: "/creatine-calculator",
  },
  {
    id: "creatine-monohydrate-best-form",
    claim:
      "Plain creatine monohydrate is the form to buy: the fancier, pricier versions have not been shown to beat it, and it is the form nearly all the research used.",
    category: "supplements",
    tags: ["creatine", "myth"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnCreatine,
    relatedContent: "/supplements/creatine-monohydrate",
  },
  {
    id: "protein-target-range",
    claim:
      "For people training for muscle, roughly 1.6 to 2.2 g of protein per kg of bodyweight per day is a well-supported range; beyond about 2.2 there is little added benefit for most people.",
    category: "nutrition",
    tags: ["protein", "muscle"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnProtein,
    relatedContent: "/reference/protein-targets-by-bodyweight",
    relatedTool: "/macro-calculator",
  },
  {
    id: "protein-total-drives-muscle",
    claim:
      "Total daily protein is the main driver of muscle gain; spreading it across meals is sensible, but the timing of any single dose matters far less than hitting your daily target.",
    category: "nutrition",
    tags: ["protein", "timing", "muscle"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnProtein,
    relatedContent: "/supplements/whey-protein",
    relatedTool: "/macro-calculator",
  },
  {
    id: "whey-vs-plant-protein",
    claim:
      "Whey and good plant-protein blends both build muscle: whey is a complete, rapidly-digested protein rich in leucine, and blends such as pea and rice can match it when total protein and leucine are adequate.",
    category: "nutrition",
    tags: ["protein", "whey", "plant-based"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnProtein,
    relatedContent: "/supplements/whey-protein",
  },
  {
    id: "caffeine-ergogenic",
    claim:
      "Caffeine is one of the few supplements with strong, consistent evidence for performance, especially endurance, with useful effects on alertness and perceived effort; the ISSN position stand rates it clearly ergogenic.",
    category: "supplements",
    tags: ["caffeine", "endurance", "performance"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnCaffeine,
    relatedContent: "/supplements/caffeine",
    relatedTool: "/caffeine-calculator",
  },
  {
    id: "beta-alanine-window",
    claim:
      "Beta-alanine raises muscle carnosine to buffer acid build-up, giving a small but real benefit for sustained high-intensity efforts lasting roughly one to four minutes, not for single maximal lifts or long steady endurance.",
    category: "supplements",
    tags: ["beta-alanine", "high-intensity"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnBetaAlanine,
    relatedContent: "/supplements/beta-alanine",
  },
  {
    id: "beta-alanine-tingle-harmless",
    claim:
      "The skin tingle (paraesthesia) some people feel from a larger beta-alanine dose is a harmless, temporary effect, not a sign of it working; splitting the daily amount into smaller doses reduces it.",
    category: "supplements",
    tags: ["beta-alanine", "myth"],
    tier: "well-supported",
    basis: "human",
    source: SRC.issnBetaAlanine,
    relatedContent: "/supplements/beta-alanine",
  },
  {
    id: "beetroot-nitrate-endurance",
    claim:
      "The dietary nitrate in beetroot juice raises nitric oxide and can modestly improve exercise economy and time to exhaustion, making it one of the better-evidenced endurance aids, though highly-trained athletes tend to respond less.",
    category: "cardio",
    tags: ["beetroot", "nitrate", "endurance"],
    tier: "well-supported",
    basis: "human",
    source: SRC.suppBeetroot,
    relatedContent: "/supplements/beetroot-juice",
    relatedTool: "/running-pace-calculator",
  },
  {
    id: "sodium-bicarbonate-buffer",
    claim:
      "Sodium bicarbonate raises the blood's buffering capacity and has solid evidence for improving repeated high-intensity efforts of roughly one to ten minutes, though gut upset is common enough that it must be trialled in training first.",
    category: "supplements",
    tags: ["sodium-bicarbonate", "high-intensity"],
    tier: "well-supported",
    basis: "human",
    source: SRC.suppBicarb,
    relatedContent: "/supplements/sodium-bicarbonate",
  },
  {
    id: "electrolytes-when-they-matter",
    claim:
      "Electrolyte drinks earn their keep during long, hot or very sweaty sessions where you lose meaningful sodium, roughly beyond 60 to 90 minutes; for most people a normal diet already supplies enough for everyday needs.",
    category: "nutrition",
    tags: ["electrolytes", "hydration"],
    tier: "well-supported",
    basis: "human",
    source: SRC.suppElectrolytes,
    relatedContent: "/supplements/electrolytes",
    relatedTool: "/water-intake-calculator",
  },

  // --- Supplements — the honest 'preliminary' cards ---
  {
    id: "ashwagandha-stress-preliminary",
    claim:
      "Several small randomised trials report that ashwagandha reduces stress and cortisol, but the studies are small and often industry-funded, so it is best treated as promising rather than proven.",
    category: "mind",
    tags: ["ashwagandha", "stress", "adaptogen"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppAshwagandha,
    relatedContent: "/supplements/ashwagandha",
  },
  {
    id: "vitamin-d-fix-deficiency",
    claim:
      "Correcting a genuine vitamin D deficiency, common in northern winters, is worthwhile for bone and general health; topping up someone who is already replete is unlikely to improve strength or performance.",
    category: "supplements",
    tags: ["vitamin-d", "deficiency"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppVitaminD,
    relatedContent: "/supplements/vitamin-d",
  },
  {
    id: "omega-3-general-health",
    claim:
      "There is early, promising evidence that omega-3 (EPA/DHA) modestly supports muscle protein synthesis and reduces soreness, but its stronger, broader case is general health; whole-food oily fish is the first-choice source.",
    category: "supplements",
    tags: ["omega-3", "fish-oil", "recovery"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppOmega3,
    relatedContent: "/supplements/omega-3",
    relatedTool: "/heart-age-calculator",
  },
  {
    id: "magnesium-fix-shortfall",
    claim:
      "If you are low in magnesium, correcting it may help sleep and muscle cramps; the evidence for a sleep benefit in people who already get enough is weaker and often overstated.",
    category: "sleep",
    tags: ["magnesium", "sleep", "cramps"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppMagnesium,
    relatedContent: "/supplements/magnesium",
  },
  {
    id: "collagen-tendon-not-muscle",
    claim:
      "Collagen shows growing but still-preliminary promise for tendons, joints and skin, yet it is a poor muscle-building protein because it lacks enough leucine; for muscle, whey or a good mixed-protein diet is far better.",
    category: "supplements",
    tags: ["collagen", "tendon", "protein"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppCollagen,
    relatedContent: "/supplements/collagen",
  },
  {
    id: "melatonin-timing-not-sedative",
    claim:
      "Melatonin's strongest evidence is for shifting the body clock in jet lag and delayed sleep timing rather than acting as a sedative; when you take it often matters more than the dose.",
    category: "sleep",
    tags: ["melatonin", "jet-lag", "circadian"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppMelatonin,
    relatedContent: "/supplements/melatonin",
    relatedTool: "/sleep-calculator",
  },
  {
    id: "tart-cherry-recovery-sleep",
    claim:
      "Tart cherry's polyphenols show promising evidence for easing muscle soreness and modestly improving sleep, which is why some athletes use it around competition rather than every day, since routinely blunting inflammation may dampen training adaptations.",
    category: "recovery",
    tags: ["tart-cherry", "soreness", "sleep"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppTartCherry,
    relatedContent: "/supplements/tart-cherry",
  },
  {
    id: "l-theanine-caffeine-focus",
    claim:
      "L-theanine, found naturally in tea, is best known for taking the edge off caffeine: some studies support smoother, calmer attention from the pair than caffeine alone, though the effects are modest.",
    category: "mind",
    tags: ["l-theanine", "caffeine", "focus"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppLTheanine,
    relatedContent: "/supplements/l-theanine",
    relatedTool: "/caffeine-calculator",
  },
  {
    id: "curcumin-soreness-preliminary",
    claim:
      "There is growing, still-preliminary evidence that curcumin's anti-inflammatory action may reduce post-exercise soreness, but plain culinary turmeric is poorly absorbed, so the studied effect comes from concentrated, absorption-enhanced extracts.",
    category: "recovery",
    tags: ["curcumin", "turmeric", "soreness"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppCurcumin,
    relatedContent: "/supplements/curcumin",
  },
  {
    id: "glucosamine-mixed-joints",
    claim:
      "The evidence for glucosamine and chondroitin is genuinely mixed: some people with osteoarthritis report modest pain relief while well-controlled trials often show little better than placebo, and there is little sign they benefit healthy joints.",
    category: "physiology",
    tags: ["glucosamine", "joints", "osteoarthritis"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppGlucosamine,
    relatedContent: "/supplements/glucosamine-chondroitin",
  },
  {
    id: "iron-test-dont-guess",
    claim:
      "Correcting a tested iron deficiency clearly improves energy and endurance, but supplementing when your levels are normal offers no benefit and carries real risks, because the body cannot easily excrete excess iron.",
    category: "physiology",
    tags: ["iron", "deficiency", "endurance"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppIron,
    relatedContent: "/supplements/iron",
  },
  {
    id: "zinc-deficiency-not-more",
    claim:
      "In men who are genuinely low in zinc, restoring it can help hormone levels, but in those who already have enough, extra zinc does not reliably raise testosterone, and chronic high doses cause a copper deficiency.",
    category: "supplements",
    tags: ["zinc", "testosterone", "deficiency"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppZinc,
    relatedContent: "/supplements/zinc",
  },
  {
    id: "green-tea-extract-small-liver",
    claim:
      "Green tea extract's catechins may slightly raise fat oxidation, but the real-world weight effect is small and often just the caffeine; concentrated EGCG extracts have also been linked to rare liver injury, unlike simply drinking brewed tea.",
    category: "supplements",
    tags: ["green-tea", "egcg", "fat-loss"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppGreenTea,
    relatedContent: "/supplements/green-tea-extract",
  },
  {
    id: "glycine-sleep-quality",
    claim:
      "A few small studies suggest taking glycine before bed can improve subjective sleep quality and reduce next-day tiredness, possibly by gently lowering core body temperature; promising, but based on limited research.",
    category: "sleep",
    tags: ["glycine", "sleep"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppGlycine,
    relatedContent: "/supplements/glycine",
    relatedTool: "/sleep-calculator",
  },
  {
    id: "hmb-anti-catabolic",
    claim:
      "HMB's muscle-building evidence is mostly underwhelming in trained lifters who already eat enough protein; its more plausible role is anti-catabolic, reducing muscle breakdown during heavy dieting, injury or in older or untrained people.",
    category: "supplements",
    tags: ["hmb", "muscle", "leucine"],
    tier: "preliminary",
    basis: "human",
    source: SRC.suppHmb,
    relatedContent: "/supplements/hmb",
  },

  // --- Supplements — the myth-busting 'marketing-claim' cards (on-brand debunks) ---
  {
    id: "bcaa-redundant-with-protein",
    claim:
      "For anyone eating enough total protein, BCAAs add very little: building muscle needs all the essential amino acids, and complete proteins like whey already contain plenty of the three branched-chain ones.",
    category: "supplements",
    tags: ["bcaa", "protein", "myth"],
    tier: "marketing-claim",
    source: SRC.suppBcaa,
    relatedContent: "/supplements/bcaa",
    relatedTool: "/macro-calculator",
  },
  {
    id: "glutamine-low-value",
    claim:
      "In healthy people who eat enough protein, controlled studies do not support meaningful muscle, strength or immune gains from glutamine; its credible evidence sits in specific clinical settings, not everyday training.",
    category: "supplements",
    tags: ["glutamine", "myth"],
    tier: "marketing-claim",
    source: SRC.suppGlutamine,
    relatedContent: "/supplements/glutamine",
  },
  {
    id: "tribulus-no-testosterone",
    claim:
      "Despite being one of the most common ingredients in 'test booster' products, controlled studies in men generally show tribulus does not meaningfully raise testosterone or improve strength or muscle.",
    category: "supplements",
    tags: ["tribulus", "testosterone", "myth"],
    tier: "marketing-claim",
    source: SRC.suppTribulus,
    relatedContent: "/supplements/tribulus-terrestris",
  },
  {
    id: "test-boosters-mostly-fail",
    claim:
      "As a category, most over-the-counter 'natural testosterone boosters' do not reliably raise testosterone in controlled studies; where an ingredient helps, it is usually by correcting a genuine deficiency, not boosting a normal level.",
    category: "supplements",
    tags: ["testosterone", "myth"],
    tier: "marketing-claim",
    source: SRC.suppTestBooster,
    relatedContent: "/supplements/testosterone-booster",
  },
  {
    id: "fat-burners-mostly-caffeine",
    claim:
      "Most of any real 'fat burner' effect is the caffeine; the other ingredients are typically underdosed or unproven, and none override the sustained energy deficit that actually drives fat loss.",
    category: "supplements",
    tags: ["fat-burner", "myth", "fat-loss"],
    tier: "marketing-claim",
    source: SRC.suppFatBurner,
    relatedContent: "/supplements/fat-burner",
  },
  {
    id: "zma-no-boost-if-replete",
    claim:
      "In men who are not deficient in zinc or magnesium, which is most people who train and eat reasonably, controlled studies do not support ZMA's marketed testosterone or strength increases.",
    category: "supplements",
    tags: ["zma", "testosterone", "myth"],
    tier: "marketing-claim",
    source: SRC.suppZma,
    relatedContent: "/supplements/zma",
  },
  {
    id: "pre-workout-is-its-parts",
    claim:
      "A pre-workout's real effect is its handful of evidence-based ingredients, mainly caffeine plus beta-alanine and a maybe from citrulline; a 'proprietary blend' that hides per-ingredient doses often under-doses the ones that work.",
    category: "supplements",
    tags: ["pre-workout", "caffeine", "myth"],
    tier: "marketing-claim",
    source: SRC.suppPreWorkout,
    relatedContent: "/supplements/pre-workout",
    relatedTool: "/caffeine-calculator",
  },

  // --- Nutrition / physiology from the daily-games registry's specific sources ---
  {
    id: "caffeine-half-life-5h",
    claim:
      "Caffeine's average half-life is about five hours, so a mid-afternoon coffee can still leave a meaningful dose at bedtime, though genetics swing this from under two to over nine hours.",
    category: "physiology",
    tags: ["caffeine", "sleep", "genetics"],
    tier: "well-supported",
    basis: "human",
    source: SRC.caffeineIOM,
    relatedTool: "/caffeine-calculator",
    relatedContent: "/supplements/caffeine",
  },
  {
    id: "caffeine-400mg-ceiling",
    claim:
      "EFSA judges up to about 400 mg of caffeine a day safe for most healthy adults, roughly four cups of coffee; pregnancy and some heart conditions lower that.",
    category: "nutrition",
    tags: ["caffeine", "safety"],
    tier: "well-supported",
    basis: "human",
    source: SRC.caffeineEFSA,
    relatedTool: "/caffeine-calculator",
    relatedContent: "/supplements/caffeine",
  },
  {
    id: "total-water-intake-efsa",
    claim:
      "EFSA sets adequate total water at 2.5 litres a day for men and 2.0 for women, and that includes the 20 to 30% most people get from food, not just what they drink.",
    category: "nutrition",
    tags: ["hydration", "water"],
    tier: "well-supported",
    basis: "human",
    source: SRC.waterEFSA,
    relatedTool: "/water-intake-calculator",
  },
  {
    id: "eight-glasses-myth",
    claim:
      "The 'eight glasses of water a day' rule has no clear scientific origin; EFSA's total-water intakes (with food included) are the closest evidence-based reference, and thirst remains a useful signal for most healthy people.",
    category: "nutrition",
    tags: ["hydration", "myth"],
    tier: "marketing-claim",
    source: SRC.waterEFSA,
    relatedTool: "/water-intake-calculator",
  },
  {
    id: "sleep-cycle-90-min",
    claim:
      "A full pass through light, deep and REM sleep averages about 90 minutes in adults, though real cycles run anywhere from 70 to 120 minutes and lengthen through the night.",
    category: "sleep",
    tags: ["sleep", "sleep-cycle"],
    tier: "well-supported",
    basis: "human",
    source: SRC.sleepIOM,
    relatedTool: "/sleep-calculator",
  },
  {
    id: "adults-need-7-to-9h",
    claim:
      "The National Sleep Foundation recommends 7 to 9 hours of sleep for adults; seven is the floor most people should aim to clear, not a target to skim.",
    category: "sleep",
    tags: ["sleep", "duration"],
    tier: "well-supported",
    basis: "human",
    source: SRC.sleepNSF,
    relatedTool: "/sleep-calculator",
  },
  {
    id: "max-hr-tanaka",
    claim:
      "The modern Tanaka equation (208 − 0.7 × age) estimates maximum heart rate more accurately across ages than the old '220 − age' rule of thumb, giving about 180 bpm at age 40.",
    category: "cardio",
    tags: ["heart-rate", "training-zones"],
    tier: "well-supported",
    basis: "human",
    source: SRC.tanaka,
    relatedTool: "/heart-rate-zone-calculator",
    relatedContent: "/reference/heart-rate-zones-by-age",
  },
  {
    id: "10000-steps-marketing-origin",
    claim:
      "The 10,000-steps target began as a 1960s Japanese pedometer marketing slogan, not a scientific finding; the research shows health benefits accumulating well before 10,000 and continuing beyond, so more movement is simply better than less.",
    category: "training",
    tags: ["steps", "myth", "activity"],
    tier: "marketing-claim",
    source: SRC.steps,
    relatedTool: "/steps-to-calories-calculator",
  },

  // --- Longevity / physiology from the tool configs' primary papers ---
  {
    id: "phenotypic-age-vs-calendar",
    claim:
      "Phenotypic Age, computed from nine routine blood markers plus your age, can differ from your calendar age and tracks lifespan and healthspan, giving a snapshot of biological ageing that a birthday alone does not.",
    category: "longevity",
    tags: ["biological-age", "biomarker"],
    tier: "well-supported",
    basis: "human",
    source: SRC.levinePhenoAge,
    relatedTool: "/phenotypic-age-calculator",
    relatedContent: "/glossary/biological-age",
  },
  {
    id: "prevent-broad-risk",
    claim:
      "The American Heart Association's 2024 PREVENT equations estimate 10- and 30-year cardiovascular risk from midlife, folding in kidney and metabolic health rather than cholesterol alone.",
    category: "physiology",
    tags: ["cardiovascular", "risk", "prevent"],
    tier: "well-supported",
    basis: "human",
    source: SRC.ahaPrevent,
    relatedTool: "/heart-age-calculator",
  },
  {
    id: "five-habits-longer-life",
    claim:
      "In a large US cohort, five low-risk habits at age 50 — never smoking, a healthy weight, regular activity, moderate alcohol and a good diet — were associated with roughly 12 to 14 years longer life expectancy.",
    category: "longevity",
    tags: ["lifestyle", "life-expectancy"],
    tier: "well-supported",
    basis: "human",
    source: SRC.liLifestyle,
    relatedTool: "/lifestyle-life-expectancy",
  },
  {
    id: "bmr-biggest-burn",
    claim:
      "Your resting metabolic rate — the energy you burn just staying alive — is the largest part of most people's daily calorie burn, and the Mifflin-St Jeor equation estimates it from height, weight, age and sex.",
    category: "physiology",
    tags: ["metabolism", "bmr", "tdee"],
    tier: "well-supported",
    basis: "human",
    source: SRC.mifflin,
    relatedTool: "/bmr-calculator",
    relatedContent: "/glossary/bmr",
  },

  // --- Recovery clusters (each sourced) ---
  {
    id: "compression-boots-feel-good",
    claim:
      "The best-supported effect of pneumatic compression boots is on how recovered you feel and on reducing muscle soreness; whether they meaningfully improve next-day performance is far less clear, and the effect sizes are modest.",
    category: "recovery",
    tags: ["compression", "soreness"],
    tier: "preliminary",
    basis: "human",
    source: SRC.recCompression,
    relatedContent: "/recovery/compression-therapy",
  },
  {
    id: "massage-guns-short-term",
    claim:
      "Massage guns have modest but real evidence for a short-term increase in range of motion and some relief of soreness, but no good evidence they boost strength, speed or muscle growth.",
    category: "recovery",
    tags: ["massage-gun", "mobility", "soreness"],
    tier: "preliminary",
    basis: "human",
    source: SRC.recMassageGuns,
    relatedContent: "/recovery/massage-guns",
  },
  {
    id: "red-light-preliminary",
    claim:
      "Red light therapy is genuinely being researched, with preliminary and mixed evidence for muscle recovery and some skin outcomes, but the consumer market overpromises and results depend heavily on dose and device.",
    category: "recovery",
    tags: ["red-light", "photobiomodulation"],
    tier: "preliminary",
    basis: "human",
    source: SRC.recRedLight,
    relatedContent: "/recovery/red-light-therapy",
  },
  {
    id: "sleep-environment-basics",
    claim:
      "The highest-value changes to your sleep environment are the well-supported basics — a cool room (often cited around 16 to 19°C), darkness and quiet — while most sleep gadgets are preliminary at best.",
    category: "sleep",
    tags: ["sleep", "environment"],
    tier: "well-supported",
    basis: "human",
    source: SRC.recSleepEnv,
    relatedContent: "/recovery/sleep-environment",
    relatedTool: "/sleep-calculator",
  },
  {
    id: "breathwork-slow-breathing",
    claim:
      "Slow, controlled breathing at around six breaths a minute has reasonable evidence for acutely calming the nervous system and nudging heart-rate variability — a genuinely useful, free tool for in-the-moment stress.",
    category: "mind",
    tags: ["breathwork", "stress", "hrv"],
    tier: "preliminary",
    basis: "human",
    source: SRC.recBreathwork,
    relatedContent: "/recovery/breathwork",
    relatedTool: "/heart-rate-zone-calculator",
  },
  {
    id: "foam-rolling-not-fascia",
    claim:
      "Foam rolling gives a real short-term boost in range of motion and modestly eases soreness, but the popular idea that it physically 'breaks up' fascia or knots isn't supported; the effect is more likely neural and short-lived.",
    category: "recovery",
    tags: ["foam-rolling", "mobility", "myth"],
    tier: "preliminary",
    basis: "human",
    source: SRC.recFoamRolling,
    relatedContent: "/recovery/foam-rolling",
  },
];

/**
 * Fresh chunks (PULSE.md §15) live in a JSON sidecar — the single home for
 * recent-discovery cards and the machine-append target for the harvest pipeline
 * (§15.7 F1/F2). Keeping them out of this hand-authored TS array means the
 * automation only ever edits data, never code (a clean PR diff). The JSON is
 * validated by `validateCorpus` at build + in the unit test, so the structural
 * guarantees (§15.4) hold identically to the evergreen chunks above. The cast
 * is safe because that validation gate runs over the merged corpus.
 */
const freshChunks = freshChunksJson as unknown as GroundingChunk[];

/**
 * The full grounding corpus: hand-authored evergreen chunks + sidecar-managed
 * fresh chunks (PULSE.md §15). Order puts evergreen first; `selectChunks`
 * re-orders per draw with the freshness boost, so array order is not load-bearing.
 */
export const groundingChunks: GroundingChunk[] = [...evergreenChunks, ...freshChunks];

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

/**
 * Fresh (recent-discovery) chunks, newest first (PULSE.md §15). Powers the
 * weekly digest (§15.7 F3) — the durable, crawlable Pulse surface, rendered from
 * the stable vetted `claim` (not the ephemeral generated phrasing, §8).
 */
export function freshChunksByRecency(): GroundingChunk[] {
  return groundingChunks
    .filter((c) => c.kind === "fresh" && typeof c.addedAt === "string")
    .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
}
