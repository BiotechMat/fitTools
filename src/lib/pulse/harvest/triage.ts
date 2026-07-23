/**
 * Pulse harvest — triage (PULSE.md §15.2). Pure, unit-testable: allowlist
 * enforcement, dedupe against the existing corpus, stable id proposal, and
 * mechanical study-design inference from publication types. No network, no LLM.
 */

import type { FreshChunk, StudyCandidate } from "./types.ts";

/** Host of a URL, lowercased, or null if unparseable. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

/** True iff the URL's host is (a subdomain of) an allowlisted host (§15.2). */
export function withinAllowlist(url: string, allowlist: readonly string[]): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return allowlist.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

/** The DOIs and source URLs already present, so the harvest never re-adds one. */
export function existingKeys(chunks: FreshChunk[]): { dois: Set<string>; urls: Set<string> } {
  const dois = new Set<string>();
  const urls = new Set<string>();
  for (const c of chunks) {
    if (c.study?.doi) dois.add(c.study.doi.toLowerCase());
    if (c.source?.url) urls.add(c.source.url.toLowerCase());
  }
  return { dois, urls };
}

/**
 * Drop candidates that fail the allowlist, are already in the corpus (by DOI or
 * URL), or duplicate an earlier candidate in the same batch. Returns the kept
 * candidates and the reasons for each drop (for the report).
 */
export function triage(
  candidates: StudyCandidate[],
  existing: { dois: Set<string>; urls: Set<string> },
  allowlist: readonly string[],
): { kept: StudyCandidate[]; skipped: { candidate: StudyCandidate; reason: string }[] } {
  const kept: StudyCandidate[] = [];
  const skipped: { candidate: StudyCandidate; reason: string }[] = [];
  const seenDois = new Set(existing.dois);
  const seenUrls = new Set(existing.urls);

  for (const c of candidates) {
    if (!withinAllowlist(c.url, allowlist)) {
      skipped.push({ candidate: c, reason: "outside source allowlist" });
      continue;
    }
    const doi = c.doi?.toLowerCase();
    if (doi && seenDois.has(doi)) {
      skipped.push({ candidate: c, reason: "duplicate DOI (already in corpus/batch)" });
      continue;
    }
    if (seenUrls.has(c.url.toLowerCase())) {
      skipped.push({ candidate: c, reason: "duplicate source URL" });
      continue;
    }
    kept.push(c);
    if (doi) seenDois.add(doi);
    seenUrls.add(c.url.toLowerCase());
  }
  return { kept, skipped };
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "or", "in", "on", "for", "with", "to", "from",
  "at", "by", "is", "are", "as", "effects", "effect", "study", "trial", "among",
]);

/** Stable kebab-case chunk id: `fresh-<slug>-<hash>` (deterministic per DOI/pmid). */
export function proposeChunkId(candidate: StudyCandidate): string {
  const words = candidate.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 6);
  const slug = words.join("-") || "study";
  return `fresh-${slug}-${shortHash(candidate.doi ?? candidate.externalId)}`;
}

/** Small stable base36 hash (djb2) — collision-resistant enough for ids. */
function shortHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 6);
}

/**
 * Mechanical study-design label from publication types + URL (§15.4). Preprint
 * servers force a "preprint" label so a non-peer-reviewed source can never read
 * as peer-reviewed (validateCorpus enforces this too).
 */
export function inferDesign(candidate: StudyCandidate): string {
  const host = hostOf(candidate.url) ?? "";
  const isPreprint = /(^|\.)medrxiv\.org$|(^|\.)biorxiv\.org$/.test(host);
  const types = candidate.pubTypes.map((t) => t.toLowerCase());
  const has = (needle: string) => types.some((t) => t.includes(needle));

  let base: string;
  if (has("meta-analysis")) base = "Meta-analysis";
  else if (has("systematic review")) base = "Systematic review";
  else if (has("randomized controlled trial")) base = "RCT";
  else if (has("clinical trial")) base = "Clinical trial";
  else if (has("observational") || has("cohort")) base = "Cohort";
  else if (has("review")) base = "Review";
  else base = "Study";

  return isPreprint ? `${base} (preprint)` : base;
}
