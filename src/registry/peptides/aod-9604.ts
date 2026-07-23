import type { PeptidePage } from "@/registry/peptides";

export const aod9604Page: PeptidePage = {
  slug: "aod-9604",
  name: "AOD-9604",
  aka: ["Growth-hormone fragment analogue"],
  category: "metabolic",
  title: "AOD-9604: What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on AOD-9604: a growth-hormone fragment developed as an anti-obesity drug that failed to beat placebo for weight loss in human trials, now resold as a fat-loss peptide.",
  valueLine:
    "Developed as an anti-obesity drug and tested in humans, where it failed to beat placebo for weight loss, despite being resold today as a fat-loss peptide.",
  headlineTier: "not-supported",
  headlineBasis: "human",
  wadaProhibited: true,
  faq: [
    {
      q: "What is AOD-9604?",
      a: "It is a synthetic fragment based on part of the growth-hormone molecule, originally developed by a pharmaceutical company as a potential anti-obesity treatment. It is closely related in concept to other 'fat-loss' growth-hormone fragments.",
    },
    {
      q: "Does AOD-9604 cause fat loss?",
      a: "This is the unusual case where it was actually tested: in human clinical trials for obesity, it did not produce significantly more weight loss than placebo, and development for that use did not succeed. So the fat-loss claims now made for it are contradicted by the very trials meant to prove them.",
    },
    {
      q: "Is AOD-9604 safe?",
      a: "In the obesity trials it was reasonably tolerated, but 'didn't clearly harm' is not the same as 'works', and long-term safety for the way it is used today is not established. Research-chemical products also carry purity and contamination risks.",
    },
    {
      q: "Is AOD-9604 banned in sport?",
      a: "It is a non-approved substance, which places it in a prohibited category under WADA rules, and anti-doping authorities have treated it as banned. Athletes should regard it as prohibited.",
    },
  ],
  related: ["fragment-176-191", "glp-1-agonists"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "PubMed: AOD-9604, growth-hormone fragment, obesity clinical trials and outcomes",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=AOD-9604+obesity+weight+loss",
    },
    {
      label:
        "WADA Prohibited List, non-approved substances (S0) and growth factors (S2) prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
