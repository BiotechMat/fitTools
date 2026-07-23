# DASHBOARD.md — The personal dashboard ("Your numbers")

Spec + build blueprint for the FitTools **dashboard**: the signed-in home base
where a person's vitals, saved calculations, scores and blood-test biomarkers
come together in one place and change over time.

**Status (2026-07-23): D0 (local scaffold) BUILT; later phases blueprint, not
signed off.** The `/blood-test` page already promises results that "land in
your private dashboard" and calculators that "light up" from real numbers, so
the destination needed a spec. **D0 is now built** (see §11): the anonymous,
zero-account `/dashboard` route, the metric registry, the local-first profile
store, and their tests. Everything that stores real personal or blood-test data
stays **gated** behind ROADMAP E0 accounts *and* the BUSINESS_PLAN §13 /
SPEC §17 data-protection posture, and D1–D4 are not started. Nothing past D0
begins before the SPEC milestone it depends on passes and Mat signs the gate
off (CLAUDE.md workflow).

Built in D0 (2026-07-23): `src/registry/metrics.ts` (+ `validateMetrics`),
`src/lib/dashboard-store.ts` (the `HistoryProvider` seam), `src/app/dashboard/`
(noindexed route), `src/components/dashboard/DashboardView.tsx`, a nav link,
and `tests/unit/metrics.test.ts` + `tests/unit/dashboard-store.test.ts`.

> **Sequencing (2026-07-23, `STATUS.md §3`):** **D1 (Trajectory) is buildable
> now** on the local store and is the near-term keystone (Phase 3) — but it needs
> more tools wired to `ResultHistory` first (only TDEE and 1RM persist today), so
> the dashboard has data to chart (Phase 2). **D2–D4 wait on the E0 accounts +
> data-protection crossing** (Phase 4). Do not jump the §8 gate.

Companion to: `SPEC.md` (§10 persistence, §17 scope), `ROADMAP.md`
(E0 accounts, **E2 Trajectory — the keystone**), `DESIGN.md` (§6 retention
components — styled, this doc assembles them), `METHODOLOGY.md` (the scores it
displays), and the blood-test work (`src/registry/biomarkers.ts`,
`src/app/blood-test/`).

---

## 0. How to use this spec

The dashboard is an **aggregator, not a new source of truth**. It renders data
the tools already produce and the blood test will provide; it must not
re-implement any formula or invent any metric. Build order is §11. Do not build
ahead of the gates in §8 and §11 — storing blood values is the crossing SPEC
§17 names, and it is a deliberate step, not a default.

---

## 1. Purpose & place in the product

The calculators win the *first* visit. The dashboard is built to win the
*second, tenth and hundredth* — it is the surface ROADMAP's return loop
(E2) and daily loops (Pulse, DAILY-GAMES) all point back at.

In the engagement loop (ROADMAP §3) the dashboard is the **"reason to return"**:

- It makes progress **visible** — the proven anti-churn mechanic and, per
  ROADMAP §1, the single safest motivator (temporal "you vs you").
- It is where a **blood test pays off**: raw numbers become heart age, metabolic
  and biological-age scores, tracked over repeat panels.
- It is the **persistence** that premium sells (DESIGN §5, SPEC §10 Pro tier) —
  free keeps every calculation and its methodology; premium keeps the *history
  and depth*. The answer is never gated; the archive is the product.

What it is **not**: not a diagnosis, not a health record, not a coach. It shows
estimates and self-tracking (SPEC §2), framed positively (§9).

---

## 2. Non-negotiable constraints

Everything in ROADMAP §2 and DESIGN §4 binds. The load-bearing ones here:

1. **Positive frame only.** A weak or regressed number is shown with its top
   modifiable driver and next step — never a bare red verdict (DESIGN §4). Share
   surfaces carry wins only.
2. **Temporal comparison is primary.** "You vs you" is the default. Any social
   comparison is secondary and flattering-by-default ("top X%"), opt-in, and
   tightly segmented.
3. **Metrics stay estimates.** Everything obeys METHODOLOGY.md — open, versioned,
   non-diagnostic, no mortality figures, body-composition never dominant.
