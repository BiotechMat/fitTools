# ACCOUNTS-DPIA.md — Data protection impact assessment (WORKING DRAFT)

**Status (2026-07-24): DRAFT for Mat's review and sign-off — an A0
deliverable (ACCOUNTS.md §7.5).** Written to the ICO's DPIA structure,
sized honestly for what v1 actually does. Sign-off on this document — plus
the ICO registration fee and the live privacy-policy update — completes the
paperwork half of the A0 gate. This draft is a working paper, not legal
advice; have it checked if in doubt.

---

## 1. What the processing is

FitTools (sole trader: Mathew Beale, UK) adds optional, free user accounts
to an otherwise stateless calculator site. An account stores: an email
address (login handle), a self-declared age band (13–15 / 16–17 / 18+ —
never a date of birth), session records, consent records, and — per user,
per surface — JSON documents mirroring what the site already keeps in the
browser: calculator results, dashboard vitals and metric points, daily-game
streaks, Pulse likes/saves, arcade bests, saved supplements ("stack"),
saved exercises, bookmarked tools, unit preference. Blood-test biomarker
values are **excluded** in v1: the server rejects them; the `bloodwork`
namespace ships later behind its own consent and an update to this DPIA.

Purpose: let a user keep their own numbers across devices. No advertising
use, no profiling, no automated decision-making, no sale or sharing, no
model training. Lawful bases: **contract** (account basics — email,
session, age band, the non-health documents the user chooses to sync);
**explicit consent** (Art 9) for the health-flavoured documents
(calculator results, vitals, supplement stack), captured as its own
plain-language step, versioned, revocable — revocation deletes the server
copies.

## 2. Necessity & proportionality

- The site works fully without an account (local-first); accounts are
  opt-in additive persistence — the minimum data needed for the stated
  purpose, and nothing else (no name, no DOB, no marketing default).
- Special-category treatment is applied *broadly on purpose*: calculator
  estimates a user typed become health-related once linked to an
  identity, so they sit behind explicit consent even where arguable.
- Retention: while the account is active; 24-month inactivity expiry with
  a warning email at 22 months; erasure immediate on request. Provider
  point-in-time backups retain deleted data ~7 days (disclosed; never
  restored to resurrect an account; re-deleted after any DR restore).

## 3. Children (ICO Children's Code conformance)

Accounts open at 13+ (self-declared band). Conformance choices: high
privacy by default (nothing syncs beyond what the user saves; no
profiling, no behavioural ads — under-18s get non-personalised ad serving
if/when free-tier ads activate); health-flavoured storage is **never
offered below the 16–17 band** and the server enforces band + consent
together; transparency is plain-language at the point of action, not
fine print; no nudge techniques (no streak-shaming, no countdowns, no
paid play-limits — binding product principles predating this feature);
the games' arcade monetisation is extras-only, never limits. Risk of
false age declaration: mitigated by the low-risk default tier (an
under-16 claiming 18+ gains only health-value storage of numbers they
themselves type; no contact features, no visibility to others exist).

## 4. Processors & transfers

| Processor | Role | Data touched | Region |
|---|---|---|---|
| Vercel | Hosting, serverless functions | request traffic, env secrets | functions pinned London/Frankfurt |
| Neon | Postgres (all account data) | everything in §1 | London preferred, else Frankfurt — recorded at provisioning |
| Resend | Transactional email | email address, sign-in links | EU processing configuration at setup |
| Google / Apple | Optional OAuth identity | email, provider id (only if the user chooses them) | per their DPAs |

DPAs collected at provisioning; no other third party receives any account
data. No transfers outside UK/EEA in the primary flow; OAuth providers'
standard mechanisms apply only when a user elects them.

## 5. Risks & mitigations (the register)

| Risk | Likelihood/impact | Mitigation |
|---|---|---|
| Account-data breach exposing health-flavoured numbers | low / high | no passwords held; DB encryption at rest; secrets server-side; least data stored; rate-limited endpoints; documents are user-typed estimates, not clinical records |
| Silent cross-device data loss (integrity) | low / medium | conditional writes + merge-on-conflict (tested); local copy always survives |
| Under-16 reaching health storage | low / medium | server enforces band+consent together; consent never shown below 16–17 |
| Email account compromise → account takeover | medium / medium | inherent to email-based auth; 15-min single-use links, sessions revocable ("sign out everywhere"), no payment data held |
| Erasure incompleteness | low / medium | explicit multi-table hard delete; backup tail disclosed and bounded |
| Function/DB region drift to US | low / medium | regions pinned and recorded; checked at provisioning |

## 6. Rights & controls (built, not promised)

View (export includes everything), portability (one JSON), erasure
(typed-confirmation delete on /account, immediate), consent withdrawal
(one click; deletes gated server copies), objection/complaints route via
the privacy policy (ICO named as supervisory authority).

## 7. Sign-off

- [ ] DPIA reviewed and accepted (Mat) — date: ______
- [ ] ICO registration fee confirmed paid / exemption checked — date: ______
- [ ] Privacy + cookie policy updates live before first real sign-up — date: ______
- [ ] Region + processor list confirmed as provisioned (§4 table) — date: ______
- [ ] Revisit trigger noted: the `bloodwork` namespace, the extractor, the
      estimator, premium payments, or any new processor each reopen this
      document before go-live of that feature.
