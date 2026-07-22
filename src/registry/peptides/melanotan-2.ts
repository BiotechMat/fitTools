import type { PeptidePage } from "@/registry/peptides";

export const melanotan2Page: PeptidePage = {
  slug: "melanotan-2",
  name: "Melanotan II",
  aka: ["MT-II", "MT-2"],
  category: "melanocortin",
  title: "Melanotan II — What It Is, the Claims, and the Documented Risks",
  metaDescription:
    "An evidence-tiered explainer on Melanotan II: an unlicensed melanocortin agonist sold for tanning, with documented safety concerns and no approval — contrasted with the licensed afamelanotide.",
  valueLine:
    "An unlicensed tanning peptide with a genuinely concerning safety record — and no quality control behind what's sold.",
  headlineTier: "marketing-claim",
  headlineBasis: "human",
  wadaProhibited: false,
  faq: [
    {
      q: "Is Melanotan II safe?",
      a: "It is an unlicensed product with documented safety concerns. Published case reports link it to changes in moles and melanoma, prolonged painful erections (priapism), nausea and, rarely, serious muscle breakdown (rhabdomyolysis). UK and other regulators have specifically warned against buying and using it.",
    },
    {
      q: "Is it the same as the approved afamelanotide?",
      a: "No — and this is a key distinction. Afamelanotide (Melanotan I / Scenesse) is a licensed medicine for a rare light-sensitivity condition, used under specialist supervision. Melanotan II is a different, unlicensed compound sold online for cosmetic tanning with none of that oversight.",
    },
    {
      q: "Does it actually make you tan?",
      a: "It does stimulate melanin production, so tanning claims have a real mechanism. But 'it works' is beside the point when the product is unlicensed, unmonitored for skin-cancer risk, and sold without any quality control — the risks are why regulators advise against it.",
    },
    {
      q: "Why is this filed under 'marketing claim'?",
      a: "Not because tanning doesn't occur, but because it is marketed as a safe, convenient tanning shortcut while the documented risk profile and lack of any regulatory oversight are downplayed or omitted by sellers.",
    },
  ],
  related: ["pt-141"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "DermNet — Melanotan II: mechanism and documented adverse effects (moles/melanoma changes, priapism, systemic toxicity)",
      url: "https://dermnetnz.org/topics/melanotan-ii",
    },
    {
      label:
        "Cancer Research UK — Fake tan and Melanotan injections (why Melanotan is unlicensed and unsafe)",
      url: "https://www.cancerresearchuk.org/about-cancer/causes-of-cancer/sun-uv-and-cancer/fake-tan-and-melanotan-injections",
    },
  ],
};