4. **No medical advice.** The clinical-input disclaimer
   (`src/components/ClinicalDisclaimer.tsx`) renders wherever blood values are
   shown; the standard disclaimer sits site-wide. Never softened (CLAUDE.md).
5. **Personal & blood data is special-category (UK GDPR).** It may only be
   stored under §8. The anonymous scaffold uses the same local-first store the
   rest of the site uses; account-linked and blood-test storage are gated.
6. **Budgets & CLS unchanged.** SPEC §13 holds; every late-loading tile (charts,
   the post-hydration state) reserves its dimensions (zero-CLS rule).
7. **British English; DESIGN tokens only.** No new colours — reuse the §1
   palette and §3 component language already in `globals.css`.

---

## 3. Information architecture — what the dashboard holds

Four data domains plus the retention layer. Each domain is **read-through** to
an existing registry or store; the dashboard adds no new science.

### 3.1 Profile & vitals (the person)
The stable inputs the calculators keep re-asking for — sex, date of birth
(→ age), height, current weight, resting HR, unit preference. Stored once,
reused everywhere. This is what lets a returning user open a tool pre-filled
instead of re-typing. Canonical SI (SPEC §3, §6); display conversion at the
edge via the existing `units.ts` + `UnitInput` pattern.

### 3.2 Saved calculations & scores
Every result the user has banked, per tool, over time — the archive behind the
existing "since last time" chip (`src/lib/history.ts`,
`src/components/ResultHistory.tsx`), surfaced as a grid. Each card shows the
tool, its latest value, the positively-framed delta vs the last run, and a
sparkline when ≥2 points exist. Links back to the tool (pre-filled from 3.1).

### 3.3 Biomarkers (blood test + manual entry)
The 27-marker panel from `src/registry/biomarkers.ts`, grouped exactly as the
blood-test page groups them, showing the user's own dated readings and unit.
Two entry routes: (a) **from a test bought through us** — the promised
auto-population (blood-test page HOW_IT_WORKS step 03); (b) **manual entry** of
values from any lab, so the tool is useful before the partner integration
lands. Both write real health data → both are **gated by §8**. Descriptions
stay educational and carry **no reference ranges or "optimal" values**
(matching the biomarkers registry's deliberate omission — that would be medical
advice). A raised marker links to *"what this means"* content and the tool it
feeds, not to a verdict.

### 3.4 Composite indices & biological age
The headline scores, read straight from the existing engines — Metabolic
Fitness Index, Pace of Aging Index, Recovery Readiness Index
(`src/lib/composite/*`), plus Phenotypic Age and Heart Age. Each renders as the
inverted espresso ScoreCard (DESIGN §3) with its state pill
(`On track` / `Keep an eye` / `Needs work`), its versioned-methodology chip
(DESIGN §3, links to the open scoring), and — when driven by 3.3 — a
"populated from your blood test" provenance line.

### 3.5 Trajectory (longitudinal) — ROADMAP E2, the keystone
The trend view: any metric from 3.2–3.4 plotted over time with the DESIGN §6
chart language (hairline grid, 2px ink line, soft-blaze area, Blaze endpoint
dot, tabular-nums). Personal-best `PB` stickers, milestone flags, and Space
Mono "what moved this" annotations. Pure temporal, self-vs-self. Empty state
invites the first save, warmly. This is the reason the whole store is designed
timestamped from day one (§5), even though the chart itself is an E2 build.

### 3.6 Retention layer
The DESIGN §6 components, assembled here against their ROADMAP phases: the
day-1 win badge (E3), the "since last time" chips (buildable now), the
welcome-back / "due a re-run" strip (returners), streak chips (E3), and
percentile/status pills (E4). Every one obeys the positive-frame and
graceful-streak guardrails — no loss theatre exists in this system.

### 3.7 Share / achievement cards — ROADMAP E1
The 1200×630 OG / 1080×1920 story cards (DESIGN §6) generated from a dashboard
metric at peak satisfaction. **Wins only** — percentiles, PBs, milestones.
Server-rendered via the existing OG pipeline (`src/lib/og-image.tsx`); the
deficit numbers stay on the dashboard next to their fix list, never on a card.

---

## 4. Route & navigation

