import { describe, expect, it } from "vitest";
import { PULSE_CATEGORIES } from "@/lib/pulse/types";
import { HARVEST_CATEGORIES } from "@/lib/pulse/harvest/sources";
import { parseIdList, parseSummaries } from "@/lib/pulse/harvest/pubmed";
import {
  existingKeys,
  inferDesign,
  proposeChunkId,
  triage,
  withinAllowlist,
} from "@/lib/pulse/harvest/triage";
import { buildFreshChunks } from "@/lib/pulse/harvest/draft";
import { mergeFresh } from "@/lib/pulse/harvest/emit";
import { runHarvest } from "@/lib/pulse/harvest/index";
import type { CandidateDraft, FreshChunk, HarvestConfig, StudyCandidate } from "@/lib/pulse/harvest/types";
import type { FetchLike } from "@/lib/pulse/harvest/pubmed";
import type { Drafter } from "@/lib/pulse/harvest/draft";

const CONFIG: HarvestConfig = {
  perQuery: 5,
  allowlist: ["pubmed.ncbi.nlm.nih.gov", "biorxiv.org"],
  addedAt: "2026-07-23",
};

function candidate(over: Partial<StudyCandidate> = {}): StudyCandidate {
  return {
    externalId: "111",
    title: "Creatine before training improves strength",
    journal: "Nutrients",
    year: "2026",
    doi: "10.1/abc",
    url: "https://pubmed.ncbi.nlm.nih.gov/111/",
    abstract: "A randomized trial in 11 men…",
    pubTypes: ["Randomized Controlled Trial"],
    channel: "pubmed",
    ...over,
  };
}

describe("harvest — category list mirrors the app (drift guard)", () => {
  it("HARVEST_CATEGORIES equals PULSE_CATEGORIES as a set", () => {
    expect([...HARVEST_CATEGORIES].sort()).toEqual([...PULSE_CATEGORIES].sort());
  });
});

describe("harvest — PubMed parsing", () => {
  it("parses the esearch id list", () => {
    expect(parseIdList({ esearchresult: { idlist: ["1", "2", 3] } })).toEqual(["1", "2"]);
    expect(parseIdList({})).toEqual([]);
  });

  it("maps esummary records to candidates, extracting DOI + pubtypes mechanically", () => {
    const data = {
      result: {
        uids: ["111"],
        "111": {
          title: "Creatine and strength: an RCT.",
          source: "Nutrients",
          pubdate: "2026 Jun 1",
          articleids: [
            { idtype: "pubmed", value: "111" },
            { idtype: "doi", value: "10.3390/nu18111789" },
          ],
          pubtype: ["Journal Article", "Randomized Controlled Trial"],
        },
      },
    };
    const [c] = parseSummaries(data);
    expect(c.doi).toBe("10.3390/nu18111789");
    expect(c.year).toBe("2026");
    expect(c.url).toBe("https://pubmed.ncbi.nlm.nih.gov/111/");
    expect(c.title).toBe("Creatine and strength: an RCT"); // trailing period stripped
    expect(c.pubTypes).toContain("Randomized Controlled Trial");
  });
});

describe("harvest — triage (§15.2)", () => {
  it("enforces the allowlist by host suffix", () => {
    expect(withinAllowlist("https://pubmed.ncbi.nlm.nih.gov/1/", CONFIG.allowlist)).toBe(true);
    expect(withinAllowlist("https://www.biorxiv.org/x", CONFIG.allowlist)).toBe(true);
    expect(withinAllowlist("https://dailyhealthblog.example/x", CONFIG.allowlist)).toBe(false);
    expect(withinAllowlist("not a url", CONFIG.allowlist)).toBe(false);
  });

  it("drops non-allowlisted, corpus-duplicate, and in-batch-duplicate candidates", () => {
    const existing = existingKeys([
      { ...(candidate() as unknown as FreshChunk), study: { doi: "10.1/known" } } as FreshChunk,
    ]);
    const cands = [
      candidate({ externalId: "a", doi: "10.1/known", url: "https://pubmed.ncbi.nlm.nih.gov/a/" }),
      candidate({ externalId: "b", doi: "10.1/new", url: "https://tabloid.example/b" }),
      candidate({ externalId: "c", doi: "10.1/fresh", url: "https://pubmed.ncbi.nlm.nih.gov/c/" }),
      candidate({ externalId: "d", doi: "10.1/fresh", url: "https://pubmed.ncbi.nlm.nih.gov/d/" }),
    ];
    const { kept, skipped } = triage(cands, existing, CONFIG.allowlist);
    expect(kept.map((c) => c.externalId)).toEqual(["c"]);
    expect(skipped.map((s) => s.reason)).toEqual([
      "duplicate DOI (already in corpus/batch)",
      "outside source allowlist",
      "duplicate DOI (already in corpus/batch)",
    ]);
  });

  it("drops non-research publication types (letter, comment, editorial)", () => {
    const cands = [
      candidate({ externalId: "r", doi: "10.1/rct", url: "https://pubmed.ncbi.nlm.nih.gov/r/", pubTypes: ["Randomized Controlled Trial"] }),
      candidate({ externalId: "l", doi: "10.1/letter", url: "https://pubmed.ncbi.nlm.nih.gov/l/", pubTypes: ["Letter"] }),
      candidate({ externalId: "c", doi: "10.1/comment", url: "https://pubmed.ncbi.nlm.nih.gov/c/", pubTypes: ["Journal Article", "Comment"] }),
      candidate({ externalId: "e", doi: "10.1/ed", url: "https://pubmed.ncbi.nlm.nih.gov/e/", pubTypes: ["Editorial"] }),
    ];
    const { kept, skipped } = triage(cands, existingKeys([]), CONFIG.allowlist);
    expect(kept.map((c) => c.externalId)).toEqual(["r"]);
    expect(skipped.filter((s) => s.reason.includes("not primary research"))).toHaveLength(3);
  });

  it("proposes a stable, deterministic kebab id", () => {
    const id = proposeChunkId(candidate());
    expect(id).toMatch(/^fresh-[a-z0-9-]+$/);
    expect(proposeChunkId(candidate())).toBe(id); // deterministic
  });

  it("infers design from pub types and labels preprints", () => {
    expect(inferDesign(candidate({ pubTypes: ["Meta-Analysis"] }))).toBe("Meta-analysis");
    expect(inferDesign(candidate({ pubTypes: ["Randomized Controlled Trial"] }))).toBe("RCT");
    expect(
      inferDesign(candidate({ url: "https://www.biorxiv.org/x", pubTypes: ["Journal Article"] })),
    ).toBe("Study (preprint)");
  });
});

