# SPEC.md — Fitness Tools Platform (working name: "FitTools")

> **Build status: M0–M4 all complete and signed off (2026-07-23).** This spec
> remains authoritative for *how* the platform is built; for *what is built now
> and what's next*, see `STATUS.md`. Server-side calculation, AI APIs, accounts
> and a pro tier are in scope where a feature needs them (see §2, §10, §17) — the
> milestone sequence below is history, not a gate on the post-v1 work.

## 0. How to use this spec
Work through milestones M0→M4 in order. Do not start a milestone until the previous
one's acceptance criteria pass. Formula modules are test-first: write the test vectors,
then the implementation. When this spec says "source", the citation must appear in the
page's Methodology section, not just in code comments.

## 1. Product overview
A statically generated fitness/health calculator website. Each tool is its own
SEO-optimised landing page (interactive calculator above the fold, editorial depth
below). Revenue: display ads (Journey by Mediavine → Raptive/Mediavine), contextual
affiliate placements, email capture, later a "pro" tier. Operator is UK-based; primary
commercial audience is US + UK.

Goals, in priority order:
1. Correctness — this is YMYL health content; every formula verified against published sources.
2. Core Web Vitals — the site must stay fast after ads are added.
3. Shipping velocity — a new calculator should be a config + formula + content file, not new engineering.
4. Monetisation readiness — consent, ad slots, and affiliate infra built in from the start (ads activate later).

## 2. Non-negotiable constraints
- No medical advice. Every tool page renders the medical disclaimer component. Results
  copy uses "estimate", never prescriptive language.
- Tier 4 tools ship with `monetization.ads: false`, a stronger disclaimer, and no
  compound-specific dosing recommendations — the user supplies their own prescribed
  values; the tool does arithmetic only. (Originally the `/labs/` route group; at Mat's
  direction 2026-07-23 the /labs URL is retired and tier 4 renders inside the peptides
  section at /learn/peptides/, with permanent redirects and the same rules intact.)
- Calculation logic is client-side pure TypeScript **by default** — it keeps the static
  tools private, zero-cost to host, SEO-friendly and inside the performance budgets, so
  new calculators start here. Server-side calculation and external/AI APIs are **permitted
  where a feature genuinely needs them** (e.g. a vision-based estimator), behind explicit
  per-use consent, a documented data-protection posture, and their own threat model; they
  must not regress the static tools or their budgets.
- Consent Mode v2 defaults to denied for UK/EEA. No ad or analytics tags fire before consent.
- Canonical internal units are SI (kg, cm, ml, seconds). Conversion happens only at the
  display/input layer.

## 3. Tech stack (pinned)
- Next.js (latest stable, App Router), static generation via `generateStaticParams`
  from the tool registry. TypeScript `strict: true`, no `any`.
- Tailwind CSS. Zod for input schemas. MDX for editorial content.
- Vitest (formula + unit tests), Playwright (per-tool smoke tests), axe-core (a11y).
- Hosting: Vercel (or Cloudflare Pages — pick one at M0 and record in README).
- OG images generated per tool at build time (@vercel/og or satori).
- No CMS in v1. Content lives in the repo.

## 4. Repository structure
```
/src
  /app
    /(hubs)/nutrition|workout|recovery/page.tsx    # topic sections: calculators + domain content
    /calculators/page.tsx                          # all-calculators index (nav submenu target)
    /(tools)/[slug]/page.tsx                       # tool template, statically generated
    /learn/peptides/peptide-reconstitution/        # Tier 4, ads disabled (was /labs/[slug])
    /about, /author/mathew-beale, /legal/*         # static pages
    sitemap.ts, robots.ts
  /components        # CalculatorShell, UnitInput, ResultsPanel, Methodology,
                     # FAQ, AuthorBox, RelatedTools, AdSlot, AffiliateBlock,
                     # DisclaimerBanner, EmailCapture, EmbedFrame
  /lib
    /formulas/*.ts   # pure functions, one file per domain, fully tested
    /units.ts        # conversions (exact: 1 lb = 0.45359237 kg; 1 in = 2.54 cm)
    /schema-org.ts   # JSON-LD generators
    /analytics.ts    # typed event helpers
  /registry
    tools.ts         # imports every tool config; single source of truth
    /configs/*.ts    # one config per tool
    affiliates.ts    # tool-slug → affiliate offers mapping
  /content/tools/*.mdx   # below-the-fold editorial per tool
  /data/*.json       # MET table, strength standards, plate inventories
/tests
```

