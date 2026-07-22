import { describe, expect, it } from "vitest";
import { referencesForTool } from "@/lib/reference-links";
import { standardTools } from "@/registry/tools";

/**
 * Reciprocal cross-link reverse index (CONTENT-reference.md §8). The
 * calculator→reference links are derived from the reference registries, so
 * they must be consistent and never dead.
 */

describe("referencesForTool", () => {
  it("surfaces the creatine supplement on the creatine calculator", () => {
    const groups = referencesForTool("creatine-calculator");
    const supplements = groups.find((g) => g.section === "Supplements");
    expect(supplements?.items.some((i) => i.href === "/supplements/creatine-monohydrate")).toBe(true);
  });

  it("surfaces ApoB and Lp(a) glossary terms on the heart-age calculator", () => {
    const groups = referencesForTool("heart-age-calculator");
    const glossary = groups.find((g) => g.section === "Glossary");
    const hrefs = glossary?.items.map((i) => i.href) ?? [];
    expect(hrefs).toContain("/glossary/apob");
    expect(hrefs).toContain("/glossary/lp-a");
  });

  it("surfaces exercises on the one-rep-max calculator, capped per section", () => {
    const groups = referencesForTool("one-rep-max-calculator");
    const ex = groups.find((g) => g.section === "Exercises");
    expect(ex).toBeDefined();
    expect(ex!.items.length).toBeGreaterThan(0);
    expect(ex!.items.length).toBeLessThanOrEqual(6);
  });

  it("only ever returns non-empty groups, with absolute hrefs", () => {
    for (const tool of standardTools()) {
      for (const group of referencesForTool(tool.slug)) {
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) {
          expect(item.href.startsWith("/")).toBe(true);
          expect(item.title.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
