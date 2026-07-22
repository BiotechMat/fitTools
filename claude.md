# CLAUDE.md

## Project
Fitness calculator platform. Full requirements in SPEC.md — read it before any work.
Status (2026-07-22): SPEC milestones M0–M4 built and signed off by Mat (M3
monetisation infra and M4 labs + embeds signed off 2026-07-22). Post-v1 work
done: METHODOLOGY.md Layer 1 tools (Phenotypic Age, Heart Age/PREVENT, CGM
metrics, lifestyle life-expectancy; Fitness Age blocked on paywalled source),
Layer 2 composite indices (all three), CONTENT.md recovery clusters (all eight:
cold-water, sauna, compression, massage guns, red-light, sleep environment,
breathwork, foam rolling), CONTENT-peptides.md, and the CONTENT-reference.md
first batch (glossary, supplement database, exercise library, food reference,
reference tables, plus both-way calculator↔reference cross-links).
Do not start a SPEC milestone until the previous one's acceptance criteria pass
and Mat has signed off.

## Project docs
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
  PULSE_LLM_MODEL / PULSE_LLM_PROVIDER.
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
