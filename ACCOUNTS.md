# ACCOUNTS.md — Sign-in & accounts (ROADMAP E0 — the crossing)

Companion to `SPEC.md` (§10 persistence, §17 scope), `ROADMAP.md` (E0 — the
gating milestone), `STATUS.md` (§3 Phase 4 — where this sits in the execution
order), `DASHBOARD.md` (§5 the profile document, §8 the privacy gate, D2
accounts & sync), `PROFILE.md` (the feature accounts unlock next),
`MONETISATION.md` (the model decision that gates the premium tier, not the
free account), `DESIGN.md` (§5 upsell posture, §6 retention surfaces) and
`BUSINESS_PLAN.md` (§13 the data-protection threshold).

**Status (2026-07-24): IN BUILD — A0–A4 commenced together at Mat's
direction (per-phase sign-offs waived, same day). Build record: §13.** Mat
delegated the stack decisions the same day ("choose the best option,
justify"); they are recorded in §9 with rationale, sized for **~200k
registered users at peak** (§5.4). Scope direction from Mat, also 2026-07-24:
**nearly every surface becomes savable to the account** — calculators,
estimators/predictors, the supplements a user takes, the exercises they save,
arcade scores, and (gated, sequenced) bloodwork — folded into §3, §6 and the
A-sequence. The revenue model is confirmed premium-led (MONETISATION,
2026-07-23) with two details resolved in this session (§9.9); the remaining
opens — price/mechanics and the exact free/paid line — gate the premium
tier, not this build. Sequencing note: this work is `STATUS.md §3` Phase 4,
pulled forward by Mat's explicit instruction (2026-07-24: "commence A0–A4
all together, no per-phase sign-off") — go-live still waits on the A0
provisioning + posture items only Mat can complete (§13).

---

## 0. How to use this doc

Read §1–§3 for what v1 accounts are (and deliberately are not). §4–§6 are the
engineering plan; §7 is the **binding** consent/data-protection posture — the
part `BUSINESS_PLAN §13` and `SPEC §17` say must be built as a deliberate
step, not drifted across. §9 records the decisions and their
rationale; §10 is the build sequence with acceptance criteria. Nothing stores
identified health data until the §7 gate items exist.

---

## 1. What accounts are for

One sentence: **keep your numbers, across devices, safely.** The calculators
stay anonymous and free; an account is purely additive persistence — the same
local-first documents the site already writes, promoted to a home that
follows the user.

### 1.1 The strategic position

Accounts are the single unbuilt milestone everything ambitious funnels
through (`STATUS.md §2.3`). They are **not** a feature in themselves; they
are the identity + storage foundation that unlocks, in order:

| Unlocked | Doc | Waits on |
|---|---|---|
| Cross-device history & dashboard sync (D2) | DASHBOARD §11.3 | this doc, all of it |
| Manual profile + auto-populate (the retention hook) | PROFILE §2.1, §9.2 | E0 + §7 posture |
| Manual biomarker entry, then blood-test auto-population (D3) | DASHBOARD §3.3, §11.4 | E0 + §7 — scheduled as **A4** (§10); manual entry ships before the partner (decided §9.7) |
| Bloodwork upload & extraction | PROFILE §4 | E0 + §7 + its own threat model |
| Body-composition estimator (18+, ephemeral) | CONTENT-looksmaxxing §6 | E0 + §7 + §6.3 guardrails |
| Premium tier (persistence & depth) | MONETISATION | E0 + the §4 detail decisions (price/mechanics, exact free/paid line) |
| Leaderboards / challenges / anonymous counts | ROADMAP E4 | E0 + own posture |

### 1.2 Why the promotion is cheap (the seam is real)

Every persistent surface already writes a **versioned, tolerant-parsed,
sync-ready document through one module** — the SPEC §10 `HistoryProvider`
seam, built deliberately across `src/lib/history.ts`,
`src/lib/dashboard-store.ts`, `src/lib/pulse-store.ts` and
`src/lib/daily-store.ts`. Each already documents its own first-login merge
strategy (§6.2). Promotion is therefore **one central sync layer**, not a
caller sweep — the promise those modules were built to keep.

---

## 2. Non-negotiable principles (inherited — do not reopen)

1. **Free stays free; the answer is never gated** (MONETISATION §2.1). An
   account is never required to run a calculator, read content, play a game
   or see a result. Signed-out behaviour changes not at all.
2. **Local-first stays the default.** `localStorage` remains the read path
   and the source of truth on-device; the account is a sync/backup layer on
   top. The "runs in your browser" trust line stays true for signed-out
   users, and signed-in users keep working offline.
3. **Premium sells persistence and depth, never the answer** (MONETISATION
   §2.2). v1 accounts are **free-only**; no tier logic ships until the
   MONETISATION §4 detail decisions — price/mechanics and the exact
   free/paid line — are made (`STATUS.md §4` blocking decision #1).
4. **Honest, quiet upsell — no dark patterns** (DESIGN §5). The sign-up
   prompt is the existing "keep these across devices — free account" card:
   plain benefit, never blocking, never a countdown, never blurred content.
5. **Data minimisation by design.** We ask for an email address and nothing
   else. No name field, no demographic capture at sign-up, no marketing
   default-opt-in. The profile's vitals live in the dashboard document the
   user chooses to fill, not in the account record.
6. **The §7 posture is binding** (BUSINESS_PLAN §13, SPEC §17, DASHBOARD §8,
   PROFILE §7). No identified health-flavoured value is persisted
   server-side before every §7 gate item exists. Ship because of the
   guardrails, never without them.
7. **Never sold, never shared, never used to train models** (PROFILE §7.5).
   Stated in the privacy policy and enforced; the account exists only to
   serve the user their own numbers.
8. **Budgets hold** (SPEC §13). The ~170 kB JS cap and zero-CLS rules are
   unchanged; auth ships code-split (§4.5). Static tool pages stay static.

---

## 3. Scope

### 3.1 v1 (this milestone — ROADMAP E0 / Dashboard D2)

- **Sign-in** (decided §9.1): passwordless **magic link** + **Google** +
  **Sign in with Apple**. No passwords stored, ever (smaller breach surface,
  fits the privacy moat). Passkeys are the first fast-follow, not v1.
- **Account storage — every savable surface** (Mat's direction,
  2026-07-24). One namespace per surface (§6.2), each a local-first
  document that works signed-out and syncs signed-in:
  - `history` — every calculator / estimator / predictor result (store
    exists; only TDEE + 1RM write to it today — wiring the rest is the
    Phase 2 job the dashboard already needs, and it becomes account value
    here).
  - `dashboard` — vitals + metric points (exists; biomarkers stay empty
    until A4).
  - `daily` — Ballpark / Myth results, streaks, freezes (exists).
  - `pulse` — likes, saves, seen-set, affinity (exists).
  - `arcade` — **new** consolidation: per-game bests, Lifeline
    skins/unlocks and per-day bests (today scattered across
    `fittools.*.best` keys).
  - `stack` — **new** store: the supplements a user takes
    (supplement-registry ids + added date + optional note; deliberately no
    dosing fields — §6.2 note).
  - `training` — **new** store: exercises saved from the library (exercise
    ids; a structured set/rep workout log is a later surface — §11).
  - `favourites` — **new** store: bookmarked tools/pages (registry slugs)
    — the "bookmark tools" surface (a premium-candidate for *depth*, per
    §9.9's additive-gating rule).
  - `prefs` — **new**: unit preference, so metric/imperial follows the
    account across devices.
- **Consent flow**: the §7.2 granular health-data consent, separate from
  account creation, gating the health-flavoured namespaces (§6.2).
- **Data controls, day one**: view, export (JSON), revoke consent,
  **delete everything** — first-class on the account page, not buried.
- **Surfaces**: `/signin`, `/account`, the nav account entry, the signed-in
  dashboard state (DASHBOARD §7), save affordances on supplement/exercise
  pages (§8), and the "keep this number" prompts wired to real sign-up.

### 3.2 NOT in v1 (each has its own gate or sequence)

- **Bloodwork/biomarker values** — now explicitly scheduled as **A4**
  (Dashboard D3): manual entry first (decided §9.7), partner
  auto-population later on the same namespace. Until A4 the server
  **rejects** biomarker content (§6.4) — the crossing stays deliberate;
  the schedule is now real.
- **Premium/tier logic, payments** — blocked on the MONETISATION §4 detail
  decisions (price/mechanics, exact free/paid line — §9.9).
- **Profile auto-populate** — the next milestone (PROFILE §9.2), built on
  this foundation.
- **Structured workout logging** (sets/reps/sessions) — a later namespace
  the §6.5 recipe supports; v1 ships exercise saves only.
- **Leaderboards, challenges, any cross-user surface** (ROADMAP E4).
- **Bloodwork upload/extraction; the photo estimator** — later, shared
  server surface + threat model (PROFILE §4; CONTENT-looksmaxxing §6).

---

## 4. Auth architecture

### 4.1 Methods (DECIDED — §9.1)

**Magic link + Google + Sign in with Apple, all at launch.** Magic link is
the universal, password-free baseline. At a ~200k-user peak, magic-link-
*only* would mean six-figure annual email volumes and re-login friction on
every new device; the two OAuth buttons absorb most of that at zero
marginal cost. Google covers the Android/desktop majority; Apple fits the
iOS-heavy Gen-Z audience, and its privacy posture matches the site's
(private-relay addresses are fine — email is only ever a login handle and
mail route). The Apple Developer Programme (~$99/yr) is accepted as a §5.4
line item. Web-only, so Apple's app-store sign-in mandate never applies —
it is offered on fit, not obligation. Passkeys follow once the account
base exists.

**Identity note (accepted v1 papercut):** accounts key on verified email.
Apple's private relay mints a distinct address, so the same person using
magic link one day and Apple the next can end up with **two accounts**.
v1 accepts this — `/signin` says plainly "use the same method you signed
up with", and OAuth providers sharing a verified email do link — and a
manual account-linking flow on `/account` is the fast-follow alongside
passkeys. Not worth blocking v1 on.

### 4.2 Library — self-hosted only

A hosted identity SaaS (Clerk etc.) is **ruled out on posture**: it puts a
third-party script on pages, a per-MAU bill on a free feature, and — the
real disqualifier — a third-party processor between the user and a site
whose moat is "your data stays yours". Auth must run in our own Next.js app
against our own database.

Two credible candidates were weighed (both free, self-hosted, DB-backed;
either is a new dependency — approval granted under the 2026-07-24
delegation, recorded in §9.2):

| | **Better Auth** (decided) | **Auth.js / NextAuth v5** (fallback) |
|---|---|---|
| Shape | TypeScript-first auth framework; owns its schema via CLI migrations | The long-standing Next.js auth library + DB adapter |
| Magic link | First-class plugin | Email provider built-in |
| Passkeys/2FA later | Plugins exist | Possible, more assembly |
| Rate limiting | Built in | Bring your own |
| Maturity | Newer, very active, strong momentum | Huge install base, slower-moving |

**Decision (§9.2): Better Auth**, health-checked at A0 (maintenance
cadence, open advisories), with Auth.js as the documented fallback.
Rationale: TypeScript-first with first-class magic-link/social/passkey
plugins (exactly the v1 + fast-follow method set), built-in rate limiting
with pluggable storage (needed on serverless — §4.6), schema ownership via
CLI migrations (our database, our data), and an integration kept thin
enough that a later swap stays bounded. At 200k users both candidates are
proven; Better Auth wins on fit, not necessity.

### 4.3 Sessions (DECIDED — §9.8)

Database-backed sessions with an httpOnly, Secure, SameSite=Lax cookie
(library default). **60-day rolling expiry** — fewer magic-link re-sends, a
real cost and friction lever at scale — with a short-lived **signed cookie
cache (~5 min)** so authed navigation doesn't hit Postgres on every
request; revocation ("sign out everywhere" on the account page) tolerates
that bounded cache window. The session cookie is strictly necessary under
PECR — no consent banner interaction — but is documented in the cookie
policy (§7.6).

### 4.4 The static-pages constraint (load-bearing)

Tool pages are statically generated and **must stay that way** (SPEC §2,
§13). Therefore:

- **No global middleware auth.** Nothing makes the (tools) routes dynamic.
- Auth state is read **client-side** by a tiny session probe in the nav
  (cookie-aware fetch to a session endpoint, cached), and **server-side only
  on account-scoped routes** (`/account`, the API). `/dashboard` stays a
  client-composed page as today.
- Signed-out rendering is byte-identical to today's output.

### 4.5 JS budget

The shared bundle sits ~165 kB against the 170 kB CI cap. Rules: the auth
client library loads **only** in the code-split `/signin` and `/account`
chunks; the nav probe is hand-written (target < 2 kB, no library import);
the sync engine (§6.3) lazy-loads only when a session exists. The CI budget
assertion is the backstop.

### 4.6 Threat notes (v1 surface)

Magic links: single-use, short expiry (≤ 15 min), uniform "check your email"
response (no account enumeration), rate-limited per address + IP. Sync API:
authed, rate-limited, size-capped (§6.4); rate-limit counters live in the
database — in-memory counters don't survive serverless instances — and a
Redis tier is the noted later lever (§5.4), not a v1 build. CSRF/session fixation:
library-handled; verify in e2e. No new XSS surface: store documents are
JSON, parsed with the existing tolerant parsers, never rendered as HTML.
Auth is the site's **first sensitive server surface** — it inherits the
"own threat model" duty PROFILE §7.2 assigns, ahead of the extractor.

---

## 5. Data layer

### 5.1 Database

There is no database today (the site is static + two API routes). Accounts
need one. Candidates, all Postgres-shaped and Vercel-friendly:

- **Neon** (Vercel marketplace-native, serverless Postgres, scale-to-zero —
  fits the near-zero-cost posture; UK/EU regions available).
- **Supabase** (Postgres + more; London region; heavier than needed if
  we're bringing our own auth library, but a fine home).

**Decision (§9.3): Neon via the Vercel integration.** Serverless Postgres
whose pricing tracks the site's actual curve — near-zero now (scale-to-zero
while the account base is young), an estimated ~$19–69/mo plan band at the
200k peak (§5.4) — with an HTTP driver built for Vercel functions and
branch databases that mirror preview deployments. Region **London
preferred, Frankfurt acceptable** — verified at provisioning and recorded
in the §7.4 posture; Vercel function regions pinned to match
(`lhr1`/`fra1`) so personal data isn't processed in the US by default.
Supabase (London) stays the named alternative if Neon's region or pricing
surprises at setup.

### 5.2 Schema (small, deliberately)

```
users / sessions / verification …    ← library-owned (+ age_band — §7.7)
store_documents (
  user_id, namespace,                ← the §6.2 registry: "history" | "dashboard"
  version int, doc jsonb,            |   "daily" | "pulse" | "arcade" | "stack"
  updated_at timestamptz,            |   "training" | "favourites" | "prefs"
                                     |   (+ "bloodwork" at A4)
  PRIMARY KEY (user_id, namespace)
)
consents (
  user_id, kind,                     ← "health-storage" now; "bloodwork-storage" at A4
  granted_at, revoked_at, policy_version
)
```

**One JSON document per store per user** — the same shape the local stores
already serialise, so "the local document is what gets uploaded and adopted
server-side" (DASHBOARD §5.5) is literally the implementation. No
relational modelling of individual metrics in v1: Trajectory charts
client-side from the document. **Bloodwork gets its own namespace and its
own consent kind at A4** — separate erasure, separate retention, and a
server-side gate that doesn't depend on inspecting the dashboard document
(§6.4). Encryption at rest is provider-level; DB credentials and
email-provider keys are server-side env only.

### 5.3 Email delivery

Magic links need transactional email. Phase 1 already owes a double-opt-in
provider for `EmailCapture`/newsletter — **decision (§9.4): Resend, serving
both**: auth transactional mail now, newsletter/double-opt-in broadcasts
after. Fallback if login-mail deliverability ever underperforms: move
transactional to Postmark (the deliverability gold standard), keep
broadcasts on Resend — a config swap, not a rebuild. Sender domain
(`tools.fit`) gets SPF/DKIM/DMARC as part of A1.

### 5.4 Capacity & cost at the 200k peak

Sizing target (Mat, 2026-07-24): **~200k registered accounts at peak.**
Working assumptions: ~15–25% monthly-active (30–50k MAU), a few thousand
daily actives, debounced sync pushes of a few kB each.

- **Database.** Documents are small — a heavy user's full history is tens
  of kB; most namespaces are hundreds of bytes. 200k users × ~30 kB
  typical ≈ **~6 GB** plus indexes, comfortably inside Neon's mid plans.
  Write load (~10 pushes per active user per day) averages single-digit
  writes/sec with bursts in the tens — trivial for Postgres behind the
  pooler.
- **Email.** The OAuth options carry most sign-ins; magic-link volume at
  peak lands around tens of thousands/month, inside Resend's ~$20–90/mo
  tiers. 60-day sessions (§4.3) keep re-auth mail down.
- **Cost envelope at peak** (monthly): Vercel Pro ~$20 + usage, Neon
  ~$19–69, Resend ~$20–90, Apple ~$8 effective → **roughly $70–200/mo**,
  consistent with BUSINESS_PLAN §9's "low hundreds at scale" cost posture
  — and near-zero until the ramp happens (free/scale-to-zero tiers from
  day one).
- **Deliberately not built for this scale:** multi-region replicas, queues,
  Redis, CRDTs. At 200k users they are premature; the §6 LWW-document
  model on Postgres is the honest fit. The first real scaling lever, if
  ever needed, is a Redis rate-limit/cache tier (§4.6) — noted, not built.

---

## 6. Sync — promoting the seam

### 6.1 Model

**Pull → merge → write-local → push** on sign-in; **debounced push** (~2 s)
on local change, subscribed to the change events every store already emits;
**pull-if-newer** (per-document `updated_at`) on page load with a session.
**Writes are conditional**: every PUT carries the `updated_at` it last saw
(an etag); a mismatch returns 409 and the client re-pulls, re-merges with
the same pure merge functions, and re-pushes — so a stale writer resolves
by **merge, never by silently dropping data**. The realistic stale writer
is not an offline device (there is no offline mode) but a **resumed mobile
tab**: phone browsers resurrect tabs from memory for days without
reloading, so a tab that last pulled on Monday can push on Thursday over
everything another device wrote in between; failed pushes retrying on
flaky gym signal are the same class. The guard costs one header and one
retry branch over merge functions A2 builds anyway. Plain
last-write-wins applies only to genuinely scalar namespaces (`prefs`). At
one-user-few-devices scale that plus set-union semantics is sufficient; no
CRDTs. Offline or failed pushes retry on the next change/load; the
device's local copy always keeps working (principle §2.2).

### 6.2 Namespaces & first-login merges (the registry)

The client engine and the API share one **namespace registry**
(`src/lib/account/namespaces.ts`): key → document version, merge function,
and whether the namespace is health-flavoured (consent-gated, §7.2).
Strategies marked *(doc)* were specified in their feature docs — build to
those. Merge functions are **pure and unit-tested** beside the store cores
they extend.

| Namespace | Contents | Consent-gated? | Merge on first sign-in |
|---|---|---|---|
| `history` | per-tool SI results — every calculator/estimator/predictor | **yes** | union by (tool, local day), latest of day wins, 30/tool cap (history.ts rules) |
| `dashboard` | vitals + metric points (biomarkers empty until A4) | **yes** | vitals: latest `updatedAt` wins; metrics: union by (metric, savedAt), per-metric cap *(doc: DASHBOARD §5)* |
| `daily` | results, streak, freezes | no | union results by date; `max(current, best)`; larger freeze balance *(doc: DAILY-GAMES §8)* |
| `pulse` | likes, saves, seen, affinity | no | union the monotonic sets; last-write-wins affinity *(doc: PULSE §6)* |
| `arcade` | per-game bests, Lifeline skins/unlocks, per-day bests (consolidates `fittools.*.best`) | no | `max` per numeric key; union unlocks |
| `stack` | supplements the user takes: registry id, `addedAt`, optional note | **yes** | union by id, latest note wins |
| `training` | saved exercises: registry ids, `addedAt` | no | union by id |
| `favourites` | bookmarked tools/pages: registry slugs, `addedAt` | no | union by slug |
| `prefs` | unit preference | no | last-write-wins |
| `bloodwork` | dated biomarker readings (manual now; purchased-test auto-population later) | **yes — own `bloodwork-storage` consent, 18+** | union by (marker, takenAt), overlay wins ties |

Notes. `stack` is consent-gated deliberately: a supplement list can reveal
health conditions (finasteride, ashwagandha…), so it sits on the cautious
side of the line; `training` saves are bookmark-grade and are not. No
dosing fields exist on `stack` — it records *what*, never *how much*; the
no-dosing editorial discipline (CONTENT-peptides §0) stays intact.
`arcade`, `stack`, `training`, `favourites` and `prefs` are **new
local-first store modules** built at A2 in the established pattern (pure
core + guarded wrapper + change event + tests); they work signed-out from
day one, like everything else.

### 6.3 The engine

`src/lib/account-sync.ts`: a lazy-loaded module that (a) reads the §6.2
namespace registry for keys and merge functions, (b) subscribes to each
store's change event, (c) talks to the API below. No calculator, game or
store caller changes — the seam keeps its promise.

### 6.4 API (all dynamic, authed, rate-limited)

```
GET    /api/account/stores            → all documents (initial pull)
PUT    /api/account/stores/[ns]       → upsert one document
GET    /api/account/export            → everything we hold, one JSON file
DELETE /api/account                   → delete-all: documents + consents + account
```

Server-side validation on PUT: known namespace; tolerant re-parse with the
same pure parsers the client uses (never trust the wire); document size cap
(~128 kB — an order of magnitude above real usage); and **the gate in
code**: the `bloodwork` namespace does not exist server-side until A4, and
a `dashboard` document with a non-empty `biomarkers` array is rejected.
Consent-gated namespaces (§6.2: `history`, `dashboard`, `stack`)
additionally require an active `health-storage` consent row **and a 16+
age band (§7.7)** — no consent, or an under-16 band, no write, HTTP 403
(§7.2).

### 6.5 Adding a savable surface (the recipe)

Mat's direction is that nearly everything becomes savable, so this must be
a **pattern, not a project** — mirroring SPEC §5's "a tool is three files":

1. **A store module** in `src/lib/` — pure core + guarded localStorage
   wrapper + change event + a pure merge function, unit-tested (the shape
   history.ts established).
2. **One registry entry** in `src/lib/account/namespaces.ts` — key,
   version, merge, consent flag.
3. **The save affordance** in the component.

The sync engine, API validation, export and delete-all are all
registry-driven — **no server or engine change per new surface**. A future
workout log, saved-foods list or anything else lands the same way.

---

## 7. Consent & data-protection posture (BINDING — the §8/§13 gate)

Calculator estimates a user typed are innocuous in `localStorage`; linked to
an identified account they become health-related personal data under UK
GDPR (special-category-adjacent — DASHBOARD §2.5). All of the following
exist **before** the first health-flavoured byte is stored server-side:

1. **Lawful basis, split honestly.** Account basics (email, session) —
   contract. Health-flavoured stored values — **explicit consent** (Art 9),
   collected separately (below), revocable, versioned against the policy
   text (`consents.policy_version`).
2. **Granular consent UX.** Creating an account acknowledges Terms +
   Privacy (standard). The **health-storage consent is its own
   plain-language step**, shown at first sync (and only to the 16+ bands —
   §7.7) — not fine print, per the
   CONTENT-looksmaxxing §6.3 convention: what's stored (your saved results
   and the vitals you enter), where (named region), that it follows the
   account until deleted, and the one-click outs. Until granted: the
   account works; `daily`, `pulse`, `arcade`, `training`, `favourites` and
   `prefs` sync; `history`, `dashboard` and `stack` stay local-only. Revoking deletes the
   gated server copies and keeps local ones.
3. **User controls, first-class on `/account`**: view what's held, export
   (portability, one JSON), revoke consent, **delete everything** (erasure —
   immediate hard delete of documents, consents and the account; e2e-tested).
   One honest caveat, disclosed in the policy: provider point-in-time
   **backups retain deleted data for a short tail** (~7 days,
   provider-dependent, recorded at A0). Backups are never restored to
   resurrect deleted accounts; after a disaster-recovery restore,
   completed deletions are re-applied. This is the standard ICO-accepted
   posture — stated, not hidden.
4. **Published posture** before launch: privacy-policy update (the
   blood-test page already promises it), naming storage location/region,
   encryption at rest, the processor list (Vercel, DB provider, email
   provider — DPAs on file), retention (§9.6), and the §2.7 never-sold /
   never-trained commitment.
5. **Operational duties (Mat, at A0):** confirm/pay the **ICO registration
   fee** (UK controller); run a lightweight **DPIA** for the health-data
   store (required territory for special-category processing at scale, and
   the right discipline regardless); records-of-processing entry; and —
   with 13+ accounts — the **Children's Code conformance check** folded
   into the DPIA (§7.7).
6. **PECR/cookies:** the session cookie is strictly necessary (exempt, but
   documented). No analytics or marketing attaches to account identity; the
   existing consent-mode gating is unchanged, and account events (§8.4)
   carry no health data.
7. **Minors — 13+ accounts, tiered by age band** (Mat, 2026-07-24: floor
   at the UK legal minimum so younger audiences can save the games).
   Sign-up captures a **self-declared age band (13–15 / 16–17 / 18+) —
   the band only, never a date of birth** (data minimisation; the optional
   dashboard `birthDate` stays a separate, user-chosen profile field). The
   fun namespaces (`daily`, `pulse`, `arcade`, `training`, `favourites`,
   `prefs`) sync for every band — streaks, bests, skins: what a younger
   user actually wants an account for. The **health-storage consent is offered from 16+
   only**: under-16s never see it, their calculators keep working exactly
   as today (client-side, local-first — free stays free), and the server
   enforces the band alongside the consent row (§6.4). Bloodwork is
   expected to sit at 18+ (settled at A4); the estimator's 18+ affirmation
   is unchanged. Opening accounts to 13+ brings the **ICO Children's
   Code** into scope deliberately: the A0 DPIA covers children's risks,
   transparency is age-appropriate plain language, privacy defaults stay
   high, and no nudge techniques — obligations the DESIGN §5
   no-dark-patterns posture and ROADMAP §2 guardrails already meet in
   spirit; A0 makes them explicit.
8. **Hygiene rules:** account ids/emails never in URLs or query strings;
   no health values in logs or error reports; documents never sent to any
   third party or model; age derived, never stored (existing rule).

---

## 8. Surfaces & UI (DESIGN.md language, no new vocabulary)

1. **`/signin`** — one card: email field → "check your email" state;
   Google/Apple buttons; a first-ever sign-in confirms the age band
   (§7.7). Own chunk; noindex.
2. **`/account`** — signed-in only: email, sessions ("sign out
   everywhere"), consent state + toggle, export button, delete-everything
   (confirm by typing, honest copy), links to Privacy. This page IS the §7.3
   controls; it ships in A1, not later.
3. **Nav** — signed-out: nothing new beyond existing prompts; signed-in: a
   quiet account entry (initial/avatar-free — no images to fetch).
4. **Prompts** — the existing DESIGN §5 "keep this number — free account"
   cards on ResultsPanel and the dashboard's anonymous-partial state now
   link to `/signin`. One per page max, forest outline, plain benefit, no
   theatre.
5. **Save affordances** — "Save to my stack" on supplement pages, "Save
   exercise" on library pages: bookmark-style, instant, local-first; syncs
   when signed in. "My stack" / "My exercises" render as dashboard cards
   (the §3.2-grid language), not new top-level routes.
6. **Dashboard signed-in state** (DASHBOARD §7) — same view, synced store;
   a one-line "synced to your account · region" provenance in settings.
7. **States that must render cleanly:** signed-out (unchanged), signed-in
   pre-consent (games/pulse synced; a quiet consent card where history
   would sync), signed-in consented, offline-with-session, and every
   degraded storage state the stores already handle. Zero-CLS throughout.

### 8.4 Analytics (SPEC §12 pattern, consent-gated as ever)

```
| { name: "account_signup";    params: { method: "magic-link" | "google" | "apple" } }
| { name: "account_signin";    params: { method: string } }
| { name: "account_consent";   params: { kind: "health-storage"; granted: boolean } }
| { name: "account_deleted";   params: Record<string, never> }
| { name: "sync_first_merge";  params: Record<string, never> }
```

No emails, no ids, no health values in params. Success metrics are ROADMAP
E0's: sign-up rate from the save-prompt CTA; % of calculator users who save
a result; D7 return among account holders vs not.

---

## 9. Decisions (taken 2026-07-24 — delegated by Mat; rationale recorded)

Mat delegated the stack decisions ("choose the best option, justify"), set
the sizing target (~200k users at peak) and the all-surfaces savable scope.
Changing any locked item below is a spec change. §9.9 is the one call
deliberately left with Mat.

1. **Auth methods → magic link + Google + Apple, all at launch.** The
   passwordless baseline plus the two OAuth routes that remove most email
   cost and sign-in friction at 200k scale (§4.1); Apple on audience fit,
   the ~$99/yr accepted. Passkeys fast-follow.
2. **Auth library → Better Auth** (A0 health-check; Auth.js the documented
   fallback). Plugin fit for exactly this method set, serverless-safe rate
   limiting built in, schema ownership, thin integration (§4.2). A new
   dependency, approved under this delegation.
3. **Database → Neon Postgres via the Vercel integration; London
   preferred, Frankfurt acceptable; function regions pinned to match.**
   Cost tracks the growth curve (near-zero → ~$19–69/mo at peak), HTTP
   driver fits functions, preview-branch databases, UK/EU residency for
   the §7 posture (§5.1). Supabase (London) is the named alternative if
   provisioning surprises.
4. **Email → Resend.** One provider closes two items: auth transactional
   mail now, the Phase 1 newsletter/double-opt-in broadcasts after; good
   deliverability, EU processing, ~$20–90/mo at peak. Documented fallback:
   transactional to Postmark, broadcasts stay (§5.3).
5. **Age line → 13+ accounts (UK legal floor), tiered by band** — revised
   2026-07-24 by Mat, superseding the earlier 16+ call: younger audiences
   are exactly who the games serve, so the account floor drops to the
   legal minimum. The tiering keeps the cautious line where it matters:
   health-flavoured sync (`history`, `dashboard`, `stack`) is offered from
   **16+**; bloodwork is expected 18+ (settled at A4); the estimator stays
   18+. An under-16 account gets the full games/content layer and loses
   nothing — calculators remain client-side and local for everyone. Brings
   the ICO Children's Code into A0 scope (§7.7).
6. **Retention → keep while active; 24-month inactivity expiry (warning
   at 22 months); erasure immediate on request.** Bloodwork sets its own,
   stricter retention at A4. Resolves DASHBOARD §13.4.
7. **Savable scope → everything in §3.1 ships in v1; bloodwork is A4,
   manual entry before the partner integration** (resolving DASHBOARD
   §13.2). The supplement stack is consent-gated as health-flavoured
   (§6.2); a structured workout log is deferred but pattern-supported
   (§6.5).
8. **Sessions → 60-day rolling + ~5-min signed cookie cache** (§4.3):
   fewer login emails, no per-request DB read, bounded revocation window.
9. **Monetisation model — shape CONFIRMED (2026-07-23), details advanced
   here (2026-07-24).** The model order is premium-led: premium sign-ups
   first (very low monthly or possibly a £10 one-off lifetime unlock —
   mechanics open), blood-test profit second, affiliates small
   (MONETISATION §1). This session resolved two details: the free tier
   will carry light, premium-lean ads and premium removes them
   (MONETISATION §4.2), and the arcade is monetised through **extras,
   never play-limits** (MONETISATION §2.6). Still open, still Mat's: the
   exact free/paid feature line ("save calculators, bookmark tools" are
   named candidates — MONETISATION §4.3) and price/mechanics (§4.1).
   Consequences for this build: v1 accounts stay free-only and
   tier-neutral, and because **nothing may launch free and be walled
   later**, gating must be additive — so A2 ships free sync with modest,
   honest caps (e.g. a history window) that premium later *lifts*, and
   premium-candidate surfaces (favourites depth, arcade extras) launch
   with the tier.

---

## 10. Build sequence & acceptance criteria

Gates per CLAUDE.md: typecheck + tests green before every commit; each step
needs Mat's sign-off before the next.

### A0 — Decisions & posture groundwork *(no code)*
§9 decisions made; DPIA + ICO check done; privacy/cookie policy drafts
updated; providers provisioned (DB region verified, email domain
authenticated). **Accept:** every §7 item has an owner and a draft.

### A1 — Auth foundation
Library + DB wired; magic-link + Google/Apple flows; age-band capture
(band only — §7.7); `/signin`, `/account` (with working
**delete-all** and export from day one — they are simplest before there's
data); nav probe; session e2e (Playwright, using a dev-mode mail catcher or
provider test inbox). **Accept:** sign-up → sign-in → sign-out → delete-all
round-trips in e2e; signed-out output byte-identical; tool pages still
static; zero third-party requests signed-out; JS budget passes; axe clean.

### A2 — Sync engine, consent & the new stores
`store_documents` API + `account-sync.ts` + the §6.2 namespace registry;
the **new store modules** (`arcade` consolidation, `stack`, `training`,
`favourites`, `prefs`) in the established pure-core pattern; merge
functions for every
namespace (pure, ≥3 vectors each, incl. the documented daily/pulse
strategies); the health-storage consent step gating the flagged namespaces
(403 without it); the bloodwork rejection guard; export covers every
namespace. **Accept:** first-login merge vectors pass per namespace;
the concurrent-write path is tested (etag mismatch → 409 → re-pull,
re-merge, re-push — no device's entries silently lost); consent revoke
deletes the gated server copies; bloodwork content is rejected; size caps
enforced; the new stores work signed-out identically to the old ones.

### A3 — Surface integration (Dashboard D2 complete)
Signed-in dashboard state; save affordances on supplement/exercise pages +
the "My stack" / "My exercises" dashboard cards; save-prompts wired;
analytics events; docs updated (STATUS.md, DASHBOARD.md D2, PROFILE.md
pointer, README env vars for the new secrets). **Accept:** DASHBOARD §12
D2 criteria; e2e for the signed-in dashboard and a stack/exercise save
round-trip; Lighthouse budgets unchanged.

### A4 — Bloodwork (Dashboard D3, manual entry first — decided §9.7)
Its own gate, after A3 ships and §7 is re-reviewed for special-category
storage specifically: the `bloodwork` namespace + `bloodwork-storage`
consent kind; manual biomarker entry UI (DASHBOARD §3.3b) with
`ClinicalDisclaimer` wherever values render; validation against the
calculator ranges (PROFILE §3); its own retention statement. Partner
auto-population lands later on the same namespace. **Accept:** DASHBOARD
§12 D2/D3 criteria — no blood value persists without the specific consent;
erasure covers bloodwork independently; no reference ranges or "optimal"
values anywhere (the biomarkers registry's deliberate omission holds).

**Then:** PROFILE §9.2 (manual profile + auto-populate) as the next
milestone on this foundation; premium behind the MONETISATION decision;
the extractor and estimator on their own threat model after that.

---

## 11. Out of scope (v1)

Everything in §3.2, plus: username/handles and public profiles; avatars;
account-to-account anything; a structured workout log and food diary
(later namespaces via §6.5, not v1); email marketing by default (newsletter
remains its own double-opt-in); admin dashboards (the DB console suffices
at this scale); SSO/2FA (fast-follow candidates with passkeys).

---

## 12. Risks & mitigations

- **Scope creep into the sensitive features.** The estimator, bloodwork and
  premium all want to ride along. *Mitigation:* the §3.2 gates are in code
  (biomarker rejection) and in sequence (separate sign-offs), not just in
  prose.
- **Auth library risk** (Better Auth is young). *Mitigation:* A0 health
  check; DB-backed sessions and a thin integration keep a later swap to
  Auth.js bounded; magic-link-only v1 minimises coupled surface.
- **JS budget regression.** *Mitigation:* §4.5 rules + the existing CI cap.
- **Compliance debt.** Storing health-adjacent data without the posture
  would be the exact drift BUSINESS_PLAN §13 warns about. *Mitigation:* A0
  is a real phase with deliverables, and A2's consent gating is enforced
  server-side.
- **Younger accounts near body metrics.** The 13+ floor exists for the
  games; the body-image risk the docs already govern (CONTENT-looksmaxxing
  §2.2) stays managed by the tier — health-flavoured storage 16+, bloodwork
  expected 18+, the estimator 18+ — with every positive-frame guardrail
  binding unchanged.
- **Login depends on email delivery** (magic links). *Mitigation:* two
  OAuth alternatives on the same screen; authenticated sender domain from
  A1; deliverability monitored; the §9.4 Postmark fallback is a config
  swap, not a rebuild.
- **Trust optics.** The site's trust line has been "nothing stored, nothing
  sent". *Mitigation:* that stays literally true signed-out; the account
  pitch is the honest inverse ("stored only for you, deletable in one
  click"), and §2.7 is published policy.

---

## 13. Build record (2026-07-24 — A0–A4 commenced together, Mat's direction)

**Built and on the branch** (all env-gated: with no `DATABASE_URL` the site
runs byte-identical signed-out and auth routes return 503):

- **A2 data layer:** `src/lib/account/` — merge.ts (all nine namespaces,
  pure, vectored), namespaces.ts (the §6.2 registry with collect/apply and
  the consent split enforced by `validateNamespaces()`), collections.ts
  (stack/training/favourites stores), arcade-doc.ts (adapter over the
  games' keys — distribute only ever raises), prefs-doc.ts (units follow
  the account), sync.ts (the §6.1 engine: pull→merge→push, debounced
  pushes, 409→re-merge→retry, 401→stop+clear-hint, consent mirrored).
- **A1 auth:** Better Auth 1.6 over Neon (`src/lib/auth/server.ts` — magic
  link 15-min single-use via Resend-over-fetch, Google + Apple, 60-day
  sessions + 5-min cookie cache, DB-backed rate limiting, age band as a
  user field), `/api/auth/[...all]`, the auth client confined to the
  /signin + /account chunks, the hand-written nav session probe with the
  device hint (anonymous pageviews: zero extra requests).
- **A2 API:** `/api/account/stores` (+ per-namespace conditional PUT with
  the §6.4 gate ladder: 401/403/404/413/422/428/409), consent grant/revoke
  (revoke deletes gated server copies), export, DELETE /api/account
  (explicit hard delete). `db/schema.sql` for the fittools tables; Better
  Auth tables via its CLI at provisioning.
- **A1/A3 UI:** /signin (band-first, magic link, social, honest
  unavailable state), /account (§7.3 controls day one: consent card,
  export, typed delete-everything, sign out everywhere, band completion),
  AccountNavLink (renders nothing signed out), AccountSync mount,
  SaveItemButton on every supplement/exercise/tool page, the dashboard
  "Saved for later" grid.
- **A4 (complete in code — Mat, 2026-07-24: blood results persist to the
  account):** manual biomarker entry on the dashboard — 28-marker grouped
  picker, ClinicalDisclaimer, no reference ranges — PLUS the `bloodwork`
  namespace and its own `bloodwork-storage` consent (18+ band, its own
  card on /account, separate erasure via revoke). Blood values travel
  ONLY under that namespace: the dashboard document strips biomarkers at
  collect and the server 422s any dashboard document carrying them, so
  the two consents can never leak into each other. Like everything else
  it is dark until provisioning + the DPIA sign-off turn accounts on.
- **Post-auth flow (Mat, 2026-07-24):** signing in lands on the dashboard
  (/account completes the sign-in — hint, band, consents — then forwards
  via a safe internal `next` param), and a signed-in avatar chip (email
  initial, riso circle) sits top-right in the nav beside the CTA,
  linking to /account. Signed out: no chip, no probe, no requests.
- **Tests:** 688 green (38 account-specific: merges, stores, registry,
  engine incl. the 409 path, the two-consent gates and the
  bloodwork-vs-dashboard separation); typecheck, lint, build and budgets
  green throughout.

**Blocked on A0 provisioning (Mat's hands — cannot be done from the repo):**
Neon project (London; run `db/schema.sql` + Better Auth CLI migrate),
`BETTER_AUTH_SECRET`, Resend key + SPF/DKIM/DMARC on tools.fit, Google
OAuth credentials, Apple Developer Programme + Sign in with Apple config,
ICO registration fee, privacy/cookie-policy updates going live, and the
DPIA sign-off (working draft: `ACCOUNTS-DPIA.md`). Env var names are in
`.env.example`. **Also pending:** live-database e2e of the full auth flow
(magic link needs a real DB + inbox; everything below that seam is
unit-tested), and the A2 free-sync history caps (deferred until the
free/paid line is decided — additive gating preserved either way).
