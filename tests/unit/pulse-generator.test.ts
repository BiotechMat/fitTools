import { describe, expect, it } from "vitest";
import { buildCardsFromChunks, buildCardsFromDrafts } from "@/lib/pulse/generator";
import type { GroundingChunk } from "@/lib/pulse/types";

const chunk: GroundingChunk = {
  id: "sauna-cv-mortality",
  claim: "Frequent sauna use is associated with lower cardiovascular mortality.",
  category: "longevity",
  tags: ["sauna"],
  tier: "well-supported",
  basis: "human",
  source: { label: "Laukkanen 2015", url: "https://pubmed.ncbi.nlm.nih.gov/25705824/" },
  relatedContent: "/recovery/sauna-therapy",
};
const map = new Map([[chunk.id, chunk]]);

/**
 * The anti-hallucination contract (PULSE.md §2.1 / §5.3): the model only names a
 * chunk; the server attaches the real source. A draft citing an unknown chunk is
 * dropped — the model can never introduce a source we didn't vet.
 */
describe("buildCardsFromDrafts", () => {
  it("attaches the real source from the chunk (model never supplies a url)", () => {
    const [card] = buildCardsFromDrafts(
      [{ chunkId: "sauna-cv-mortality", fact: "Regular sauna sessions track with a longer life." }],
      map,
    );
    expect(card.source).toEqual(chunk.source);
    expect(card.generated).toBe(true);
    expect(card.category).toBe("longevity");
    expect(card.relatedContent).toBe("/recovery/sauna-therapy");
  });

  it("drops a draft whose chunkId was not supplied", () => {
    const cards = buildCardsFromDrafts(
      [{ chunkId: "totally-made-up", fact: "Ice baths cure everything." }],
      map,
    );
    expect(cards).toHaveLength(0);
  });

  it("drops a draft with an empty fact", () => {
    expect(buildCardsFromDrafts([{ chunkId: "sauna-cv-mortality", fact: "   " }], map)).toHaveLength(0);
  });
});

describe("buildCardsFromChunks (degraded path)", () => {
  it("serves the vetted claim verbatim, still sourced, flagged not-generated", () => {
    const [card] = buildCardsFromChunks([chunk]);
    expect(card.fact).toBe(chunk.claim);
    expect(card.source).toEqual(chunk.source);
    expect(card.generated).toBe(false);
  });
});

/**
 * Fresh-card framing (PULSE.md §15.4) must survive both card-build paths — the
 * "New" badge, caveat line and study meta are carried from the chunk, never the
 * model, exactly like the source.
 */
describe("fresh-chunk fields carry through (PULSE.md §15)", () => {
  const freshChunk: GroundingChunk = {
    ...chunk,
    id: "fresh-x",
    kind: "fresh",
    addedAt: "2026-07-23",
    caveat: "one small pilot",
    study: { doi: "10.1/x", journal: "Nutrients", design: "Pilot RCT", n: 11, population: "men" },
  };
  const freshMap = new Map([[freshChunk.id, freshChunk]]);

  it("carries kind/addedAt/caveat/study on the generated path", () => {
    const [card] = buildCardsFromDrafts([{ chunkId: "fresh-x", fact: "New pilot hints at a timing edge." }], freshMap);
    expect(card.kind).toBe("fresh");
    expect(card.addedAt).toBe("2026-07-23");
    expect(card.caveat).toBe("one small pilot");
    expect(card.study?.doi).toBe("10.1/x");
    expect(card.generated).toBe(true);
  });

  it("carries them on the degraded (verbatim) path too", () => {
    const [card] = buildCardsFromChunks([freshChunk]);
    expect(card.kind).toBe("fresh");
    expect(card.caveat).toBe("one small pilot");
    expect(card.study?.n).toBe(11);
  });

  it("leaves evergreen chunks without fresh framing", () => {
    const [card] = buildCardsFromChunks([chunk]);
    expect(card.kind).toBeUndefined();
    expect(card.caveat).toBeUndefined();
  });
});
