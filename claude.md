# CLAUDE.md

## Project
Fitness calculator platform. Full requirements in SPEC.md — read it before any work.
Current milestone: M0. Do not start a milestone until the previous one's acceptance
criteria pass and Mat has signed off.

## Project docs
- SPEC.md — the build. Authoritative for engineering. Implement from this.
- METHODOLOGY.md — scoring science for longevity tools. Implement from this
  WHEN building those tools (post-v1). Coefficients must be verified against
  primary sources with a reproduced test — see the doc.
- CONTENT.md — recovery/wellness content section spec. Build from this when
  building content pages.
- ROADMAP.md — post-v1 / engagement sequencing. Context, NOT a current build
  target. Do not implement ahead of SPEC milestones.
- BUSINESS_PLAN.md — strategy/context only. Never a build instruction.

## Commands
pnpm dev | build | test | lint | typecheck | test:e2e | lighthouse
(create these scripts in M0 and keep this list current as they change)

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
- Nothing in SPEC §17 (out of scope). No server-side calculation or calc APIs.
- No third-party scripts outside the env-flagged loaders in SPEC §10.
- Never soften or remove disclaimers/compliance components to simplify a page.