## 5. Tool registry pattern
Each tool = three files:
1. `registry/configs/<slug>.ts` — exports a `ToolConfig`:
   `{ slug, title, metaDescription, hub, tier, inputsSchema (Zod), defaults,
     faq: {q, a}[], related: slug[], monetization: { ads: boolean, affiliates: boolean },
     lastReviewed: ISO date, sources: {label, url}[] }`
2. `lib/formulas/<domain>.ts` — pure function(s) with unit tests.
3. `content/tools/<slug>.mdx` — Methodology, interpretation, limitations.

The registry drives routing, sitemap, hub listings, related-tool links, and JSON-LD.
Adding a tool must require zero changes outside these three files plus one registry import.

## 6. Units system
- `UnitInput` component: metric/imperial toggle, persisted in localStorage, geo-defaulted
  (imperial for US via request geo header at first paint, metric otherwise).
- All formula functions accept SI only. Converters are exact and tested.
- Height in imperial uses ft+in split inputs; weight supports st+lb for UK users.

## 7. Formula library (authoritative specification)
Every formula: implement exactly as below, cite the stated source on-page, and include
≥3 test vectors per formula (at least one from the source publication or a verifiable
published example). Round only at display time.

**BMR / TDEE**
- Mifflin–St Jeor (default): men `10W + 6.25H − 5A + 5`; women `10W + 6.25H − 5A − 161`
  (W kg, H cm, A yr). Source: Mifflin et al., Am J Clin Nutr 1990.
- Katch–McArdle (when body-fat known): `370 + 21.6 × FFM(kg)`.
- Revised Harris–Benedict (optional toggle): men `88.362 + 13.397W + 4.799H − 5.677A`;
  women `447.593 + 9.247W + 3.098H − 4.330A`. Source: Roza & Shizgal 1984.
- TDEE = BMR × activity factor {1.2, 1.375, 1.55, 1.725, 1.9}. Label factors plainly.

**Macros**: protein slider 1.6–2.2 g/kg (default 1.8; source: Morton et al., Br J Sports
Med 2018); fat 20–35% of kcal (default 25%); carbs = remainder. Output g and kcal.

**Calorie deficit / timeline**: uses 7700 kcal ≈ 1 kg heuristic; cap recommended deficit
at 25% of TDEE; limitations copy must name adaptive thermogenesis and the heuristic's
weakness over long durations (Wishnofsky origin).

**BMI**: kg/m², WHO categories, prominent athlete-limitation note.

**Body fat % (US Navy, cm, log10)**:
men `495 / (1.0324 − 0.19077·log10(waist−neck) + 0.15456·log10(height)) − 450`;
women `495 / (1.29579 − 0.35004·log10(waist+hip−neck) + 0.22100·log10(height)) − 450`.
Validate log arguments > 0; show ±3–4 pp error band. Source: Hodgdon & Beckett 1984.

**Lean body mass (Boer)**: men `0.407W + 0.267H − 19.2`; women `0.252W + 0.473H − 48.3`.
**FFMI**: `FFM / h(m)²`; adjusted `FFMI + 6.1 × (1.8 − h)`. Source: Kouri et al. 1995.

**Ideal weight**: report the range across Devine, Robinson, Miller, Hamwi formulas
(all defined per inch over 5 ft), explicitly framed as historical estimating formulas.

**1RM**: Epley `w(1 + r/30)` (default), Brzycki `w·36/(37 − r)`, Lombardi `w·r^0.10`,
O'Conner `w(1 + 0.025r)`. Valid for r ≤ 10; warn above. Show %1RM table 50–95%.

**Plate loading**: greedy per-side algorithm; bar default 20 kg (configurable 15/20/10);
plate inventory from `/data`, user-editable; output per-side stack + achievable nearest
weight when exact load impossible.

**Warm-up generator**: configurable ramp, default `bar×10, 40%×5, 60%×3, 80%×1` of
first work set, rounded to plate-loadable weights (reuse plate module).

**Double progression planner**: inputs = rep range (e.g. 6–8), sets, current load,
increment; rule: all sets at top of range → next session load + increment, reps reset
to bottom of range; else repeat load, add reps. Output next-session prescription.

**Volume calculator**: per-exercise sets×reps×load tonnage + weekly hard-set counts
per muscle group.

**Strength standards & DOTS/Wilks/IPF GL**: score form
`total × 500 / (a + b·bw + c·bw² + d·bw³ + e·bw⁴)`. Do NOT guess coefficients:
pull official published coefficients (IPF / DOTS as implemented in the open-source
OpenPowerlifting codebase) into `/data` with source URLs, and add regression tests
against OpenPowerlifting's own computed scores for ≥5 known lifter entries.
Strength standards bands (untrained→elite by lift/sex/bodyweight) live in
`/data/strength-standards.json` with an on-page editorial note describing derivation
and source.

