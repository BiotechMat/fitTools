import type { PeptidePage } from "@/registry/peptides";

export const fragment176191Page: PeptidePage = {
  slug: "fragment-176-191",
  name: "HGH Fragment 176-191",
  aka: ["AOD-9604", "GH fragment 176-191"],
  category: "metabolic",
  title: "HGH Fragment 176-191 (AOD-9604) — What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on HGH Fragment 176-191 / AOD-9604: a growth-hormone fragment marketed for fat loss whose largest human trial failed, leading its developer to abandon it.",
  valueLine:
    "Marketed hard for fat loss — but the human trials didn't deliver, and drug development was abandoned.",
  headlineTier: "marketing-claim",
  headlineBasis: "human",
  wadaProhibited: true,
  faq: [
    {
      q: "Does HGH Fragment 176-191 burn fat?",
      a: "This is the clearest 'marketing claim vs evidence' case in this section. The fragment (developed as the drug candidate AOD-9604) went through multiple human trials — and its largest Phase IIb obesity trial failed to show a significant benefit, after which development was stopped in 2007. The strong fat-loss marketing is not backed by that human evidence.",
    },
    {
      q: "What is it, chemically?",
      a: "It is a short fragment corresponding to the tail end (amino acids 176–191) of the human growth-hormone molecule, designed to mimic GH's fat-metabolism effects without its other actions. In practice, the hoped-for fat-loss effect did not hold up in the pivotal human trial.",
    },
    {
      q: "Is it safe?",
      a: "The trials generally reported it was tolerated, but 'tolerated' is not the same as 'effective', and unregulated 'research chemical' versions carry the usual purity and contamination unknowns. It has no approval for weight loss.",
    },
    {
      q: "Is it banned in sport?",
      a: "As an unapproved growth-hormone-related peptide it falls under the WADA prohibited categories and should be treated as banned in sport.",
    },
  ],
  related: ["tesamorelin", "mk-677", "glp-1-agonists"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "AOD-9604 (GH fragment 176-191) clinical development — human obesity trials, including the Phase IIb trial that did not meet its endpoint; development discontinued 2007",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=AOD9604+obesity+clinical+trial",
    },
    {
      label:
        "World Anti-Doping Agency — Prohibited List (growth hormone fragments and releasing factors)",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
  ],
};
