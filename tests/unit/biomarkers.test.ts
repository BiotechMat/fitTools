import { describe, expect, it } from "vitest";
import {
  biomarkers,
  biomarkersById,
  BIOMARKER_GROUPS,
  validateBiomarkers,
  biomarkersInGroup,
} from "@/registry/biomarkers";

/**
 * The biomarker panel must satisfy the invariants it owns: unique ids, real
 * educational copy, a known display group, and — crucially — live tool
 * cross-links (a dead "feeds your X calculator" link is worse than none).
 * The marker set itself is placeholder pending the partner; these checks guard
 * structure, not the science.
 */
describe("biomarker registry", () => {
  it("passes structural validation (incl. live tool cross-links)", () => {
    expect(validateBiomarkers()).toEqual([]);
  });

  it("has markers and every one carries display copy", () => {
    expect(biomarkers.length).toBeGreaterThan(0);
    for (const b of biomarkers) {
      expect(b.name.trim().length).toBeGreaterThan(0);
      expect(b.description.trim().length).toBeGreaterThan(0);
      expect(b.unit.trim().length).toBeGreaterThan(0);
    }
  });

  it("indexes every marker by id", () => {
    expect(biomarkersById.size).toBe(biomarkers.length);
  });

  it("every display group contains at least one marker", () => {
    for (const g of BIOMARKER_GROUPS) {
      expect(biomarkersInGroup(g.category).length).toBeGreaterThan(0);
    }
  });

  it("catches a bad marker in validation", () => {
    const problems = validateBiomarkers([
      {
        id: "bad",
        name: "",
        category: "metabolic",
        unit: "",
        summary: "",
        description: "",
        feedsTool: "not-a-real-tool",
        relatedContent: "glossary/apob", // missing leading slash
      },
    ]);
    expect(problems.some((p) => p.includes("empty name"))).toBe(true);
    expect(problems.some((p) => p.includes("is not a registered tool"))).toBe(true);
    expect(problems.some((p) => p.includes("absolute route"))).toBe(true);
  });
});