describe("harvest — buildFreshChunks (§15.3 anti-hallucination)", () => {
  const cands = [candidate({ externalId: "111", doi: "10.1/abc" })];

  it("attaches the real citation from the candidate — the model supplies no URL", () => {
    const drafts: CandidateDraft[] = [
      { index: 0, claim: "Creatine before lifting may edge up same-day strength.", category: "supplements", tags: ["Creatine", "timing"], tier: "preliminary", caveat: "One small RCT, n=11 men — exploratory." },
    ];
    const [chunk] = buildFreshChunks(drafts, cands, CONFIG);
    expect(chunk.source.url).toBe("https://pubmed.ncbi.nlm.nih.gov/111/");
    expect(chunk.source.label).toContain("Nutrients 2026");
    expect(chunk.study?.doi).toBe("10.1/abc");
    expect(chunk.study?.design).toBe("RCT");
    expect(chunk.study?.n).toBeUndefined(); // pipeline never fabricates sample size
    expect(chunk.kind).toBe("fresh");
    expect(chunk.addedAt).toBe("2026-07-23");
    expect(chunk.tags).toEqual(["creatine", "timing"]); // normalised lowercase
  });

  it("drops a draft with an out-of-range index (model invented it)", () => {
    const drafts: CandidateDraft[] = [
      { index: 9, claim: "x", category: "supplements", tags: [], tier: "preliminary", caveat: "y" },
    ];
    expect(buildFreshChunks(drafts, cands, CONFIG)).toHaveLength(0);
  });

  it("drops drafts with an empty caveat or an invalid category/tier", () => {
    const bad: CandidateDraft[] = [
      { index: 0, claim: "x", category: "supplements", tags: [], tier: "preliminary", caveat: "  " },
      { index: 0, claim: "x", category: "not-a-category" as CandidateDraft["category"], tags: [], tier: "preliminary", caveat: "c" },
      { index: 0, claim: "x", category: "supplements", tags: [], tier: "made-up" as CandidateDraft["tier"], caveat: "c" },
    ];
    expect(buildFreshChunks(bad, cands, CONFIG)).toHaveLength(0);
  });

  it("dedupes two drafts pointing at the same study", () => {
    const drafts: CandidateDraft[] = [
      { index: 0, claim: "a", category: "supplements", tags: [], tier: "preliminary", caveat: "c" },
      { index: 0, claim: "b", category: "supplements", tags: [], tier: "preliminary", caveat: "c" },
    ];
    expect(buildFreshChunks(drafts, cands, CONFIG)).toHaveLength(1);
  });

  it("clamps a single study's tier: well-supported → preliminary unless meta-analysis", () => {
    const rct = [candidate({ pubTypes: ["Randomized Controlled Trial"] })];
    const [c1] = buildFreshChunks(
      [{ index: 0, claim: "A single RCT hints at an effect.", category: "supplements", tags: [], tier: "well-supported", caveat: "One RCT, n=40." }],
      rct,
      CONFIG,
    );
    expect(c1.tier).toBe("preliminary"); // clamped — a lone RCT can't be well-supported

    const meta = [candidate({ pubTypes: ["Meta-Analysis"] })];
    const [c2] = buildFreshChunks(
      [{ index: 0, claim: "A meta-analysis supports the effect.", category: "supplements", tags: [], tier: "well-supported", caveat: "15 RCTs." }],
      meta,
      CONFIG,
    );
    expect(c2.tier).toBe("well-supported"); // meta-analysis may keep it
  });

  it("rejects a draft whose claim/caveat reads like a no-abstract placeholder", () => {
    const drafts: CandidateDraft[] = [
      { index: 0, claim: "Abstract unavailable.", category: "training", tags: [], tier: "preliminary", caveat: "No abstract provided; unable to assess." },
    ];
    expect(buildFreshChunks(drafts, cands, CONFIG)).toHaveLength(0);
  });
});

