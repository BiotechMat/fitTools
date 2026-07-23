import type { PeptidePage } from "@/registry/peptides";

export const epithalonPage: PeptidePage = {
  slug: "epithalon",
  name: "Epithalon",
  aka: ["Epitalon", "Epithalone"],
  category: "metabolic",
  title: "Epithalon — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on epithalon: a synthetic peptide marketed for longevity and telomere lengthening, whose human evidence is limited, dated and far from establishing any anti-ageing effect.",
  valueLine:
    "Marketed as a longevity and 'telomerase-activating' peptide — but the supporting human evidence is sparse, dated and nowhere near establishing an anti-ageing effect.",
  headlineTier: "marketing-claim",
  headlineBasis: "mixed",
  wadaProhibited: false,
  faq: [
    {
      q: "What is epithalon?",
      a: "It is a synthetic four-amino-acid peptide based on a substance derived from the pineal gland, marketed heavily for longevity and 'anti-ageing', often with claims about lengthening telomeres — the protective caps on chromosomes.",
    },
    {
      q: "Does epithalon extend lifespan or lengthen telomeres?",
      a: "The claims rest largely on animal research and a small number of older human studies, mostly from a single research group, that fall short of modern standards. There is no robust, independently replicated human evidence that it slows ageing or meaningfully lengthens telomeres, so the longevity claims are not supported.",
    },
    {
      q: "Is epithalon safe?",
      a: "Its long-term safety in humans is essentially unstudied by modern standards, and research-chemical products carry purity and contamination risks. Any compound claiming to influence cellular ageing pathways warrants particular caution given how little is known.",
    },
    {
      q: "Is epithalon banned in sport?",
      a: "It is not a headline growth factor, but as a non-approved substance it can fall under WADA's category for substances with no regulatory approval for human use. Athletes should check current WADA guidance rather than assume it is permitted.",
    },
  ],
  related: ["mk-677"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "PubMed: epithalon / epitalon — telomere, ageing and longevity research (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=epithalon+OR+epitalon+telomere+aging",
    },
    {
      label:
        "WADA Prohibited List — non-approved substances (S0) prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
