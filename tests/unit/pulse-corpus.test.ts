import { describe, expect, it } from "vitest";
import { groundingChunks, validateCorpus, chunksById, freshChunksByRecency } from "@/registry/pulse";
import type { GroundingChunk } from "@/lib/pulse/types";
import { allTools, toolPath } from "@/registry/tools";
import { supplements } from "@/registry/supplements";
import { glossaryEntries } from "@/registry/glossary";
import { recoveryClusters } from "@/registry/recovery-content";
import { referenceTablePages } from "@/registry/reference-tables";

/**
 * The Pulse grounding corpus must satisfy the invariants Pulse owns (PULSE.md
 * §3.2): unique ids, a REAL source on every chunk (the anti-hallucination
 * anchor — §2.1), valid category, well-formed internal routes.
 */
describe("pulse grounding corpus", () => {
  it("passes structural validation", () => {
    expect(validateCorpus()).toEqual([]);
  });

  it("has at least one chunk and every chunk carries a source url", () => {
    expect(groundingChunks.length).toBeGreaterThan(0);
    for (const c of groundingChunks) {
      expect(c.source.url).toMatch(/^https?:\/\//);
      expect(c.source.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("indexes every chunk by id", () => {
    expect(chunksById.size).toBe(groundingChunks.length);
  });

  /**
   * Cross-link integrity (PULSE.md §3.2 / §9): a card's relatedTool /
   * relatedContent is the internal-linking payoff, so a broken link must fail
   * the build, exactly as glossary/recovery cross-links do. Resolve every one
   * against the real registries.
   */
  it("resolves every relatedTool and relatedContent to a real route", () => {
    const toolPaths = new Set(allTools.map(toolPath));
    const contentRoutes = new Set<string>([
      ...supplements.map((s) => `/supplements/${s.slug}`),
      ...glossaryEntries.map((g) => `/glossary/${g.slug}`),
      ...recoveryClusters.map((c) => `/recovery/${c.slug}`),
      ...referenceTablePages.map((t) => `/reference/${t.slug}`),
    ]);
    const broken: string[] = [];
    for (const c of groundingChunks) {
      if (c.relatedTool && !toolPaths.has(c.relatedTool)) broken.push(`${c.id} → tool ${c.relatedTool}`);
      if (c.relatedContent && !contentRoutes.has(c.relatedContent)) {
        broken.push(`${c.id} → content ${c.relatedContent}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("has grown past the v1 floor toward the 60–100 target (PULSE.md §3.3)", () => {
    expect(groundingChunks.length).toBeGreaterThanOrEqual(55);
  });
});

/**
 * Fresh-chunk invariants (PULSE.md §15.4): a recent-discovery card must carry
 * its honesty line (caveat) and its added-date, so it can never be dressed up
 * as settled science or escape the freshness decay.
 */
describe("pulse fresh chunks (PULSE.md §15)", () => {
  const fresh = groundingChunks.filter((c) => c.kind === "fresh");

  it("has fresh seed chunks, each with a caveat and a valid addedAt date", () => {
    expect(fresh.length).toBeGreaterThan(0);
    for (const c of fresh) {
      expect(c.caveat?.trim().length).toBeGreaterThan(0);
      expect(c.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(c.addedAt!))).toBe(false);
    }
  });

  const base = (over: Partial<GroundingChunk>): GroundingChunk => ({
    id: "x",
    claim: "c",
    category: "nutrition",
    tags: [],
    tier: "preliminary",
    source: { label: "L", url: "https://pubmed.ncbi.nlm.nih.gov/1/" },
    ...over,
  });

  it("flags a fresh chunk with no caveat", () => {
    expect(validateCorpus([base({ kind: "fresh", addedAt: "2026-07-23" })])).toContain(
      "x: fresh chunk missing caveat",
    );
  });

  it("flags a fresh chunk with a malformed addedAt", () => {
    const problems = validateCorpus([base({ kind: "fresh", caveat: "small", addedAt: "yesterday" })]);
    expect(problems).toContain("x: fresh chunk needs addedAt as YYYY-MM-DD");
  });

  it("flags duplicate study DOIs across the corpus", () => {
    const problems = validateCorpus([
      base({ id: "a", kind: "fresh", caveat: "c", addedAt: "2026-07-23", study: { doi: "10.1/x" } }),
      base({ id: "b", kind: "fresh", caveat: "c", addedAt: "2026-07-23", study: { doi: "10.1/X" } }),
    ]);
    expect(problems).toContain("b: duplicate study.doi 10.1/X");
  });

  it("flags a preprint source not labelled as a preprint", () => {
    const problems = validateCorpus([
      base({
        kind: "fresh",
        caveat: "c",
        addedAt: "2026-07-23",
        source: { label: "L", url: "https://www.biorxiv.org/content/10.1101/2026.01.01.123456v1" },
        study: { design: "cohort" },
      }),
    ]);
    expect(problems).toContain('x: preprint source must set study.design to note "preprint"');
  });

  it("flags caveat/study set on a non-fresh chunk (mis-tagging)", () => {
    const problems = validateCorpus([base({ caveat: "oops" })]);
    expect(problems).toContain('x: caveat/study set but kind is not "fresh"');
  });
});

describe("freshChunksByRecency (digest — PULSE.md §15.7 F3)", () => {
  it("returns only fresh chunks, newest addedAt first", () => {
    const result = freshChunksByRecency();
    expect(result.length).toBe(groundingChunks.filter((c) => c.kind === "fresh").length);
    expect(result.every((c) => c.kind === "fresh")).toBe(true);
    for (let i = 1; i < result.length; i++) {
      expect((result[i - 1].addedAt ?? "") >= (result[i].addedAt ?? "")).toBe(true);
    }
  });

  it("excludes evergreen chunks", () => {
    expect(freshChunksByRecency().some((c) => c.kind !== "fresh")).toBe(false);
  });
});
