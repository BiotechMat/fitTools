# STATUS.md — Where the project is, and what's next

**The single, cross-cutting source of truth for current state and execution
order.** SPEC.md, ROADMAP.md, METHODOLOGY.md and the CONTENT/feature docs
remain authoritative for *how* each thing is built; this file records *what is
built, what is next, and what is blocked*, across all of them. When this file
and a feature doc disagree on build status, this file is newer — update the
feature doc to match.

**Snapshot date: 2026-07-23.** Live at **https://tools.fit** (auto-indexable on
the Vercel production deployment). Full suite green: **516 unit tests across 53
files + 15 Playwright e2e specs**; `pnpm typecheck` clean; Lighthouse budgets
enforced in CI.

---

## 1. Where we are

SPEC milestones **M0–M4 are complete and signed off**, and most of the *post-v1*
layer is built too. The engineering is well ahead of the roadmap; the gaps are
in **content volume, instrumentation, and distribution**, not in the platform.

**Built and live:**

| Area | State |
|---|---|
| Calculators (SPEC M0–M4) | **40 tools** in the `/calculators` index + Nutrition / Workout / Recovery topic sections (2026-07-23 IA restructure: "Calculators" nav submenu; `/labs` retired — the reconstitution calculator sits in `/learn/peptides` with tier-4 rules intact); registry-driven routing, sitemap, JSON-LD, OG images, embeds |
| Longevity tools (METHODOLOGY L1) | Phenotypic Age, Heart Age (PREVENT), CGM metrics, lifestyle life-expectancy — **built**. Fitness Age **blocked** (paywalled Nes 2011 source) |
| Composite indices (METHODOLOGY L2) | All three — Metabolic Fitness, Pace of Aging, Recovery Readiness — **built** |
| Recovery/wellness content (CONTENT.md) | Both launch clusters **+ all six future clusters** built (cold-water, sauna, compression, red-light, foam-rolling, breathwork, sleep-environment, massage-guns) |
| Reference layer (CONTENT-reference.md) | Exercises (42), supplements (35), food reference (4), glossary (55), reference tables (3), both-way calculator↔reference cross-links |
| Peptides (CONTENT-peptides.md) | Pillar + 16 compound pages, no-dosing discipline |
| Glow-up (CONTENT-looksmaxxing.md) | §8 Step 1 — skin & sun cluster + debunk hub (pending Mat sign-off) |
| Pulse (PULSE.md) | v1 feed + full fresh-cards pipeline **F0–F3** (harvest CLI, weekly Action, `/pulse/this-week` digest) |
| Daily games (DAILY-GAMES.md) | Ballpark + Myth or Fact?, streaks, share, analytics |
| Arcade (LIFELINE.md, POWERHOUSE.md) | **Lifeline** heartbeat flapper (v1–v4: daily-seeded run, ghost replay, death-card PNG, challenge links, skins) + **Powerhouse** mitochondria shooter, grouped in the `/arcade` hub; both funnel to Heart Age / HR-zone tools |
| Dashboard (DASHBOARD.md) | **D0** local scaffold — metric registry, store, `/dashboard` route |
| Share loop (ROADMAP E1) | **Partially built** — tool pipeline (`/api/share-card` + `/share` + share buttons) **plus** (2026-07-23) the arcade/daily hook: game share links carry the score as bounded params and unfurl as `/api/arcade-card` score cards; every section/content/tool page now has its own OG image. All cards render in the Lifeline death-card house style (paper sheet, ink frame, pixel emblems, Anton score — `src/lib/og-image.tsx` + `src/lib/pixel-art.ts`, vendored OFL fonts in `src/lib/og-fonts/`). Still open: Pulse cards, 1080×1920 story format |
| Design (DESIGN.md) | v2 rebrand implemented + §8 motion system |
| Monetisation infra (SPEC §10) | CMP, AdSlot, affiliate registry, analytics, email — all **built behind flags, all OFF** |

---

## 2. The central finding — the machine is built; the tank is near-empty

Three imbalances, not code defects, are what actually gate growth:

