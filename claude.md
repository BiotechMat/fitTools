# CLAUDE.md

## Project
Fitness calculator platform. Full requirements in SPEC.md — read it before any work.

**Current state & what's next: see `STATUS.md`** — the cross-cutting build tracker
and execution roadmap. Live at https://tools.fit; 516 unit tests + 15 e2e specs
green; typecheck clean. The short version: the platform is well ahead of the
roadmap, and the near-term priority is content volume, instrumentation and
distribution (fuel the banks → turn on measurement → close half-built loops →
Trajectory → accounts), NOT new features. The status paragraph below is the
historical build ledger; `STATUS.md` supersedes it for "what's done / what's next".

Status (2026-07-23): SPEC milestones M0–M4 built and signed off by Mat (M3
monetisation infra and M4 labs + embeds signed off 2026-07-22). Post-v1 work
done: METHODOLOGY.md Layer 1 tools (Phenotypic Age, Heart Age/PREVENT, CGM
metrics, lifestyle life-expectancy; Fitness Age blocked on paywalled source),
Layer 2 composite indices (all three), CONTENT.md recovery clusters (all eight:
cold-water, sauna, compression, massage guns, red-light, sleep environment,
breathwork, foam rolling), CONTENT-peptides.md, the CONTENT-reference.md
first batch (glossary, supplement database, exercise library, food reference,
reference tables, plus both-way calculator↔reference cross-links), the Pulse
feed + fresh-cards pipeline F0–F3 (PULSE.md), the daily games (DAILY-GAMES.md),
the arcade (LIFELINE.md /lifeline heartbeat flapper; POWERHOUSE.md /powerhouse
side-scrolling mitochondria shooter; MAXOUT.md /max-out one-rep-max timing
game; SNAKEOIL.md /snake-oil myth slicer; ARCADE-IDEAS.md is the candidate
bench; hub at /arcade — nav + homepage CTA point there), the glow-up section first step (CONTENT-looksmaxxing.md §8), the E1 share
loop (/share achievement card — tool-only for now; extending it to Pulse/Daily/
arcade is STATUS.md Phase 2),
the /blood-test page (placeholder panel, pending partner), the dashboard D0
local scaffold (DASHBOARD.md; D1–D4 gated behind accounts + the
data-protection posture), the DESIGN.md §8 motion & effects system, and the
"Our recommendation" affiliate-card system (2026-07-23: shared
src/components/RecommendationCard.tsx + surface-keyed src/registry/affiliates.ts
wired across supplement, recovery, glow-up and tool pages; cards render their
editorial picks now, and the buy button + disclosure appear per pick once its
affiliate URL is pasted into the registry — activation notes in the registry
header; no picks on marketing-claim pages by rule, enforced in
tests/unit/affiliates.test.ts), and the 2026-07-23 IA restructure (Mat's
direction): a "Calculators" nav menu nesting two accordion levels — menu →
categories → each category's calculators (registry-driven, same model on
desktop and in the mobile menu) with the /calculators index as its lead
link and per-category pages at /calculators/nutrition|workout|recovery;
topic sections Nutrition,
Workout (renamed from Strength, /strength redirects) and Recovery each open
with one card into their calculator category page, followed by their domain
content (food reference / exercise library / recovery guides); /labs
retired — the reconstitution calculator lives at
/learn/peptides/peptide-reconstitution with tier-4 rules (enhanced
disclaimer, no ads) intact and permanent redirects from the old URLs;
`toolPath()` in src/registry/tools.ts is the single source of truth for
tool hrefs.
Do not start a SPEC milestone until the previous one's acceptance criteria pass
and Mat has signed off.

## Project docs
- STATUS.md — the cross-cutting build tracker + execution roadmap. Read FIRST to
  see what's built, what's next, and what's blocked. Source of truth for build
  status and sequencing; supersedes the status ledger above and the per-doc
  build notes when they disagree.
- SPEC.md — the build. Authoritative for engineering. Implement from this.
- METHODOLOGY.md — scoring science for longevity tools. Implement from this
  WHEN building those tools (post-v1). Coefficients must be verified against
  primary sources with a reproduced test — see the doc.
- CONTENT.md — recovery/wellness content section spec. Build from this when
  building content pages.
  
  - CONTENT-reference.md — reference/lookup content spec (exercise library,
  supplement database, food reference, glossary, reference tables). Content-only,
  no accounts. Build from this when building those pages. Cross-linking into the
  calculators (its §8) is a build requirement, not optional.

