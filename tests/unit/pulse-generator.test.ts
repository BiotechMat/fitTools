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
