# CONTENT-looksmaxxing.md — Evidence-based "glow-up" section

Companion to `SPEC.md`, `METHODOLOGY.md`, `ROADMAP.md`, `CONTENT.md`,
`DESIGN.md`. Defines a Gen-Z-facing **looksmaxxing / self-improvement** content
section and the decision framework for an optional body-composition estimator.

**Status (2026-07-23): §8 STEP 1 BUILT (pending Mat's sign-off).** The launch
increment is live on the `v2-design` branch: the **skin & sun cluster** (§3.1 —
pillar + 6 satellites: sunscreen, retinoids, routine, ingredients, plus the
tanmaxxing and sunscreen-myths debunks) and the **debunk hub** (§3.5,
`/glow-up/looksmaxxing-myths` — mewing, bone-smashing, tanmaxxing, mouth-taping,
SARMs, each rated with a route to the honest alternative). Registry-driven
(`src/registry/glowup-content.ts`), evidence-tiered with a new `not-supported`
tier + rotated verdict stamp, every page carrying the safety box, medical
disclaimer and the §1.3/§6.3 body-image support signpost (`BodyImageResources`).
Cross-linked both ways into the calculators (§4), surfaced in the nav and the
homepage category strip, in the sitemap, and covered by
`tests/e2e/glowup-content.spec.ts`. No appearance rating anywhere (§1.1).
Still to build: §3.2 sleep, §3.3 body-composition, §3.4 hair, §7 "Trends,
rated". The body-composition estimator (§6) remains architecturally in scope
(Mat, 2026-07-22) but gated on the data-protection posture and the §6.3
body-image / minor-safety guardrails — sequence it after accounts land, not now.

---

## 0. The thesis (why this section, why us)

"Looksmaxxing" is one of the largest Gen-Z search categories in health, and it
is served almost entirely by grifters, forums, and influencers selling jaw
trainers and tanning. The 2026 AAD survey found **~64% of Gen Z have seen
sunscreen misinformation online and >1 in 3 name influencers as their primary
skincare source**. Trends like **"tanmaxxing"** (deliberate UV exposure,
Melanotan II nasal sprays) are actively dangerous and dermatologist-flagged.

That gap is the opportunity. The site's existing house style — evidence tiers,
myth chips, "Unproven" labels, cited sources — is *already* the perfect
instrument for this space. **We do not compete on hype; we counter-programme
it.** The honest version of "looksmaxxing" is skin health, sleep, body
composition, grooming, and consistency — which routes directly to tools and
content we already ship (body-fat, FFMI, TDEE, protein, sleep, recovery,
collagen, red-light). Position: *"the glow-up, but peer-reviewed — skip the
jaw exercises, here's what actually changes how you look."*

Being the one credible voice in a scam-heavy, YMYL-scrutinised category is an
SEO and trust moat, not a reputational risk — **provided the guardrails in §1
hold without exception.**

---

## 1. Non-negotiable principles (extends CONTENT.md §1)

Inherits the four CONTENT.md principles (evidence-tiering, disclosure, safety
box, no-medical-advice) and adds five that are specific to appearance content,
grounded in body-image research:

1. **No appearance rating. Ever.** No face scoring, "canthal tilt" analysis,
   attractiveness rank, "looksmax score", or before/after "potential" mockups.
   This is this blueprint's own hard line (ROADMAP no longer draws it
   site-wide), stated here because this is the section most tempted to cross
   it. We rate *evidence*, never a person.
2. **Health-framed, not aesthetic-ranked.** Every recommendation is justified by
   a health mechanism (UV → skin cancer + photoageing; sleep → skin repair;
   protein → lean mass), with the appearance benefit as a *consequence*, never
   the primary metric. This is METHODOLOGY.md's "body-composition never
   dominant" rule applied to the whole section.
3. **De-escalation over engagement.** The body-image literature is explicit:
   body checking and appearance self-surveillance reduce negative affect
   short-term but **maintain and worsen eating-disorder pathology long-term**,
   and diet/fitness-app users show higher disordered-eating symptomology than
   non-users. So this section is deliberately engineered to send an anxious
   reader *away* satisfied, not to maximise dwell/return on insecurity. Where
   the two conflict, wellbeing wins. This is a design principle, not a
   disclaimer.
4. **Debunk with the same rigour as endorse.** Dangerous trends (tanmaxxing,
   bone-smashing, mewing-for-jawline, unregulated peptides/SARMs, Melanotan)
   get a factual, non-sensational, cited debunk and an explicit
   `Unproven` / `Not supported` tier — never amplified, never
   "both-sidesed".
