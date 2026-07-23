import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeSearchText } from "@/lib/search-filter";

/**
 * Type-to-filter matching for card lists (hub pages). Word-prefix semantics:
 * typing "c" narrows to cards with a word starting with "c" (Creatine,
 * Vitamin C), not every card containing the letter (Zinc).
 */

describe("normalizeSearchText", () => {
  it("lowercases and collapses punctuation to spaces", () => {
    expect(normalizeSearchText("Beta-alanine")).toBe("beta alanine");
    expect(normalizeSearchText("  Omega-3 (fish oil) ")).toBe("omega 3 fish oil");
  });

  it("folds diacritics and unicode digits", () => {
    expect(normalizeSearchText("Créatine")).toBe("creatine");
    expect(normalizeSearchText("VO₂max")).toBe("vo2max");
  });
});

describe("matchesSearch", () => {
  it("matches on any word prefix, case-insensitively", () => {
    expect(matchesSearch("Creatine monohydrate", "c")).toBe(true);
    expect(matchesSearch("Creatine monohydrate", "C")).toBe(true);
    expect(matchesSearch("Vitamin C", "c")).toBe(true);
    expect(matchesSearch("Creatine monohydrate", "mono")).toBe(true);
  });

  it("does not match mid-word substrings", () => {
    expect(matchesSearch("Zinc", "c")).toBe(false);
    expect(matchesSearch("Ashwagandha", "c")).toBe(false);
    expect(matchesSearch("Creatine", "reat")).toBe(false);
  });

  it("matches multi-word queries across word boundaries", () => {
    expect(matchesSearch("Vitamin D", "vitamin d")).toBe(true);
    expect(matchesSearch("Omega-3 (fish oil)", "fish oil")).toBe(true);
    expect(matchesSearch("Vitamin D", "vitamin c")).toBe(false);
  });

  it("ignores punctuation and diacritics in either side", () => {
    expect(matchesSearch("Beta-alanine", "alanine")).toBe(true);
    expect(matchesSearch("Beta-alanine", "beta a")).toBe(true);
    expect(matchesSearch("VO₂max", "vo2")).toBe(true);
  });

  it("treats an empty or whitespace query as match-all", () => {
    expect(matchesSearch("Anything", "")).toBe(true);
    expect(matchesSearch("Anything", "   ")).toBe(true);
    expect(matchesSearch("Anything", "!?")).toBe(true);
  });
});
