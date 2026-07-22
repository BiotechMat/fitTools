/**
 * Reciprocal cross-links (CONTENT-reference.md §8): the reference registries
 * each declare their related calculator(s), so we derive the *reverse* index
 * here — given a tool slug, the reference pages that point back to it. This
 * keeps the calculator→reference links automatically in sync with the
 * reference→calculator links, with no separate mapping to maintain.
 */

import { glossaryEntries } from "@/registry/glossary";
import { supplements } from "@/registry/supplements";
import { exercises } from "@/registry/exercises";
import { foodReferencePages } from "@/registry/food-reference";
import { referenceTablePages } from "@/registry/reference-tables";

export interface ReferenceLink {
  href: string;
  title: string;
}

export interface ReferenceLinkGroup {
  section: string;
  items: ReferenceLink[];
}

/** Keep each section tidy on the tool page. */
const PER_SECTION_LIMIT = 6;

/** Reference pages that link back to the given tool, grouped by section. */
export function referencesForTool(toolSlug: string): ReferenceLinkGroup[] {
  const groups: ReferenceLinkGroup[] = [
    {
      section: "Glossary",
      items: glossaryEntries
        .filter((e) => e.relatedTools.includes(toolSlug))
        .map((e) => ({ href: `/glossary/${e.slug}`, title: e.term })),
    },
    {
      section: "Supplements",
      items: supplements
        .filter((s) => s.relatedTools.includes(toolSlug))
        .map((s) => ({ href: `/supplements/${s.slug}`, title: s.name })),
    },
    {
      section: "Exercises",
      items: exercises
        .filter((e) => e.relatedTools.includes(toolSlug))
        .map((e) => ({ href: `/exercises/${e.pattern}/${e.slug}`, title: e.name })),
    },
    {
      section: "Food reference",
      items: foodReferencePages
        .filter((p) => p.relatedTools.includes(toolSlug))
        .map((p) => ({ href: `/nutrition/reference/${p.slug}`, title: p.title })),
    },
    {
      section: "Reference tables",
      items: referenceTablePages
        .filter((p) => p.relatedTools.includes(toolSlug))
        .map((p) => ({ href: `/reference/${p.slug}`, title: p.title })),
    },
  ];

  return groups
    .map((g) => ({ ...g, items: g.items.slice(0, PER_SECTION_LIMIT) }))
    .filter((g) => g.items.length > 0);
}
