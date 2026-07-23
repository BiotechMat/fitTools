/**
 * Blood-test biomarker panel (blood-test page). The typed list of markers the
 * planned at-home blood test measures, grouped for display and cross-linked
 * into the calculators each result will populate.
 *
 * PLACEHOLDER DATA (2026-07-23): the exact panel, units and marker set are NOT
 * yet confirmed — they depend on the blood-testing partner, which is not yet
 * integrated. These are best-judgment placeholders chosen to (a) match a
 * credible fitness/longevity panel and (b) line up with the inputs the site's
 * existing tools already consume (the Phenotypic Age panel, Heart Age lipids,
 * the metabolic markers). Confirm every marker, unit and description against
 * the partner's real assay before launch. Descriptions are educational only
 * and deliberately carry no reference ranges or "optimal" values (that would be
 * medical advice — see the disclaimer on the page).
 *
 * Same single-source-of-truth pattern as the tools / glossary / pulse / daily
 * registries: this drives the panel display, the sitemap-worthy content and
 * (later) the mapping from a result to the tool input it fills.
 */

import { getTool } from "@/registry/tools";

export const BIOMARKERS_LAST_REVIEWED = "2026-07-23";

/** Display groups for the panel. Order here is the order on the page. */
export type BiomarkerCategory =
  | "metabolic"
  | "heart"
  | "inflammation"
  | "organ"
  | "blood-count"
  | "hormones"
  | "vitamins";

export interface BiomarkerGroup {
  category: BiomarkerCategory;
  label: string;
  /** One-line intro for the group heading. */
  blurb: string;
  /** Reused chip style (existing tokens only — no new colours). */
  chip: string;
}

export const BIOMARKER_GROUPS: BiomarkerGroup[] = [
  {
    category: "metabolic",
    label: "Metabolic health",
    blurb: "How your body handles sugar and stores energy — the base of long-term metabolic health.",
    chip: "bg-good-soft text-foreground",
  },
  {
    category: "heart",
    label: "Heart & lipids",
    blurb: "The particles and fats that drive cardiovascular risk — the numbers behind your heart age.",
    chip: "bg-primary-soft text-foreground",
  },
  {
    category: "inflammation",
    label: "Inflammation & ageing",
    blurb: "Low-grade inflammation markers linked to how your body ages over time.",
    chip: "bg-warning-bg text-foreground",
  },
  {
    category: "organ",
    label: "Liver & kidney",
    blurb: "How your two main filtering organs are coping — quiet but important markers.",
    chip: "bg-surface-deep text-foreground",
  },
  {
    category: "blood-count",
    label: "Full blood count",
    blurb: "The make-up of your blood cells — oxygen delivery, immune status and more.",
    chip: "bg-good-soft text-foreground",
  },
  {
    category: "hormones",
    label: "Hormones",
    blurb: "Signals that shape energy, mood, recovery and body composition.",
    chip: "bg-primary-soft text-foreground",
  },
  {
    category: "vitamins",
    label: "Vitamins & minerals",
    blurb: "Common deficiencies that quietly sap energy, sleep and performance.",
    chip: "bg-fresh text-foreground",
  },
];

export interface Biomarker {
  /** Stable kebab-case id — used for anchors and (later) result mapping. */
  id: string;
  name: string;
  /** Abbreviations or alternate names. */
  aka?: string[];
  category: BiomarkerCategory;
  /** Typical reporting unit (PLACEHOLDER — confirm with the partner assay). */
  unit: string;
  /** One-line "what it is". */
  summary: string;
  /** 1–2 sentences: what it measures and why it matters. Educational, non-diagnostic. */
  description: string;
  /** Calculator this result will populate or refine (validated tool slug, no leading slash). */
  feedsTool?: string;
  /** Related glossary/content route (validated absolute route). */
  relatedContent?: string;
}

