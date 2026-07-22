import type { PeptidePage } from "@/registry/peptides";

export const tb500Page: PeptidePage = {
  slug: "tb-500",
  name: "TB-500 / Thymosin Beta-4",
  aka: ["TB-500", "thymosin beta-4", "Tβ4"],
  category: "healing",
  title: "TB-500 / Thymosin Beta-4 — What It Is and What the Evidence Shows",
  metaDescription:
    "An evidence-tiered explainer on TB-500 / thymosin beta-4: an actin-regulating peptide marketed for recovery and repair, with preclinical (animal and lab) evidence but no controlled human fitness trials.",
  valueLine:
    "A naturally-occurring repair peptide with interesting lab biology — and no controlled human evidence for the recovery claims.",
  headlineTier: "preliminary",
  headlineBasis: "animal",
  wadaProhibited: true,
  faq: [
    {
      q: "What is thymosin beta-4?",
      a: "It is a naturally-occurring peptide involved in regulating actin, a protein central to how cells move, migrate and repair. 'TB-500' is the name commonly used for a synthetic version (or fragment) sold as a research chemical.",
    },
    {
      q: "Does TB-500 speed up recovery in people?",
      a: "The recovery and tissue-repair claims come from cell and animal studies plus mechanism. Thymosin beta-4 has been studied in humans for specific medical conditions (such as certain eye and heart indications), but there are no controlled trials showing it improves athletic recovery — so that use is unproven.",
    },
    {
      q: "Is it safe?",
      a: "Long-term safety for fitness use is not established, and 'research chemical' products carry the usual purity and contamination unknowns. Treat any online supplier's safety assurances with scepticism.",
    },
    {
      q: "Is TB-500 banned in sport?",
      a: "Yes. Thymosin beta-4 / TB-500 is prohibited under the WADA code (growth factors and related peptides) at all times.",
    },
  ],
  related: ["bpc-157"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Goldstein AL, Hannappel E, Kleinman HK. Thymosin β4: actin-sequestering protein moonlights as a tissue-repair factor (review)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=thymosin+beta+4+tissue+repair+review",
    },
    {
      label:
        "World Anti-Doping Agency — Prohibited List (peptide hormones, growth factors and related substances, S2)",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
