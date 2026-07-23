# FitTools — evidence-based fitness calculators

Statically generated fitness/health calculator site. Each tool is an
SEO-optimised landing page: interactive calculator above the fold, editorial
depth below. Full product requirements live in [SPEC.md](SPEC.md); working
conventions in [CLAUDE.md](CLAUDE.md); **current build state and what's next in
[STATUS.md](STATUS.md)** — read that first for where the project actually is
(live at https://tools.fit; SPEC M0–M4 + most post-v1 work shipped; the near-term
priority is content volume, instrumentation and distribution, not new features).

**Hosting decision (M0, per SPEC §3): Vercel.** Chosen for first-party
Next.js support, request-geo headers (used later for imperial/metric
defaults), and preview deployments per branch.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:3000 |
| `pnpm build` | Production build (static generation) |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | TypeScript, strict mode |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests (formulas, units, registry, schema) |
| `pnpm test:e2e` | Playwright smoke + axe tests (run `pnpm build` first) |
| `pnpm lighthouse` | Lighthouse CI against SPEC §13 budgets (run `pnpm build` first) |
| `pnpm harvest` | Pulse fresh-cards harvest — PubMed discovery → draft → `pulse-fresh.json` sidecar + report (PULSE.md §15.9). No-op drafting without an API key. |

## Environment flags

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://tools.fit` on Vercel production; `http://localhost:3000` otherwise | Canonical origin used in metadata, JSON-LD, and the sitemap. **The production domain is now the built-in default** (`src/lib/site.ts`), so the live site is indexable automatically — no manual env var needed. Set this only to move to a different domain. **Indexability is gated on `VERCEL_ENV === "production"`** (or this var being explicitly set): local dev, CI and Vercel Preview all still emit `noindex`, so previews never enter the search index. |
| `NEXT_PUBLIC_ADS_ENABLED` | unset (off) | When `"true"` AND consent is granted, `AdSlot` reserves its fixed dimensions and lazy-mounts ads. Until M3 wires up the CMP, consent is hard-coded to denied, so no ad can render regardless of this flag. |
| `NEXT_PUBLIC_EMAIL_ENDPOINT` | unset (off) | Provider-agnostic newsletter endpoint. `EmailCapture` renders nothing until this is set; the provider must implement double opt-in. |

With all flags off the site makes **zero third-party requests** — this is
asserted again in M3 acceptance.

## Activation guide (M3 infrastructure — all off by default)

| Variable | Effect when set |
| --- | --- |
| `NEXT_PUBLIC_GA4_ID` | Loads GA4 **only after consent is granted** (basic Consent Mode v2, default denied). Enables the consent banner. |
| `NEXT_PUBLIC_CMP_SCRIPT_URL` | Loads a Google-certified CMP script (loads unconditionally — it is the consent tool). Required before ad activation per SPEC §10. |
| `NEXT_PUBLIC_ADS_SCRIPT_URL` | Loads the ad network script (Journey/Grow) **only after consent**. |
| `NEXT_PUBLIC_ADS_ENABLED` | `"true"` lets `AdSlot` render (still consent-gated, fixed 300×250 reservation, lazy mount). |

Activation order: (1) sign up with a Google-certified CMP and set its
script URL; (2) set the GA4 ID; (3) verify consent-gating on a preview
(`FLAGS_ON=1 pnpm test:e2e` runs the gated suite); (4) set the ad script
URL + `NEXT_PUBLIC_ADS_ENABLED=true`; (5) re-run Lighthouse — CLS must
stay < 0.05. With every flag unset the site makes zero third-party
requests (asserted by e2e).

Affiliate offers: add entries to `src/registry/affiliates.ts` (slug →
offers). Every rendered offer carries the disclosure line and
`rel="sponsored nofollow"` automatically; clicks emit `affiliate_click`.

Beyond these ad/consent flags, the full go-live activation checklist (Pulse's
`ANTHROPIC_API_KEY` — cost-bounded site-wide, one daily phrasing pass on the
Haiku default (PULSE.md §14.1) — the harvest Action secret, Search
Console, a double-opt-in email provider for `EmailCapture`, and pasting real
affiliate URLs) is **`STATUS.md §3` Phase 1** — the near-term, highest-ROI work,
mostly config rather than code.

## Adding a tool (content workflow)

A tool is three files plus one import (SPEC §5):

1. `src/registry/configs/<slug>.ts` — `ToolConfig` (Zod input schema,
   defaults, FAQ, sources, monetisation flags, `lastReviewed`).
2. `src/lib/formulas/<domain>.ts` — pure SI functions. **Test-first**: add
   ≥3 vectors in `tests/unit/` from the cited source before implementing.
3. `src/content/tools/<slug>.mdx` — Methodology, interpretation,
   limitations (British English).

Then import the config in `src/registry/tools.ts` and register the
calculator component in `src/components/calculators/index.ts`. Routing,
sitemap, hub listings, related links and JSON-LD all derive from the
registry.

If the calculator needs the tool's input ranges or defaults client-side,
put them in `src/registry/configs/<slug>.shared.ts` (dependency-free) and
build the Zod schema from those constants — importing Zod into client code
adds ~68 kB gzipped and blows the SPEC §13 JS budget.

### JS budget history

SPEC §13's JS cap was revised 120 → 160 kB gzipped (agreed with Mat,
2026-07-21): the Next 16 + React 19 framework baseline alone transfers
~146 kB on every page. Revised again 160 → 170 kB (2026-07-22) after M3
consent + M4 labs/embed infrastructure grew the shared bundle to ~165 kB.
Keep app-side additions lean; the CI assertion fails the build past 170 kB.

### Why production builds use webpack

`pnpm build` runs `next build --webpack` deliberately. Turbopack's
production chunking merges the whole client graph into shared chunks, so
every calculator ships on every page (~167 kB and growing with each tool).
Webpack respects the per-tool `next/dynamic` code splitting in
`src/components/calculators/index.ts`, keeping each page at ~145 kB
regardless of catalogue size. Dev still uses Turbopack for fast HMR.
Revisit when Turbopack gains chunking controls.

## Notes

- Canonical units are SI everywhere in `src/lib`; conversion happens only in
  input components (`src/components/UnitInput.tsx`).
- Unit preference persists in `localStorage`; US locales default to
  imperial. Once deployed on Vercel, a request-geo default can be layered in
  (SPEC §6) without making tool pages dynamic.
- CI (`.github/workflows/ci.yml`) runs typecheck → lint → unit tests →
  build → Playwright (desktop + mobile) → Lighthouse budgets, and fails on
  any budget regression (SPEC §13).