1. **Content banks sit far below their own targets.** The engagement surfaces
   are excellent engineering wrapped around very little fuel:

   | Bank | Now | Doc target | Gap |
   |---|---|---|---|
   | Pulse corpus | **64** (61 evergreen + 3 fresh) | 60–100 (PULSE §3.3) | ✅ in band (2026-07-23 harvest) |
   | Ballpark items | **10** | ~90 (DAILY-GAMES §4) | ~10 days of dailies |
   | Myth or Fact? items | **9** | ~40 (DAILY-GAMES §4) | ~2 weeks |

   An "endless" scroll that exhausts in under a minute, and a daily game with a
   week of runway, undersell finished features.

2. **The site is indexable but blind.** GA4, the CMP, Search Console and the
   email endpoint are all unactivated, so the SEO ramp — BUSINESS_PLAN's primary
   risk — has begun with **zero instrumentation**. None of ROADMAP §5's success
   metrics can be measured yet.

3. **Everything ambitious funnels through one unbuilt milestone: ROADMAP E0
   accounts + the data-protection posture.** Dashboard D1–D4, PROFILE.md, the
   bloodwork extractor, the body-composition estimator, and premium all queue
   behind it — and premium *additionally* waits on the MONETISATION.md model
   decision, which is explicitly unmade (§4 here).

**The directive that follows:** stop building new machines. Feed, instrument,
and connect the ones already built; get Trajectory live; then make the
accounts/monetisation crossing deliberately.

---

## 3. Execution roadmap (2026-07)

Ordered by return on effort. Phases 1–3 need little or no new engineering and
depend on no unmade decision — start there. Phases 4–5 are the deliberate
crossings and carry Mat-only decisions (§4).

### Phase 1 — Fuel & switches *(days; highest ROI; almost no new code)*

The features exist; give them content and turn on measurement.

- **Grow the content banks.** Pulse corpus → 60+, Ballpark → ~90, Myth → ~40.
  All harvestable from already-vetted repo content (recovery clusters, glossary,
  supplement/tool sources); fresh Pulse chunks already have `pnpm harvest` + the
  PR gate. Every new item brings its own primary source (CLAUDE.md).
- **Flip the recorded activation switches** (all documented, all code-complete):
  - `ANTHROPIC_API_KEY` in Vercel → Pulse leaves degraded mode (PULSE §14
    "PRODUCTION TODO"). Cost-safe to flip: generation is site-wide, one pass
    per UTC day on the `claude-haiku-4-5` default with a hard daily call
    budget (PULSE §14.1); `PULSE_LLM_MODEL` is now only an optional override.
  - Same key as a GitHub Actions secret + "Actions may create PRs" → the weekly
    harvest Action goes live (PULSE §15.10).
- **Activate measurement.** CMP + GA4 (consent-gated loaders built and
  e2e-tested), Search Console verification, a double-opt-in email provider for
  `EmailCapture`. `/pulse/this-week` was built as the newsletter unit.
- **Activate affiliate buy buttons.** The recommendation cards already render
  their editorial picks; the buy button + disclosure appear per pick once its
  affiliate URL is pasted into `src/registry/affiliates.ts` (one-line edits, no
  marketing-claim pages by rule).

*Owner: mostly config/content + Vercel dashboard, not repo engineering.*

### Phase 2 — Close the loops that are 80% built *(~1–2 weeks)*

- **Extend the share-card pipeline beyond tools.** PARTLY DONE (2026-07-23):
  the arcade games and both dailies now share through `/api/arcade-card` — a
  sibling of `/api/share-card` with the same forgery posture (bounded numbers /
  fixed ids only, `src/lib/arcade-share.ts`). Game share links carry the result
  as query params on the game's own URL, whose `generateMetadata` unfurls them
  as the score card (LIFELINE §6 challenge links included), and every
  section/content page got a per-page OG image. Still open from this bullet:
  **Pulse cards** (PULSE §4) and the **1080×1920 story format**.
- **Build the specced SEO artefacts** (the internal-linking payoff both content
  docs call a build requirement): `/daily/archive/<date>` pages, the
  `/pulse/<date>` daily page with `Claim` JSON-LD, and reciprocal "related facts"
  strips on tool/article pages.
- **Wire more calculators to `ResultHistory`.** Only **TDEE and 1RM** persist
  today (DASHBOARD D0 note), which starves the dashboard and Trajectory of data.
  This is a prerequisite for Phase 3 to have anything to chart.
- **Small closers:** `/pulse/saved` view (store already supports it), and the
  **Powerhouse** daily-seeded run + share text (Lifeline's already shipped —
  POWERHOUSE §6).

### Phase 3 — Trajectory (Dashboard D1 / ROADMAP E2) — *the keystone*

