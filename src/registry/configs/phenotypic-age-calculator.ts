import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PHENOAGE_DEFAULTS,
  PHENOAGE_LIMITS,
  PHENOAGE_SLUG,
} from "@/registry/configs/phenotypic-age-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const phenoAgeInputsSchema = z.object({
  ageYears: limit(PHENOAGE_LIMITS.ageYears),
  albuminGPerL: limit(PHENOAGE_LIMITS.albuminGPerL),
  creatinineUmolPerL: limit(PHENOAGE_LIMITS.creatinineUmolPerL),
  glucoseMmolPerL: limit(PHENOAGE_LIMITS.glucoseMmolPerL),
  crpMgPerL: limit(PHENOAGE_LIMITS.crpMgPerL),
  lymphocytePercent: limit(PHENOAGE_LIMITS.lymphocytePercent),
  mcvFl: limit(PHENOAGE_LIMITS.mcvFl),
  rdwPercent: limit(PHENOAGE_LIMITS.rdwPercent),
  alpUPerL: limit(PHENOAGE_LIMITS.alpUPerL),
  wbc10e9PerL: limit(PHENOAGE_LIMITS.wbc10e9PerL),
});

export const phenoAgeConfig: ToolConfig = {
  slug: PHENOAGE_SLUG,
  title: "Phenotypic Age Calculator: Biological Age from Blood Tests",
  valueLine:
    "Estimate your biological age from nine standard blood-panel markers, using the published Levine PhenoAge model.",
  metaDescription:
    "Free Phenotypic Age (PhenoAge) calculator using the peer-reviewed Levine 2018 model: nine blood biomarkers plus age, with the exact published coefficients and full methodology shown.",
  hub: "recovery",
  tier: 2,
  inputsSchema: phenoAgeInputsSchema,
  defaults: { ...PHENOAGE_DEFAULTS },
  disclaimerLevel: "clinical-input",
  faq: [
    {
      q: "What is phenotypic age?",
      a: "Phenotypic Age (PhenoAge) is an estimate of biological age derived from nine routine blood markers plus your chronological age. It was built to track differences in ageing and mortality risk across people of the same calendar age, and a lower PhenoAge is associated, at population level, with better long-term outcomes.",
    },
    {
      q: "Which blood tests do I need?",
      a: "Albumin, creatinine, fasting glucose, C-reactive protein (CRP), lymphocyte percentage, mean corpuscular volume (MCV), red cell distribution width (RDW), alkaline phosphatase (ALP) and white blood cell count, all from a standard metabolic panel plus a full blood count and hs-CRP.",
    },
    {
      q: "How accurate is PhenoAge?",
      a: "It is a validated research measure of population-level mortality risk, not a personal prediction. Two people with the same PhenoAge can have very different futures. Treat a difference from your chronological age as a general signal to discuss with your doctor, not a verdict.",
    },
    {
      q: "What is a good phenotypic age?",
      a: "A PhenoAge lower than your chronological age is generally the favourable direction. But the number is only as good as your blood results on the day, and inflammation from a recent illness, for example, can raise CRP and WBC and push the estimate up temporarily.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Every calculation runs entirely in your browser. Your blood values are never sent to us or anyone else, and nothing is stored.",
    },
    {
      q: "Can I use this instead of seeing a doctor?",
      a: "No. This is an educational estimate from a published formula, not a medical test. Any concern about your blood results or your health belongs with a qualified clinician.",
    },
  ],
  related: ["bmi-calculator", "tdee-calculator", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Levine ME, et al. An epigenetic biomarker of aging for lifespan and healthspan. Aging 2018;10:573-591 (clinical Phenotypic Age)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/",
    },
    {
      label:
        "Levine ME. Modeling the rate of senescence: can estimated biological age predict mortality? J Gerontol A 2013;68:667-674 (original derivation)",
      url: "https://pubmed.ncbi.nlm.nih.gov/23213031/",
    },
    {
      label:
        "Kwon D, Belsky DW. BioAge R package, phenoage_calc.R (authors' reference implementation; source of the exact coefficients used here)",
      url: "https://github.com/dayoonkwon/BioAge",
    },
  ],
};
