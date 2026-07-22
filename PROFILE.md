# PROFILE.md — Health profile & bloodwork (auto-populate)

Companion to `SPEC.md` (the build), `ROADMAP.md` (E0 accounts, E2 the return
engine), `MONETISATION.md` (persistence is the premium product), `METHODOLOGY.md`
(evidence/units discipline), `DESIGN.md` (§6 retention surfaces) and
`CONTENT-looksmaxxing.md` (§6 the sensitive-data precedent). Defines a **user
health profile**: a place to enter personal metrics and upload bloodwork once, so
those values **auto-populate every relevant calculator**.

**Status (2026-07-23): BLUEPRINT — not built, not signed off.** The profile
depends on accounts (`ROADMAP.md E0`); the **bloodwork upload/extraction is gated
on the data-protection posture in §7**, which is binding, not advisory. Metrics
entry (anthropometrics/lifestyle) is the lighter first slice; biomarker storage
and file upload are the resourced, sensitive step. Build order in §9.

---

## 1. What it is & why it belongs

**One page where a signed-in user records who they are, physiologically** —
age, sex, height, weight, activity, and their blood-panel biomarkers — plus an
**upload for a bloodwork report** (PDF/photo) whose values are extracted and, after
the user confirms them, saved to the profile. Those saved values then **pre-fill
the inputs of every calculator that uses them**: enter your numbers once, and
Heart Age, Phenotypic Age, TDEE, BMI, the composite indices and the rest open
already filled in.

Strategic fit:
- **This is the persistence premium sells** (`MONETISATION.md §2–§3`,
  `DESIGN.md §5–§6`, `ROADMAP.md E2`). A saved profile that makes every tool
  one-tap is exactly the "depth and persistence" the subscription gates — never
  the calculation itself, which stays free.
- **The retention keystone.** A stored profile + "since last time" deltas
  (`DESIGN.md §6`) turns one-off calculator visits into a longitudinal habit
  (`ROADMAP.md E2` Trajectory) — the safest, strongest motivator.
- **Convenience compounds trust.** The credibility moat plus "we already did the
  data entry for you" is a strong, honest reason to sign in.

---

## 2. Scope — the two capabilities

1. **Profile metrics (manual).** Structured fields the user types or edits:
   anthropometrics (age, sex, height, weight), lifestyle flags (smoking, on
   BP/statin meds, diabetes, activity level), and blood biomarkers entered by
   hand. Lighter data-protection weight than uploaded files, but biomarkers are
   still health data (§7).
2. **Bloodwork upload (extraction).** Upload a lab report; the server extracts the
   biomarker values; **the user reviews and confirms every value before anything
   is saved** (§4). The heavier, gated capability.

Both feed one **canonical profile record** the calculators read from (§3).

---

## 3. Data model — canonical SI, provenance-tracked

The profile is a single versioned, per-account document — the same local-first,
sync-ready shape as `history.ts` / `pulse-store.ts`, promoted to server storage at
`ROADMAP.md E0`.

- **Canonical units are SI**, matching `src/lib` and the calculator configs
  (`*-calculator.shared.ts`): `glucoseMmolPerL`, `totalCholMmol`, `hdlMmol`,
  `systolicBp`, `egfr`, `weightKg`, `heightCm`, `ageYears`/date-of-birth, etc.
  Conversion happens only at the UI edge (`UnitInput.tsx`, `SPEC.md §6`), so the
  profile never stores an ambiguous unit.
- **Every field carries provenance**: `{ value, unit, source: "manual" |
  "bloodwork", measuredOn?: ISODate, enteredOn: ISODate }`. Age of a value
  matters (a two-year-old cholesterol is context, not current truth), so the UI
  shows it ("HDL 1.3 mmol/L · bloodwork 12 Mar").
- **Validated against the same ranges** the calculators already enforce
  (`HEART_AGE_LIMITS`, `PHENOAGE_LIMITS`, the Zod schemas) — an out-of-range
  extracted value is flagged for the user, never silently stored.
- **Not a medical record.** It's a convenience cache of user-provided numbers,
  framed as such in-UI and in the privacy policy (§7, §8).

### 3.1 Biomarkers worth capturing (they already drive tools)
Derived from the existing calculator inputs, so the mapping is real today:
`ageYears`, `sex`, `weightKg`, `heightCm`; total & HDL cholesterol, systolic BP,
eGFR, fasting glucose, HbA1c; albumin, creatinine, CRP, lymphocyte %, MCV, RDW,
ALP, WBC (the Phenotypic Age panel); ApoB, Lp(a) (Heart Age context); plus the
lifestyle flags (smoking, diabetes, BP/statin meds). One panel populates
Heart Age, Phenotypic Age, the composite indices, and the basic anthropometric
tools at once.

---

## 4. Bloodwork upload flow (the extraction contract)

Bloodwork is uploaded as a PDF or photo and processed **server-side** (the same
server/AI-API scope now in play — `SPEC.md §2, §17`; `CONTENT-looksmaxxing.md §6`
is the precedent). The contract that protects correctness:

1. **Extract, then require human confirmation.** The extractor returns
   `{ marker, value, unit, confidence }` proposals; the user is shown every
   proposed value beside the source snippet and **must confirm or correct each**
   before it enters the profile. **No extracted value is ever saved — or fed to a
   calculator — unsupervised.** A hallucinated glucose flowing into Heart Age is a
   trust incident of the worst kind; the same anti-fabrication discipline as
   `PULSE.md §1.1` and METHODOLOGY applies — the model proposes, the human ratifies.