- Route: **`/dashboard`** — a top-level `page.tsx`, same shape as `/pulse`,
  `/daily`, `/blood-test`. Personal, so `robots`-noindexed and excluded from
  `sitemap.ts` (it is not an SEO surface; the tools are).
- Nav: a **"Dashboard"** (or "Your numbers") link in the primary nav in
  `src/app/layout.tsx`, sitting with Pulse / Daily. When signed out (pre-E0) it
  reads as **"Your numbers"** and lands on the anonymous local view with a quiet
  "keep these across devices — free account" prompt (DESIGN §5 upsell style).
- Entry points that must deep-link here once built: the blood-test page CTAs,
  the "keep this number" prompt on each ResultsPanel, and the welcome-back strip.

---

## 5. Data model & persistence architecture

### 5.1 The gap this must close
Today `history.ts` stores one thing well: a **single canonical SI number per
tool per calendar day** (`StoredResult { tool, value, savedAt }`), capped at 30
per tool. That is exactly right for the one-tool "since last time" chip and it
must keep working unchanged. But a dashboard needs three things it does not
carry: **who the person is** (3.1), **more than one metric per calculation**
(e.g. a macro result is protein *and* fat *and* carbs), and **dated biomarker
panels with units** (3.3). So the dashboard introduces a richer profile
document *around* the existing history, not a replacement for it.

### 5.2 The `DashboardProfile` document
One versioned document, composed of the domains in §3:

```ts
interface DashboardProfile {
  version: 1;
  profile: {                    // §3.1 — canonical SI, one value each
    sex?: "male" | "female";
    birthDate?: string;         // ISO date; age derived, never stored
    heightCm?: number;
    weightKg?: number;
    restingHr?: number;
    updatedAt: string;
  };
  metrics: MetricPoint[];       // §3.2 & §3.4 — timestamped, multi-metric
  biomarkers: BiomarkerReading[]; // §3.3 — GATED (§8)
}

interface MetricPoint {
  metric: string;   // metric-registry key (§5.3), e.g. "macros.protein-g"
  value: number;    // canonical SI / registry unit
  savedAt: string;  // ISO datetime
  source?: string;  // tool slug or "blood-test" for provenance
}

interface BiomarkerReading {
  marker: string;   // biomarkers.ts id, e.g. "apob"
  value: number;
  unit: string;     // snapshot of the assay unit at capture time
  takenAt: string;  // ISO date of the blood draw
  source: "blood-test" | "manual";
}
```

Rules: SI/registry units only, converted at display (SPEC §3, §6); age is
**derived from `birthDate`, never stored**; same tolerant-parse discipline as
`history.ts` (corrupt or foreign storage degrades to empty, never throws).

### 5.3 The metric registry — single source of truth
A new `src/registry/metrics.ts`, following the exact pattern of
`biomarkers.ts` / `tools.ts` / `daily.ts`: a typed list that is the **only**
place a dashboard-trackable metric is defined. Each entry maps a stable key to
its label, unit, the tool or biomarker it comes from, its `MetricDirection`
(reuse the type already in `history.ts`), and the epsilon noise-floor that
`frameDelta` uses to call a change "level". This drives the 3.2 grid, the 3.5
trend picker and the 3.4 score tiles. A `validateMetrics()` function + Vitest
asserts the invariants (unique keys, every `feedsTool` is a real registered
tool, every biomarker source is a real marker id) so a broken cross-link
**fails the build** — same rule biomarkers.ts already enforces.

### 5.4 Store: local-first, sync-ready (the E0 seam)
Build the store as `src/lib/dashboard-store.ts` in the established shape: a
**pure, node-testable core** (parse / upsert / derive) plus a **thin guarded
localStorage wrapper** (`fittools.dashboard.v1`, a `fittools:dashboard-change`
event, `useSyncExternalStore` for live updates) — identical to `history.ts`,
`pulse-store.ts`, `daily-store.ts`. This *is* the `HistoryProvider` seam SPEC
§10 mandates: every read/write goes through it, so when E0 accounts land, local
→ authed storage is **one central change**, not a caller sweep. Reuse
`frameDelta` / `latestBefore` from `history.ts` for deltas rather than
reimplementing the framing rules.