5. **Minor-aware.** This audience skews young. No content assumes adult
   supplement/pharma use; anything with an age dimension (retinoids, finasteride,
   creatine in under-18s) says so plainly. No feature may require uploading a
   photo of a body without the explicit protections in §6.

---

## 2. Psychology & retention — what the research actually supports

Researched 2026; sources in §9. The goal: durable return visits **without**
running on insecurity (ROADMAP §2.1's positive-frame rule, applied hard here).
Mechanisms below are split into *use* and *avoid*.

### 2.1 Mechanisms we use (positive-frame, SDT-aligned)

- **Self-Determination Theory (autonomy · competence · relatedness).** People
  sustain behaviour they *chose* and that fits their values. Content should
  offer paths ("pick the one thing you'll actually do") rather than prescribe a
  regimen. Autonomy-supportive framing is the backbone.
- **Competence via visible progress (the safe motivator).** The keystone is
  temporal self-comparison — "you vs you" — already begun in the
  `ResultHistory` "since last time" chip (DESIGN.md §6). Progress bars exploit
  the **Zeigarnik effect** (open loops pull toward completion) — safe when the
  loop is a *routine* ("3 of 5 evening-routine steps logged"), unsafe when the
  loop is an *appearance target*.
- **Habit stacking around existing anchors.** Skincare and sleep are naturally
  daily and cue-bound (brushing teeth → sunscreen), which is ideal for habit
  formation; content teaches the stack rather than a streak quota.
- **Novelty cadence.** A credibility-filtered "what's actually new / what got
  debunked this month" feed (ROADMAP E5) fits this audience's need to know
  first, and gives a recurring, non-anxious reason to return.

### 2.2 Mechanisms we deliberately AVOID (even though they boost metrics)

- **Loss-aversion streaks on appearance behaviours.** Research shows people
  expend ~40% more effort to protect a streak — powerful, but on
  appearance/diet behaviours it manufactures guilt and compulsion in exactly
  the at-risk subset. If streaks are used at all (ROADMAP E3), they are on
  *neutral routine* behaviours (sunscreen applied, slept 7h), always with
  freezes and no loss theatre (DESIGN.md §6), and never on a weight/body-fat
  number.
- **Variable-reward / dopamine loops** tied to checking an appearance metric.
  This is the core mechanic of body-checking pathology; we do not build it.
- **Progress photos / body-checking prompts.** No "take a daily selfie to track
  your glow-up". This is the single highest-risk mechanic in the category
  (§6 governs the one bounded exception).

### 2.3 The retention design rule for this section

> Retention here comes from **trust and utility**, not from a compulsion loop.
> A reader who gets a clear, honest answer and a routine they chose will come
> back for the next question and tell a friend — the credibility flywheel. We
> optimise for *"came back because it helped"*, never *"came back because they
> felt bad"*. A rest nudge (this doc's §6.3, styled in DESIGN.md §6) sits
> behind any compulsive-checking pattern in this section.

---

## 3. Content clusters (build order)

Same cluster shape as CONTENT.md §2 (1 pillar + satellites), evidence-tiered,
each satellite targeting a real long-tail intent. Priority = search volume ×
safety-gap × routing to existing tools.

### 3.1 Skin & sun — *launch cluster* (highest safety-gap, evergreen)
- **Pillar:** "The evidence-based glow-up: what actually improves your skin."
- Satellites: sunscreen — the non-negotiable (counter to tanmaxxing, dermatology
  cited); retinoids explained (OTC vs prescription, minor note); the honest
  skincare routine (3 steps that matter vs a 10-step shelf); niacinamide /
  vitamin C / the ingredient reality; **tanmaxxing & Melanotan — the debunk**
  (`Not supported`, cited harm); "sunscreen myths" (base tan, indoor tanning).
- Routes to: red-light-therapy (existing recovery page), collagen (existing
  supplement page), sleep tools.

### 3.2 Sleep & recovery for appearance ("beauty sleep, literally")
- Sleepmaxxing evaluated: what's evidence-based (consistency, light, cool room)
  vs gimmick (mouth-taping — flag risks). Skin repair overnight; cortisol &
  skin. Routes to the sleep calculator, recovery hub, magnesium page.

### 3.3 Body composition — the real "physique glow-up"
- Recomposition basics; why the scale lies; protein for lean mass; why spot
  reduction is a myth. **Health-framed, links to body-fat / FFMI / TDEE / macro
  tools.** This is the cluster the §6 estimator would live in — text-first even
  if the estimator is never built.

### 3.4 Hair & grooming
- Hair-loss basics (finasteride/minoxidil at the evidence-tier level, **no
  dosing** — same discipline as CONTENT-peptides.md); the myth pile (biotin for
  hair, derma-rollers); beard/skin grooming that's actually skin health.

### 3.5 The debunk hub (cross-cluster authority + shareable)
- Standing, updated "looksmaxxing myths, rated" page: mewing, bone-smashing,
  jaw trainers, mouth-taping, tanmaxxing, "primal"/raw-everything, SARMs.
  Each a myth chip + one-line verdict + link to the honest alternative. This is
  the most linkable and most shareable page in the section.

---

## 4. Cross-linking (build requirement, not optional)

Mirrors CONTENT-reference §8: every cluster page cross-links **into the
relevant calculator**, and each of those calculators links back out to the
honest-glow-up content. The section's entire commercial and retention value is
in being the *front door* that routes insecurity-driven search into the site's
credible tools. A page that doesn't route is incomplete.

---

## 5. Section identity (DESIGN.md)

Uses the v2 system as-is: the evidence medal ladder (Gold/Silver/Bronze →
Unproven → Not supported), myth chips
(`<s>Myth</s>`), Anton headers, sticker language. One addition to specify in
DESIGN.md if built: a **"rated" verdict stamp** for the debunk hub
(reuse the rotated evidence-tier stamp from the supplement page). British
English, warm/punchy voice, but the safety register stays serious (§1).

---

## 6. BLUEPRINT — the body-composition estimator (DECISION REQUIRED)

The idea: estimate body-fat % from a photo via AI. This section is the honest
engineering + ethics blueprint, ending in a recommendation. **It is not a
green-light.**

### 6.1 Is it feasible? Yes.
Peer-reviewed 2D-photo → body-fat models now reach ~2.1% mean absolute error
vs DXA (Cambridge BodyShape; Nature *npj Digital Medicine* VBC and PhotoScan
cohorts — §9). The science is real and improving.

### 6.2 Does it fit the site? Now yes, with two real gates.

The architecture objection is resolved: server-side / AI-API calculation and
accounts are in scope (Mat, 2026-07-22; SPEC §2, §17). A serverless proxy to
the Claude vision API is a legitimate feature, not a rule-break. Two gates
remain — both about safety, not architecture, and both binding:

1. **Data protection (BUSINESS_PLAN §13 threshold).** A body photo is deeply
   sensitive personal data — far beyond the stateless numbers the site handles
   today. Uploading it to any API crosses the "stateless → stored/processed
   health data" line the risk register says to treat as a deliberate, resourced
   step (UK GDPR special-category-adjacent; minors are in-audience per §1.5).
   This work is coming anyway with accounts — the estimator rides on it, it does
   not get to skip it.
2. **Body-image safety (§1.3, §2.2).** A photo-based body-fat number is close
   to the definition of a body-checking mechanic — the highest-risk pattern in
   the literature for the at-risk subset. This is the gate that never fully
   goes away and that §6.3's guardrails exist to hold.

### 6.3 Mandatory safe design (all binding)

Built as a clearly-bounded, opt-in feature with **every** guardrail below:

- **Ephemeral, no storage.** Photo is processed and discarded; never stored,
  never logged, never added to `HistoryProvider` or the dashboard profile store
  (`DASHBOARD.md` §5) — the photo and any appearance figure stay out of all
  persistence, local or account. No progress-photo feature — ever. State this
  in-UI and in the privacy policy.
- **Consent + on-device gate.** Explicit per-use consent screen; an **18+**
  affirmation (this is the minor line from §1.5); a clear "your photo is sent
  to an AI service to estimate body composition and is not kept" notice **before**
  the picker (never in fine print).
- **Result as a range, health-framed.** Return a **band** (e.g. "roughly
  18–22%, athletic range"), never a single dramatic number, alongside the
  healthy-range context and the same non-diagnostic disclaimer as every tool.
  No "you need to lose X". Pair with the "what this is / isn't" panel.
- **Harm-signal + exit.** Repeated re-checks trigger the rest nudge (styled in
  DESIGN.md §6) and a signpost to body-image resources (Beat / NEDA). An
  eating-concern screening link is always present.
- **Free, never a premium hook.** Charging for an appearance number is exactly
  the insecurity monetisation the whole strategy rejects.
- **Architecture:** a single serverless endpoint (Vercel function) that proxies
  to the Claude API with a fixed vision prompt; no image persistence; rate-
  limited; key server-side only. Reserve dimensions for zero-CLS. This is the
  first server-side surface on the site — it needs its own threat model.

### 6.4 Recommendation

**Green-lit as a planned feature; sequence it after accounts land.** Build the
§3.3 body-composition *content* first (it stands alone and routes to the
existing client-side Navy-method tool). Then build the estimator as an
adults-only, ephemeral, §6.3-guardrailed feature on top of the accounts /
data-protection posture (ROADMAP E0) — the natural moment, since that
infrastructure is what makes the sensitive-data handling safe. The upside
(novelty, virality) is real; the downside it must engineer against (a minor's
body photo on a server, a body-checking loop, a YMYL trust hit) is why §6.3 is
binding, not advisory. Ship it *because* of the guardrails, never without them.

---

## 7. Other Gen-Z areas worth owning (researched 2026)

Each is a high-volume, low-credibility, tool-adjacent search space where the
evidence-tier house style wins. Ranked by fit:

1. **Sleepmaxxing** (own it — routes to sleep calculator; big, evergreen, gimmick-
   heavy). Overlaps §3.2.
2. **Cortisol / nervous-system regulation** ("cortisol face", cortisol
   mocktails). Huge 2026 trend, ~all misinformation, routes to sleep/recovery/
   HRV. High debunk value.
3. **Fibermaxxing / gut health** (fibre saw a ~230% search spike in 2026).
   Genuinely evidence-supported when done right — routes to a fibre/nutrition
   angle; pairs with the food reference.
4. **"Nature's Ozempic" / GLP-1-adjacent** (berberine, fibre, protein for
   satiety). BUSINESS_PLAN already names GLP-1 as a core segment — high
   commercial + debunk value.
5. **Longevity for the young** ("what actually slows ageing at 25"): reframes the
   existing longevity tools (heart age, phenotypic age, VO₂max) for a Gen-Z
   entry point. Strong internal-routing play.
6. **Caffeine / energy-drink reality, creatine-for-everything, mouth-taping** —
   smaller debunk satellites that slot into existing supplement/tool pages.

These argue for a **"Trends, rated"** standing hub (ROADMAP E5 novelty cadence):
one credibility-filtered page updated as trends break — recurring return habit,
newsletter feeder, and backlink magnet, all without an insecurity loop.

---

## 8. Build sequencing

1. **§3.1 Skin & sun** cluster (launch — biggest safety gap, evergreen, no new
   infra) + **§3.5 debunk hub** (shareable anchor).
2. Cross-linking into existing tools (§4).
3. **§3.2 sleep** and **§3.3 body-composition (content)** clusters.
4. **§7 "Trends, rated"** standing hub + newsletter feeder.
5. **§3.4 hair/grooming.**
6. **§6 estimator** — sequenced onto the accounts / data-protection work
   (ROADMAP E0), adults-only, with the §6.3 guardrails. The content clusters and
   the existing client-side Navy-method tool cover body composition until then.

Clusters reuse the recovery-content registry pattern and existing components,
and need no new dependencies. The estimator is the one server-side surface; it
rides on the accounts / data-protection infrastructure (ROADMAP E0) rather than
being a standalone decision, and remains gated on the §6.3 safety guardrails.

---

## 9. Sources (researched July 2026)

- AAD 2026 Practice Safe Sun Survey; dermatology coverage of "tanmaxxing" /
  Melanotan (Yahoo Health, Fox News, IBTimes, AAD).
- Body-image & app research: body-checking maintains ED pathology (PMC11671019);
  diet/fitness-app use ↔ disordered eating systematic review (ScienceDirect
  S174014452400158X); Instagram body-surveillance (Within Health); AI/algorithms
  & body image (Alliance for Eating Disorders).
- Retention psychology: SDT & habit formation (PMC6302524); streak/loss-aversion
  and Zeigarnik gamification analyses (Trophy, Digia, 2025).
- AI body-fat feasibility: Cambridge BodyShape; *npj Digital Medicine* VBC
  (s41746-022-00628-3) and 2D-photo advances (s41746-024-01380-6); PhotoScan
  (medRxiv 2025.08.01.25332763).
- Gen-Z wellness trends 2026: McKinsey Future of Wellness; sleepmaxxing/
  fibermaxxing/cortisol coverage (eMarketer, Outside, draxe).

Coefficients/claims used in any built page must be verified against primary
sources with the URL recorded on the page (CLAUDE.md convention), not cited
from this summary.
