/**
 * Pulse harvest — emit (PULSE.md §15.7). Pure: merge new fresh chunks into the
 * existing sidecar (idempotent — never re-adds by id or DOI) and render a
 * human-readable report for the PR body / session review. No I/O here; the CLI
 * owns reading and writing the JSON file.
 */

import type { FreshChunk, StudyCandidate } from "./types.ts";

/** Append additions the sidecar doesn't already have (by id or DOI). Existing wins. */
export function mergeFresh(existing: FreshChunk[], additions: FreshChunk[]): FreshChunk[] {
  const ids = new Set(existing.map((c) => c.id));
  const dois = new Set(existing.map((c) => c.study?.doi?.toLowerCase()).filter(Boolean));
  const merged = [...existing];
  for (const a of additions) {
    if (ids.has(a.id)) continue;
    const doi = a.study?.doi?.toLowerCase();
    if (doi && dois.has(doi)) continue;
    merged.push(a);
    ids.add(a.id);
    if (doi) dois.add(doi);
  }
  return merged;
}

/** Markdown summary of a harvest run — the PR body / review sheet. */
export function renderReport(args: {
  discovered: number;
  additions: FreshChunk[];
  skipped: { candidate: StudyCandidate; reason: string }[];
  degraded: boolean;
  addedAt: string;
}): string {
  const { discovered, additions, skipped, degraded, addedAt } = args;
  const lines: string[] = [];
  lines.push(`# Pulse harvest — ${addedAt}`, "");
  lines.push(
    `Discovered **${discovered}** candidates → **${additions.length}** new fresh ${
      additions.length === 1 ? "chunk" : "chunks"
    } proposed` + (degraded ? " _(degraded: no drafting model — review candidates manually)_" : "") + ".",
    "",
  );

  if (additions.length > 0) {
    lines.push("## Proposed fresh chunks (review before merge)", "");
    for (const c of additions) {
      lines.push(`### ${c.id}`);
      lines.push(`- **${c.category}** · tier \`${c.tier}\` · ${c.study?.design ?? "study"}`);
      lines.push(`- **Claim:** ${c.claim}`);
      lines.push(`- **What it shows:** ${c.caveat}`);
      lines.push(`- **Source:** [${c.source.label}](${c.source.url})`);
      if (c.study?.doi) lines.push(`- **DOI:** ${c.study.doi}`);
      lines.push(
        "- **Reviewer TODO:** confirm claim against the abstract; add `study.n` / `study.population` if useful; adjust tier if warranted.",
        "",
      );
    }
  }

  if (skipped.length > 0) {
    lines.push("## Skipped", "");
    for (const s of skipped.slice(0, 40)) {
      lines.push(`- \`${s.reason}\` — ${s.candidate.title} (${s.candidate.url})`);
    }
    if (skipped.length > 40) lines.push(`- …and ${skipped.length - 40} more`);
    lines.push("");
  }

  lines.push(
    "> Every proposed chunk is a **draft**. Nothing reaches the feed until this",
    "> PR is reviewed and merged (PULSE.md §15.1).",
  );
  return lines.join("\n");
}