### 5.5 Versioning & migration
`version` is explicit and bumped on shape change; the parser migrates or
discards forward-incompatible documents rather than throwing. When E0 lands,
the local document is what gets uploaded and adopted server-side (same
migration story PULSE.md and daily-store already carry).

---

## 6. Page composition (top → bottom)

Ordering follows the loop and the positive frame — wins and identity first,
detail below, compliance always present.

1. **Header / welcome-back strip** — greeting, unit toggle, "since your last
   visit" novelty cues and "due a re-run" chips (DESIGN §6). Day-1 win badge
   fires here on the first ever save.
2. **Headline scores row** — the §3.4 composite/biological-age ScoreCards, each
   with state pill + methodology chip. This is the flattering, glanceable top.
3. **Trajectory** — the §3.5 trend card (E2). Renders its warm empty state
   until ≥2 points exist; reserves its dimensions before then (zero CLS).
4. **Saved calculations grid** — the §3.2 cards with sparklines and delta chips.
5. **Biomarkers panel** — the §3.3 grouped readings (gated; renders the
   structure + "connect your blood test" empty state pre-E0), with the clinical
   disclaimer directly above it.
6. **Profile & settings** — edit §3.1 vitals, unit preference, export, and the
   data controls from §8 (view / export / delete everything).
7. **Compliance footer** — `DisclaimerBanner`, and the blood-test data note
   reused from `src/app/blood-test/page.tsx`.

---

## 7. States

- **Anonymous, empty** (buildable now): explains what the dashboard will hold,
  shows the structure with empty tiles, and invites a first calculation. No
  personal data required to render.
- **Anonymous, partial**: local calculations exist → scores and trajectory
  populate from localStorage; a quiet "keep these across devices — free account"
  prompt appears (DESIGN §5, never blocking, never a countdown).
- **Signed-in** (E0): the same view, backed by the profile store, synced across
  devices; blood-test biomarkers appear here.
- **Blood-test-populated** (partner integration): §3.3 fills automatically and
  the §3.4 scores show the "from your blood test" provenance line.

Every state must render without layout shift and without a console error, and
degrade gracefully when storage is unavailable (private mode / quota) — exactly
as the existing stores do.

---

## 8. Privacy & data-protection gate (the crossing)

Storing calculation estimates the user themselves typed is one thing; storing
**real blood biomarkers and identity** is the special-category-data crossing
SPEC §17 and BUSINESS_PLAN §13 call out. Before any of §3.1 (identified) or §3.3
(blood values) is **persisted to an account**, all of the following must be
built as a deliberate step — not skipped, not simplified:

- A **lawful basis + explicit consent** flow specific to health data, per-use,
  reversible.
- A published **data-protection posture** (retention, storage location,
  encryption at rest, processor list) and the privacy-policy copy the
  blood-test page already promises ("full detail will be in the privacy policy
  before the test goes on sale").
- **User data controls on the dashboard itself**: view everything held, export
  (portability), and **delete everything** (erasure) — the §6.6 settings block.
- **Never** in URL params or query strings; never sent to any endpoint the user
  did not choose (platform privacy rules).

Until that gate is signed off, the dashboard ships **anonymous and local-only**:
it may store the user's own calculation estimates in `localStorage` (as the site
already does via `history.ts`) and may render the biomarker *structure* with
empty states, but it does not persist identified profiles or real blood values.
Manual biomarker entry (§3.3b) is the first feature to sit behind this gate.

---

## 9. Compliance & disclaimers

- Standard `DisclaimerBanner` site-wide; **`ClinicalDisclaimer` wherever blood
  values or blood-derived scores are shown** (§3.3, §3.4).
- Reuse the blood-test page's "About your results & your data" note verbatim in
  the biomarker area — screening/self-tracking, not diagnosis; discuss anything
  abnormal with a GP.
- No reference ranges, no "optimal" scores, no colour-only status (DESIGN §3 —
  always a spelled-out label with the colour).
- Positive-frame copy is mandatory on every regressed or weak metric (§2.1).

---

## 10. Design language (DESIGN.md mapping)

The dashboard assembles components DESIGN.md §6 already specifies — it should
add **no new visual vocabulary**:

