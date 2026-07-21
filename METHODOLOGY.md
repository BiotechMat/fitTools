# METHODOLOGY.md — Longevity & Health Scoring

Companion to `SPEC.md` and `ROADMAP.md`. This document is the authoritative
reference for every calculated health/longevity metric on the site. It defines
two layers:

- **Layer 1 — Published formulas.** Peer-reviewed models implemented faithfully.
  These are the credibility bedrock. The maths is not ours; correctness is
  non-negotiable.
- **Layer 2 — Open composite indices.** Original, transparent, versioned scores.
  The formulas ARE ours, and the entire product value is that we publish them in
  full rather than hiding them like the incumbents (WHOOP, Oura, InsideTracker).

> **How to use this doc:** Layer 1 sections give the model form and the primary
> source. Where numeric coefficients appear, they are a *reference to verify* —
> see §1. Do not ship a Layer 1 formula until its worked example (§7) passes.

---

## 1. Non-negotiable principles

1. **Never trust a transcribed coefficient — including the ones in this file.**
   Reproductions of these formulas on blogs and in libraries contain known
   errors. For every Layer 1 formula, transcribe coefficients from the primary
   source (paper supplement or the authors' own published code), record the exact
   source URL in the tool config's `sources`, and prove correctness with a
   reproduced worked example (§7). The values printed here are a starting point
   and a cross-check, not an authority.
2. **No medical advice, no diagnosis, no treatment guidance.** Every metric is an
   *estimate*. Copy never tells a user to start, stop, or change a medication,
   never assigns a disease, and never issues a mortality/"death-date" figure.
3. **Honest presentation.** A composite score never appears as a bare headline
   number. It always renders with its full sub-score breakdown (radar), its
   formula, its weights, and a "what this is / what it isn't" panel.
4. **Safety over engagement.** No score rewards extreme restriction. Body-
   composition inputs are capped in weight and are never the dominant term in any
   index (see §4.8). Anything that could tip a vulnerable user toward disordered
   behaviour is out.
5. **Clinical inputs get clinical framing.** Tools that take blood-panel or
   blood-pressure inputs (§3.1, §3.3) carry the enhanced disclaimer and a
   prominent "discuss with your clinician" line, and must not present results as a
   substitute for medical assessment.

---

## 2. Shared conventions

- **Internal units are SI** (per `SPEC.md` §6). Convert at the input boundary
  only. Every clinical formula below states the exact unit each coefficient
  expects — mismatched units are the single most common failure mode.
- **Rounding:** round only at display. Carry full precision through the maths.
- **Input validation:** every input has a Zod schema with a plausible clinical
  range; out-of-range values are rejected with a clear message, never silently
  clamped into the formula (except documented flooring, e.g. CRP, see §3.1).
- **Provenance:** every reference table (norms, percentiles, life-expectancy
  tables) is cited with source and date in the config.

---

## 3. Layer 1 — Published formulas

### 3.1 Blood-based biological age — *Phenotypic Age*

**Source:** Levine ME et al., "An epigenetic biomarker of aging for lifespan and
healthspan," *Aging* 2018 (the **clinical** Phenotypic Age, derived originally in
Levine 2013, *J Gerontol A*). Use the 9-biomarker clinical version — NOT the DNA
methylation clock, which requires methylation data.

**Why it matters:** this is the accessible on-ramp to the biological-age wave.
The nine markers come from a standard metabolic panel + CBC + hs-CRP that many
users already have.

**Inputs and the exact units the coefficients expect:**

| Biomarker | Coefficient unit | Common lab unit | Conversion to formula unit |
|---|---|---|---|
| Albumin | g/L | g/dL (US) | × 10 |
| Creatinine | µmol/L | mg/dL (US) | × 88.42 |
| Glucose (fasting) | mmol/L | mg/dL (US) | ÷ 18.0182 |
| C-reactive protein | mg/dL, then **natural log** | mg/L (UK) | ÷ 10, then `ln` |
| Lymphocyte | % | % | — |
| Mean corpuscular volume | fL | fL | — |
| Red cell distribution width | % | % | — |
| Alkaline phosphatase | U/L | U/L | — |
| White blood cell count | 10⁹/L (1000 cells/µL) | 10⁹/L | — |
| Chronological age | years | years | — |

**Model form (three stages):**

1. Linear combination:
   `LinComb = b0 + Σ (coef_i × marker_i) + coef_age × age`
2. 120-month mortality score (Gompertz):
   `Mort = 1 − exp( −exp(LinComb) × (exp(γ·120) − 1) / γ )`
