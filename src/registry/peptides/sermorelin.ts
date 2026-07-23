import type { PeptidePage } from "@/registry/peptides";

export const sermorelinPage: PeptidePage = {
  slug: "sermorelin",
  name: "Sermorelin",
  aka: ["GHRH (1-29)", "GRF 1-29"],
  category: "gh-secretagogue",
  title: "Sermorelin — What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on sermorelin: a growth-hormone-releasing hormone analogue with a genuine medical history, now marketed for anti-ageing and muscle on evidence that doesn't support those claims.",
  valueLine:
    "A GHRH analogue with a real medical past — but the anti-ageing and physique claims made for it today outrun the evidence.",
  headlineTier: "preliminary",
  headlineBasis: "human",
  approvedUse:
    "Historically used in medicine as a growth-hormone-releasing agent — including as a test of pituitary function and in assessing growth in children — though the branded product was later discontinued in the US.",
  wadaProhibited: true,
  faq: [
    {
      q: "What is sermorelin?",
      a: "It is a shortened synthetic version of natural growth-hormone-releasing hormone (GHRH). Unlike most compounds in this section, it has a genuine medical history, having been used as a diagnostic agent and, at one time, in paediatric growth contexts before the branded product was discontinued.",
    },
    {
      q: "Does sermorelin work for anti-ageing or muscle?",
      a: "It can stimulate the body's own growth-hormone release, which is well documented. But the leap from that to reversing ageing or building muscle in healthy adults is not supported by good long-term human trials, which is where the modern 'anti-ageing clinic' marketing overreaches.",
    },
    {
      q: "Is sermorelin safe?",
      a: "It has been used medically under supervision, but self-directed use for anti-ageing or physique goals is a different context, without that oversight or the same evidence base. Products from research-chemical suppliers also carry purity and contamination risks.",
    },
    {
      q: "Is sermorelin banned in sport?",
      a: "Yes. As a GHRH analogue it falls under the WADA Prohibited List's peptide-hormone and growth-factor category and is banned at all times.",
    },
  ],
  related: ["cjc-1295", "tesamorelin", "ipamorelin"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "WADA Prohibited List — S2 Peptide Hormones, Growth Factors: GHRH and its analogues prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
    {
      label:
        "PubMed: sermorelin — GHRH analogue, growth-hormone stimulation and clinical use (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=sermorelin+GHRH+growth+hormone",
    },
  ],
};
