import { describe, expect, it } from "vitest";
import {
  glossaryCatalogue,
  glossaryCatalogueTerms,
} from "@/registry/glossaryCatalogue";
import { glossaryBySlug } from "@/registry/glossary";
import {
  supplementCatalogue,
  supplementCatalogueItems,
} from "@/registry/supplementCatalogue";
import { supplementsBySlug } from "@/registry/supplements";

/**
 * Catalogue invariants (CONTENT-reference.md §4, §6, §8). The catalogues are the
 * breadth layer of the /glossary and /supplements hubs; they list the full
 * 200-item reference sets and cross-link into the in-depth pages, so every
 * `slug` that is set must resolve to a real detail page.
 */

describe("glossary catalogue", () => {
  it("lists all 200 terms", () => {
    expect(glossaryCatalogueTerms).toHaveLength(200);
  });

  it("has a term and definition for every entry", () => {
    for (const t of glossaryCatalogueTerms) {
      expect(t.term.trim().length).toBeGreaterThan(0);
      expect(t.def.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique display terms", () => {
    const terms = glossaryCatalogueTerms.map((t) => t.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("every linked slug resolves to a real glossary entry", () => {
    for (const t of glossaryCatalogueTerms) {
      if (t.slug) {
        expect(glossaryBySlug.has(t.slug), `${t.term} → unknown term ${t.slug}`).toBe(true);
      }
    }
  });

  it("has non-empty, uniquely-named category groups", () => {
    const categories = glossaryCatalogue.map((g) => g.category);
    expect(new Set(categories).size).toBe(categories.length);
    for (const g of glossaryCatalogue) {
      expect(g.items.length).toBeGreaterThan(0);
    }
  });
});

describe("supplement catalogue", () => {
  it("lists all 200 supplements", () => {
    expect(supplementCatalogueItems).toHaveLength(200);
  });

  it("has a name and note for every entry", () => {
    for (const s of supplementCatalogueItems) {
      expect(s.name.trim().length).toBeGreaterThan(0);
      expect(s.note.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique display names", () => {
    const names = supplementCatalogueItems.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every supplement links to a real, evidence-rated page", () => {
    for (const s of supplementCatalogueItems) {
      expect(s.slug.length, `${s.name} has no page slug`).toBeGreaterThan(0);
      const page = supplementsBySlug.get(s.slug);
      expect(page, `${s.name} → unknown supplement ${s.slug}`).toBeDefined();
      // Every page carries a headline evidence rating.
      expect(page?.headlineTier).toBeTruthy();
    }
  });

  it("has non-empty, uniquely-named category groups", () => {
    const categories = supplementCatalogue.map((g) => g.category);
    expect(new Set(categories).size).toBe(categories.length);
    for (const g of supplementCatalogue) {
      expect(g.items.length).toBeGreaterThan(0);
    }
  });
});