**Heart-rate zones**: HRmax via Tanaka `208 − 0.7·age` (note 220−age as legacy);
Karvonen with resting HR: `THR = (HRmax − RHR)·intensity + RHR`; output 5-zone table.

**Running pace / race predictor**: pace/split arithmetic; Riegel prediction
`T₂ = T₁ × (D₂/D₁)^1.06` with stated assumptions.

**Calories burned**: MET method `kcal/min = MET × 3.5 × kg / 200`; MET values from the
2011 Compendium of Physical Activities subset stored in `/data/mets.json` with codes.

**Steps → calories**: distance via stride ≈ 0.415×height (men) / 0.413×height (women),
then MET walking estimate; label clearly as rough estimate.

**Water intake**: anchor on EFSA adequate intakes (2.0 L/day women, 2.5 L/day men total
water) with activity/climate adjustments; label as guideline, not prescription.

**Sleep calculator**: wake time − n×90 min cycles − 15 min latency; present 4–6 cycle
options; note cycle-length variability.

**Caffeine half-life**: `C(t) = dose × 0.5^(t/t½)`, default t½ = 5 h, user range
1.5–9.5 h; chart remaining mg vs. time; show when level falls below a user-set
sleep threshold.

**Creatine**: loading 0.3 g/kg/day for 5–7 days; maintenance 3–5 g/day. Source: ISSN
position stand (Kreider et al. 2017).

**Peptide reconstitution (Tier 4, /learn/peptides/ — /labs/ until 2026-07-23)**:
concentration = vial mg ÷ diluent ml;
draw volume = desired dose ÷ concentration; U-100 syringe units = ml × 100. Inputs are
user-supplied only; no compound presets, no dosing suggestions; `ads: false`; enhanced
disclaimer always visible. (Original requirement included an acknowledgement gate
before first use; removed at Mat's direction 2026-07-21 — the enhanced disclaimer
remains mandatory.)

## 8. Page template (tool pages)
Order: H1 + one-sentence value line → calculator (interactive, zero-CLS, usable without
scrolling on 390 px viewport) → results panel with plain-English interpretation →
[AdSlot if enabled] → MDX: Methodology (with formula rendered and sources) →
Limitations → FAQ (from config) → AffiliateBlock (if enabled) → AuthorBox with
credentials + lastReviewed date → RelatedTools → DisclaimerBanner. Hubs list child
tools with descriptions and interlink laterally.

## 9. SEO implementation
- Metadata API per tool from config; canonical URLs; breadcrumbs.
- JSON-LD per tool: `WebApplication` (+ `offers: free`), `FAQPage` from config FAQ,
  `BreadcrumbList`; `Article`+`Person` on editorial pages. Validate in CI against
  Google's structured-data requirements (schema unit tests on generator output).
- `sitemap.ts` and OG images generated from the registry.
- No thin programmatic variants: demographic variants handled inside one page.
- Embeddable widget (M4): `/embed/[slug]` minimal iframe build with attribution link;
  "Embed this calculator" copy-code block on tool pages.

## 10. Monetisation infrastructure
- `AdSlot`: reserved fixed dimensions (zero CLS), lazy-mounts on visibility, renders
  nothing until consent granted AND `NEXT_PUBLIC_ADS_ENABLED=true`. Placement config
  per tool. No ads above the calculator.
- Consent: Google-certified CMP + Consent Mode v2, default denied (UK/EEA), settings
  re-openable from footer. Third-party scripts (CMP, Grow/Journey script, ad tag)
  loaded via `next/script` behind env flags so the site runs clean until activation.
- `AffiliateBlock`: reads `registry/affiliates.ts`; every render includes the
  disclosure line; links `rel="sponsored nofollow"`; click events tracked.
- `EmailCapture`: provider-agnostic POST (env-configured endpoint), double-opt-in
  compatible, one placement per page max.
- Accounts & pro tier: PLANNED (ROADMAP E0/E6) — sign-in is on the near-term
  roadmap. Results history is saved to localStorage behind a `HistoryProvider`
  designed to swap to authed storage when accounts land; build all new
  persistence through it so that migration stays a central change. The
  aggregating surface for that persistence — profile/vitals, saved scores and
  blood-test biomarkers, with longitudinal Trajectory — is the personal
  dashboard (DASHBOARD.md; blueprint, local-first scaffold buildable now,
  identified-profile and blood-data storage gated behind E0 + the §17
  data-protection posture).

## 11. Compliance & legal
Pages: Privacy Policy, Cookie Policy, Terms, Affiliate Disclosure, Medical Disclaimer,
About/Author. Footer links on every page. Medical disclaimer component on every tool.
UK GDPR/PECR: no non-essential cookies pre-consent. Author page states real
credentials accurately (MSc Biotechnology, University of Reading) — no inflated claims.

