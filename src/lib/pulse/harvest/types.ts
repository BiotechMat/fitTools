/**
 * Pulse harvest — shared types (PULSE.md §15.7 F1). The discovery pipeline that
 * drafts fresh (recent-discovery) chunks from newly published research.
 *
 * Runtime-safety note: everything under `harvest/` must be runnable by a plain
 * Node process (the CLI + the F2 GitHub Action), so these modules use ONLY
 * relative imports and `import type` for app types (type imports are erased at
 * runtime, so they never pull the `@/…` alias chain into the runner). Values
 * that the app also owns (the category list) are mirrored in `sources.ts` and
 * asserted equal in the unit test, rather than imported.
 */

import type { GroundingChunk, PulseCategory } from "../types.ts";

/** A raw study discovered from a source, before triage or drafting. */
export interface StudyCandidate {
  /** Stable external id (PubMed pmid, or a hash for web hits) — for dedupe/logs. */
  externalId: string;
  title: string;
  journal?: string;
  /** Publication year as reported by the source. */
  year?: string;
  doi?: string;
  /** Canonical URL that becomes the card's source. MUST be allowlisted (§15.2). */
  url: string;
  abstract?: string;
  /** Publication types from the source (e.g. "Randomized Controlled Trial"). */
  pubTypes: string[];
  /** Which channel surfaced it, for the report. */
  channel: "pubmed" | "web";
}

/**
 * What the drafting model returns per candidate. Note the ABSENCE of any
 * url/source/doi field — the model may only reference a candidate by its
 * `index`, exactly like the runtime generator's chunkId contract (§15.3). The
 * server/script attaches the real citation from the candidate metadata.
 */
export interface CandidateDraft {
  /** Index into the candidates array we supplied — the only reference allowed. */
  index: number;
  claim: string;
  category: PulseCategory;
  tags: string[];
  tier: GroundingChunk["tier"];
  /** The reality-check line (§15.3). Required. */
  caveat: string;
}

/** A drafted fresh chunk — a GroundingChunk guaranteed to carry the §15.4 fields. */
export type FreshChunk = GroundingChunk & {
  kind: "fresh";
  addedAt: string;
  caveat: string;
};

export interface HarvestConfig {
  /** Max PubMed ids pulled per category query. */
  perQuery: number;
  /** Allowlisted host suffixes — a candidate whose URL host isn't covered is dropped. */
  allowlist: string[];
  /** ISO date (YYYY-MM-DD) stamped on new chunks — the corpus entry date, not pubdate. */
  addedAt: string;
}

export interface HarvestResult {
  /** New fresh chunks ready to append to the sidecar (already deduped + built). */
  additions: FreshChunk[];
  /** Candidates discovered but dropped, with a reason — for the report. */
  skipped: { candidate: StudyCandidate; reason: string }[];
  /** Total candidates discovered across all channels. */
  discovered: number;
  /** True when no drafting model was configured (degraded — candidates only). */
  degraded: boolean;
  /** Human-readable markdown summary for the PR body / session review. */
  report: string;
}
