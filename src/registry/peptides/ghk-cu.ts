import type { PeptidePage } from "@/registry/peptides";

export const ghkCuPage: PeptidePage = {
  slug: "ghk-cu",
  name: "GHK-Cu",
  aka: ["Copper peptide", "Copper tripeptide-1"],
  category: "healing",
  title: "GHK-Cu — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on GHK-Cu (copper peptide): a naturally occurring peptide with a real cosmetic history for skin, versus the more speculative injectable 'healing' and anti-ageing claims.",
  valueLine:
    "A copper-binding peptide with a genuine cosmetic-skincare history — but the injectable systemic 'healing' and anti-ageing claims are far less well supported.",
  headlineTier: "preliminary",
  headlineBasis: "mixed",
  approvedUse:
    "No approved medical drug use; GHK-Cu is an established cosmetic ingredient used topically in skincare products.",
  wadaProhibited: false,
  faq: [
    {
      q: "What is GHK-Cu?",
      a: "GHK is a small peptide that occurs naturally in the body and binds copper, forming GHK-Cu. It is best known as a copper peptide used topically in skincare, where it is associated with skin-firmness and appearance claims.",
    },
    {
      q: "Does GHK-Cu heal tissue or reverse ageing?",
      a: "There is laboratory and some topical-skin evidence behind its appearance-related use, but the broader systemic 'healing' and anti-ageing claims — especially for injected use — rest on cell and animal data rather than good human trials. Treat the injectable claims as speculative.",
    },
    {
      q: "Is GHK-Cu safe?",
      a: "As a topical cosmetic ingredient it has a long history of use. Injecting research-chemical versions is a completely different proposition, without safety data or regulatory oversight, and carries purity and contamination risks.",
    },
    {
      q: "Is GHK-Cu banned in sport?",
      a: "It is not specifically named on the WADA Prohibited List as a growth factor in the way some peptides are. Any non-approved substance used by injection can still fall into a prohibited category, so athletes should check current WADA guidance rather than assume it is cleared.",
    },
  ],
  related: ["bpc-157", "tb-500"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "PubMed: GHK-Cu (copper peptide) — skin, wound-healing and regenerative research (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=GHK-Cu+copper+peptide+skin+OR+wound+healing",
    },
    {
      label:
        "WADA Prohibited List — reference for growth factors and non-approved substances (S0, S2)",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
