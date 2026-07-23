/**
 * Pulse harvest — orchestrator (PULSE.md §15.7 F1). Discover → triage → draft →
 * build, returning fresh chunks to append plus a review report. Pure of the
 * filesystem: the CLI (`scripts/pulse-harvest.ts`) owns reading/writing the
 * sidecar; the F2 GitHub Action calls the same `runHarvest`.
 *
 * `fetch` and the drafter are injected so the whole pipeline is unit-testable
 * offline against fixtures, with no live PubMed or LLM call.
 */

import { fetchAbstract, fetchSummaries, searchPubmed } from "./pubmed.ts";
import type { FetchLike } from "./pubmed.ts";
import { buildFreshChunks, getDrafter } from "./draft.ts";
import type { Drafter } from "./draft.ts";
import { existingKeys, triage } from "./triage.ts";
import { renderReport } from "./emit.ts";
import { HARVEST_ALLOWLIST, PUBMED_QUERIES } from "./sources.ts";
import type { FreshChunk, HarvestConfig, HarvestResult, StudyCandidate } from "./types.ts";

export interface RunHarvestOptions {
  /** The current sidecar contents — dedupe target. */
  existing: FreshChunk[];
  /** Injected fetch (defaults to global fetch). */
  fetchImpl?: FetchLike;
  /** Injected drafter (defaults to the env-configured one). */
  drafter?: Drafter;
  /** Override the category queries (tests). */
  queries?: readonly { category: string; term: string }[];
  config?: Partial<HarvestConfig>;
  /** Hard cap on drafts per run, to bound LLM cost (§15.7). */
  maxDraftPerRun?: number;
  /**
   * Delay (ms) between per-candidate abstract (efetch) calls, to stay under
   * PubMed's ~3 req/s unauthenticated limit — rate-limit misses returned empty
   * abstracts, which produced the "abstract unavailable" cards. The CLI/Action
   * pass a real value; unit tests leave it 0 so injected fetches don't wait.
   */
  abstractDelayMs?: number;
}

/**
 * Minimum abstract length (chars) to accept a candidate for drafting. A real
 * abstract runs many hundreds of chars; an efetch that failed or returned only
 * a citation header falls well under this, so the study is skipped rather than
 * drafted from nothing.
 */
const MIN_ABSTRACT_CHARS = 200;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms: number): Promise<void> {
  return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}

export async function runHarvest(opts: RunHarvestOptions): Promise<HarvestResult> {
  const fetchImpl = opts.fetchImpl ?? ((url: string) => fetch(url));
  const drafter = opts.drafter ?? getDrafter();
  const queries = opts.queries ?? PUBMED_QUERIES;
  const maxDraftPerRun = opts.maxDraftPerRun ?? 6;
  const config: HarvestConfig = {
    perQuery: opts.config?.perQuery ?? 6,
    allowlist: opts.config?.allowlist ?? [...HARVEST_ALLOWLIST],
    addedAt: opts.config?.addedAt ?? todayISO(),
  };

  // 1. Discover across every category query.
  const discovered: StudyCandidate[] = [];
  for (const q of queries) {
    const pmids = await searchPubmed(q.term, config.perQuery, fetchImpl);
    const summaries = await fetchSummaries(pmids, fetchImpl);
    discovered.push(...summaries);
  }

  // 2. Triage: allowlist + dedupe against corpus and within the batch.
  const { kept, skipped } = triage(discovered, existingKeys(opts.existing), config.allowlist);

  // 3. Cap per run to bound cost; the overflow is reported, not silently dropped.
  const capped = kept.slice(0, maxDraftPerRun);
  for (const c of kept.slice(maxDraftPerRun)) {
    skipped.push({ candidate: c, reason: "over per-run draft cap" });
  }

  // 4. Enrich with abstracts (grounding for the draft) and DROP any candidate
  //    without a usable one — a study we can't read can't be responsibly
  //    drafted, so it is skipped rather than turned into an "abstract
  //    unavailable" card (the bug behind half of the first run's drafts).
  //    Only when a drafter is configured; degraded runs skip the efetch calls.
  let draftable = capped;
  if (drafter.available) {
    const withAbstract: StudyCandidate[] = [];
    for (const c of capped) {
      c.abstract = await fetchAbstract(c.externalId, fetchImpl);
      if ((c.abstract?.trim().length ?? 0) >= MIN_ABSTRACT_CHARS) {
        withAbstract.push(c);
      } else {
        skipped.push({ candidate: c, reason: "no abstract available to ground a draft" });
      }
      await sleep(opts.abstractDelayMs ?? 0);
    }
    draftable = withAbstract;
  }

  // 5. Draft (or degrade to none) and build fresh chunks — the anti-hallucination
  //    enforcement happens in buildFreshChunks. Indices line up with `draftable`.
  const drafts = await drafter.draft(draftable);
  const additions = buildFreshChunks(drafts, draftable, config);

  const report = renderReport({
    discovered: discovered.length,
    additions,
    skipped,
    degraded: !drafter.available,
    addedAt: config.addedAt,
  });

  return {
    additions,
    skipped,
    discovered: discovered.length,
    degraded: !drafter.available,
    report,
  };
}
