/**
 * Pulse harvest — drafting (PULSE.md §15.3). A Haiku-class model turns each
 * discovered study into a card draft; the citation is attached MECHANICALLY by
 * `buildFreshChunks`, never by the model.
 *
 * Anti-hallucination contract (mirrors the runtime generator, §15.3): the model
 * is given abstracts and may only reference a study by its `index`. It never
 * emits a URL, DOI, journal or source — the script maps `index` → the
 * candidate's real metadata. A draft with an out-of-range index is dropped.
 * Nothing here throws: no key → the null drafter, and the pipeline degrades to
 * emitting candidates for manual drafting.
 */

import { HARVEST_CATEGORIES } from "./sources.ts";
import { inferDesign, proposeChunkId } from "./triage.ts";
import type { CandidateDraft, FreshChunk, HarvestConfig, StudyCandidate } from "./types.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5";

const VALID_TIERS = ["well-supported", "preliminary", "marketing-claim", "not-supported"] as const;
type Tier = (typeof VALID_TIERS)[number];

function isTier(v: unknown): v is Tier {
  return typeof v === "string" && (VALID_TIERS as readonly string[]).includes(v);
}
function isCategory(v: unknown): v is FreshChunk["category"] {
  return typeof v === "string" && (HARVEST_CATEGORIES as readonly string[]).includes(v);
}

/**
 * Turn model drafts into fresh chunks, attaching the REAL citation from the
 * candidate (title/journal/year → source; DOI + inferred design → study). PURE
 * and unit-tested — the §15.3 enforcement point. Drops any draft with an
 * unknown index, empty claim/caveat, invalid category/tier, or a duplicate id.
 */
export function buildFreshChunks(
  drafts: CandidateDraft[],
  candidates: StudyCandidate[],
  config: HarvestConfig,
): FreshChunk[] {
  const out: FreshChunk[] = [];
  const usedIds = new Set<string>();

  for (const d of drafts) {
    const candidate = candidates[d.index];
    if (!candidate) continue; // index the model invented — reject
    const claim = d.claim?.trim();
    const caveat = d.caveat?.trim();
    if (!claim || !caveat) continue;
    if (!isCategory(d.category) || !isTier(d.tier)) continue;

    const id = proposeChunkId(candidate);
    if (usedIds.has(id)) continue; // two drafts for one study — keep the first
    usedIds.add(id);

    out.push({
      id,
      claim,
      category: d.category,
      tags: normaliseTags(d.tags),
      tier: d.tier,
      basis: "human",
      source: { label: sourceLabel(candidate), url: candidate.url }, // ← mechanical, never model
      kind: "fresh",
      addedAt: config.addedAt,
      caveat,
      study: {
        doi: candidate.doi,
        journal: candidate.journal,
        design: inferDesign(candidate),
        // n / population are deliberately left for human review at the PR gate —
        // the pipeline never fabricates a sample size (§15.3).
      },
    });
  }
  return out;
}

function sourceLabel(c: StudyCandidate): string {
  const tail = [c.journal, c.year].filter(Boolean).join(" ");
  return tail ? `${c.title}. ${tail}` : c.title;
}

function normaliseTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().trim().replace(/\s+/g, "-"))
    .filter((t) => t.length > 0)
    .slice(0, 5);
}

export interface Drafter {
  readonly available: boolean;
  /** Draft one card per candidate. Returns [] on failure (never throws). */
  draft(candidates: StudyCandidate[]): Promise<CandidateDraft[]>;
}

/** No-key fallback — the pipeline degrades to emitting candidates for manual drafting. */
export const nullDrafter: Drafter = {
  available: false,
  async draft() {
    return [];
  },
};

const SYSTEM_PROMPT = [
  "You draft bite-sized fact cards for a credible, evidence-first fitness and",
  "longevity feed, from RECENT studies. You are given study abstracts. For each,",
  "write one punchy card that leads with the finding AND is honest about what the",
  "evidence actually is.",
  "",
  "Hard rules:",
  "- Use ONLY facts stated in the abstract you were given. Never add a statistic,",
  "  mechanism or nuance that isn't there. Never invent numbers.",
  "- Preserve the evidential hedging: an association is not causation; a single",
  "  trial or a preprint is not settled science. Default `tier` to 'preliminary'",
  "  unless the abstract is a meta-analysis or systematic review.",
  "- `caveat` is REQUIRED and must state the reality check in plain English:",
  "  the design, the sample size and population, and the key limitation",
  "  (e.g. 'One pilot RCT, n=11 active men, exploratory, needs replication').",
  "- British English. `claim` is 1 to 2 sentences. No emoji, no hashtags, no",
  "  clickbait. Choose `category` and up to 5 lowercase `tags`.",
  "- Reference each study by its `index` only. You are physically unable to cite",
  "  a source; the system attaches the real citation. Never write a URL, DOI or",
  "  journal name in the claim.",
  "Return one card per study.",
].join("\n");

function draftSchema(indices: number[]) {
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
          required: ["index", "claim", "category", "tags", "tier", "caveat"],
          properties: {
            index: { type: "integer", enum: indices },
            claim: { type: "string" },
            category: { type: "string", enum: [...HARVEST_CATEGORIES] },
            tags: { type: "array", items: { type: "string" } },
            tier: { type: "string", enum: [...VALID_TIERS] },
            caveat: { type: "string" },
          },
        },
      },
    },
  };
}

interface AnthropicResponse {
  content?: { type: string; text?: string }[];
}

/** Claude Messages API drafter (fetch; structured output; no new dependency). */
export class ClaudeDrafter implements Drafter {
  readonly available = true;
  // Explicit fields (not TS parameter properties) so the harvest runs under
  // Node's native type-stripping, which rejects parameter properties.
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = process.env.PULSE_NEWS_MODEL || DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async draft(candidates: StudyCandidate[]): Promise<CandidateDraft[]> {
    if (candidates.length === 0) return [];
    const indices = candidates.map((_, i) => i);
    const userContent =
      "Draft one card per study below. Use only what each abstract states.\n\n" +
      candidates
        .map(
          (c, i) =>
            `index: ${i}\ntitle: ${c.title}\njournal: ${c.journal ?? "?"} ${c.year ?? ""}\n` +
            `types: ${c.pubTypes.join(", ") || "?"}\nabstract: ${c.abstract || "(abstract unavailable)"}`,
        )
        .join("\n\n---\n\n");

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
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          output_config: { format: { type: "json_schema", schema: draftSchema(indices) } },
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
      return []; // network/parse failure degrades to candidates-only — never throws
    }
  }
}

function isDraft(v: unknown): v is CandidateDraft {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.index === "number" && typeof r.claim === "string" && typeof r.caveat === "string";
}

/** Resolve the configured drafter. Key absent → null drafter (degraded). */
export function getDrafter(): Drafter {
  if (process.env.PULSE_NEWS_PROVIDER === "none") return nullDrafter;
  const key = process.env.PULSE_LLM_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return nullDrafter;
  return new ClaudeDrafter(key);
}
