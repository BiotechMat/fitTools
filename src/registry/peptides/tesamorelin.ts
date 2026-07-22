import type { PeptidePage } from "@/registry/peptides";

export const tesamorelinPage: PeptidePage = {
  slug: "tesamorelin",
  name: "Tesamorelin",
  aka: ["Egrifta", "TH9507"],
  category: "gh-secretagogue",
  title: "Tesamorelin — What It Is and What the Evidence Shows",
  metaDescription:
    "An evidence-tiered, non-promotional explainer on tesamorelin (Egrifta): a GHRH analogue, the one GH-releasing peptide with FDA approval and robust trial data — for a specific medical use, not fitness.",
  valueLine:
    "The GH-releasing peptide with the strongest evidence — because it was developed and approved as a medicine.",
  headlineTier: "well-supported",
  headlineBasis: "human",
  approvedUse:
    "FDA-approved to reduce excess visceral abdominal fat in people with HIV-associated lipodystrophy.",
  wadaProhibited: true,
  faq: [
    {
      q: "Is tesamorelin approved by regulators?",
      a: "Yes — it is FDA-approved (as Egrifta) to reduce excess visceral abdominal fat in people with HIV-associated lipodystrophy. That is its only approved use; it is not approved for general fitness, physique or anti-ageing purposes.",
    },
    {
      q: "Does tesamorelin build muscle?",
      a: "That is not what it was approved for and not what the trials measured. Its evidence base is about reducing visceral fat in a specific patient group. Using it for muscle gain is off-label and unstudied for that purpose.",
    },
    {
      q: "Why is tesamorelin the 'good evidence' example here?",
      a: "Because it went through the full drug-development process — large randomised placebo-controlled trials with imaging endpoints — which almost none of the other compounds in this section have. It shows what real evidence looks like, and how far most 'research peptides' fall short of it.",
    },
    {
      q: "Is tesamorelin allowed in sport?",
      a: "No. As a growth-hormone-releasing factor it falls under the WADA prohibited list (peptide hormones and releasing factors) and is banned in and out of competition.",
    },
  ],
  related: ["mk-677", "fragment-176-191", "glp-1-agonists"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Falutz J, et al. Metabolic effects of a growth hormone–releasing factor in patients with HIV. N Engl J Med 2007;357:2359–2370 (pivotal RCT)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Falutz+growth+hormone+releasing+factor+HIV+2007",
    },
    {
      label:
        "Stanley TL, Grinspoon SK. Growth hormone and tesamorelin in the management of HIV-associated lipodystrophy (review)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3218714/",
    },
    {
      label: "US FDA — Drugs@FDA record for Egrifta (tesamorelin)",
      url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process&searchTerm=tesamorelin",
    },
  ],
};
