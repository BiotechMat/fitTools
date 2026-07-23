import type { PeptidePage } from "@/registry/peptides";

export const cjc1295Page: PeptidePage = {
  slug: "cjc-1295",
  name: "CJC-1295",
  aka: ["GHRH analogue", "Modified GRF (1-29)"],
  category: "gh-secretagogue",
  title: "CJC-1295 — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on CJC-1295: a long-acting growth-hormone-releasing hormone analogue marketed for muscle and anti-ageing, with only early pharmacology data and no proven fitness benefits.",
  valueLine:
    "A long-acting GHRH analogue that raises growth-hormone output — but its marketed muscle and anti-ageing benefits are unproven in healthy people.",
  headlineTier: "marketing-claim",
  headlineBasis: "mixed",
  wadaProhibited: true,
  faq: [
    {
      q: "What is CJC-1295?",
      a: "It is a synthetic analogue of growth-hormone-releasing hormone (GHRH), the natural signal that tells the pituitary to release growth hormone. It is engineered to last far longer in the body than natural GHRH, which is why it is often paired in marketing with faster-acting secretagogues.",
    },
    {
      q: "Does CJC-1295 build muscle?",
      a: "Early studies established that it can raise circulating growth hormone and IGF-1 levels, but raising a hormone is not the same as producing muscle or fat-loss results. There are no robust long-term trials demonstrating the physique or anti-ageing benefits it is marketed for.",
    },
    {
      q: "Is CJC-1295 safe?",
      a: "It is not an approved medicine, and its long-term safety in healthy people is unknown. Materials sold as research chemicals also carry purity and contamination risks. Sustained elevation of growth hormone and IGF-1 has theoretical long-term risks that have not been well characterised for this compound.",
    },
    {
      q: "Is CJC-1295 banned in sport?",
      a: "Yes. GHRH and its analogues are named on the WADA Prohibited List under peptide hormones and growth factors, and are banned at all times.",
    },
  ],
  related: ["ipamorelin", "sermorelin", "tesamorelin", "ghrp-6"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "WADA Prohibited List — S2 Peptide Hormones, Growth Factors: GHRH and its analogues prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
    {
      label:
        "PubMed: CJC-1295 — GHRH analogue, growth hormone and IGF-1 pharmacology (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=CJC-1295+GHRH+growth+hormone+IGF-1",
    },
  ],
};
