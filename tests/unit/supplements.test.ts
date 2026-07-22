import { describe, expect, it } from "vitest";
import {
  supplements,
  supplementsBySlug,
  supplementsByTier,
  resolveRelatedSupplements,
} from "@/registry/supplements";
import { getTool } from "@/registry/tools";

/**
 * Supplement registry invariants (CONTENT-reference.md §4, §8, §9). Every
 * cross-link must resolve, every page must carry a citation, and headline
 * tiers must be valid so the hub grouping is exhaustive.
 */

const TIERS = ["well-supported", "preliminary", "marketing-claim"];

describe("supplement registry invariants", () => {
  it("has unique slugs", () => {
    const slugs = supplements.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry has a name, short, meta, a valid tier and ≥1 https source", () => {
    for (const s of supplements) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.short.length).toBeGreaterThan(0);
      expect(s.metaDescription.length).toBeGreaterThan(0);
      expect(TIERS).toContain(s.headlineTier);
      expect(s.sources.length).toBeGreaterThan(0);
      for (const src of s.sources) {
        expect(src.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("every related-supplement slug resolves and is not self-referential", () => {
    for (const s of supplements) {
      expect(resolveRelatedSupplements(s.relatedSupplements)).toHaveLength(
        s.relatedSupplements.length,
      );
      expect(s.relatedSupplements).not.toContain(s.slug);
    }
  });

  it("every related-tool slug resolves to a registered tool", () => {
    for (const s of supplements) {
      for (const slug of s.relatedTools) {
        expect(getTool(slug), `${s.slug} → unknown tool ${slug}`).toBeDefined();
      }
    }
  });

  it("tier grouping covers every supplement exactly once", () => {
    const grouped = supplementsByTier().flatMap(([, list]) => list);
    expect(grouped).toHaveLength(supplements.length);
    expect(new Set(grouped.map((s) => s.slug)).size).toBe(supplements.length);
  });

  it("leads with the well-supported tier", () => {
    expect(supplementsByTier()[0][0]).toBe("well-supported");
  });

  it("safety data, where present, has a title and at least one point", () => {
    for (const s of supplements) {
      if (s.safety) {
        expect(s.safety.title.length).toBeGreaterThan(0);
        expect(s.safety.points.length).toBeGreaterThan(0);
      }
    }
  });

  it("every supplement is resolvable by slug", () => {
    for (const s of supplements) {
      expect(supplementsBySlug.get(s.slug)).toBe(s);
    }
  });
});