Buildable **now** on the local store, no accounts required. The longitudinal
trend card (DASHBOARD §3.5) — the proven anti-churn mechanic and the safest
motivator. Depends on Phase 2's history wiring to have data. Keep it
**dependency-free**: the shared bundle is ~165 kB against a 170 kB CI cap, so a
charting library would blow the budget (README JS-budget history).

### Phase 4 — Accounts + data-protection posture (ROADMAP E0) — *the crossing*

The next real engineering milestone and the gate everything sensitive waits on.
Build as a deliberate, resourced step (BUSINESS_PLAN §13; SPEC §17):

1. Lawful-basis + explicit consent flow for health data; published
   data-protection posture; view / export / **delete-all** controls.
2. Promote the `HistoryProvider` seam local → authed (Dashboard **D2**).
3. **PROFILE.md** manual profile + auto-populate (enter numbers once, every tool
   pre-fills — a strong, honest retention hook), then manual biomarker entry
   (Dashboard **D3**).
4. Later, on the same threat model: bloodwork extraction (PROFILE §4) and the
   body-composition estimator (CONTENT-looksmaxxing §6), adults-only, ephemeral,
   guardrailed.

**Decide the monetisation model (§4) before designing the account tier**, so
premium is built around what it actually gates.

### Phase 5 — Monetisation activation (ROADMAP E6) — *once traffic justifies it*

Switch on ads/affiliates/premium per the **premium-lean, subscription-led**
direction (MONETISATION.md). Deferred deliberately: an engaged, returning
audience monetises far better than cold traffic.

---

## 4. Blocking decisions (Mat only)

These gate the phases above and cannot be resolved from the code:

1. **The monetisation model** (MONETISATION §4) — price, the free/paid line,
   ads-in-free-tier vs ad-free-for-everyone, trial mechanics. Unblocks Phase 4's
   tier design and the owed BUSINESS_PLAN/ROADMAP reconciliation (§6 here).
2. **Fitness Age** (METHODOLOGY §3.2) — blocked solely on obtaining the Nes 2011
   full text. Buy/request the paper, or drop the tool (it also carries 25% of the
   Pace of Aging index design).
3. **Names** — "Myth or Fact?" and "Lifeline" are still working titles;
   "Ballpark" is locked.
4. **Dashboard open questions** (DASHBOARD §13) — manual biomarker entry before
   the partner deal? anonymous dashboard as a launch feature? health-data
   retention window?
5. **The blood-test partner** — `/blood-test` is live and makes promises that
   depend on it.

---

## 5. Risks to watch

- **Distribution is the weakest muscle.** Everything built so far is *product*;
  the share loop (Phase 2) and SEO artefacts are the only acquisition mechanics,
  and the 6–12 month SEO ramp has implicitly started. Pull the cheap authority
  plays forward: the "Trends, rated" hub (CONTENT-looksmaxxing §7), embed
  seeding, and the digest-as-newsletter.
- **YMYL freshness decays silently.** Every tool carries `lastReviewed`, but
  nothing enforces re-review. A CI warning when a config's `lastReviewed` passes
  ~12 months would fit the house style and protect the credibility moat.
- **Doc drift.** claude.md doubles as a status ledger and is straining (this file
  is the relief valve); BUSINESS_PLAN §7/§11 and ROADMAP E6 still read *ads-first*
  and owe reconciliation to MONETISATION.md (§6). Keep build-status claims here,
  not scattered.

---

## 6. Reconciliation owed (tracked here until closed)

Per MONETISATION §5 — once the model is confirmed (§4.1):

- [ ] **BUSINESS_PLAN §7 / §11** — reorder revenue streams to lead with
      subscription; ads/affiliates as supporting lines.
- [ ] **ROADMAP E6** — elevate premium from "scaffold a tier" to the first-class
      outcome the earlier phases build toward.
- [~] **claude.md / SPEC §10** — the "premium gates persistence & depth, never
      the calculation" rule is already a binding product principle in
      MONETISATION §2 (the revenue source of truth), DESIGN §5 and DASHBOARD §1;
      MONETISATION §5 still lists making it explicit in claude.md / SPEC §10 as a
      loose end. Low-stakes; fold in when the model is confirmed.

Until then, MONETISATION.md is the source of truth for revenue direction and
this file is the source of truth for build status and sequencing.