export const biomarkers: Biomarker[] = [
  // ---- Metabolic health ----
  {
    id: "fasting-glucose",
    name: "Fasting glucose",
    category: "metabolic",
    unit: "mmol/L",
    summary: "Blood sugar after an overnight fast.",
    description:
      "Your blood-sugar level after not eating overnight. A persistently raised fasting glucose is one of the earliest signs that the body is struggling to manage sugar, well before type-2 diabetes develops.",
    feedsTool: "metabolic-fitness-index",
    relatedContent: "/glossary/fasting-glucose",
  },
  {
    id: "hba1c",
    name: "HbA1c",
    aka: ["Glycated haemoglobin"],
    category: "metabolic",
    unit: "mmol/mol",
    summary: "Your average blood sugar over ~3 months.",
    description:
      "A single number that reflects your average blood sugar over the previous two to three months, so it smooths out day-to-day spikes. It's the standard marker for tracking long-term glucose control.",
    feedsTool: "metabolic-fitness-index",
    relatedContent: "/glossary/hba1c",
  },
  {
    id: "fasting-insulin",
    name: "Fasting insulin",
    aka: ["HOMA-IR"],
    category: "metabolic",
    unit: "mIU/L",
    summary: "How hard your pancreas is working to keep sugar in check.",
    description:
      "The amount of insulin circulating after a fast. Read alongside glucose, it flags insulin resistance early — often years before glucose itself starts to drift upward.",
    feedsTool: "metabolic-fitness-index",
    relatedContent: "/glossary/fasting-insulin",
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    category: "metabolic",
    unit: "mmol/L",
    summary: "Fat carried in your blood.",
    description:
      "The main form of fat circulating in your blood. Raised triglycerides often travel with insulin resistance and are part of the wider picture of metabolic and heart health.",
    feedsTool: "metabolic-fitness-index",
    relatedContent: "/glossary/triglycerides",
  },

  // ---- Heart & lipids ----
  {
    id: "total-cholesterol",
    name: "Total cholesterol",
    category: "heart",
    unit: "mmol/L",
    summary: "All the cholesterol in your blood, combined.",
    description:
      "The sum of the cholesterol carried across all your lipoprotein particles. It's a useful headline number, but the balance between the types below matters far more than the total alone.",
    feedsTool: "heart-age-calculator",
    relatedContent: "/glossary/total-cholesterol",
  },
  {
    id: "ldl-cholesterol",
    name: "LDL cholesterol",
    aka: ["LDL-C", "'Bad' cholesterol"],
    category: "heart",
    unit: "mmol/L",
    summary: "Cholesterol on the particles that can clog arteries.",
    description:
      "The cholesterol carried on low-density lipoproteins, the particles most associated with fatty build-up in artery walls. Lowering it is one of the best-evidenced ways to reduce cardiovascular risk.",
    feedsTool: "heart-age-calculator",
    relatedContent: "/glossary/ldl-cholesterol",
  },
  {
    id: "hdl-cholesterol",
    name: "HDL cholesterol",
    aka: ["HDL-C", "'Good' cholesterol"],
    category: "heart",
    unit: "mmol/L",
    summary: "Cholesterol on the particles that clear it away.",
    description:
      "Cholesterol carried on high-density lipoproteins, which help move cholesterol back to the liver. Higher levels are generally more favourable, though the relationship is more nuanced than 'more is always better'.",
    feedsTool: "heart-age-calculator",
    relatedContent: "/glossary/hdl-cholesterol",
  },
  {
    id: "apob",
    name: "ApoB",
    aka: ["Apolipoprotein B"],
    category: "heart",
    unit: "g/L",
    summary: "A direct count of your artery-clogging particles.",
    description:
      "There is one ApoB molecule on every atherogenic particle, so measuring it counts those particles directly — which can pin down cardiovascular risk more precisely than standard cholesterol alone.",
    feedsTool: "heart-age-calculator",
    relatedContent: "/glossary/apob",
  },
  {
    id: "lp-a",
    name: "Lp(a)",
    aka: ["Lipoprotein(a)"],
    category: "heart",
    unit: "nmol/L",
    summary: "An inherited, one-off cardiovascular risk marker.",
    description:
      "A largely genetic particle that stays fairly stable through life, so a single measurement can reveal lifelong elevated heart-attack and stroke risk that ordinary cholesterol testing misses entirely.",
    feedsTool: "heart-age-calculator",
    relatedContent: "/glossary/lp-a",
  },

  // ---- Inflammation & ageing ----
  {
    id: "hs-crp",
    name: "hs-CRP",
    aka: ["High-sensitivity C-reactive protein"],
    category: "inflammation",
    unit: "mg/L",
    summary: "A sensitive marker of low-grade inflammation.",
    description:
      "A protein that rises with inflammation in the body. The high-sensitivity version picks up the low, chronic levels linked to cardiovascular and metabolic risk, rather than the big spikes of an acute infection.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/hs-crp",
  },
  {
    id: "homocysteine",
    name: "Homocysteine",
    category: "inflammation",
    unit: "µmol/L",
    summary: "An amino acid tied to B-vitamin status and heart risk.",
    description:
      "An amino acid that builds up when B-vitamin metabolism isn't working well. Raised levels are associated with cardiovascular risk and are often modifiable with folate and B12.",
    relatedContent: "/glossary/homocysteine",
  },

  // ---- Liver & kidney ----
  {
    id: "albumin",
    name: "Albumin",
    category: "organ",
    unit: "g/L",
    summary: "The main protein your liver makes.",
    description:
      "The most abundant protein in blood, produced by the liver. It reflects liver function and overall nutritional status, and tends to decline with age and ill health.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/albumin",
  },
  {
    id: "creatinine",
    name: "Creatinine",
    aka: ["eGFR"],
    category: "organ",
    unit: "µmol/L",
    summary: "A waste product used to gauge kidney function.",
    description:
      "A muscle waste product cleared by the kidneys, so its level (and the eGFR estimated from it) is the standard way to check how well your kidneys are filtering.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/creatinine",
  },
  {
    id: "alt",
    name: "ALT",
    aka: ["Alanine aminotransferase"],
    category: "organ",
    unit: "U/L",
    summary: "A liver enzyme that flags liver stress.",
    description:
      "An enzyme concentrated in the liver. When liver cells are under strain — from fatty liver, alcohol or other causes — more ALT leaks into the blood, making it a useful liver-health check.",
    relatedContent: "/glossary/alt",
  },
  {
    id: "alkaline-phosphatase",
    name: "Alkaline phosphatase",
    aka: ["ALP"],
    category: "organ",
    unit: "U/L",
    summary: "An enzyme linked to liver and bone.",
    description:
      "An enzyme found mainly in the liver and bones. It's used alongside the other liver markers to build a picture of liver and bone health.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/alkaline-phosphatase",
  },

  // ---- Full blood count ----
  {
    id: "white-blood-cells",
    name: "White blood cell count",
    aka: ["WBC"],
    category: "blood-count",
    unit: "×10⁹/L",
    summary: "The size of your immune-cell army.",
    description:
      "The total number of infection-fighting cells in your blood. Both high and low counts are informative, and the level is one of the markers used in biological-age scoring.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/white-blood-cells",
  },
  {
    id: "lymphocyte-percentage",
    name: "Lymphocyte percentage",
    category: "blood-count",
    unit: "%",
    summary: "The share of white cells that are lymphocytes.",
    description:
      "The proportion of your white blood cells that are lymphocytes — the cells central to immune memory. The balance shifts with age, infection and immune health.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/lymphocyte-percentage",
  },
  {
    id: "mcv",
    name: "Mean corpuscular volume",
    aka: ["MCV"],
    category: "blood-count",
    unit: "fL",
    summary: "The average size of your red blood cells.",
    description:
      "The average size of your red blood cells. Cells that are unusually large or small can point to nutrient deficiencies (such as B12 or iron) and feed into biological-age estimates.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/mcv",
  },
  {
    id: "rdw",
    name: "Red cell distribution width",
    aka: ["RDW"],
    category: "blood-count",
    unit: "%",
    summary: "How varied your red blood cell sizes are.",
    description:
      "A measure of how much your red blood cells vary in size. A wider spread has emerged as a surprisingly strong marker of overall health and biological ageing.",
    feedsTool: "phenotypic-age-calculator",
    relatedContent: "/glossary/rdw",
  },

  // ---- Hormones ----
  {
    id: "testosterone",
    name: "Testosterone",
    category: "hormones",
    unit: "nmol/L",
    summary: "A key hormone for muscle, energy and libido.",
    description:
      "A hormone that influences muscle, bone, mood, energy and libido in all sexes (at different levels). It's commonly checked when energy, recovery or body composition aren't responding to training.",
    relatedContent: "/glossary/testosterone",
  },
  {
    id: "tsh",
    name: "TSH",
    aka: ["Thyroid-stimulating hormone"],
    category: "hormones",
    unit: "mIU/L",
    summary: "The master dial for your thyroid.",
    description:
      "The signal your brain sends to control the thyroid, which sets your metabolic rate. It's the first-line check for an under- or over-active thyroid, a common cause of fatigue and weight change.",
    relatedContent: "/glossary/tsh",
  },
  {
    id: "cortisol",
    name: "Cortisol",
    category: "hormones",
    unit: "nmol/L",
    summary: "Your main stress hormone.",
    description:
      "The body's principal stress hormone, which also follows a daily rhythm. Measured in the morning, it gives a snapshot of your stress-response and adrenal signalling.",
    relatedContent: "/glossary/cortisol",
  },

  // ---- Vitamins & minerals ----
  {
    id: "vitamin-d",
    name: "Vitamin D",
    aka: ["25-hydroxyvitamin D"],
    category: "vitamins",
    unit: "nmol/L",
    summary: "The sunshine vitamin — commonly low.",
    description:
      "A vitamin (really a hormone) important for bone, immune and muscle health. Deficiency is very common, especially in winter, and is one of the more worthwhile things to know and correct.",
    relatedContent: "/glossary/vitamin-d",
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    category: "vitamins",
    unit: "pmol/L",
    summary: "Essential for nerves and red blood cells.",
    description:
      "A vitamin needed for healthy nerves and red blood cells. Low levels cause fatigue and can be more common in plant-based diets and with age.",
    relatedContent: "/glossary/vitamin-b12",
  },
  {
    id: "ferritin",
    name: "Ferritin",
    category: "vitamins",
    unit: "µg/L",
    summary: "Your iron stores.",
    description:
      "A measure of stored iron. Low ferritin is a leading cause of tiredness and poor training performance — particularly in menstruating and endurance athletes — while very high levels warrant a look too.",
    relatedContent: "/glossary/ferritin",
  },
  {
    id: "folate",
    name: "Folate",
    aka: ["Vitamin B9"],
    category: "vitamins",
    unit: "nmol/L",
    summary: "Works with B12 for blood and nerve health.",
    description:
      "A B-vitamin that partners with B12 to make red blood cells and support nerve function. It also helps keep homocysteine in check.",
    relatedContent: "/glossary/folate",
  },
];

