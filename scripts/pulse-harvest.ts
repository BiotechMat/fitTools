/**
 * Pulse harvest CLI (PULSE.md §15.7 F1) — "harvest as a session".
 *
 * Reads the fresh-chunk sidecar, runs the discovery→triage→draft pipeline,
 * merges any new drafts back into the sidecar, and writes a review report.
 * Nothing is published: the changed `pulse-fresh.json` + `harvest-report.md`
 * are a PR for a human to review and merge (§15.1). With no ANTHROPIC_API_KEY
 * the run degrades — it still discovers and reports candidates, but drafts none.
 *
 * Runnable with plain Node (native TS type-stripping): `pnpm harvest`.
 * Env: ANTHROPIC_API_KEY / PULSE_LLM_API_KEY enables drafting;
 *      PULSE_NEWS_MODEL overrides the model (default claude-haiku-4-5);
 *      PULSE_NEWS_PROVIDER=none forces degraded mode.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runHarvest } from "../src/lib/pulse/harvest/index.ts";
import { mergeFresh } from "../src/lib/pulse/harvest/emit.ts";
import type { FreshChunk } from "../src/lib/pulse/harvest/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const SIDECAR = resolve(here, "../src/registry/pulse-fresh.json");
const REPORT = resolve(here, "../harvest-report.md");

function loadSidecar(): FreshChunk[] {
  const raw = readFileSync(SIDECAR, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`${SIDECAR} is not a JSON array`);
  // Trusted: the committed sidecar is validated by validateCorpus (build + test).
  return parsed as FreshChunk[];
}

async function main(): Promise<void> {
  const existing = loadSidecar();
  console.log(`[pulse-harvest] loaded ${existing.length} existing fresh chunks`);

  const result = await runHarvest({ existing });
  console.log(
    `[pulse-harvest] discovered ${result.discovered}, ` +
      `${result.additions.length} new draft(s)${result.degraded ? " (degraded — no drafting model)" : ""}`,
  );

  writeFileSync(REPORT, result.report + "\n", "utf8");
  console.log(`[pulse-harvest] wrote report → ${REPORT}`);

  if (result.additions.length === 0) {
    console.log("[pulse-harvest] no new chunks to append.");
    return;
  }

  const merged = mergeFresh(existing, result.additions);
  writeFileSync(SIDECAR, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(
    `[pulse-harvest] appended ${merged.length - existing.length} chunk(s) → ${SIDECAR}\n` +
      "[pulse-harvest] review the diff + report, then open a PR (nothing is published until merged).",
  );
}

main().catch((err: unknown) => {
  console.error("[pulse-harvest] failed:", err);
  process.exitCode = 1;
});
