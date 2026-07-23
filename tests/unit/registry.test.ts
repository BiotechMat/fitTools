import { describe, expect, it } from "vitest";
import { allTools, getTool, relatedTools, toolPath, toolsForHub } from "@/registry/tools";
import { tdeeInputsSchema } from "@/registry/configs/tdee";

/** Registry invariants + Zod range validation (SPEC §5, §14). */

describe("registry invariants", () => {
  it("has unique slugs", () => {
    const slugs = allTools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every related slug resolves to a registered tool", () => {
    for (const tool of allTools) {
      expect(relatedTools(tool)).toHaveLength(tool.related.length);
    }
  });

  it("every tool has sources, FAQ entries and an ISO lastReviewed date", () => {
    for (const tool of allTools) {
      expect(tool.sources.length).toBeGreaterThan(0);
      expect(tool.faq.length).toBeGreaterThanOrEqual(4);
      expect(tool.faq.length).toBeLessThanOrEqual(8);
      expect(tool.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const source of tool.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("tier 4 tools never enable ads (SPEC §2)", () => {
    for (const tool of allTools.filter((t) => t.tier === 4)) {
      expect(tool.monetization.ads).toBe(false);
    }
  });

  it("toolPath routes tier 4 into the peptides section, everything else to the root slug", () => {
    const peptide = getTool("peptide-reconstitution");
    const tdee = getTool("tdee-calculator");
    expect(peptide && toolPath(peptide)).toBe("/learn/peptides/peptide-reconstitution");
    expect(tdee && toolPath(tdee)).toBe("/tdee-calculator");
  });

  it("defaults parse against the tool's own input schema", () => {
    for (const tool of allTools) {
      expect(tool.inputsSchema.safeParse(tool.defaults).success).toBe(true);
    }
  });

  it("finds the TDEE tool in the nutrition hub", () => {
    expect(getTool("tdee-calculator")?.hub).toBe("nutrition");
    expect(toolsForHub("nutrition").map((t) => t.slug)).toContain("tdee-calculator");
  });
});

describe("tdeeInputsSchema range validation", () => {
  const valid = {
    sex: "male",
    ageYears: 30,
    weightKg: 80,
    heightCm: 175,
    activity: "moderate",
    formula: "mifflin",
  };

  it("accepts in-range input", () => {
    expect(tdeeInputsSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["age below 13", { ...valid, ageYears: 12 }],
    ["age above 100", { ...valid, ageYears: 101 }],
    ["weight below 30 kg", { ...valid, weightKg: 29 }],
    ["weight above 300 kg", { ...valid, weightKg: 301 }],
    ["height below 120 cm", { ...valid, heightCm: 119 }],
    ["height above 250 cm", { ...valid, heightCm: 251 }],
    ["body fat below 5%", { ...valid, bodyFatPercent: 4 }],
    ["body fat above 60%", { ...valid, bodyFatPercent: 61 }],
    ["unknown activity level", { ...valid, activity: "extreme" }],
  ])("rejects %s", (_label, input) => {
    expect(tdeeInputsSchema.safeParse(input).success).toBe(false);
  });
});
