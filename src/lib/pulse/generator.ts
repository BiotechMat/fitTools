/**
 * Pulse generation (PULSE.md §5.1, §11). Provider-abstracted so a local model
 * can slot in later; the Claude implementation calls the Messages API over
 * `fetch` (no new dependency — CLAUDE.md; mirrors EmailCapture's fetch usage).
 *
 * THE ANTI-HALLUCINATION CONTRACT (PULSE.md §2.1 / §5.3): the model is given
 * grounding chunks and may only reference one by `chunkId`. It never emits a
 * URL. The server maps `chunkId` → the chunk's pre-vetted `source`. A draft
 * whose `chunkId` isn't one we supplied is dropped. Citation fabrication is
 * therefore structurally impossible — the model cannot attach a source we
 * didn't already vet.
 *
 * Graceful degradation (mirrors analytics/ads "silent until configured"): with
 * no API key the generator is null and the route serves the vetted claims
 * verbatim as cards — still real, still sourced — flagged `degraded`.
 */

import type { GeneratedCardDraft, GroundingChunk, PulseCard } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Haiku by default (locked PULSE.md §11.12): rephrasing vetted one-liners is a
// high-volume, low-complexity workload; Haiku is ~5× cheaper per token than
// Opus. PULSE_LLM_MODEL overrides (e.g. claude-opus-4-8 for richer phrasing).
const DEFAULT_MODEL = "claude-haiku-4-5";

/** Tiny stable string hash for card ids (djb2). Not security-sensitive. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Turn validated drafts into cards, attaching the REAL source from the chunk.
 * Pure and node-testable — this is the enforcement point for §5.3. Drafts whose
 * chunkId is unknown, or whose fact is empty, are dropped.
 */
export function buildCardsFromDrafts(
  drafts: GeneratedCardDraft[],
  chunkMap: ReadonlyMap<string, GroundingChunk>,
): PulseCard[] {
  const cards: PulseCard[] = [];
  for (const d of drafts) {
    const chunk = chunkMap.get(d.chunkId);
    if (!chunk) continue; // model referenced a chunk we didn't supply — reject
    const fact = d.fact?.trim();
    if (!fact) continue;
    cards.push({
      id: `${chunk.id}-${hash(fact)}`,
      chunkId: chunk.id,
      fact,
      detail: d.detail?.trim() || undefined,
      category: chunk.category,
      tags: chunk.tags,
      tier: chunk.tier,
      basis: chunk.basis,
      source: chunk.source, // ← real, vetted, server-attached
      relatedTool: chunk.relatedTool,
      relatedContent: chunk.relatedContent,
      generated: true,
      kind: chunk.kind,
      addedAt: chunk.addedAt,
      study: chunk.study,
      caveat: chunk.caveat,
    });
  }
  return cards;
}

/** Degraded path: serve the vetted claim verbatim as a card (still real + sourced). */
export function buildCardsFromChunks(chunks: GroundingChunk[]): PulseCard[] {
  return chunks.map((chunk) => ({
    id: `${chunk.id}-claim`,
    chunkId: chunk.id,
    fact: chunk.claim,
    category: chunk.category,
    tags: chunk.tags,
    tier: chunk.tier,
    basis: chunk.basis,
    source: chunk.source,
    relatedTool: chunk.relatedTool,
    relatedContent: chunk.relatedContent,
    generated: false,
    kind: chunk.kind,
    addedAt: chunk.addedAt,
    study: chunk.study,
    caveat: chunk.caveat,
  }));
}

export interface PulseGenerator {
  readonly available: boolean;
  /** Generate one draft per supplied chunk. Returns [] on failure (never throws). */
  generate(chunks: GroundingChunk[]): Promise<GeneratedCardDraft[]>;
}

/** No-key fallback — the route degrades to serving vetted claims. */
export const nullGenerator: PulseGenerator = {
  available: false,
  async generate() {
    return [];
  },
};

const SYSTEM_PROMPT = [
  "You write bite-sized fact cards for a credible, evidence-first fitness and",
  "longevity feed. You are given VETTED, already-sourced claims. Your only job is",
  "to rephrase each claim into one punchy, scroll-stopping card.",
  "",
  "Hard rules:",
  "- Rephrase ONLY the supplied claim. Never add a fact, statistic, mechanism, or",
  "  nuance that is not in the claim you were given.",
  "- Keep the claim's evidential hedging intact (e.g. 'observational', 'preliminary',",
  "  'associated with' must survive — never upgrade an association to causation).",
  "- British English. 1–2 sentences for `fact`. No emoji, no hashtags, no clickbait,",
  "  no invented numbers.",
  "- Reference each claim by its `chunkId`. You are physically unable to cite a",
  "  source; the system attaches the real citation. Do not mention sources or URLs.",
  "- `detail` is optional: one extra sentence of grounded context from the same",
  "  claim, or omit it.",
  "Return one card per supplied claim.",
].join("\n");

function draftSchema(chunkIds: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["cards"],
    properties: {
      cards: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["chunkId", "fact"],
          properties: {
            chunkId: { type: "string", enum: chunkIds },
            fact: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
    },
  };
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}

/** Claude Messages API generator (fetch; structured output; no thinking — fast). */
export class ClaudeGenerator implements PulseGenerator {
  readonly available = true;
  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.PULSE_LLM_MODEL || DEFAULT_MODEL,
  ) {}

  async generate(chunks: GroundingChunk[]): Promise<GeneratedCardDraft[]> {
    if (chunks.length === 0) return [];
    const chunkIds = chunks.map((c) => c.id);
    const userContent =
      "Rephrase each of these vetted claims into a card. Return one card per claim.\n\n" +
      chunks
        .map((c) => `chunkId: ${c.id}\ncategory: ${c.category}\nevidence: ${c.tier}\nclaim: ${c.claim}`)
        .join("\n\n");

    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          // ~2 sentences + optional detail per card; scaled so a full
          // PHRASING_BATCH_SIZE batch never truncates mid-JSON.
          max_tokens: Math.min(512 + 220 * chunks.length, 8192),
          system: SYSTEM_PROMPT,
          output_config: { format: { type: "json_schema", schema: draftSchema(chunkIds) } },
          messages: [{ role: "user", content: userContent }],
        }),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as AnthropicResponse;
      const text = data.content?.find((b) => b.type === "text")?.text;
      if (!text) return [];
      const parsed: unknown = JSON.parse(text);
      const cards = (parsed as { cards?: unknown }).cards;
      if (!Array.isArray(cards)) return [];
      return cards.filter(isDraft);
    } catch {
      return []; // network/parse failure degrades to vetted claims — never throws
    }
  }
}

function isDraft(v: unknown): v is GeneratedCardDraft {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.chunkId === "string" && typeof r.fact === "string";
}

/** Resolve the configured generator. Key absent → null generator (degraded). */
export function getGenerator(): PulseGenerator {
  if (process.env.PULSE_LLM_PROVIDER === "none") return nullGenerator;
  const key = process.env.PULSE_LLM_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return nullGenerator;
  return new ClaudeGenerator(key);
}
