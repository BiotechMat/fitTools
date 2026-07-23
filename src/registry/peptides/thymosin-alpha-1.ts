import type { PeptidePage } from "@/registry/peptides";

export const thymosinAlpha1Page: PeptidePage = {
  slug: "thymosin-alpha-1",
  name: "Thymosin alpha-1",
  aka: ["Tα1", "Thymalfasin"],
  category: "healing",
  title: "Thymosin alpha-1 — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on thymosin alpha-1: an immune-modulating peptide with genuine approved medical uses in some countries, distinct from its unproven marketing as a fitness or general 'wellness' peptide.",
  valueLine:
    "An immune-modulating peptide with real approved medical uses abroad — but no established role in fitness, recovery or general 'wellness' for healthy people.",
  headlineTier: "marketing-claim",
  headlineBasis: "human",
  approvedUse:
    "Approved in a number of countries (as thymalfasin) for immune-related uses such as an adjunct in certain hepatitis infections and as an immune modulator; not approved for fitness or anti-ageing use.",
  wadaProhibited: false,
  faq: [
    {
      q: "What is thymosin alpha-1?",
      a: "It is a naturally occurring peptide involved in regulating the immune system. As the drug thymalfasin it is approved in several countries for specific immune-related medical uses — which sets it apart from most compounds marketed to gym-goers.",
    },
    {
      q: "Does it help with fitness, recovery or 'wellness'?",
      a: "Its evidence lies in defined clinical, immune-related settings, not in improving training, recovery or general wellness in healthy people. Extrapolating from its approved medical uses to a fitness benefit is where the marketing overreaches; that benefit is not established.",
    },
    {
      q: "Is thymosin alpha-1 safe?",
      a: "In its approved medical uses it has been studied and used under supervision. Self-directed use of research-chemical versions for unproven goals is a different matter, without that oversight and with the usual purity and contamination risks.",
    },
    {
      q: "Is thymosin alpha-1 banned in sport?",
      a: "Notably, WADA has clarified that thymosin alpha-1 is not prohibited — unlike thymosin beta-4 (TB-500), which is banned. This is a case where two similarly named peptides have very different anti-doping status, so athletes should not assume they are interchangeable.",
    },
  ],
  related: ["tb-500", "bpc-157"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "PubMed: thymosin alpha-1 (thymalfasin) — immune modulation and clinical use (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=thymosin+alpha+1+thymalfasin+immune",
    },
    {
      label:
        "WADA — clarification that thymosin alpha-1 is not prohibited (contrast with thymosin beta-4)",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
