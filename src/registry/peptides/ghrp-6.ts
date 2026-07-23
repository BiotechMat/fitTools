import type { PeptidePage } from "@/registry/peptides";

export const ghrp6Page: PeptidePage = {
  slug: "ghrp-6",
  name: "GHRP-6",
  aka: ["Growth-hormone-releasing peptide-6"],
  category: "gh-secretagogue",
  title: "GHRP-6: What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on GHRP-6: an older growth-hormone-releasing peptide known for strongly stimulating appetite, marketed for muscle on evidence that doesn't establish real-world benefit.",
  valueLine:
    "An older secretagogue that reliably raises growth hormone and hunger, but with no good evidence it builds muscle or improves body composition in healthy people.",
  headlineTier: "marketing-claim",
  headlineBasis: "mixed",
  wadaProhibited: true,
  faq: [
    {
      q: "What is GHRP-6?",
      a: "It is one of the earlier growth-hormone-releasing peptides, a ghrelin mimetic that prompts the pituitary to release growth hormone. A defining feature is that it strongly stimulates appetite, which distinguishes it from 'cleaner' newer peptides marketed to avoid that effect.",
    },
    {
      q: "Does GHRP-6 build muscle?",
      a: "It raises growth hormone and hunger, but neither guarantees muscle gain, and there are no solid long-term human trials showing the physique benefits it is sold for. The strong appetite stimulation is often reframed in marketing as a benefit rather than a side effect.",
    },
    {
      q: "Is GHRP-6 safe?",
      a: "Its long-term safety in healthy people is not established. As with other research-chemical peptides, purity and contamination are additional concerns, and it is not an approved medicine for muscle-building use.",
    },
    {
      q: "Is GHRP-6 banned in sport?",
      a: "Yes. Growth-hormone-releasing peptides are explicitly listed on the WADA Prohibited List and banned at all times.",
    },
  ],
  related: ["ipamorelin", "cjc-1295", "mk-677"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "WADA Prohibited List, S2 Peptide Hormones, Growth Factors: GH-releasing peptides (GHRPs) prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
    {
      label:
        "PubMed: GHRP-6, growth-hormone-releasing peptide, appetite and GH secretion (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=GHRP-6+growth+hormone+releasing+peptide",
    },
  ],
};
