import { describe, expect, it } from "vitest";
import {
  referenceTablePages,
  getReferenceTablePage,
} from "@/registry/reference-tables";
import { getTool } from "@/registry/tools";

/**
 * Reference-tables registry invariants (CONTENT-reference.md §7, §8). Each
 * table must cross-link to the calculator it mirrors, so the static/interactive
 * pair stays connected.
 */

describe("reference-tables registry", () => {
  it("has unique slugs and non-empty copy", () => {
    const slugs = referenceTablePages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of referenceTablePages) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.intro.length).toBeGreaterThan(0);
      expect(p.howToRead.length).toBeGreaterThan(0);
    }
  });

  it("every table links to at least one real calculator", () => {
    for (const p of referenceTablePages) {
      expect(p.relatedTools.length).toBeGreaterThan(0);
      for (const slug of p.relatedTools) {
        expect(getTool(slug), `${p.slug} → unknown tool ${slug}`).toBeDefined();
      }
    }
  });

  it("any sources use https URLs", () => {
    for (const p of referenceTablePages) {
      for (const s of p.sources) {
        expect(s.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("is resolvable by slug", () => {
    for (const p of referenceTablePages) {
      expect(getReferenceTablePage(p.slug)).toBe(p);
    }
  });
});
