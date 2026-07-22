/**
 * Pulse — shared types (PULSE.md). The endless-scroll cited-fact feed.
 *
 * Design invariant (PULSE.md §1.1 / §2.1): facts are *generated* at runtime but
 * *grounded* in vetted content, and every card carries a REAL source. The
 * anti-hallucination mechanism is structural — the language model never emits a
 * source URL; it only names which grounding chunk it used, and the server
 * attaches that chunk's pre-vetted citation. See `generator.ts` / `route.ts`.
 *
 * Evidence vocabulary is reused from the peptides registry so the existing
 * <EvidenceTier /> component renders Pulse cards unchanged.
 */

import type { Source } from "@/registry/types";
import type { EvidenceBasis, EvidenceTier } from "@/registry/peptides";

/** Feed-native category superset (PULSE.md §3.1, locked §11). */
export type PulseCategory =
  | "training"
  | "nutrition"
  | "recovery"
  | "sleep"
  | "physiology"
  | "supplements"
  | "longevity"
  | "cardio"
  | "mind";

export const PULSE_CATEGORIES: readonly PulseCategory[] = [
  "training",
  "nutrition",
  "recovery",
  "sleep",
  "physiology",
  "supplements",
  "longevity",
  "cardio",
  "mind",
] as const;

/** Human labels for the category chips (British English). */
export const PULSE_CATEGORY_LABELS: Record<PulseCategory, string> = {
  training: "Training",
  nutrition: "Nutrition",
  recovery: "Recovery",
  sleep: "Sleep",
  physiology: "Physiology",
  supplements: "Supplements",
  longevity: "Longevity",
  cardio: "Cardio",
  mind: "Mind",
};

export function isPulseCategory(value: unknown): value is PulseCategory {
  return typeof value === "string" && (PULSE_CATEGORIES as readonly string[]).includes(value);
}

/**
 * A grounding chunk: a vetted, sourced claim the generator rephrases into
 * fresh cards. This is grounding material, NOT a bank of finished cards — the
 * served fact is generated; the chunk exists to keep the citation real and to
 * carry the cross-links. Derived from the site's already-sourced content.
 */
export interface GroundingChunk {
  /** Stable kebab-case id — the only thing the model is allowed to reference. */
  id: string;
  /** The vetted factual claim (grounding, not final card copy). British English. */
  claim: string;
  category: PulseCategory;
  tags: string[];
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  /** REAL primary source — the anti-hallucination anchor. Never model-generated. */
  source: Source;
  /** Optional cross-link into a calculator (validated against the tool registry). */
  relatedTool?: string;
  /** Optional cross-link to an article/route (validated to resolve). */
  relatedContent?: string;
}

/**
 * What the generator returns per card. Note the ABSENCE of any source/url field
 * — the model may only cite a chunk by id (PULSE.md §5.3 anti-hallucination).
 */
export interface GeneratedCardDraft {
  /** Must be one of the chunk ids supplied in the request. */
  chunkId: string;
  /** Rephrased, punchy fact — 1–2 sentences, British English. */
  fact: string;
  /** Optional deeper second layer, shown on expand. */
  detail?: string;
}

/** A finished card served to the client. `source` is always carried from the chunk. */
export interface PulseCard {
  /** Unique per served card (chunkId + content hash). */
  id: string;
  chunkId: string;
  fact: string;
  detail?: string;
  category: PulseCategory;
  tags: string[];
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  source: Source;
  relatedTool?: string;
  relatedContent?: string;
  /** True when LLM-generated; false when the vetted claim is served verbatim. */
  generated: boolean;
}

export interface PulseBatchResponse {
  cards: PulseCard[];
  /** True when the generator is unavailable and vetted claims are served as-is. */
  degraded: boolean;
}
