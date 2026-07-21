# FitTools — evidence-based fitness calculators

Statically generated fitness/health calculator site. Each tool is an
SEO-optimised landing page: interactive calculator above the fold, editorial
depth below. Full product requirements live in [SPEC.md](SPEC.md); working
conventions in [CLAUDE.md](CLAUDE.md).

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

## Environment flags

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical origin used in metadata, JSON-LD, and the sitemap. Set to the production domain on Vercel. |
| `NEXT_PUBLIC_ADS_ENABLED` | unset (off) | When `"true"` AND consent is granted, `AdSlot` reserves its fixed dimensions and lazy-mounts ads. Until M3 wires up the CMP, consent is hard-coded to denied, so no ad can render regardless of this flag. |

With all flags off the site makes **zero third-party requests** — this is
asserted again in M3 acceptance.

## Ad activation (M3 — do not enable before)

1. Install the Google-certified CMP + Consent Mode v2 defaults (denied for
   UK/EEA) behind `next/script` env flags — see SPEC §10.
2. Replace `src/lib/consent.ts` with the real CMP consent signal.
3. Set `NEXT_PUBLIC_ADS_ENABLED=true` in the Vercel environment.
4. Verify in a preview deployment: no tags before consent, CLS < 0.05.

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
~146 kB on every page — measured identically on the content-free homepage —
and this site's calculator code adds ~10 kB. Keep app-side additions lean;
the CI assertion fails the build past 160 kB.

## Notes

- Canonical units are SI everywhere in `src/lib`; conversion happens only in
  input components (`src/components/UnitInput.tsx`).
- Unit preference persists in `localStorage`; US locales default to
  imperial. Once deployed on Vercel, a request-geo default can be layered in
  (SPEC §6) without making tool pages dynamic.
- CI (`.github/workflows/ci.yml`) runs typecheck → lint → unit tests →
  build → Playwright (desktop + mobile) → Lighthouse budgets, and fails on
  any budget regression (SPEC §13).
