import type { PeptidePage } from "@/registry/peptides";

export const bpc157Page: PeptidePage = {
  slug: "bpc-157",
  name: "BPC-157",
  aka: ["Body Protection Compound-157", "PL 14736"],
  category: "healing",
  title: "BPC-157 — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on BPC-157: a synthetic peptide heavily marketed for tendon and gut healing, whose supporting evidence is almost entirely animal studies, with no controlled human trials.",
  valueLine:
    "Heavily marketed for healing — but the human evidence is essentially absent; the studies are almost all in rodents.",
  headlineTier: "preliminary",
  headlineBasis: "animal",
  wadaProhibited: true,
  faq: [
    {
      q: "Does BPC-157 heal tendons and injuries?",
      a: "There is a lot of positive animal research — mostly in rats — reporting faster healing of tendon, ligament, muscle and gut tissue. But there are no published randomised controlled trials in humans, so whether any of this transfers to people at any dose is genuinely unknown. Claims of proven healing in humans are not supported.",
    },
    {
      q: "What is BPC-157?",
      a: "It is a synthetic peptide based on a short sequence said to be derived from a protein found in gastric juice. The 'stable gastric pentadecapeptide' description comes from the research literature; the compound sold online is a laboratory-made synthetic.",
    },
    {
      q: "Is BPC-157 safe?",
      a: "Nobody can honestly say. Without human safety trials, the long-term safety profile is unknown, and 'research chemical' products carry additional purity and contamination risks. In 2023 the US FDA moved to restrict its compounding, citing insufficient safety data.",
    },
    {
      q: "Is BPC-157 banned in sport?",
      a: "It is not an approved medicine, which places it under WADA's category for substances with no current regulatory approval for human use (S0) — meaning it is prohibited in sport at all times.",
    },
  ],
  related: ["tb-500"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Seiwerth S, et al. BPC 157 — a review of the experimental (animal) literature on healing effects",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Seiwerth+BPC+157+review",
    },
    {
      label:
        "US FDA — 503A bulk drug substances: BPC-157 evaluated as not eligible for compounding (insufficient safety data)",
      url: "https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act",
    },
  ],
};
