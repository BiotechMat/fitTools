import { describe, expect, it } from "vitest";
import {
  glossaryEntries,
  glossaryBySlug,
  resolveRelatedTerms,
} from "@/registry/glossary";
import { getTool } from "@/registry/tools";

/**
 * Glossary registry invariants (CONTENT-reference.md §6, §8). The glossary is
 * the internal-linking backbone, so every cross-link must resolve — a dead
 * related-term or related-tool link would defeat its whole purpose.
 */

describe("glossary registry invariants", () => {
  it("has unique slugs", () => {
    const slugs = glossaryEntries.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry has a term, one-line short and body text", () => {
    for (const e of glossaryEntries) {
      expect(e.term.length).toBeGreaterThan(0);
      expect(e.short.length).toBeGreaterThan(0);
      expect(e.body.length).toBeGreaterThanOrEqual(2);
      expect(e.body.every((p) => p.trim().length > 0)).toBe(true);
    }
  });

  it("every related-term slug resolves to a real glossary entry", () => {
    for (const e of glossaryEntries) {
      expect(resolveRelatedTerms(e.relatedTerms)).toHaveLength(e.relatedTerms.length);
      // and none point at themselves
      expect(e.relatedTerms).not.toContain(e.slug);
    }
  });

  it("every related-tool slug resolves to a registered tool", () => {
    for (const e of glossaryEntries) {
      for (const slug of e.relatedTools) {
        expect(getTool(slug), `${e.slug} → unknown tool ${slug}`).toBeDefined();
      }
    }
  });

  it("any sources use https URLs", () => {
    for (const e of glossaryEntries) {
      for (const s of e.sources ?? []) {
        expect(s.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("related-term links are reciprocal-friendly (both entries exist)", () => {
    for (const e of glossaryEntries) {
      for (const slug of e.relatedTerms) {
        expect(glossaryBySlug.has(slug)).toBe(true);
      }
    }
  });
});