/**
 * Structural validation (build-time, via unit test). Returns problems; empty
 * means valid. Asserts the invariants the panel owns — unique ids, real copy,
 * a known category with a group, live tool cross-links (broken cross-links must
 * fail the build, per CONTENT-reference §8), and absolute content routes.
 */
export function validateBiomarkers(list: Biomarker[] = biomarkers): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const groups = new Set(BIOMARKER_GROUPS.map((g) => g.category));

  for (const b of list) {
    if (seen.has(b.id)) problems.push(`duplicate id: ${b.id}`);
    seen.add(b.id);
    if (!b.name.trim()) problems.push(`${b.id}: empty name`);
    if (!b.summary.trim()) problems.push(`${b.id}: empty summary`);
    if (!b.description.trim()) problems.push(`${b.id}: empty description`);
    if (!b.unit.trim()) problems.push(`${b.id}: empty unit`);
    if (!groups.has(b.category)) problems.push(`${b.id}: unknown category ${b.category}`);
    if (b.feedsTool && !getTool(b.feedsTool)) {
      problems.push(`${b.id}: feedsTool '${b.feedsTool}' is not a registered tool`);
    }
    if (b.relatedContent && !b.relatedContent.startsWith("/")) {
      problems.push(`${b.id}: relatedContent must be an absolute route`);
    }
  }

  // Every group should have at least one marker, or the heading renders empty.
  for (const g of BIOMARKER_GROUPS) {
    if (!list.some((b) => b.category === g.category)) {
      problems.push(`group '${g.category}' has no biomarkers`);
    }
  }
  return problems;
}

export const biomarkersById: ReadonlyMap<string, Biomarker> = new Map(
  biomarkers.map((b) => [b.id, b]),
);

/** Markers in a group, in registry order. */
export function biomarkersInGroup(category: BiomarkerCategory): Biomarker[] {
  return biomarkers.filter((b) => b.category === category);
}
