/**
 * Peptides educational cluster registry (CONTENT-peptides.md). A
 * lightweight parallel to the calculator registry: drives the /learn/peptides
 * routes, sitemap entries, hub listing, JSON-LD and internal links.
 *
 * These are REFERENCE pages, not tools — no ToolConfig, no calculator, no
 * product sales. Every page is educational and carries the safety/legality
 * box. No dosing, protocol, route or sourcing content anywhere (by design).
 */

import type { FaqEntry, Source } from "@/registry/types";

/**
 * Evidence strength for a health claim (the site-wide house style, CONTENT.md
 * §1). `marketing-claim` = unproven/oversold; `not-supported` = actively
 * contradicted by evidence or a flagged-dangerous trend (CONTENT-looksmaxxing
 * §4 debunk tier). Used as the compound's headline tier here and inline by the
 * shared `EvidenceTier` component across content sections.
 */
export type EvidenceTier =
  | "well-supported"
  | "preliminary"
  | "marketing-claim"
  | "not-supported";

/** Where the evidence comes from. */
export type EvidenceBasis = "human" | "animal" | "in-vitro" | "mixed";

export type PeptideCategory =
  | "gh-secretagogue"
  | "healing"
  | "melanocortin"
  | "metabolic";

export interface PeptidePage {
  slug: string;
  name: string;
  /** Also-known-as / brand or research names. */
  aka?: string[];
  category: PeptideCategory;
  title: string;
  metaDescription: string;
  valueLine: string;
  /** Headline tier for the compound's *fitness* claims (shown on the card). */
  headlineTier: EvidenceTier;
  headlineBasis: EvidenceBasis;
  /** Approved medical use, if any (the evidence-contrast anchor). */
  approvedUse?: string;
  /** WADA / sport prohibition. */
  wadaProhibited: boolean;
  faq: FaqEntry[];
  related: string[];
  lastReviewed: string;
  sources: Source[];
}

export const CATEGORY_LABELS: Record<PeptideCategory, string> = {
  "gh-secretagogue": "Growth-hormone secretagogues",
  healing: "“Healing” / recovery peptides",
  melanocortin: "Melanocortin peptides",
  metabolic: "Metabolic & other",
};

export const TIER_LABELS: Record<EvidenceTier, string> = {
  "well-supported": "Well-supported",
  preliminary: "Preliminary",
  "marketing-claim": "Marketing claim",
  "not-supported": "Not supported",
};

import { tesamorelinPage } from "@/registry/peptides/tesamorelin";
import { glp1Page } from "@/registry/peptides/glp-1-agonists";
import { pt141Page } from "@/registry/peptides/pt-141";
import { mk677Page } from "@/registry/peptides/mk-677";
import { bpc157Page } from "@/registry/peptides/bpc-157";
import { tb500Page } from "@/registry/peptides/tb-500";
import { fragment176191Page } from "@/registry/peptides/fragment-176-191";
import { melanotan2Page } from "@/registry/peptides/melanotan-2";

export const allPeptides: PeptidePage[] = [
  tesamorelinPage,
  glp1Page,
  pt141Page,
  mk677Page,
  bpc157Page,
  tb500Page,
  fragment176191Page,
  melanotan2Page,
];

export const peptidesBySlug: ReadonlyMap<string, PeptidePage> = new Map(
  allPeptides.map((p) => [p.slug, p]),
);

export function getPeptide(slug: string): PeptidePage | undefined {
  return peptidesBySlug.get(slug);
}

export function peptidesByCategory(): [PeptideCategory, PeptidePage[]][] {
  const order: PeptideCategory[] = [
    "gh-secretagogue",
    "healing",
    "melanocortin",
    "metabolic",
  ];
  return order
    .map(
      (cat) =>
        [cat, allPeptides.filter((p) => p.category === cat)] as [
          PeptideCategory,
          PeptidePage[],
        ],
    )
    .filter(([, pages]) => pages.length > 0);
}

export function relatedPeptides(page: PeptidePage): PeptidePage[] {
  return page.related.flatMap((slug) => {
    const found = getPeptide(slug);
    return found ? [found] : [];
  });
}