3. Phenotypic Age:
   `PhenoAge = 141.50225 + ln( −0.00553 × ln(1 − Mort) ) / 0.090165`

**Reference coefficients — VERIFY every digit against the primary source:**

```
b0 (intercept)                 = -19.9067
albumin (g/L)                  =  -0.0336
creatinine (µmol/L)            =  +0.0095
glucose (mmol/L)               =  +0.1953
ln(CRP) (mg/dL)                =  +0.0954
lymphocyte (%)                 =  -0.0120
mean corpuscular volume (fL)   =  +0.0268
red cell distribution width(%) =  +0.3306
alkaline phosphatase (U/L)     =  +0.00188
white blood cell count (10⁹/L) =  +0.0554
age (years)                    =  +0.0804
γ (Gompertz)                   =   0.0076927
```

**Implementation notes:**
- CRP: clamp to a small positive floor before `ln` (e.g. 0.01 mg/dL) so a
  reported CRP of 0 doesn't blow up. Document the floor on-page.
- Because a single wrong constant yields a silently plausible-but-wrong "age,"
  the §7 worked example is mandatory before ship.

**Output framing:** report Phenotypic Age alongside chronological age and the
delta. Frame the delta as "associated with" outcomes at population level. Clinical
disclaimer (§1.5). No advice to act on the number.

---

### 3.2 Fitness Age (non-exercise VO₂max)

**Source:** Nes BM et al., "Estimating VO₂peak from a nonexercise prediction
model," *Med Sci Sports Exerc* 2011 (HUNT Fitness Study). This is the actual
published basis for the popular "fitness age" / "World Fitness Level" tool.

**Inputs:** sex, age, waist circumference (cm), resting heart rate (bpm), and a
physical-activity index derived from self-reported weekly frequency, duration, and
intensity of exercise.

**Model form:** sex-specific multiple linear regression estimating VO₂peak
(mL·kg⁻¹·min⁻¹). "Fitness Age" is then the chronological age at which the
population-average VO₂peak equals the user's estimated VO₂peak — i.e. invert a
reference VO₂peak-by-age curve (also from the HUNT cohort).

**Coefficients — DO NOT transcribe from memory.** Take the two sex-specific
equations, the physical-activity index coding, and the reference VO₂peak-by-age
curve directly from the Nes 2011 paper. Record the source in config. Reproduce the
paper's example estimate as the §7 test.

**Output framing:** estimated VO₂max + fitness age + age/sex percentile band.
Present VO₂max as an estimate from a non-exercise model (accuracy is lower than a
lab test); do not imply measured precision.

---

### 3.3 Heart Age (cardiovascular risk age)