2. **Unit + range sanity.** Extracted values are normalised to SI and checked
   against the calculator ranges (§3); anything implausible is surfaced for
   correction, never auto-accepted.
3. **Minimise what's kept.** By default the **uploaded file is discarded after
   extraction** — only the confirmed structured values persist. Keeping the
   original is an explicit opt-in with its own retention note.
4. **Degrade safely.** No extraction service configured, or a low-confidence
   read → fall back to manual entry. The feature never blocks the profile.

---

## 5. Auto-populate mechanism

- A **profile → calculator-input mapping** keyed by the canonical SI field names
  the configs already use. Where a calculator input matches a profile field, the
  calculator initialises from the profile instead of the static default.
- **Profile is a default, never a lock.** Every prefilled field stays fully
  editable; changing it in a tool does not silently rewrite the profile (an
  explicit "save back to profile?" affordance does). The calculators remain
  usable, unchanged, for signed-out users — profile is purely additive.
- **Transparency on medical-flavoured inputs.** A prefilled clinical value shows
  its provenance inline ("from your profile · bloodwork 12 Mar"), so the user
  always knows what fed a Heart Age or PhenoAge result.
- **Reuses existing architecture:** the registry's `.shared.ts` constants and the
  SI canon mean the mapping is a thin layer, not a rewrite. No calculator logic
  changes; they gain an optional initial-values source.

---

## 6. UI

- **`/profile`** (signed-in): sectioned form — Basics, Lifestyle, Bloodwork —
  each field with its unit toggle, provenance and "measured on" date. v2 system
  (`DESIGN.md`); zero-CLS.
- **Bloodwork upload panel:** picker → extraction progress → **confirmation
  table** (proposed value · source snippet · accept/correct) → save. A clear,
  pre-picker notice: what's sent, that the file isn't kept by default, and the
  non-diagnostic framing (never fine print — `CONTENT-looksmaxxing.md §6.3`
  convention).
- **In-calculator cue:** a small "prefilled from your profile" chip on tools that
  drew from it, with a one-tap "edit profile".
- **Full data controls:** view / edit / export (machine-readable) / **delete
  everything**, prominent, not buried (§7).

---

## 7. Data protection — BINDING gates

Biomarkers and bloodwork are **special-category-adjacent health data under UK
GDPR** — a categorical step beyond the stateless numbers the site handles today.
This is the "stateless → stored/processed health data" line that
`BUSINESS_PLAN.md §13` and `CONTENT-looksmaxxing.md §6.2` say to treat as a
deliberate, resourced move. All of the following bind before any biomarker is
stored:

1. **Explicit, granular consent** to store health data and (separately) to send an
   upload for extraction — plain-language, before the action, revocable.
2. **Encryption at rest**; secrets/keys server-side only; the extraction endpoint
   rate-limited with its own threat model (first sensitive server surface).
3. **Data minimisation.** Store confirmed structured values, not raw files by
   default (§4.3). Documented retention; nothing kept "just in case".
4. **User-controlled lifecycle.** View, edit, export and **one-click delete-all**
   are first-class, honoured server-side (right to erasure).
5. **Never sold, never shared, never used to train models.** Stated in the privacy
   policy and enforced; the profile exists only to serve the user their own tools.
6. **Minor-aware** (audience skews young — `CONTENT-looksmaxxing.md §1.5`):
   age-gating and extra caution where a value or feature has an age dimension.
7. **Not medical advice, not a diagnosis.** The profile and every auto-populated
   result keep the existing non-diagnostic disclaimers; the profile is explicitly
   "your numbers, for your convenience", not a health record or a substitute for a
   clinician.

Ship the feature **because of** these guardrails, never without them — the same
posture as the `CONTENT-looksmaxxing.md §6` estimator.

---

## 8. Guardrails & principles

- **Free to use, premium to persist** (`MONETISATION.md`): using a calculator and
  entering values ad-hoc stays free; the *saved, auto-populating profile* is the
  premium/account layer. The answer is never gated.
- **The model proposes, the human ratifies** — no unconfirmed extracted value
  reaches a calculator (§4.1).
- **Transparency over magic** — prefilled values always show provenance (§5).
- **British English; zero-CLS; no new dependencies without asking** (CLAUDE.md).

---

## 9. Sequencing (build when scheduled)

1. **Accounts + storage (`ROADMAP.md E0`)** — the profile has no home without them;
   promote the local-first store to per-account server storage.
2. **Manual profile + auto-populate** — the metrics form and the profile→input
   mapping. This alone delivers most of the value (one-time entry, every tool
   prefilled) with the lighter data-protection weight of user-typed values.
3. **Bloodwork upload + extraction** — the gated, sensitive capability, on top of
   the §7 posture and the §4 confirmation contract. The extractor is the one new
   server surface; sequence it with the accounts/data-protection work, alongside
   the `CONTENT-looksmaxxing.md §6` estimator (shared infrastructure and threat
   model).
4. **Trajectory tie-in (`ROADMAP.md E2`)** — dated profile values become the
   longitudinal series the return engine charts.

Until built, the calculators remain fully usable client-side with manual entry
per visit; the profile is additive, never a prerequisite.

---

## 10. Out of scope (v1)

- A medical records system, clinician sharing, or any diagnostic interpretation
  beyond the existing tool outputs.
- Auto-interpreting bloodwork ("your CRP is high") beyond feeding the existing,
  cited calculators — no new medical claims.
- Storing raw uploaded files by default, or any secondary use of health data
  (training, analytics, sale) — never.
- Auto-populating without the user seeing the value (§4.1, §5).