| Dashboard element | DESIGN.md source |
|---|---|
| Score tiles | §3 inverted espresso ScoreCard + state pill + methodology chip |
| Delta chips | §6 "since last time" (forest = better, soft-paper = level/behind) |
| Trend card | §6 Trajectory chart language (hairline grid, ink line, blaze fill) |
| Day-1 / streak / welcome-back | §6 badges & strips, graceful-streak rules |
| Share cards | §6 achievement card (wins only, espresso ground, Anton number) |
| Upsell prompt | §5 honest-and-quiet (forest outline, plain price, no theatre) |
| Cards / borders / type | §3 (2px ink border, hard shadow) / §2 (Anton/Figtree/Space Mono) |

Tokens come from `globals.css`; no hard-coded colours. Zero-CLS and
`prefers-reduced-motion` per DESIGN §7.

---

## 11. Build sequence (buildable now vs gated)

Sequenced against SPEC milestones and ROADMAP phases; do not jump the gates.

1. **D0 — Local scaffold & data layer** ✅ **BUILT (2026-07-23)**.
   `src/registry/metrics.ts` + `validateMetrics()` test; `dashboard-store.ts`
   (pure core + guarded wrapper + tests); `/dashboard` route with the §7
   anonymous/empty and partial states composing existing history data and
   ScoreCards; nav link. No new science, no new colours, no identified data.
   Notes: only TDEE and 1RM persist to history today, so the scores row and
   most calc cards render their empty state until more tools are wired to
   `ResultHistory` (a near-term follow-up) or `MetricPoint`s are written; the
   score-state pill (DESIGN §3) is deferred until METHODOLOGY defines bands
   (kept out to honour "no new science"); 1RM shows canonical kg (unit-system-
   aware display is a later enhancement).
2. **D1 — Trajectory** *(with ROADMAP E2)*. The §3.5 trend card over the D0
   store. The keystone view.
3. **D2 — Accounts & sync** *(with ROADMAP E0 + the §8 gate signed off)*.
   Promote the store from local to authed via the HistoryProvider seam; enable
   identified profiles.
4. **D3 — Biomarkers** *(with §8 + the blood-test partner integration)*. Manual
   entry first, then auto-population from a test bought through us.
5. **D4 — Share cards & status** *(with ROADMAP E1/E4)*. Achievement OG cards
   and flattering percentile pills.

Each step gates on the previous one's tests passing and Mat's sign-off
(CLAUDE.md workflow). Typecheck + tests must pass before every commit.

---

## 12. Acceptance criteria (per step)

- **D0**: `/dashboard` renders every §7 state with **zero CLS** and no console
  errors; `validateMetrics()` fails the build on a broken tool/biomarker
  cross-link; the store's pure core has ≥3 Vitest vectors (parse tolerance,
  multi-metric upsert, delta framing) and degrades to empty when storage
  throws; existing `history.ts` behaviour and the "since last time" chip are
  unchanged; axe clean; budgets (SPEC §13) hold.
- **D1**: trajectory reserves dimensions before data and renders self-vs-self
  only; empty state present.
- **D2/D3**: no identified profile or blood value is persisted until the §8
  gate items exist; view/export/delete-all all function; `ClinicalDisclaimer`
  present wherever blood data shows.
- **D4**: share cards carry wins only; deficit numbers never leave the page.

---

## 13. Out of scope / open questions

- **Out of scope (v1 dashboard):** clinician sharing/PDF reports, wearable/API
  sync (Apple Health, CGM live feeds), household/multi-profile, notifications
  beyond opt-in re-run reminders, any social feed. These are ROADMAP-later.
- **Open questions for Mat:**
  1. Route/label — **`/dashboard`** vs **"Your numbers"** as the user-facing
     name (this doc uses `/dashboard` for the route, "Your numbers" for
     signed-out copy).
  2. Does manual biomarker entry (§3.3b) ship *before* the paid test, or wait
     for the partner? It is the earliest thing behind the §8 gate.
  3. Is the anonymous local dashboard a launch feature, or does the whole
     surface wait for E0 accounts? (This doc assumes local-first ships first.)
  4. Retention window for stored health data (feeds the §8 posture).
