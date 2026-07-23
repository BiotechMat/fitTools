# ACCOUNTS.md — Sign-in & accounts (ROADMAP E0 — the crossing)

Companion to `SPEC.md` (§10 persistence, §17 scope), `ROADMAP.md` (E0 — the
gating milestone), `STATUS.md` (§3 Phase 4 — where this sits in the execution
order), `DASHBOARD.md` (§5 the profile document, §8 the privacy gate, D2
accounts & sync), `PROFILE.md` (the feature accounts unlock next),
`MONETISATION.md` (the model decision that gates the premium tier, not the
free account), `DESIGN.md` (§5 upsell posture, §6 retention surfaces) and
`BUSINESS_PLAN.md` (§13 the data-protection threshold).

**Status (2026-07-23): BLUEPRINT — not built, not signed off.** This is the
planning document for lightweight sign-in and per-account storage: what v1
includes, the architecture, the binding data-protection posture, the build
sequence, and the decisions only Mat can make (§9). Per `STATUS.md §3` this
work is **Phase 4** — after the content banks, instrumentation and Trajectory
— and per `CLAUDE.md` no phase starts before the previous one's acceptance
passes and Mat signs off. Planning now, building when scheduled.

---

## 0. How to use this doc

Read §1–§3 for what v1 accounts are (and deliberately are not). §4–§6 are the
engineering plan; §7 is the **binding** consent/data-protection posture — the
part `BUSINESS_PLAN §13` and `SPEC §17` say must be built as a deliberate
step, not drifted across. §9 lists the open decisions with recommendations;
§10 is the build sequence with acceptance criteria. Nothing in §4–§6 starts
until the §9 stack decisions are made; nothing stores identified health data
until the §7 gate items exist.

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
| Manual biomarker entry, then blood-test auto-population (D3) | DASHBOARD §3.3, §11.4 | E0 + §7 + partner/Mat call |
| Bloodwork upload & extraction | PROFILE §4 | E0 + §7 + its own threat model |
| Body-composition estimator (18+, ephemeral) | CONTENT-looksmaxxing §6 | E0 + §7 + §6.3 guardrails |
| Premium tier (persistence & depth) | MONETISATION | E0 + the §4 model decision |
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
   MONETISATION §4 model is decided (`STATUS.md §4` blocking decision #1).
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

- **Sign-in**: passwordless **magic link** (email) first; optional social
  sign-in per the §9.1 decision. No passwords stored, ever (smaller breach
  surface, fits the privacy moat, and this audience lives in email anyway).
- **Account storage**: per-user copies of the existing store documents
  (history, dashboard vitals + metric points, daily streaks/results, pulse
  likes/saves) with the documented merge-on-first-login strategies (§6.2).
- **Consent flow**: the §7.2 granular health-data consent, separate from
  account creation.
- **Data controls, day one**: view, export (JSON), revoke consent,
  **delete everything** — first-class on the account page, not buried.
- **Surfaces**: `/signin`, `/account`, the nav account entry, the signed-in
  dashboard state (DASHBOARD §7), and the "keep this number" prompts wired
  to real sign-up.

### 3.2 Explicitly NOT in v1 (each has its own gate)

- **Biomarker/blood values** — the server **rejects** non-empty `biomarkers`
  arrays until D3's gate is signed off (§6.4). The schema field exists; the
  crossing is deliberate.
- **Premium/tier logic, payments** — blocked on MONETISATION §4.
- **Profile auto-populate** — the next milestone (PROFILE §9.2), built on
  this foundation.
- **Leaderboards, challenges, any cross-user surface** (ROADMAP E4).
- **Bloodwork upload/extraction; the photo estimator** — later, shared
  server surface + threat model (PROFILE §4; CONTENT-looksmaxxing §6).
- **Passkeys** — attractive fast-follow, kept out of v1 to keep the first
  ship small (§9.1).

---

## 4. Auth architecture

### 4.1 Methods

**Magic link (email) is the primary path.** Optional additions, per §9.1:
Google OAuth (free, huge coverage) and Sign in with Apple (fits the
privacy-minded audience and iOS share; needs the Apple Developer Programme,
~$99/yr — a real ops cost to accept). Web-only, so Apple's app-store
sign-in mandate does not apply; Apple is a choice, not an obligation.

### 4.2 Library — self-hosted only

A hosted identity SaaS (Clerk etc.) is **ruled out on posture**: it puts a
third-party script on pages, a per-MAU bill on a free feature, and — the
real disqualifier — a third-party processor between the user and a site
whose moat is "your data stays yours". Auth must run in our own Next.js app
against our own database.

Two credible candidates (both free, self-hosted, DB-backed; **either is a
new dependency and needs Mat's approval per CLAUDE.md**):

| | **Better Auth** (recommended) | **Auth.js / NextAuth v5** (conservative) |
|---|---|---|
| Shape | TypeScript-first auth framework; owns its schema via CLI migrations | The long-standing Next.js auth library + DB adapter |
| Magic link | First-class plugin | Email provider built-in |
| Passkeys/2FA later | Plugins exist | Possible, more assembly |
| Rate limiting | Built in | Bring your own |
| Maturity | Newer, very active, strong momentum | Huge install base, slower-moving |

Recommendation: **Better Auth**, verified at A0 for current maintenance
health; Auth.js is the fallback if anything smells off. Decision §9.2.

### 4.3 Sessions

Database-backed sessions with an httpOnly, Secure, SameSite=Lax cookie
(library default in both candidates). Sessions revocable server-side
(sign-out-everywhere on the account page). The session cookie is strictly
necessary under PECR — no consent banner interaction — but is documented in
the cookie policy (§7.6).

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
authed, rate-limited, size-capped (§6.4). CSRF/session fixation:
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

Recommendation: **Neon via the Vercel integration**, region **UK (London)
or EU (e.g. Frankfurt) — verified at setup** and recorded in the §7.5
posture. Vercel function regions pinned to match (e.g. `lhr1`/`fra1`) so
personal data isn't processed in the US by default. Decision §9.3.

### 5.2 Schema (small, deliberately)

```
users / sessions / verification …    ← library-owned tables
store_documents (
  user_id, namespace,                ← "history" | "dashboard" | "daily" | "pulse"
  version int, doc jsonb,
  updated_at timestamptz,
  PRIMARY KEY (user_id, namespace)
)
consents (
  user_id, kind,                     ← "health-storage" (v1's only kind)
  granted_at, revoked_at, policy_version
)
```

**One JSON document per store per user** — the same shape the local stores
already serialise, so "the local document is what gets uploaded and adopted
server-side" (DASHBOARD §5.5) is literally the implementation. No relational
modelling of individual metrics in v1: Trajectory charts client-side from
the document, and a real table can be introduced at D3 if biomarkers need
one. Encryption at rest is provider-level (both candidates); DB credentials
and email-provider keys are server-side env only.

### 5.3 Email delivery

Magic links need transactional email. Phase 1 already owes a double-opt-in
provider for `EmailCapture`/newsletter — **pick once, serve both** where
possible (e.g. Resend or Postmark for transactional; the newsletter can sit
on the same provider or a dedicated one later). Decision §9.4. Sender domain
(`tools.fit`) needs SPF/DKIM set up as part of A1.

---

## 6. Sync — promoting the seam

### 6.1 Model

**Pull → merge → write-local → push** on sign-in; **debounced push** (~2 s)
on local change, subscribed to the change events every store already emits;
**pull-if-newer** (per-document `updated_at`) on page load with a session.
Last-write-wins per document after the deterministic first-login merge —
at one-user-few-devices scale, document LWW + set-union is honest and
sufficient; no CRDTs. Offline or failed pushes retry on the next
change/load; the device's local copy always keeps working (principle §2.2).

### 6.2 First-login merge (already specified per store — build to these)

| Namespace (key) | Contents | Health-flavoured? | Merge strategy (source) |
|---|---|---|---|
| `history` (`fittools.history.v1`) | per-tool SI results | **yes** | union by (tool, local day), latest of day wins, 30/tool cap (history.ts rules) |
| `dashboard` (`fittools.dashboard.v1`) | vitals, metric points; biomarkers **empty in v1** | **yes** | vitals: latest `updatedAt` wins; metrics: union by (metric, savedAt), per-metric cap (DASHBOARD §5) |
| `daily` (`fittools.daily.v1`) | results, streak, freezes | no | union results by date; `max(current, best)`; larger freeze balance (DAILY-GAMES §8) |
| `pulse` (`fittools.pulse.v1`) | likes, saves, seen, affinity | no | union the monotonic sets; last-write-wins affinity (PULSE §6) |

Arcade bests (`fittools.*.best`) and the unit preference are cosmetic
singles — v1.1 candidates, not worth v1 surface (§13.1). Merge functions are
**pure and unit-tested** beside the store cores they extend.

### 6.3 The engine

`src/lib/account-sync.ts`: a lazy-loaded module that (a) knows the four
namespaces and their merge functions, (b) subscribes to the four change
events, (c) talks to the API below. No calculator, game or store caller
changes — the seam keeps its promise.

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
code**: a `dashboard` document with a non-empty `biomarkers` array is
rejected until D3 is signed off. Health-flavoured namespaces (`history`,
`dashboard`) additionally require an active `health-storage` consent row —
no consent, no write, HTTP 403 (§7.2).

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
   plain-language step**, shown at first sync — not fine print, per the
   CONTENT-looksmaxxing §6.3 convention: what's stored (your saved results
   and the vitals you enter), where (named region), that it follows the
   account until deleted, and the one-click outs. Until granted: the
   account works, `daily`/`pulse` sync, `history`/`dashboard` stay
   local-only. Revoking deletes the server copies and keeps local ones.
3. **User controls, first-class on `/account`**: view what's held, export
   (portability, one JSON), revoke consent, **delete everything** (erasure —
   immediate hard delete of documents, consents and the account; e2e-tested).
4. **Published posture** before launch: privacy-policy update (the
   blood-test page already promises it), naming storage location/region,
   encryption at rest, the processor list (Vercel, DB provider, email
   provider — DPAs on file), retention (§9.6), and the §2.7 never-sold /
   never-trained commitment.
5. **Operational duties (Mat, at A0):** confirm/pay the **ICO registration
   fee** (UK controller); run a lightweight **DPIA** for the health-data
   store (required territory for special-category processing at scale, and
   the right discipline regardless); records-of-processing entry.
6. **PECR/cookies:** the session cookie is strictly necessary (exempt, but
   documented). No analytics or marketing attaches to account identity; the
   existing consent-mode gating is unchanged, and account events (§8.4)
   carry no health data.
7. **Minors.** The audience skews young (CONTENT-looksmaxxing §1.5). UK
   ISS consent floor is 13; given health-flavoured storage the cautious
   line is **16+** (§9.5, Mat's call). Self-declared age gate at sign-up,
   plainly worded; the 18+ affirmation for the estimator remains its own
   separate, later gate.
8. **Hygiene rules:** account ids/emails never in URLs or query strings;
   no health values in logs or error reports; documents never sent to any
   third party or model; age derived, never stored (existing rule).

---

## 8. Surfaces & UI (DESIGN.md language, no new vocabulary)

1. **`/signin`** — one card: email field → "check your email" state; social
   buttons if enabled. Own chunk; noindex.
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
5. **Dashboard signed-in state** (DASHBOARD §7) — same view, synced store;
   a one-line "synced to your account · region" provenance in settings.
6. **States that must render cleanly:** signed-out (unchanged), signed-in
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

## 9. Decisions needed from Mat (with recommendations)

1. **Auth methods.** Recommend: magic link at launch + Google; **Apple
   optional** (worth it for this audience if the $99/yr and setup are
   acceptable). Passkeys as a fast-follow, not v1.
2. **Auth library.** Recommend **Better Auth** (verify maintenance health at
   A0); fallback Auth.js. Either is a new dependency → explicit approval
   (CLAUDE.md).
3. **Database + region.** Recommend **Neon via Vercel, London (or
   Frankfurt)**, function region pinned to match. Alternative: Supabase
   (London).
4. **Email provider** for magic links — and whether it doubles as the
   Phase 1 newsletter/double-opt-in provider (one decision closing two
   items). Recommend Resend or Postmark for transactional.
5. **Age line.** 13 (legal floor) vs **16+ (recommended)** vs 18+ for
   account creation.
6. **Retention.** Recommend: keep while active; inactive-account expiry
   (e.g. 24 months → warning email → delete) as the stated policy; deletion
   requests immediate. Feeds DASHBOARD §13.4.
7. **Monetisation model** (already `STATUS.md §4` #1). Not a blocker for
   free accounts — **is** the blocker for any tier design. Deciding it
   before A3 lets the account page ship with the right long-term framing.
8. **Timing.** Confirm accounts remain Phase 4 (after banks →
   instrumentation → Trajectory), or pull forward deliberately. This doc
   just needs to be ready either way.

---

## 10. Build sequence & acceptance criteria

Gates per CLAUDE.md: typecheck + tests green before every commit; each step
needs Mat's sign-off before the next.

### A0 — Decisions & posture groundwork *(no code)*
§9 decisions made; DPIA + ICO check done; privacy/cookie policy drafts
updated; providers provisioned (DB region verified, email domain
authenticated). **Accept:** every §7 item has an owner and a draft.

### A1 — Auth foundation
Library + DB wired; magic-link flow; `/signin`, `/account` (with working
**delete-all** and export from day one — they are simplest before there's
data); nav probe; session e2e (Playwright, using a dev-mode mail catcher or
provider test inbox). **Accept:** sign-up → sign-in → sign-out → delete-all
round-trips in e2e; signed-out output byte-identical; tool pages still
static; zero third-party requests signed-out; JS budget passes; axe clean.

### A2 — Sync engine + consent
`store_documents` API + `account-sync.ts`; the four merge functions (pure,
≥3 vectors each incl. the documented daily/pulse strategies); the
health-storage consent step gating `history`/`dashboard` writes (403
without it); biomarker-rejection guard; export includes all namespaces.
**Accept:** first-login merge vectors pass; two-device LWW behaves; consent
revoke deletes server copies; a non-empty biomarkers array is rejected;
size caps enforced.

### A3 — Surface integration (Dashboard D2 complete)
Signed-in dashboard state; save-prompts wired; analytics events; docs
updated (STATUS.md, DASHBOARD.md D2, PROFILE.md pointer, README env vars
for the new secrets). **Accept:** DASHBOARD §12 D2 criteria; e2e for the
signed-in dashboard; Lighthouse budgets unchanged.

**Then, separately gated:** PROFILE §9.2 (manual profile + auto-populate) as
the next milestone on this foundation; D3 biomarkers behind its own §7
sign-off; premium behind the MONETISATION decision.

---

## 11. Out of scope (v1)

Everything in §3.2, plus: username/handles and public profiles; avatars;
account-to-account anything; email marketing by default (newsletter remains
its own double-opt-in); admin dashboards (the DB console suffices at this
scale); SSO/2FA (fast-follow candidates with passkeys).

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
- **Trust optics.** The site's trust line has been "nothing stored, nothing
  sent". *Mitigation:* that stays literally true signed-out; the account
  pitch is the honest inverse ("stored only for you, deletable in one
  click"), and §2.7 is published policy.