- DESIGN.md — v2 visual identity (Gen-Z rebrand: Blaze orange / Forest green,
  Anton/Figtree/Space Mono). Authoritative for colours, type and component
  styling when building or restyling UI; also records the premium-lean
  monetisation posture (§5: ads optional, never structural) and the
  return-visit/retention component specs (§6, styled now, built with their
  ROADMAP phases). Direction approved as mockups only — not yet implemented;
  the live site still uses the teal tokens in globals.css.
- ROADMAP.md — post-v1 / engagement sequencing. Context, NOT a current build
  target. Do not implement ahead of SPEC milestones.
- PULSE.md — spec + build for "Pulse", an endless-scroll cited-fact-card feed
  (ROADMAP Phase E5 + E1/E3 threads). Retrieval-grounded: facts are generated
  at runtime from a vetted grounding corpus, and every card carries a REAL
  source (the model only cites a chunk id; the server attaches the citation —
  never model-invented). v1 built (see §14): src/lib/pulse/*, src/registry/
  pulse.ts, src/lib/pulse-store.ts, /api/pulse, /pulse. Degrades to serving
  vetted claims with no API key. Generation env: ANTHROPIC_API_KEY /
  PULSE_LLM_MODEL / PULSE_LLM_PROVIDER. Fresh-cards extension (recent-
  discovery chunks via a PR-gated ingest pipeline, interleaved with a "New"
  chip) — §15. BUILT 2026-07-23: F0 schema/ranking/"New" chip + 3 verified
  fresh seeds (§15.8), F1 harvest pipeline `pnpm harvest` (src/lib/pulse/
  harvest/*, fresh chunks in src/registry/pulse-fresh.json sidecar; env
  ANTHROPIC_API_KEY / PULSE_NEWS_MODEL=claude-haiku-4-5 / PULSE_NEWS_PROVIDER,
  §15.9), F2 weekly GitHub Action .github/workflows/pulse-harvest.yml opening a
  review PR (no-op until ANTHROPIC_API_KEY secret set; §15.10), F3 crawlable
  digest /pulse/this-week (§15.10). Full F0–F3 sequence done; on main.
- DAILY-GAMES.md — the daily ritual games at `/daily` ("Ballpark"
  guess-the-stat daily + "Myth or Fact?" weekly), the daily-return loop
  (ROADMAP E3/E5 threads). Hand-authored, sourced, deterministic per day —
  no LLM at runtime by design (the deliberate contrast with Pulse). v1 BUILT
  (2026-07-23, see §15): src/registry/daily.ts, src/lib/daily/*,
  src/lib/daily-store.ts, /daily, homepage banner + nav. "Ballpark" name
  LOCKED (Mat, 2026-07-23); "Myth or Fact?" name still proposed (§12.1).
  Bank growth to the ~90 Ballpark / ~40 Myth targets is the top remaining job
  (STATUS.md Phase 1).
- LIFELINE.md — spec + build for "Lifeline", the one-button heartbeat arcade
  game at `/lifeline` (Flappy-Bird lineage; score = the age you reach). v1–v4
  BUILT (2026-07-23): src/lib/lifeline.ts (+ tests), src/components/lifeline/*,
  /lifeline. Includes the daily-seeded run, ghost replay ("you vs you"), death-
  card PNG, challenge links and earned skins (§7). A funnel to the Heart Age
  calculator, explicitly a cartoon not a prediction (§3). Still open: streaks,
  /share holo-card hook, leaderboard. Name "Lifeline" proposed, not locked.
- POWERHOUSE.md — spec + build for "Powerhouse", the side-scrolling mitochondria
  shooter at `/powerhouse` (Gradius lineage; score = ATP made, difficulty = HR
  training zones). Sibling of Lifeline. v1 BUILT (2026-07-23): src/lib/
  powerhouse.ts (+ tests), src/components/powerhouse/*, /powerhouse. Lives in the
  /arcade hub (src/app/arcade/) beside Lifeline + the dailies. A funnel to the
  Heart Rate Zone calculator; cartoon, not cell biology (§3). Name "Powerhouse"
  proposed, not locked.
- ARCADE-IDEAS.md — the arcade candidate bench: the house formula distilled,
  eight game pitches, guardrail-rejected anti-ideas. Proposals, not build
  instructions; the two ⭐ picks are now built (MAXOUT.md, SNAKEOIL.md).
- MAXOUT.md — spec + build for "Max Out", the one-rep-max timing game at
  `/max-out` (stop-the-needle lineage; score = kg on the bar, flex = plates a
  side). The arcade's strength entry. v1 BUILT (2026-07-23): src/lib/maxout.ts
  (+ tests), src/components/maxout/*, /max-out; in the /arcade hub. A funnel to
  the One-Rep Max calculator + strength standards; cartoon, not a training
  plan (§3). Name "Max Out" proposed, not locked.
- SNAKEOIL.md — spec + build for "Snake Oil", the myth-slicing game at
  `/snake-oil` (Fruit Ninja lineage; slice the myths, spare the truths; every
  claim derives from the vetted daily-games registry and the death card cites
  the real source). v1 BUILT (2026-07-23): src/lib/snakeoil.ts (+ tests incl.
  roster validation), src/components/snakeoil/*, /snake-oil; in the /arcade
  hub. A funnel to Myth or Fact? and the debunk content; claims are about the
  world, never the player (§3). Name "Snake Oil" proposed, not locked.
- DASHBOARD.md — spec + build for the personal dashboard at `/dashboard`
  ("Your numbers"): the home base that aggregates vitals, saved calculations,
  composite/biological-age scores and blood-test biomarkers, with longitudinal
  Trajectory (ROADMAP E2, the keystone). An aggregator, NOT a new source of
  truth — no new formulas or metrics. D0 BUILT (2026-07-23, see §11):
  src/registry/metrics.ts (+ validateMetrics), src/lib/dashboard-store.ts (the
  SPEC §10 HistoryProvider seam, extends src/lib/history.ts), the noindexed
  /dashboard route, src/components/dashboard/DashboardView.tsx, nav link, and
  metrics + dashboard-store unit tests. Later phases (D1 Trajectory, D2
  accounts/sync, D3 biomarkers, D4 share cards) are gated: identified profiles
  and real blood values need ROADMAP E0 accounts + the BUSINESS_PLAN §13 /
  SPEC §17 data-protection posture (§8). Build sequence + gates in §11.
- BUSINESS_PLAN.md — strategy/context only. Never a build instruction.
- CONTENT-peptides.md — educational peptides reference section. Build from
  this when building those pages. No dosing/protocols by design.
- CONTENT-looksmaxxing.md — BLUEPRINT (not signed off) for an evidence-based
  Gen-Z "glow-up" content section (skin/sun, sleep, body-comp, hair, a
  debunk hub) plus retention psychology and a body-composition estimator.
  No appearance rating, ever (§1). The photo estimator (§6) is now
  architecturally unblocked (server-side/AI APIs and accounts in scope); its
  remaining gates are the data-protection posture and the body-image / minor-
  safety guardrails in §6.3 — sequence after accounts land.

## Commands
pnpm dev | build | test | lint | typecheck | test:e2e | lighthouse
(all exist. `build` uses --webpack for per-tool code-splitting; `lighthouse`
runs two passes — metric budgets then category scores. See README.)

## Engineering conventions
- TypeScript strict; no `any`; no `as` casts without a justifying comment.
- Formula modules: pure functions in src/lib/formulas/, SI units only, test-first —
  write test vectors from the cited source BEFORE the implementation.
- Never guess constants or coefficients. If a value isn't in SPEC.md, ask, or fetch
  the authoritative source and record its URL in the tool config's `sources`.
- No new dependencies without asking. Prefer platform/stdlib solutions.
- Zero-CLS rule: anything that loads late (ads, charts) reserves its dimensions.
- British English in UI copy and editorial content.

## Workflow
- Branch per milestone (m0-foundation, m1-tier1, ...). Conventional commits.
- Typecheck + tests must pass before every commit.
- Stop and ask when: a spec requirement is ambiguous, formula sources conflict,
  or a performance budget (SPEC §13) would be exceeded.
- Don't push, deploy, or open PRs without asking.

## Don'ts
- Respect SPEC §17's remaining out-of-scope items (CMS, i18n, native apps).
  Server-side calculation, calc/AI APIs, accounts and a pro tier are now in
  scope where a feature needs them — build them behind consent + a documented
  data-protection posture (SPEC §2, §17). Client-side stays the default for the
  static calculators.
- No third-party scripts outside the env-flagged loaders in SPEC §10.
- Never soften or remove disclaimers/compliance components to simplify a page.
