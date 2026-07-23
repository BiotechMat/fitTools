/**
 * Pulse harvest — PubMed E-utilities client (PULSE.md §15.2 backbone).
 *
 * esearch → pmids, esummary → structured metadata, efetch → abstract text.
 * All metadata (title, journal, year, DOI, pub types, URL) is captured
 * MECHANICALLY here; the drafting model never emits any of it (§15.3). `fetch`
 * is injected so the pure JSON→StudyCandidate mapping is unit-testable offline.
 */

import { EUTILS_BASE } from "./sources.ts";
import type { StudyCandidate } from "./types.ts";

export type FetchLike = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown>; text: () => Promise<string> }>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** esearch: newest pmids for a query. Returns [] on any failure (never throws). */
export async function searchPubmed(term: string, retmax: number, fetchImpl: FetchLike): Promise<string[]> {
  const url =
    `${EUTILS_BASE}/esearch.fcgi?db=pubmed&sort=date&retmode=json` +
    `&retmax=${encodeURIComponent(String(retmax))}&term=${encodeURIComponent(term)}`;
  try {
    const res = await fetchImpl(url);
    if (!res.ok) return [];
    return parseIdList(await res.json());
  } catch {
    return [];
  }
}

export function parseIdList(data: unknown): string[] {
  if (!isObject(data)) return [];
  const result = data.esearchresult;
  if (!isObject(result)) return [];
  const idlist = result.idlist;
  if (!Array.isArray(idlist)) return [];
  return idlist.filter((x): x is string => typeof x === "string");
}

/** esummary: structured metadata for a batch of pmids. */
export async function fetchSummaries(pmids: string[], fetchImpl: FetchLike): Promise<StudyCandidate[]> {
  if (pmids.length === 0) return [];
  const url = `${EUTILS_BASE}/esummary.fcgi?db=pubmed&retmode=json&id=${encodeURIComponent(pmids.join(","))}`;
  try {
    const res = await fetchImpl(url);
    if (!res.ok) return [];
    return parseSummaries(await res.json());
  } catch {
    return [];
  }
}

export function parseSummaries(data: unknown): StudyCandidate[] {
  if (!isObject(data)) return [];
  const result = data.result;
  if (!isObject(result)) return [];
  const uids = result.uids;
  if (!Array.isArray(uids)) return [];

  const out: StudyCandidate[] = [];
  for (const uid of uids) {
    if (typeof uid !== "string") continue;
    const rec = result[uid];
    if (!isObject(rec)) continue;
    const title = typeof rec.title === "string" ? rec.title.trim() : "";
    if (!title) continue;

    out.push({
      externalId: uid,
      title: title.replace(/\.$/, ""),
      journal: typeof rec.source === "string" ? rec.source : undefined,
      year: parseYear(rec.pubdate),
      doi: parseDoi(rec.articleids),
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      pubTypes: parsePubTypes(rec.pubtype),
      channel: "pubmed",
    });
  }
  return out;
}

function parseYear(pubdate: unknown): string | undefined {
  if (typeof pubdate !== "string") return undefined;
  const m = pubdate.match(/\d{4}/);
  return m ? m[0] : undefined;
}

function parseDoi(articleids: unknown): string | undefined {
  if (!Array.isArray(articleids)) return undefined;
  for (const a of articleids) {
    if (isObject(a) && a.idtype === "doi" && typeof a.value === "string") return a.value;
  }
  return undefined;
}

function parsePubTypes(pubtype: unknown): string[] {
  if (!Array.isArray(pubtype)) return [];
  return pubtype.filter((x): x is string => typeof x === "string");
}

/** efetch: plain-text abstract for one pmid (grounding for the draft). */
export async function fetchAbstract(pmid: string, fetchImpl: FetchLike): Promise<string> {
  const url = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=${encodeURIComponent(pmid)}`;
  try {
    const res = await fetchImpl(url);
    if (!res.ok) return "";
    return (await res.text()).trim();
  } catch {
    return "";
  }
}
