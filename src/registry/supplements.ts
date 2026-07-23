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
import {
  type EvidenceBasis,
  type EvidenceGrade,
  type EvidenceTier,
  evidenceGrade,
} from "@/registry/peptides";

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
      "Whey and protein powder, evidence-first: what it is, the well-established role of total protein in muscle growth, who actually benefits, practical notes and the ISSN position stand.",    relatedSupplements: ["creatine-monohydrate", "collagen"],
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
    relatedSupplements: ["magnesium", "zma"],
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
  {
    slug: "vitamin-d",
    name: "Vitamin D",
    aka: ["Vitamin D3", "cholecalciferol"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Correcting a deficiency matters; a performance boost if you're already replete is unproven.",
    metaDescription:
      "Vitamin D, evidence-first: correcting deficiency is well established for health, but a performance boost in people who are already replete is preliminary at best. Who should test, and safety.",
    safety: {
      title: "Safety — vitamin D",
      points: [
        "More is not better: very high doses over time can cause toxicity (high blood calcium) with nausea, kidney problems and worse.",
        "Do not megadose. If unsure, ask for a blood test and follow national guidance on sensible amounts.",
      ],
    },
    relatedSupplements: ["omega-3", "magnesium"],
    relatedTools: [],
    faq: [
      {
        q: "Should I take vitamin D?",
        a: "If you're deficient — common in winter at northern latitudes — correcting it is worthwhile for bone and general health. If your levels are already adequate, extra vitamin D is unlikely to improve performance.",
      },
      {
        q: "Does it boost strength or testosterone?",
        a: "Claims of strength or testosterone gains mostly come from correcting a deficiency, not from topping up someone who is already replete. In replete people the performance evidence is weak.",
      },
      {
        q: "How would I know if I'm low?",
        a: "A simple blood test. Risk factors include little sun exposure, darker skin, covering up, and northern winters. Testing beats guessing at a dose.",
      },
      {
        q: "D3 or D2?",
        a: "D3 (cholecalciferol) is generally preferred as it raises blood levels more effectively than D2.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: vitamin D status, supplementation and muscle function / athletic performance (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+D+supplementation+muscle+function+athletic+performance+review",
      },
    ],
  },
  {
    slug: "omega-3",
    name: "Omega-3 (fish oil)",
    aka: ["EPA/DHA", "fish oil"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Solid general-health rationale; the muscle and recovery benefits are still preliminary.",
    metaDescription:
      "Omega-3 / fish oil, honestly reviewed: the general-health case, the preliminary evidence for recovery and muscle, and how it differs from the marketing — with sources.",
    relatedSupplements: ["vitamin-d"],
    relatedTools: ["heart-age-calculator"],
    faq: [
      {
        q: "Do omega-3s help muscle or recovery?",
        a: "There's early, promising evidence that EPA/DHA may modestly support muscle protein synthesis and reduce soreness, but it's preliminary and not a reason to expect big training gains.",
      },
      {
        q: "Should I take fish oil anyway?",
        a: "If you rarely eat oily fish, a supplement is a reasonable way to get EPA and DHA, which have a broader general-health rationale. Whole-food fish is the first-choice source.",
      },
      {
        q: "How much and what to look for?",
        a: "What matters is the EPA + DHA content, not the total fish-oil weight — check the label. Quality and freshness (avoiding rancidity) also matter.",
      },
      {
        q: "Are algae oils an option?",
        a: "Yes — algae-based omega-3 provides EPA/DHA without fish and suits vegans.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: omega-3 (EPA/DHA) supplementation, muscle protein synthesis and exercise recovery",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=omega-3+EPA+DHA+muscle+protein+synthesis+recovery",
      },
    ],
  },
  {
    slug: "magnesium",
    name: "Magnesium",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Fixing a shortfall can help sleep and cramps; a boost when you're replete is weak.",
    metaDescription:
      "Magnesium, evidence-first: correcting a deficiency may help sleep and cramps, but performance benefits in people who are already replete are weak. Forms, and safety.",
    safety: {
      title: "Safety — magnesium",
      points: [
        "High supplemental doses commonly cause diarrhoea and stomach upset; magnesium oxide is the worst offender.",
        "People with kidney problems should not supplement magnesium without medical advice.",
      ],
    },
    relatedSupplements: ["zma", "vitamin-d"],
    relatedTools: ["recovery-readiness-index"],
    faq: [
      {
        q: "Does magnesium improve sleep?",
        a: "If you're low in magnesium, correcting it may help sleep and muscle cramps. The evidence for a sleep benefit in people who already get enough is weaker and often overstated.",
      },
      {
        q: "Which form is best?",
        a: "Well-absorbed forms like magnesium citrate, glycinate or malate are preferable to magnesium oxide, which is poorly absorbed and most likely to cause loose stools.",
      },
      {
        q: "Will it help my performance?",
        a: "Mainly by fixing a deficiency. Topping up someone who is already replete has not been shown to reliably boost strength or endurance.",
      },
      {
        q: "Can I just get it from food?",
        a: "Often yes — leafy greens, nuts, seeds, legumes and wholegrains are good sources. Food first, supplement to fill a genuine gap.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: magnesium supplementation, sleep, cramps and exercise performance",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+supplementation+sleep+OR+exercise+performance",
      },
    ],
  },
  {
    slug: "electrolytes",
    name: "Electrolytes",
    aka: ["Sodium, potassium, etc."],
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "Genuinely useful for heavy, prolonged sweating — overkill as an everyday drink for most.",
    metaDescription:
      "Electrolytes, honestly reviewed: the well-established role in replacing sweat losses during prolonged exercise versus the marketing that everyone needs a daily electrolyte drink.",
    safety: {
      title: "Safety — electrolytes",
      points: [
        "Most people already get plenty of sodium from food; adding a lot more isn't automatically helpful, especially with high blood pressure.",
        "In very long events, drinking large volumes of plain water without electrolytes can dangerously dilute blood sodium (hyponatraemia).",
      ],
    },
    relatedSupplements: ["caffeine"],
    relatedTools: ["water-intake-calculator"],
    faq: [
      {
        q: "Do I need an electrolyte drink every day?",
        a: "For most people, no. A normal diet supplies enough electrolytes. They earn their keep during long, hot or very sweaty sessions where you lose meaningful sodium — not as an everyday wellness drink.",
      },
      {
        q: "When do electrolytes actually matter?",
        a: "During prolonged endurance exercise (roughly beyond 60–90 minutes), heavy sweating, or in the heat, where replacing sodium (and fluid) supports performance and safety.",
      },
      {
        q: "Isn't more sodium bad for me?",
        a: "For athletes losing lots in sweat, replacing it is sensible. But most people already eat plenty of sodium, and those with high blood pressure shouldn't add more without a reason.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: sodium / electrolyte replacement, hydration and endurance-exercise performance",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=electrolyte+sodium+hydration+endurance+exercise+performance",
      },
    ],
  },
  {
    slug: "collagen",
    name: "Collagen",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Emerging evidence for tendons, joints and skin — but a poor muscle-building protein.",
    metaDescription:
      "Collagen, evidence-first: the emerging (preliminary) case for tendon, joint and skin support versus its weakness as a muscle-building protein. What the research shows.",
    relatedSupplements: ["whey-protein"],
    relatedTools: [],
    faq: [
      {
        q: "Does collagen help joints and tendons?",
        a: "There's growing, still-preliminary evidence that collagen (often with vitamin C, taken before loading) may support tendon and joint tissue and reduce some joint pain. Promising, not proven.",
      },
      {
        q: "Is collagen good for building muscle?",
        a: "No — it's a low-quality protein for muscle, lacking enough of the key amino acid leucine. For muscle, whey or a good mixed-protein diet is far better.",
      },
      {
        q: "What about skin?",
        a: "Some trials report improvements in skin hydration and elasticity. The effect sizes are modest and the field is commercially driven, so keep expectations measured.",
      },
      {
        q: "Does the source matter?",
        a: "Hydrolysed collagen (collagen peptides) is the common, more absorbable form used in studies. It is not vegan (it's animal-derived).",
      },
    ],
    sources: [
      {
        label:
          "PubMed: collagen peptide supplementation — tendon, joint and skin outcomes (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=collagen+peptide+supplementation+tendon+OR+joint+OR+skin",
      },
    ],
  },
  {
    slug: "zma",
    name: "ZMA",
    aka: ["Zinc, magnesium aspartate, B6"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "The testosterone- and strength-boosting claims don't hold up in people who aren't deficient.",
    metaDescription:
      "ZMA, honestly reviewed: why the testosterone- and strength-boosting marketing isn't supported in people who aren't deficient, and what zinc and magnesium actually do.",
    relatedSupplements: ["magnesium", "ashwagandha"],
    relatedTools: [],
    faq: [
      {
        q: "Does ZMA boost testosterone?",
        a: "In men who aren't deficient in zinc or magnesium — which is most people who train and eat reasonably — controlled studies do not support meaningful testosterone or strength increases. That's the headline claim, and it doesn't hold up.",
      },
      {
        q: "So is ZMA useless?",
        a: "Not entirely: if you're genuinely low in zinc or magnesium, correcting that has value. But that's a case for fixing a deficiency, not for ZMA's marketed muscle-building promise.",
      },
      {
        q: "Is it just zinc and magnesium?",
        a: "Yes — ZMA is zinc, magnesium and vitamin B6 in a branded combination. You can get the same nutrients from food or plain zinc/magnesium if needed.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: ZMA (zinc magnesium aspartate) supplementation, testosterone and strength — controlled trials",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=ZMA+zinc+magnesium+testosterone+strength",
      },
    ],
  },
  {
    slug: "pre-workout",
    name: "Pre-workout",
    aka: ["Pre-workout blends"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "A few proven ingredients wrapped in a lot of underdosed, unproven extras.",
    metaDescription:
      "Pre-workout supplements, honestly reviewed: the handful of ingredients that actually work (caffeine, beta-alanine, citrulline) versus the underdosed proprietary-blend marketing.",
    safety: {
      title: "Safety — pre-workout",
      points: [
        "Most of the effect is caffeine, often in high doses; watch total daily intake, late-day timing and stacking with coffee.",
        "People who are pregnant or have heart, blood-pressure or anxiety conditions should be cautious with stimulant blends.",
        "“Proprietary blends” can hide doses; occasionally products are adulterated with undisclosed stimulants.",
      ],
    },
    relatedSupplements: ["caffeine", "beta-alanine", "citrulline-malate"],
    relatedTools: ["caffeine-calculator"],
    faq: [
      {
        q: "Do pre-workouts work?",
        a: "The parts that work are the well-evidenced ingredients — mainly caffeine, plus beta-alanine and citrulline. The benefit is those ingredients, not the brand or the proprietary blend around them.",
      },
      {
        q: "What's actually worth having in one?",
        a: "Caffeine (for most of the kick), beta-alanine (for repeated high-intensity efforts) and citrulline (a modest maybe). Much of the rest is underdosed or unproven.",
      },
      {
        q: "Why 'proprietary blend' is a red flag",
        a: "A blend that lists a total without per-ingredient amounts lets a product look loaded while under-dosing the effective ingredients. Prefer products that disclose every dose.",
      },
      {
        q: "Can I just make my own?",
        a: "Effectively yes — the evidence-based ingredients are available individually, letting you control the doses and skip paying for filler.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: multi-ingredient pre-workout supplements — performance evidence and ingredient dosing",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=multi-ingredient+pre-workout+supplement+performance",
      },
    ],
  },
  {
    slug: "beetroot-juice",
    name: "Beetroot juice",
    aka: ["Dietary nitrate", "Beetroot"],
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "Dietary nitrate that genuinely improves endurance economy in many people.",
    metaDescription:
      "Beetroot juice and dietary nitrate, evidence-first: the solid human data for endurance and exercise economy, who responds (and who doesn't), the harmless red urine, and practical notes.",
    safety: {
      title: "Safety — beetroot juice",
      points: [
        "Harmless red or pink urine and stools (beeturia) are common and no cause for concern.",
        "Nitrate can lower blood pressure; anyone on blood-pressure or nitrate medication should check with a doctor first.",
        "Antibacterial mouthwash blunts the effect, because mouth bacteria are needed to convert nitrate to the active nitrite.",
      ],
    },
    relatedSupplements: ["sodium-bicarbonate", "caffeine"],
    relatedTools: ["heart-rate-zone-calculator", "running-pace-calculator"],
    faq: [
      {
        q: "Does beetroot juice actually improve performance?",
        a: "For endurance, often yes. The dietary nitrate it contains raises nitric oxide, which can modestly improve exercise economy and time to exhaustion — one of the better-evidenced endurance aids. The benefit is clearest in recreational athletes; highly-trained athletes tend to respond less.",
      },
      {
        q: "Is it the beetroot or the nitrate?",
        a: "The active ingredient is the nitrate, which is why concentrated 'shots' standardised for nitrate are used in studies rather than a token amount of beetroot in a blend. Other nitrate-rich vegetables like rocket and spinach provide it too.",
      },
      {
        q: "When should I take it?",
        a: "Studies typically dose it a couple of hours before exercise, because blood nitrite peaks with a delay. Some protocols load it over several days. Individual response varies a lot, so it's worth testing in training before relying on it.",
      },
      {
        q: "Why does it turn my urine red?",
        a: "That's beeturia — a harmless pigment effect from the beetroot, not blood. It's completely benign and simply means you've had a good dose of beetroot.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: dietary nitrate / beetroot juice supplementation and endurance-exercise performance (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=dietary+nitrate+beetroot+juice+endurance+exercise+performance+review",
      },
    ],
  },
  {
    slug: "sodium-bicarbonate",
    name: "Sodium bicarbonate",
    aka: ["Baking soda", "Bicarb"],
    headlineTier: "well-supported",
    headlineBasis: "human",
    short:
      "A blood buffer with real evidence for repeated high-intensity efforts — if your gut tolerates it.",
    metaDescription:
      "Sodium bicarbonate for performance, evidence-first: the well-established buffering benefit for high-intensity exercise, the notorious gut-upset trade-off, and who it suits — with sources.",
    safety: {
      title: "Safety — sodium bicarbonate",
      points: [
        "Gastrointestinal upset — bloating, cramps, nausea and diarrhoea — is common and can wreck a session; it must be trialled in training, never first on race day.",
        "It is a large sodium load; people with high blood pressure, kidney or heart conditions should avoid it without medical advice.",
        "This is educational information about the evidence, not a recommendation to self-experiment with a performance dose.",
      ],
    },
    relatedSupplements: ["beetroot-juice", "beta-alanine"],
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "What does sodium bicarbonate do?",
        a: "It raises the blood's buffering capacity, helping neutralise the acidity that builds up during hard efforts. There's solid evidence it can improve performance in repeated high-intensity exercise lasting roughly one to ten minutes.",
      },
      {
        q: "What's the catch?",
        a: "The gut. Meaningful doses commonly cause bloating, cramps and diarrhoea, which can easily outweigh the benefit. This is the single biggest reason people abandon it, and why it must be tested thoroughly in training first.",
      },
      {
        q: "How does it compare to beta-alanine?",
        a: "They buffer acidity by different routes — bicarbonate outside the muscle cell, beta-alanine (via carnosine) inside it — and some evidence suggests they can complement each other for the right kind of high-intensity event.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: sodium bicarbonate supplementation and high-intensity exercise performance (position stands and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+bicarbonate+supplementation+high-intensity+exercise+performance",
      },
    ],
  },
  {
    slug: "hmb",
    name: "HMB",
    aka: ["β-Hydroxy β-methylbutyrate"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A leucine metabolite with a plausible anti-catabolic role but oversold muscle claims.",
    metaDescription:
      "HMB (β-hydroxy β-methylbutyrate), honestly reviewed: the preliminary evidence, why it may help most in untrained or muscle-wasting situations rather than trained lifters, and the marketing gap.",
    relatedSupplements: ["creatine-monohydrate", "whey-protein"],
    relatedTools: [],
    faq: [
      {
        q: "Does HMB build muscle?",
        a: "The evidence is mixed and mostly underwhelming in trained lifters who already eat enough protein. Its more plausible role is anti-catabolic — reducing muscle breakdown — which may matter most during heavy dieting, injury or in older or untrained people, not for adding slabs of muscle.",
      },
      {
        q: "Isn't it just from protein anyway?",
        a: "HMB is a metabolite of the amino acid leucine, which you already get from protein. If your protein intake is adequate, you're producing some HMB already, which is one reason supplementing often adds little.",
      },
      {
        q: "Why the gap between studies and marketing?",
        a: "A handful of early studies showed dramatic results that later, better-controlled research struggled to reproduce. The marketing tends to lean on the optimistic early data rather than the more sober overall picture.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: HMB (beta-hydroxy beta-methylbutyrate) supplementation, muscle mass and strength (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=HMB+beta-hydroxy-beta-methylbutyrate+muscle+strength",
      },
    ],
  },
  {
    slug: "l-carnitine",
    name: "L-carnitine",
    aka: ["Acetyl-L-carnitine", "Carnitine"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A fat-metabolism carrier whose fat-loss reputation runs well ahead of the evidence.",
    metaDescription:
      "L-carnitine, evidence-first: why the 'fat-burner' reputation is largely unproven, the more interesting preliminary data on recovery and blood flow, and the safety context.",
    relatedSupplements: ["caffeine", "omega-3"],
    relatedTools: [],
    faq: [
      {
        q: "Does L-carnitine burn fat?",
        a: "Its role in shuttling fatty acids into cells to be burned is real biology, but that doesn't translate into meaningful fat loss from a supplement in most people. As a weight-loss aid the evidence is weak and often overstated.",
      },
      {
        q: "Is there anything it may help with?",
        a: "The more interesting, still-preliminary evidence is around exercise recovery and blood flow rather than fat loss, with some studies suggesting reduced markers of muscle damage. Promising, not proven.",
      },
      {
        q: "Do I need to supplement it?",
        a: "Healthy people who eat meat generally have plenty of carnitine and make their own, so a deficiency is uncommon. That's another reason topping up rarely does much.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: L-carnitine supplementation, fat metabolism, weight loss and exercise recovery (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=L-carnitine+supplementation+weight+loss+OR+exercise+recovery",
      },
    ],
  },
  {
    slug: "tart-cherry",
    name: "Tart cherry",
    aka: ["Montmorency cherry"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Polyphenol-rich juice with early evidence for recovery and sleep.",
    metaDescription:
      "Tart cherry (Montmorency), honestly reviewed: the preliminary human evidence for reduced soreness, faster recovery and better sleep, and the caveat about blunting training adaptations.",
    relatedSupplements: ["omega-3", "magnesium"],
    relatedTools: ["recovery-readiness-index"],
    faq: [
      {
        q: "Does tart cherry help recovery?",
        a: "There's promising evidence that its polyphenols and anthocyanins can reduce muscle soreness and speed recovery after hard or damaging exercise, which is why some endurance athletes use it around competition.",
      },
      {
        q: "Can it help me sleep?",
        a: "Some small studies report modest improvements in sleep, possibly via its melatonin content and effects on sleep-regulating pathways. The effect is gentle, not a sleeping pill.",
      },
      {
        q: "Any downside to using it all the time?",
        a: "Like other high-dose antioxidants, there's a theoretical concern that routinely blunting exercise-induced inflammation could dampen some training adaptations, so many use it around events rather than every day.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: tart cherry / Montmorency cherry supplementation, exercise recovery and sleep (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=tart+cherry+Montmorency+exercise+recovery+OR+sleep",
      },
    ],
  },
  {
    slug: "taurine",
    name: "Taurine",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "An amino acid common in energy drinks with modest, inconsistent performance data.",
    metaDescription:
      "Taurine, evidence-first: the mixed human evidence for endurance and recovery, its role in energy drinks, and why it's a modest 'maybe' rather than a proven ergogenic.",
    relatedSupplements: ["caffeine", "citrulline-malate"],
    relatedTools: [],
    faq: [
      {
        q: "Does taurine do anything for performance?",
        a: "Some studies suggest small improvements in endurance and a possible reduction in muscle damage, but results are inconsistent and effect sizes modest. It's a reasonable 'might help a little', not a reliable booster.",
      },
      {
        q: "Is it a stimulant like caffeine?",
        a: "No. Despite appearing in energy drinks, taurine is a non-stimulant amino acid. Any kick from an energy drink is the caffeine and sugar, not the taurine.",
      },
      {
        q: "Is it safe?",
        a: "Taurine is generally well tolerated in the amounts studied, and the body also makes it. As always, most of the marketing around it outstrips the fairly modest evidence.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: taurine supplementation and exercise performance / recovery (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=taurine+supplementation+exercise+performance+recovery",
      },
    ],
  },
  {
    slug: "l-theanine",
    name: "L-theanine",
    aka: ["Theanine"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A tea-derived amino acid best known for taking the edge off caffeine.",
    metaDescription:
      "L-theanine, honestly reviewed: the preliminary evidence for calm focus, its popular pairing with caffeine to reduce jitters, and realistic expectations.",
    relatedSupplements: ["caffeine"],
    relatedTools: ["caffeine-calculator"],
    faq: [
      {
        q: "What does L-theanine do?",
        a: "Found naturally in tea, it's associated with a state of relaxed alertness. The preliminary evidence points to a subtle calming effect on attention rather than anything dramatic.",
      },
      {
        q: "Why is it paired with caffeine?",
        a: "The popular combination aims to keep caffeine's focus and alertness while taking the edge off its jitters and anxiety. Some studies support smoother attention from the pair than caffeine alone, though effects are modest.",
      },
      {
        q: "Will it make me drowsy?",
        a: "It isn't a sedative and doesn't typically cause drowsiness at common amounts — the goal is calm focus, not sleep. It's one of the gentler, better-tolerated supplements.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: L-theanine, caffeine, attention and cognition (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=L-theanine+caffeine+attention+cognition",
      },
    ],
  },
  {
    slug: "rhodiola-rosea",
    name: "Rhodiola rosea",
    aka: ["Rhodiola", "Golden root"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "An adaptogen with early data for fatigue, especially mental fatigue.",
    metaDescription:
      "Rhodiola rosea, evidence-first: the preliminary human evidence for reducing fatigue and perceived exertion, the small-study caveats, and safety context.",
    safety: {
      title: "Safety — rhodiola",
      points: [
        "Generally well tolerated, but can occasionally cause irritability, jitteriness or trouble sleeping, especially later in the day.",
        "As a herbal product, potency varies between brands, and it can interact with some medications — seek medical advice if you take any.",
      ],
    },
    relatedSupplements: ["ashwagandha", "caffeine"],
    relatedTools: [],
    faq: [
      {
        q: "Does rhodiola reduce fatigue?",
        a: "Several small trials suggest it may reduce fatigue — particularly mental fatigue and burnout-type tiredness — and perhaps lower perceived effort during exercise. The studies are small and mixed, so treat it as promising rather than established.",
      },
      {
        q: "Is it a stimulant?",
        a: "No, it's classed as an adaptogen, working on the body's stress response rather than acting as a direct stimulant like caffeine. Any anti-fatigue effect is subtler than a stimulant hit.",
      },
      {
        q: "How is it usually taken?",
        a: "Studies most often use standardised extracts taken over a period of weeks. Because herbal potency varies widely, standardisation and product quality matter more here than with a single defined molecule.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: Rhodiola rosea supplementation, fatigue and physical/mental performance (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=Rhodiola+rosea+fatigue+performance",
      },
    ],
  },
  {
    slug: "curcumin",
    name: "Curcumin",
    aka: ["Turmeric extract"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "The active turmeric compound, with early evidence for soreness and joint comfort.",
    metaDescription:
      "Curcumin (turmeric extract), honestly reviewed: the preliminary evidence for reduced muscle soreness and joint discomfort, the poor-absorption problem, and safety.",
    safety: {
      title: "Safety — curcumin",
      points: [
        "Generally well tolerated, but it can have a mild blood-thinning effect; be cautious if you take anticoagulants or are due surgery, and seek medical advice.",
        "Plain turmeric powder is poorly absorbed; the supplements studied use enhanced-absorption extracts, so results from one form don't transfer to another.",
      ],
    },
    relatedSupplements: ["omega-3", "tart-cherry"],
    relatedTools: [],
    faq: [
      {
        q: "Does curcumin reduce muscle soreness?",
        a: "There's growing, still-preliminary evidence that curcumin's anti-inflammatory action may reduce post-exercise soreness and markers of muscle damage. The effect looks real but modest.",
      },
      {
        q: "Is turmeric in food enough?",
        a: "Probably not for a supplemental effect — curcumin is a small fraction of turmeric and is poorly absorbed. The studies use concentrated extracts formulated for absorption, not culinary turmeric.",
      },
      {
        q: "What about joints and inflammation?",
        a: "Some trials suggest it may ease joint discomfort, with a few comparing it favourably to standard anti-inflammatories for osteoarthritis symptoms — but the evidence base is still maturing and commercially driven.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: curcumin supplementation, muscle soreness, recovery and joint/inflammation outcomes (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=curcumin+supplementation+muscle+soreness+OR+osteoarthritis",
      },
    ],
  },
  {
    slug: "glucosamine-chondroitin",
    name: "Glucosamine & chondroitin",
    aka: ["Glucosamine", "Chondroitin"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Popular joint supplements with genuinely mixed, modest evidence.",
    metaDescription:
      "Glucosamine and chondroitin, evidence-first: the conflicting trial data for joint pain and osteoarthritis, who might see a small benefit, and safety notes.",
    safety: {
      title: "Safety — glucosamine & chondroitin",
      points: [
        "Glucosamine is often derived from shellfish; people with shellfish allergy should check the source.",
        "May affect blood-sugar control and interact with blood-thinning medication — seek medical advice if either applies.",
      ],
    },
    relatedSupplements: ["collagen", "curcumin"],
    relatedTools: [],
    faq: [
      {
        q: "Do glucosamine and chondroitin work for joints?",
        a: "The evidence is genuinely mixed. Large trials have been conflicting: some people with osteoarthritis report modest pain relief, while well-controlled studies often show little better than placebo. It's a reasonable trial-and-see, not a sure thing.",
      },
      {
        q: "Will they help a healthy person's joints?",
        a: "There's little evidence they prevent joint problems or benefit healthy joints. Most research is in people who already have osteoarthritis, not in athletes using them preventively.",
      },
      {
        q: "How long before I'd know?",
        a: "If someone responds, it typically takes several weeks of consistent use. If there's no change after a couple of months, continuing is unlikely to help.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: glucosamine and chondroitin, joint pain and osteoarthritis (randomised trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=glucosamine+chondroitin+osteoarthritis+joint+pain+randomized",
      },
    ],
  },
  {
    slug: "probiotics",
    name: "Probiotics",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Strain-specific gut bacteria with benefits that don't generalise across products.",
    metaDescription:
      "Probiotics, honestly reviewed: why effects are strain-specific, the preliminary evidence for gut and immune outcomes in athletes, and why 'probiotics' as a category tells you little.",
    safety: {
      title: "Safety — probiotics",
      points: [
        "Generally safe for healthy people, but those who are seriously immunocompromised or critically ill should only use them under medical guidance.",
        "Benefits are specific to particular strains and doses; a product without a named, studied strain may do nothing.",
      ],
    },
    relatedSupplements: ["omega-3"],
    relatedTools: [],
    faq: [
      {
        q: "Do probiotics help with training or health?",
        a: "Some strains have preliminary evidence for gut comfort, reducing the frequency or duration of colds, and supporting the gut during heavy training. But benefits are strain-specific — results with one strain don't transfer to another.",
      },
      {
        q: "Why does the strain matter so much?",
        a: "'Probiotics' is a huge category of different bacteria doing different things. A benefit shown for one named strain at a given dose says nothing about an unrelated strain in another product, which is why the label detail matters.",
      },
      {
        q: "Food or supplement?",
        a: "Fermented foods like yoghurt, kefir and sauerkraut supply live cultures and a broader diet-quality benefit. A supplement makes sense mainly when targeting a specific, studied strain for a specific reason.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: probiotics supplementation, athletes, gut and immune outcomes (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=probiotics+supplementation+athletes+immune+OR+gastrointestinal",
      },
    ],
  },
  {
    slug: "zinc",
    name: "Zinc",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Essential mineral where correcting a shortfall helps — but more isn't better.",
    metaDescription:
      "Zinc, evidence-first: correcting a deficiency supports immunity and hormones, but supplementing when replete does little, and excess causes copper deficiency. Safety and forms.",
    safety: {
      title: "Safety — zinc",
      points: [
        "Chronic high doses cause a copper deficiency, which can lead to anaemia and nerve problems — don't take a lot long-term without a reason.",
        "Large single doses on an empty stomach commonly cause nausea; national upper limits are relatively low.",
      ],
    },
    relatedSupplements: ["magnesium", "vitamin-d"],
    relatedTools: [],
    faq: [
      {
        q: "Does zinc boost testosterone?",
        a: "Mainly by correcting a deficiency. In men who are genuinely low in zinc, restoring it can help hormone levels; in men who already have enough, extra zinc does not reliably raise testosterone despite the marketing.",
      },
      {
        q: "Does it help with colds?",
        a: "There's reasonable evidence that zinc taken promptly at the onset of a cold may shorten it slightly, though results vary by form and dose. That's separate from any performance claim.",
      },
      {
        q: "Can I take too much?",
        a: "Yes. High-dose zinc over time causes copper deficiency, so more is not better. Food sources — meat, shellfish, seeds and legumes — cover most people's needs.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: zinc status and supplementation — immunity, testosterone and exercise (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=zinc+supplementation+immunity+OR+testosterone+exercise",
      },
    ],
  },
  {
    slug: "iron",
    name: "Iron",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Vital for oxygen transport — supplement only to correct a tested deficiency.",
    metaDescription:
      "Iron, honestly reviewed: correcting a genuine deficiency clearly helps endurance and energy, but supplementing without testing is risky. Who's at risk, and important safety.",
    safety: {
      title: "Safety — iron",
      points: [
        "Don't supplement iron without a blood test — excess iron accumulates and can damage the liver and other organs, and some people carry a genetic tendency to overload.",
        "Iron tablets are a leading cause of poisoning in young children; store them out of reach.",
        "Supplements commonly cause constipation and stomach upset.",
      ],
    },
    relatedSupplements: ["vitamin-d", "zinc"],
    relatedTools: [],
    faq: [
      {
        q: "Should I take iron for energy or endurance?",
        a: "Only if a blood test shows you're low. Correcting genuine iron deficiency clearly improves energy and endurance, but taking iron when your levels are normal offers no benefit and carries real risks.",
      },
      {
        q: "Who is most at risk of deficiency?",
        a: "People who menstruate, vegetarians and vegans, and endurance athletes (who can lose iron and have higher turnover) are more prone to low iron. Testing beats guessing.",
      },
      {
        q: "Why not just take it to be safe?",
        a: "Because the body has no easy way to excrete excess iron, over-supplementing can cause harmful build-up. It's one of the clearest 'test, don't guess' supplements.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: iron deficiency, supplementation and endurance-exercise performance (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=iron+deficiency+supplementation+endurance+exercise+performance",
      },
    ],
  },
  {
    slug: "vitamin-c",
    name: "Vitamin C",
    aka: ["Ascorbic acid"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Important nutrient, but high-dose supplements do little for healthy, well-fed people.",
    metaDescription:
      "Vitamin C, evidence-first: why high-dose supplements rarely help well-nourished people, the modest cold evidence, and the concern that mega-doses may blunt training adaptations.",
    safety: {
      title: "Safety — vitamin C",
      points: [
        "Very large doses commonly cause stomach upset and diarrhoea and can raise the risk of kidney stones in susceptible people.",
        "Routine high-dose antioxidant supplements may interfere with some beneficial exercise adaptations — food-level amounts don't carry this concern.",
      ],
    },
    relatedSupplements: ["vitamin-d", "zinc"],
    relatedTools: [],
    faq: [
      {
        q: "Does vitamin C prevent colds?",
        a: "For most people, regular supplements don't prevent colds, though they may slightly shorten one. The famous claims greatly overstate a modest, inconsistent effect.",
      },
      {
        q: "Should athletes megadose antioxidants?",
        a: "Probably not routinely. High-dose vitamin C and E around training may blunt some of the adaptations you're training for, because a degree of exercise-induced oxidative stress is part of the signal to adapt.",
      },
      {
        q: "Can't I just eat it?",
        a: "Easily — fruit and vegetables provide ample vitamin C for nearly everyone, along with other nutrients. Deficiency is rare in a varied diet.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: vitamin C supplementation — common cold, antioxidants and exercise adaptation (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+C+supplementation+common+cold+OR+exercise+adaptation",
      },
    ],
  },
  {
    slug: "melatonin",
    name: "Melatonin",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A sleep-timing hormone that's useful for jet lag — less so as a nightly sleeping pill.",
    metaDescription:
      "Melatonin, honestly reviewed: the good evidence for shifting body-clock timing and jet lag versus its weaker role as a general sleeping aid, plus timing and safety.",
    safety: {
      title: "Safety — melatonin",
      points: [
        "Can cause grogginess, vivid dreams or next-day drowsiness, especially at higher amounts or the wrong time of day.",
        "Long-term safety is not well established; it is a hormone. Avoid in pregnancy and seek medical advice for children, or if you take other medication.",
        "In some countries it is a prescription-only medicine — follow local rules and medical guidance.",
      ],
    },
    relatedSupplements: ["magnesium", "glycine"],
    relatedTools: ["sleep-calculator"],
    faq: [
      {
        q: "Does melatonin help you sleep?",
        a: "Its strongest evidence is for shifting the body clock — jet lag and delayed sleep timing — rather than as a sedative. It can modestly help you fall asleep a bit faster, but it's not a powerful sleeping pill.",
      },
      {
        q: "Is timing more important than dose?",
        a: "Often, yes. Because it signals 'time for sleep' to your body clock, when you take it matters a lot, and lower amounts taken at the right time can work as well as larger ones.",
      },
      {
        q: "Is it safe to take every night?",
        a: "It's widely used short-term, but the long-term safety of nightly use isn't well established, and it's a hormone. It's best treated as a targeted tool rather than a default nightcap, with medical advice for ongoing use.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: melatonin supplementation, sleep onset, jet lag and circadian timing (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+supplementation+sleep+jet+lag+circadian",
      },
    ],
  },
  {
    slug: "glycine",
    name: "Glycine",
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "A simple amino acid with early evidence for sleep quality.",
    metaDescription:
      "Glycine, evidence-first: the small but interesting human data for improving sleep quality when taken before bed, and realistic expectations for this well-tolerated amino acid.",
    relatedSupplements: ["melatonin", "magnesium"],
    relatedTools: ["sleep-calculator"],
    faq: [
      {
        q: "Does glycine improve sleep?",
        a: "A few small studies suggest taking glycine before bed can improve subjective sleep quality and reduce next-day tiredness, possibly by gently lowering core body temperature. It's promising but based on limited research.",
      },
      {
        q: "How does it differ from melatonin?",
        a: "Glycine isn't a hormone and doesn't shift your body clock; the proposed effect is on sleep quality and getting to sleep comfortably, rather than on sleep timing. The two work by different routes.",
      },
      {
        q: "Is it safe?",
        a: "Glycine is an amino acid found in food and is generally very well tolerated at the amounts studied. As with most sleep supplements, expectations should be modest.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: glycine supplementation and sleep quality (trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=glycine+supplementation+sleep+quality",
      },
    ],
  },
  {
    slug: "green-tea-extract",
    name: "Green tea extract",
    aka: ["EGCG", "Green tea catechins"],
    headlineTier: "preliminary",
    headlineBasis: "human",
    short:
      "Concentrated catechins with a small fat-oxidation effect — and a real liver caveat.",
    metaDescription:
      "Green tea extract (EGCG), honestly reviewed: the modest, often caffeine-dependent fat-oxidation evidence, why concentrated extracts differ from drinking tea, and the liver-safety warning.",
    safety: {
      title: "Safety — green tea extract",
      points: [
        "Concentrated EGCG extracts have been linked to rare but serious liver injury, particularly on an empty stomach — this is not a concern with drinking brewed tea.",
        "Extracts also contain caffeine; stop and seek medical advice if you notice jaundice, dark urine or abdominal pain.",
      ],
    },
    relatedSupplements: ["caffeine", "fat-burner"],
    relatedTools: [],
    faq: [
      {
        q: "Does green tea extract burn fat?",
        a: "Its catechins (chiefly EGCG) may slightly increase fat oxidation and energy expenditure, but the real-world effect on body weight is small and often depends on the caffeine it contains. It's a minor lever, not a fat-loss solution.",
      },
      {
        q: "Is it the same as drinking green tea?",
        a: "No. Concentrated extracts deliver far more catechins than a cup of tea, which is where both any effect and the liver-safety concern come from. Drinking brewed green tea is a safe, pleasant habit; high-dose extracts are a different proposition.",
      },
      {
        q: "Is it safe?",
        a: "Brewed tea is fine, but concentrated extracts have been associated with rare cases of liver damage. If you use one, avoid taking it on an empty stomach and stop at any sign of liver trouble.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: green tea extract / EGCG — fat oxidation, weight loss and hepatotoxicity (reviews and case reports)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=green+tea+extract+EGCG+fat+oxidation+OR+hepatotoxicity",
      },
    ],
  },
  {
    slug: "bcaa",
    name: "BCAAs",
    aka: ["Branched-chain amino acids"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "Largely redundant if you already eat enough protein.",
    metaDescription:
      "BCAAs, honestly reviewed: why branched-chain amino acids add little on top of adequate protein, the incomplete-signal problem, and when they're simply unnecessary.",
    relatedSupplements: ["whey-protein", "hmb"],
    relatedTools: ["macro-calculator"],
    faq: [
      {
        q: "Do BCAAs build muscle?",
        a: "For anyone eating enough total protein, they add very little. Building muscle needs all the essential amino acids; the three branched-chain ones alone provide an incomplete signal, and complete proteins like whey already contain plenty of them.",
      },
      {
        q: "Are they worth it during fasted training?",
        a: "The case is weak. A serving of whole protein or a complete protein source does the same job more completely and usually more cheaply. BCAAs are largely a solution to a problem most trainees don't have.",
      },
      {
        q: "Is there anyone they suit?",
        a: "The clearest edge cases are certain clinical situations. For a healthy person hitting their protein target, spending on BCAAs is generally poor value compared with food or whey.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: branched-chain amino acids (BCAA) supplementation, muscle protein synthesis and hypertrophy (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=branched-chain+amino+acids+muscle+protein+synthesis+hypertrophy",
      },
    ],
  },
  {
    slug: "glutamine",
    name: "Glutamine",
    aka: ["L-glutamine"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "Widely sold for muscle and immunity, with little support in healthy trainees.",
    metaDescription:
      "Glutamine, honestly reviewed: why the muscle-building and immune claims don't hold up in healthy, well-fed people, and the narrow clinical settings where it genuinely matters.",
    relatedSupplements: ["whey-protein", "bcaa"],
    relatedTools: [],
    faq: [
      {
        q: "Does glutamine build muscle?",
        a: "In healthy people who eat enough protein, controlled studies do not support meaningful gains in muscle or strength. The body makes glutamine and gets more from any protein-containing diet, so supplementing rarely changes anything.",
      },
      {
        q: "Does it help immunity or the gut?",
        a: "Its credible evidence is in specific clinical settings — serious illness, trauma or gut injury — not in healthy athletes. Extrapolating from those situations to everyday training is where the marketing overreaches.",
      },
      {
        q: "So who actually needs it?",
        a: "Mainly patients in defined medical contexts under supervision. For a healthy lifter, glutamine is one of the clearest examples of a well-marketed but low-value supplement.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: glutamine supplementation, muscle, immunity and exercise (reviews and trials)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=glutamine+supplementation+muscle+OR+immunity+exercise",
      },
    ],
  },
  {
    slug: "tribulus-terrestris",
    name: "Tribulus terrestris",
    aka: ["Tribulus", "Puncture vine"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "A perennial 'testosterone booster' that doesn't raise testosterone.",
    metaDescription:
      "Tribulus terrestris, honestly reviewed: why the testosterone- and strength-boosting claims fail in controlled studies, and the safety caveats around a herbal product.",
    safety: {
      title: "Safety — tribulus",
      points: [
        "As a herbal product, quality and content vary; there are isolated reports of liver and kidney problems with some tribulus products.",
        "Marketed 'test boosters' built on it can contain undisclosed ingredients — a general risk of the category.",
      ],
    },
    relatedSupplements: ["ashwagandha", "zma"],
    relatedTools: [],
    faq: [
      {
        q: "Does tribulus raise testosterone?",
        a: "No — controlled studies in men generally show it does not meaningfully raise testosterone or improve strength or muscle, despite being one of the most common ingredients in 'test booster' products.",
      },
      {
        q: "Why is it in so many products then?",
        a: "It has a long-standing reputation and a compelling marketing story, which has outlasted the disappointing evidence. Popularity here reflects tradition and marketing more than results.",
      },
      {
        q: "Is it safe?",
        a: "As a herbal extract, purity and dose vary between brands, and there are occasional reports of liver or kidney issues. Given the lack of benefit, there's little reason to take the risk.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: Tribulus terrestris, testosterone and exercise performance (trials and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=Tribulus+terrestris+testosterone+exercise+performance",
      },
    ],
  },
  {
    slug: "testosterone-booster",
    name: "Testosterone boosters",
    aka: ["T-boosters", "Natural test boosters"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "A category built on hope: most 'natural' blends don't reliably raise testosterone.",
    metaDescription:
      "Natural testosterone boosters, honestly reviewed: why most over-the-counter blends fail to raise testosterone in controlled studies, the deficiency-correction nuance, and safety.",
    safety: {
      title: "Safety — testosterone boosters",
      points: [
        "Proprietary blends can hide doses and occasionally contain undisclosed or banned substances, including actual hormones — a real risk for drug-tested athletes.",
        "Some products have been linked to liver injury. Genuine low testosterone is a medical issue to discuss with a doctor, not to self-treat with supplements.",
      ],
    },
    relatedSupplements: ["tribulus-terrestris", "zma", "ashwagandha"],
    relatedTools: [],
    faq: [
      {
        q: "Do natural testosterone boosters work?",
        a: "As a category, mostly no. The majority of over-the-counter blends do not reliably raise testosterone in controlled studies. Where an ingredient helps, it's usually by correcting a genuine deficiency (for example of zinc or vitamin D), not by boosting a normal level.",
      },
      {
        q: "What if my testosterone really is low?",
        a: "Genuinely low testosterone is a medical matter. A doctor can test and advise, and evidence-based treatment is very different from an over-the-counter 'booster'. Self-medicating with supplements isn't the answer.",
      },
      {
        q: "Are they safe?",
        a: "The proprietary-blend model makes the category risky: undisclosed ingredients, the odd banned substance, and rare reports of liver harm. For drug-tested athletes especially, they're best avoided.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: 'testosterone booster' supplements — efficacy and safety (analyses and reviews)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=testosterone+booster+supplement+efficacy+safety",
      },
    ],
  },
  {
    slug: "fat-burner",
    name: "Fat burners",
    aka: ["Thermogenics"],
    headlineTier: "marketing-claim",
    headlineBasis: "human",
    short:
      "Mostly caffeine and marketing — no supplement replaces an energy deficit.",
    metaDescription:
      "Fat burners and thermogenics, honestly reviewed: why most of the effect is caffeine, the small print on 'metabolism boosting', the stimulant-blend risks, and what actually drives fat loss.",
    safety: {
      title: "Safety — fat burners",
      points: [
        "Most rely on high-dose stimulants; stacking them with coffee or pre-workout risks jitters, raised heart rate, poor sleep and, rarely, serious cardiac events.",
        "Proprietary blends can hide doses and have historically included banned or withdrawn stimulants and hepatotoxic ingredients — a category with a poor safety track record.",
        "People who are pregnant or have heart, blood-pressure or anxiety conditions should avoid them.",
      ],
    },
    relatedSupplements: ["caffeine", "l-carnitine", "green-tea-extract"],
    relatedTools: ["caffeine-calculator"],
    faq: [
      {
        q: "Do fat burners work?",
        a: "Most of any real effect is the caffeine — a mild, temporary bump in metabolic rate and appetite suppression. The other ingredients are typically underdosed or unproven, and none override the need for an overall energy deficit to lose fat.",
      },
      {
        q: "What actually drives fat loss?",
        a: "A sustained energy deficit, enough protein, resistance training to keep muscle, and daily movement. A 'fat burner' can't substitute for those; at best it's a small, stimulant-driven nudge.",
      },
      {
        q: "Are they safe?",
        a: "The category has a chequered safety record — high stimulant loads, hidden doses and, historically, banned or harmful ingredients. The risk-to-benefit balance is poor, especially alongside other caffeine sources.",
      },
    ],
    sources: [
      {
        label:
          "PubMed: thermogenic 'fat burner' supplements — efficacy, ingredients and safety (reviews and analyses)",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=thermogenic+fat+burner+supplement+efficacy+safety",
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
  // No supplement is tiered `not-supported`, but the map stays exhaustive over
  // the shared EvidenceTier union so it sorts last if one ever is.
  "not-supported": 3,
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

const GRADE_ORDER: EvidenceGrade[] = [
  "gold",
  "silver",
  "bronze",
  "unproven",
  "not-supported",
];

/**
 * Supplements grouped on the medal ladder (the derived `evidenceGrade`, not the
 * stored tier), A→Z within each grade, empty grades dropped. Drives the
 * /supplements hub and the explorer so both read as one medal system.
 */
export function supplementsByGrade(): [EvidenceGrade, SupplementEntry[]][] {
  const byGrade = new Map<EvidenceGrade, SupplementEntry[]>();
  for (const s of [...supplements].sort((a, b) =>
    a.name.localeCompare(b.name, "en-GB"),
  )) {
    const grade = evidenceGrade(s.headlineTier, s.headlineBasis);
    const bucket = byGrade.get(grade);
    if (bucket) bucket.push(s);
    else byGrade.set(grade, [s]);
  }
  return GRADE_ORDER.filter((g) => byGrade.has(g)).map((g) => [
    g,
    byGrade.get(g)!,
  ]);
}

export function resolveRelatedSupplements(slugs: string[]): SupplementEntry[] {
  return slugs.flatMap((slug) => {
    const s = supplementsBySlug.get(slug);
    return s ? [s] : [];
  });
}