**Source (preferred):** AHA **PREVENT** equations (Khan SS et al., *Circulation*
2023–2024). This is the current standard and underlies the direction of the 2026
ACC/AHA guidelines, so it is the right modern choice.
**Fallback (simpler):** Framingham general CVD "heart age" (D'Agostino 2008).

**Inputs (PREVENT base):** age, sex, total & HDL cholesterol, systolic BP, BP-
treatment status, smoking, diabetes, eGFR, BMI. Optional enhancers: HbA1c, urine
albumin-creatinine ratio, deprivation index.

**Model form:** compute predicted 10-year (and optionally 30-year) CVD risk, then
derive "heart age" as the age at which a reference (optimal-risk-factor) profile
produces the same predicted risk.

**Coefficients:** transcribe the sex-specific PREVENT coefficients from the
published supplement. Validate by matching the AHA's own online PREVENT calculator
output for several profiles (§7).

**2026-guideline nuance — important:** ApoB and Lp(a) are risk-enhancers in the
2026 guidance but are **not** inputs to the PREVENT equations. Display them as
*context alongside* the heart-age result (with the guideline threshold context),
never folded into the risk maths. This keeps the model faithful while riding the
"know your ApoB" awareness wave. Provide a separate, clearly-labelled ApoB/Lp(a)
target-vs-actual reference panel rather than inventing a combined score.

**Output framing:** heart age + predicted risk band. Clinical disclaimer (§1.5).
No treatment guidance; risk-enhancer context is educational only.

---

### 3.4 Lifestyle life-expectancy estimate

**Source:** Li Y et al., "Impact of Healthy Lifestyle Factors on Life Expectancies
in the US Population," *Circulation* 2018.

**Inputs:** the five low-risk factors as defined in the paper — never smoking,
healthy BMI band, ≥30 min/day moderate-to-vigorous activity, moderate alcohol,
high diet quality.

**Model form:** a lookup, not a regression on the individual. Map the user's count
(and combination) of low-risk factors to the published projected life-expectancy-
at-50 tables (sex-specific).

**Values:** transcribe the life-expectancy tables directly from the paper.

**Output framing — critical:** this is a **population-level association**, framed
as "people with these habits lived, on average, X years longer in this cohort."
It is explicitly **not** a personal life-expectancy prediction and must never be
presented as one. This framing is the difference between a credible tool and an
irresponsible one.

---

### 3.5 CGM metabolic metrics

**Sources:** international CGM consensus (Battelino T et al., *Diabetes Care* 2019)
for time-in-range and %CV; Bergenstal RM et al., *Diabetes Care* 2018 for GMI.
These are standardised and safe to state with confidence (still cite them).

**Inputs:** a CGM data export (timestamp, glucose). Support mg/dL and mmol/L.

**Metrics:**
- **Mean glucose.**
- **Glucose Management Indicator (GMI, %)** = `3.31 + 0.02392 × mean glucose(mg/dL)`.
  (If input is mmol/L, convert: mg/dL = mmol/L × 18.0182.)
- **Glucose variability** = coefficient of variation `%CV = (SD / mean) × 100`.
  Consensus stability target is `%CV < 36%`.
- **Time in range** = % of readings in 70–180 mg/dL (3.9–10.0 mmol/L).

**Output framing — honesty note:** for **non-diabetic** users, the evidence that
"flattening" normal glucose excursions improves health outcomes is limited. Report
the metrics and reference ranges; do not imply that minor post-meal spikes in a
healthy person are pathological or that chasing a flat line is validated. This
candour is on-brand and protects credibility.

---

## 4. Layer 2 — Open composite index methodology (house rules)

This is our IP. Every composite index on the site is built to this pattern so it
is honest by construction.

### 4.1 Design principle
Openness is the product. We publish the inputs, the sub-score mappings, the
weights, and the version. A user (or a journalist, or a competitor) can fully
reconstruct any score. That transparency is the moat and the E-E-A-T signal.

### 4.2 Sub-score normalisation
- Each input becomes a **0–100 sub-score, higher = more favourable**, always.
- Preferred mapping: percentile against a cited age/sex reference distribution.
- Where no distribution exists: a documented, clamped piecewise-linear mapping
  with stated breakpoints and rationale. Breakpoints are published on-page.

### 4.3 Weighting and evidence tiers
- Weights are explicit and sum to 100%.
- Every input is tagged with an **evidence tier**:
  - **T1** — strong, outcome-linked evidence (e.g. VO₂max, waist-to-height, grip
    strength, smoking).
  - **T2** — moderate / consistent surrogate evidence (e.g. resting HR, HRV,
    sleep).
  - **T3** — mechanistic or weak evidence.
- **Rule:** weight magnitude must track evidence tier. A T3 input may never carry
  more weight than a T1 input. No single input exceeds ~30%.

### 4.4 Aggregation
- Default: weighted arithmetic mean of sub-scores → index 0–100.
- "Pace"-style tools may additionally map the 0–100 index to a centred tracking
  number (e.g. ~0.8–1.2, where lower = tracking younger) for presentation — but
  this is a display transform of the same transparent index, not a hidden model.

### 4.5 Missing-data handling
- Define a minimum required input set per index.
- If optional inputs are missing, renormalise weights across the available inputs
  and **flag reduced confidence** on-page. Never silently substitute a default
  value that flatters or penalises the user.

### 4.6 Presentation requirements (all mandatory)
- Headline index **plus** a radar/breakdown of every sub-score — the headline
  never appears alone.
- On-page: the formula, the weights, and each input's evidence tier.
- A "What this is / what it isn't" panel.
- Version number + link to changelog.
- Standard line: *"This is a transparent composite index for self-tracking. It is
  not a medical test and has not been validated against health outcomes."*

### 4.7 Versioning and changelog
- Semantic versioning (`v1.0.0`). Weights and mappings are part of the public
  contract: **never change them silently.** Every change bumps the version and
  appends a dated changelog entry explaining what changed and why.

### 4.8 Safety constraints
- No index outputs a mortality estimate, life-expectancy figure, or disease
  probability. (Life-expectancy content lives only in §3.4, population-framed.)
- No index rewards restriction. Body-composition inputs (waist-to-height, body
  fat) are capped at a modest weight and are never the dominant term.
- No index produces medication or supplement guidance.
- Copy is behaviour-focused and non-judgemental; a low sub-score explains the
  modifiable lever, it does not shame.

### 4.9 Reference-data provenance
Every norm/percentile table used in normalisation is cited (source + date) in the
config and surfaced on-page. No uncited "typical values."

---

## 5. Layer 2 — Proposed v1.0 index definitions

These are **design proposals**, not validated science. Weights are starting
points, editable under the §4 rules (evidence-tier discipline governs any change).
All three follow §4.6 presentation.

### 5.1 "Pace of Aging" index (self-report; no bloods)
Self-relative lifestyle trajectory score. Explicitly **not** a biological age.

| Input | Evidence tier | Proposed weight |
|---|---|---|
| Cardiorespiratory fitness (est. VO₂max / fitness age, §3.2) | T1 | 25% |
| Waist-to-height ratio | T1 | 12% |
| Grip strength (age/sex normed) | T1 | 12% |
| Physical activity volume (MVPA min/wk) | T1 | 12% |
| Sleep (duration + regularity) | T2 | 12% |
| Resting heart rate | T2 | 10% |
| HRV (vs baseline or population percentile) | T2 | 10% |
| Smoking status | T1 | 5% |
| Alcohol intake | T2 | 2% |

Output: 0–100 index + centred "pace" display number + radar. Body-composition
weight (waist-to-height) sits at 12%, well below the fitness/activity block, per
§4.8.

### 5.2 "Metabolic Fitness" score (requires CGM + basics)
Rides the OTC-CGM wave. Uses §3.5 metrics as sub-scores.

| Input | Evidence tier | Proposed weight |
|---|---|---|
| Time in range (70–180 mg/dL) | T2 | 30% |
| Glucose variability (%CV) | T2 | 20% |
| Mean glucose / GMI | T2 | 20% |
| Waist-to-height ratio | T1 | 15% |
| Resting heart rate | T2 | 15% |

Carries the §3.5 non-diabetic honesty note prominently.

### 5.3 "Recovery Readiness" score (wearable; personal baseline)
Daily, purely self-relative — the open version of proprietary readiness scores.
Sub-scores are z-scores against the user's own rolling 7- and 30-day baselines.

| Input | Evidence tier | Proposed weight |
|---|---|---|
| HRV vs personal baseline | T2 | 40% |
| Resting HR vs personal baseline | T2 | 25% |
| Sleep duration vs personal need | T2 | 20% |
| Respiratory rate vs personal baseline | T2 | 15% |

Output: daily 0–100 + radar. Framed as self-relative only; no cross-user
comparison, no clinical meaning.

---

## 6. Config / schema integration (extends `SPEC.md` ToolConfig)

Add to each calculated-metric tool's config:
- `formulaVersion` (Layer 2: semver; Layer 1: source citation + implementation
  date).
- `sources[]` — for Layer 1, the primary-source URL(s) coefficients were taken
  from.
- `evidenceTiers` — per-input tier (Layer 2).
- `referenceData[]` — provenance for every norm/percentile table.
- `disclaimerLevel` — `standard` | `clinical-input` | `labs`.
- `renderSubScores: true` for all Layer 2 tools (enables the mandatory radar).

Clinical-input tools (§3.1, §3.3) use `disclaimerLevel: clinical-input`. Anything
handling raw uploaded health data should reuse the `/labs/`-style acknowledgement
pattern from `SPEC.md` §7 where appropriate.

---

## 7. Definition of done — per formula

**Layer 1:**
- [ ] Coefficients transcribed from the primary source; source URL in config.
- [ ] A worked example from the source publication (or the authors' calculator)
      reproduced as an automated test, matching within rounding.
- [ ] Both US and SI inputs tested → identical result (unit conversions correct).
- [ ] Input validation ranges enforced; documented flooring (e.g. CRP) tested.
- [ ] Correct disclaimer level; methodology panel present.

**Layer 2:**
- [ ] Weights sum to 100%; every input tier-tagged; tier ≥ weight discipline (§4.3)
      satisfied.
- [ ] Sub-score mappings documented on-page with breakpoints.
- [ ] Radar/breakdown renders; headline never shown alone.
- [ ] Missing-data renormalisation + reduced-confidence flag tested.
- [ ] Version + changelog present; "not a medical test / not outcome-validated"
      line present.
- [ ] §4.8 safety constraints reviewed (no mortality output; body-composition
      capped and non-dominant; no advice).