## 12. Analytics
GA4 behind Consent Mode v2. Typed events: `calc_completed {tool}`, `unit_toggled`,
`affiliate_click {slug, offer}`, `email_signup`, `embed_copied`. Search Console
verification file included.

## 13. Performance budgets (tool page template, mobile, throttled)
LCP < 2.0 s, CLS < 0.05, INP < 200 ms, initial JS < 170 kB gzipped. Lighthouse
performance ≥ 95 pre-ads. CI fails the build on budget regression (Lighthouse CI).
(JS budget revised 120 → 160 kB, agreed with Mat 2026-07-21: the Next 16 +
React 19 framework baseline alone transfers ~146 kB; app code adds ~10 kB.
Revised 160 → 170 kB, agreed with Mat 2026-07-22: M3 consent + M4 labs/embed
infrastructure grew the shared bundle to ~165 kB; headroom kept for growth.)

## 14. Testing & QA
- Vitest: every formula ≥3 vectors incl. published examples; unit converters exact;
  Zod schemas reject out-of-range input (age 13–100, weight 30–300 kg etc.).
- Playwright smoke per tool: load, enter defaults, assert plausible result, no console
  errors, disclaimer visible.
- axe-core: zero critical violations; full keyboard operability; labelled inputs;
  results announced via aria-live.
- Schema generator unit tests. CI: typecheck, lint, tests, Lighthouse CI, build.

## 15. Editorial requirements (per tool MDX)
300–700 words below the fold: what the number means, how the formula works (rendered
equation), accuracy/limitations, 4–8 FAQ entries written for featured snippets, ≥2
primary-literature citations. British English spelling site-wide; imperial-first
number formatting only inside US-defaulted unit displays.

## 16. Milestones & acceptance criteria
**M0 — Foundation.** Scaffold, CI, design system, units module, registry, tool template,
ONE reference tool (TDEE) end-to-end.
✓ Deployed preview; TDEE matches published Mifflin–St Jeor examples; budgets pass;
JSON-LD passes rich-results validation; axe clean.

**M1 — Tier 1 live.** 10 Tier 1 tools, 3 hubs, legal pages, author page, sitemap,
OG images, disclaimers.
(Tier 1 list agreed with Mat 2026-07-21: TDEE, macros, calorie deficit/timeline,
BMI, body fat % (US Navy), ideal weight, 1RM, plate loading, heart-rate zones,
sleep calculator.)
✓ All M0 criteria on every page; internal links resolve; sitemap valid.

**M2 — Full catalogue.** Tiers 2–3 (~27 tools total incl. DOTS with regression tests),
MDX editorial for all, RelatedTools graph, EmailCapture.
(M2 list agreed with Mat 2026-07-21 — 15 new tools, 25 total: BMR, lean body
mass, FFMI, water intake, calories burned, steps-to-calories, creatine
[nutrition]; warm-up generator, double progression, volume, strength
standards, powerlifting score DOTS/Wilks/IPF GL [strength]; running pace,
race predictor, caffeine half-life [recovery].)
✓ Formula test count ≥ 3×tools; strength-standards data sourced; zero orphan pages.

**M3 — Monetisation readiness.** CMP + Consent Mode v2, AdSlot, affiliate registry
with first offers, analytics events, env-flag activation docs in README.
✓ With flags off: no third-party requests, budgets pass. With flags on in preview:
consent-gating verified, CLS still < 0.05.

**M4 — Labs + distribution.** `/labs/` route group with peptide + reconstitution
acknowledgement flow, embed builds + copy-embed UI.
✓ Labs pages serve no ads; embed renders < 50 kB and links back.
(2026-07-23, at Mat's direction: /labs retired post-acceptance — the reconstitution
calculator moved into the peptides section with its tier-4 rules intact; old URLs
redirect permanently.)

## 17. Out of scope (v1)
CMS, blog beyond tool editorial, i18n, native apps.

Previously out of scope, now **planned** (do not treat as blockers): accounts/auth,
payments, and the pro tier — see ROADMAP E0/E6 and §10. Server-side and AI-API
features are likewise permitted under §2's conditions. Crossing from stateless tools
to stored personal/health data still requires the data-protection posture in
BUSINESS_PLAN §13 to be built as a deliberate step, not skipped.

## 18. Definition of done (release gate)
All CI green; Lighthouse ≥ 95 perf / 100 SEO / 100 a11y / 100 best-practices on the
tool template; every tool has sources + lastReviewed + disclaimer + FAQ schema; no
console errors site-wide; README documents env flags, ad activation, and content
update workflow.