describe("harvest — mergeFresh", () => {
  it("is idempotent by id and DOI", () => {
    const a = { id: "fresh-a", study: { doi: "10.1/a" } } as FreshChunk;
    const b = { id: "fresh-b", study: { doi: "10.1/b" } } as FreshChunk;
    const aDup = { id: "fresh-a2", study: { doi: "10.1/A" } } as FreshChunk; // same DOI, different case
    expect(mergeFresh([a], [a]).length).toBe(1);
    expect(mergeFresh([a], [b]).length).toBe(2);
    expect(mergeFresh([a], [aDup]).length).toBe(1); // DOI dedupe wins
  });
});

describe("harvest — runHarvest (end to end, injected)", () => {
  // A fake PubMed: esearch → one id, esummary → one record, efetch → abstract text.
  const fakeFetch: FetchLike = async (url: string) => {
    const body = url.includes("esearch")
      ? { esearchresult: { idlist: ["111"] } }
      : url.includes("esummary")
        ? {
            result: {
              uids: ["111"],
              "111": {
                title: "New creatine timing trial",
                source: "Nutrients",
                pubdate: "2026",
                articleids: [{ idtype: "doi", value: "10.1/e2e" }],
                pubtype: ["Randomized Controlled Trial"],
              },
            },
          }
        : {};
    return {
      ok: true,
      json: async () => body,
      // A realistic-length abstract so it clears the MIN_ABSTRACT_CHARS gate
      // (index.ts §4) — a study with no usable abstract is skipped, not drafted.
      text: async () =>
        "Abstract: In this eight-week randomized controlled trial, 22 resistance-trained men " +
        "supplemented creatine either immediately before or after training. Both groups gained " +
        "strength and lean mass, with a small, non-significant edge for pre-training timing. " +
        "Larger trials are needed to confirm any true timing effect.",
    };
  };

  const fakeDrafter: Drafter = {
    available: true,
    async draft(cands) {
      return cands.map((_, index) => ({
        index,
        claim: "A new trial hints at a creatine timing edge.",
        category: "supplements" as const,
        tags: ["creatine"],
        tier: "preliminary" as const,
        caveat: "One small RCT — exploratory.",
      }));
    },
  };

  it("discovers, drafts, and builds a sourced fresh chunk", async () => {
    const res = await runHarvest({
      existing: [],
      fetchImpl: fakeFetch,
      drafter: fakeDrafter,
      queries: [{ category: "supplements", term: "creatine" }],
      config: CONFIG,
    });
    expect(res.discovered).toBe(1);
    expect(res.additions).toHaveLength(1);
    expect(res.additions[0].source.url).toBe("https://pubmed.ncbi.nlm.nih.gov/111/");
    expect(res.degraded).toBe(false);
    expect(res.report).toContain("Pulse harvest");
  });

  it("degrades with no drafter: discovers candidates but proposes no chunks", async () => {
    const res = await runHarvest({
      existing: [],
      fetchImpl: fakeFetch,
      drafter: { available: false, async draft() { return []; } },
      queries: [{ category: "supplements", term: "creatine" }],
      config: CONFIG,
    });
    expect(res.discovered).toBe(1);
    expect(res.additions).toHaveLength(0);
    expect(res.degraded).toBe(true);
  });

  it("drops a candidate whose abstract is unavailable — no placeholder card", async () => {
    const noAbstractFetch: FetchLike = async (url: string) => {
      const base = await fakeFetch(url);
      return url.includes("efetch") ? { ...base, text: async () => "" } : base;
    };
    const res = await runHarvest({
      existing: [],
      fetchImpl: noAbstractFetch,
      drafter: fakeDrafter,
      queries: [{ category: "supplements", term: "creatine" }],
      config: CONFIG,
    });
    expect(res.discovered).toBe(1);
    expect(res.additions).toHaveLength(0); // nothing drafted from an empty abstract
    expect(res.skipped.some((s) => s.reason.includes("no abstract"))).toBe(true);
  });

  it("skips a study already in the corpus (dedupe against existing)", async () => {
    const existing = [
      { id: "fresh-x", source: { label: "L", url: "https://x" }, study: { doi: "10.1/e2e" } } as FreshChunk,
    ];
    const res = await runHarvest({
      existing,
      fetchImpl: fakeFetch,
      drafter: fakeDrafter,
      queries: [{ category: "supplements", term: "creatine" }],
      config: CONFIG,
    });
    expect(res.additions).toHaveLength(0);
    expect(res.skipped.some((s) => s.reason.includes("duplicate DOI"))).toBe(true);
  });
});
