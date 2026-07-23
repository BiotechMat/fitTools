# IDEAS.md — Product brainstorm: making FitTools better

Companion to `BUSINESS_PLAN.md` (strategy), `ROADMAP.md` (engagement
sequencing), `MONETISATION.md` (revenue direction), `SPEC.md` (the build) and
the feature docs. This is an **idea backlog, not a build instruction** — like
`BUSINESS_PLAN.md`, nothing here schedules work. Ideas graduate by being pulled
into a spec doc after Mat's call.

**Status (2026-07-23): BRAINSTORM — nothing signed off.** Written with M0–M4 +
post-v1 surfaces built (calculators, indices, content hubs, Pulse v1+F0, daily
games, E1 share, dashboard D0) and E0 accounts *not yet started*. Every idea
below is additive to the existing docs: each one names the thread it amplifies
or the gap it fills, and none reopens a settled principle (`ROADMAP.md §2`
positive-frame guardrails, `MONETISATION.md §2` free-stays-free,
`METHODOLOGY.md §1` non-diagnostic discipline all bind here).

**Tags:** effort **S/M/L** · gate = what must exist first (`none` = buildable
now). "Gate: E0" means accounts; "gate: §8 posture" means the
`DASHBOARD.md §8` / `PROFILE.md §7` data-protection crossing.

---

## 1. Sharpen the wedge — calculators become explorations

The catalogue answers "what is my number?". The next differentiation is
answering "what would change it?" — no calculator farm does this, and it turns
a 40-second visit into a session.

### 1.1 Goal-seek ("reverse") mode — *S–M · gate: none*
Every formula in `src/lib/formulas/` is a pure function, so it can be inverted
numerically (bisection over one input; no new maths, no new constants). UI: a
"flip it" toggle on the results panel — *"You want heart age 32 → resting HR
≤ 58 or systolic ≤ 122 gets you there."* This is `WhatMovesIt` generalised
from a static list into an interactive answer, and its output is inherently
shareable ("my target, my path" cards — feeds E1). Start with the tools where
the question is natural: heart age, phenotypic age, body fat, race predictor,
1RM progression.

### 1.2 Scenario sliders ("what if") — *M · gate: none*
The live version of 1.1: sliders on 1–3 modifiable inputs re-running the real
equation client-side (zero server cost — the SPEC §2 client-side default pays
off here). Dwell time and interaction depth are exactly the engagement signals
tool pages lack vs content pages (`BUSINESS_PLAN.md §13` names this risk).
Constraint: sliders only on *modifiable* inputs (never age/sex — positive-frame
rule), deltas always framed as gains.

### 1.3 Guided assessments — "the Longevity MOT" — *M · gate: none (report: E0)*
Chain existing tools into one flow: Heart Age → Phenotypic Age → VO₂max →
composite index, one input set (shared fields collected once), one combined
results page. Reuses everything; the new build is a flow shell + a combined
summary. Why it matters: (a) it *is* the day-1 achievement `ROADMAP.md E3`
wants, without waiting for accounts; (b) the combined summary is the natural
E1 mega-card; (c) a polished PDF export of it is a clean premium candidate
(`MONETISATION.md §3` "deeper cuts"). Also the obvious landing page for the
biological-age search cluster (`BUSINESS_PLAN.md §3`).

### 1.4 Uncertainty made visible — *S · gate: none*
Every estimate ships with its published error band (e.g. Navy body-fat ±3–4%,
1RM formulas divergence above 5 reps — the limitations are already written in
each tool's MDX). Surface them as a "how sure is this number?" chip with a ±
band on the result. Nobody in the category does this; it is the credibility
moat made visible at the exact moment of highest attention, and it's nearly
free because `METHODOLOGY.md` discipline already documents the bounds.

### 1.5 Method-comparison pages — *S per page · gate: none*
"Epley vs Brzycki vs Lombardi", "Navy vs YMCA vs BMI-derived body fat",
"Mifflin vs Katch-McArdle" — we already implement multiple methods per domain,
so we can render live side-by-side comparisons with the user's own inputs.
Unique mid-tail SEO content (query shape: "which 1RM formula is accurate")
that calculator farms can't write and content sites can't compute.

### 1.6 Interactive percentile explorers — *S · gate: none*
The static reference tables (`/reference/`) become interactive: enter age/sex →
your row highlights, percentile chip renders, one link to the matching
calculator. Cheap conversion lift on pages that already rank for "what's a
good VO₂max at 30"-shaped queries, and it seeds the E4 percentile UI language
early.

### 1.7 Client-side wearable import — *M · gate: none (sync: E0 + §8)*
Parse Apple Health / Garmin / Fitbit *exports* entirely in the browser —
file never uploaded, nothing stored server-side — to prefill resting HR, VO₂max,
HRV, steps, sleep across tools and the local dashboard. "Your export never
leaves your device" is a marketing line no tracker app can say, it makes the
dashboard genuinely useful pre-accounts, and it de-risks the eventual §8
crossing by proving demand first. (Live API sync stays ROADMAP-later, per
`DASHBOARD.md §13`.)

---

## 2. Compound the loops — one habit, not five features

Pulse, the daily games, the dashboard and (soon) streaks are each return
reasons. The risk as they multiply: five small habits instead of one strong
one. These ideas consolidate.

### 2.1 `/today` — the single daily surface — *M · gate: none* — **PULLED → TODAY.md, built 2026-07-23**
One page composing what already exists: fact of the day (`PulseDaily`), today's
Ballpark, the weekly Myth-or-Fact when live, due-a-re-run chips
(`DESIGN.md §6` welcome-back strip), and one fresh-discovery card (Pulse F0).
This becomes the canonical bookmark/home-screen destination, the anchor for
any future notification, and the natural place for the site-wide streak (2.2).
Games and Pulse keep their own pages; `/today` is composition, not new content.

### 2.2 One "showed up" streak — *S–M · gate: none* — **PULLED → TODAY.md, built 2026-07-23**
`DAILY-GAMES.md §6` has game streaks; E3 plans behaviour streaks. Add the
umbrella: a single site-wide "active day" streak satisfied by *any* meaningful
action (played, calculated, read, logged). Rationale: multiple parallel streaks
multiply lapse-guilt (against `ROADMAP.md §2.4`); one generous streak with the
existing freeze/warm-re-entry rules maximises the retention effect at minimum
psychological cost. Per-surface streaks remain as achievements, not as the
headline number.

### 2.3 PWA + installability — *S–M · gate: none (push: E5 infra)*
The calculators are client-side and static — they work offline almost for
free. Ship the manifest + service worker, an "add FitTools to your home
screen" moment after a day-3 return, and offline caching of tools + today's
games. Web push stays opt-in and minimal when E5 lands (streak-freeze warning
and weekly digest only — never marketing pings). An installed icon is the
cheapest daily-loop multiplier available to a website.

### 2.4 Ballpark duels — *S · gate: none*
`DAILY-GAMES.md §13` already reserves duels; the serverless version is
buildable now: your result encodes into a share URL (`/daily?duel=<encoded>`),
the friend plays the same deterministic day, then sees both scores side by
side, flattering-both framing ("You edged it on sleep; they took protein").
No accounts, no server state, pure K-factor on a surface that already exists.
Guardrails: opt-in by definition (you sent the link), both-win copy per
`ROADMAP.md §2`.

### 2.5 Prefilled challenge deep-links on share cards — *S · gate: none*
E1 cards currently point at the site; add a "your turn" deep link that opens
the same calculator (empty or with the sharer's *non-personal* settings like
units preselected). Cuts the friction between "saw a card" and "got my own
number" — the exact conversion the viral loop depends on.

### 2.6 FitTools Wrapped — *M · gate: E2 (history)*
The annual (+ quarterly, so it isn't a once-a-year bet) recap: your numbers'
journey, personal bests, streaks, facts read, percentile improvements —
story-format cards via the existing OG pipeline. `BUSINESS_PLAN.md §8` already
names the Spotify-Wrapped mechanic; this is its literal, calendar-anchored
form and the single biggest predictable share moment. Design it into the
Trajectory data model now (event timestamps kept) so Wrapped is a query, not a
migration, when E2 lands.

### 2.7 Seasonal events — *S per event · gate: none (cards: E1)*
"VO₂max Week", "Sleep January", a New Year Ballpark special: time-limited
themed runs of existing surfaces with a special card frame.
`ROADMAP.md E4` plans challenges for reactivation; seasonal skins are the
zero-backend version that also gives the newsletter (E5) a recurring story.

---

## 3. From numbers to behaviour — the depth moat

Measurement gets the visit; behaviour change earns the subscription. The gap
between "here's your number" and "here's your plan" is where the durable
product lives — walked carefully, because it borders YMYL.

### 3.1 Next-best-action engine — *M–L · gate: local now, full at E2*
Generalise `WhatMovesIt` across tools: from everything known locally (saved
results, dashboard metrics), compute the top 2–3 *modifiable drivers* by
re-running the real equations, and surface one prioritised "what moves you
most" module on the dashboard. Strictly lifestyle-level, always cited, always
gain-framed, never diagnostic (`METHODOLOGY.md §1` binds). This is the bridge
from aggregator dashboard to advisor dashboard — and the premium "depth" that
`MONETISATION.md §3` sells without ever gating an answer.

### 3.2 Protocols library — *M · gate: none*
Evidence-tiered "how to actually do it" pages: Zone 2 for beginners,
progressive overload, sleep-consistency protocol, post-GLP-1 muscle retention.
Same house style as `CONTENT.md` (tiers, safety boxes, honest uncertainty).
Each protocol links its measuring tool and, when E3 lands, its behaviour
streak — closing the measure → act → re-measure loop. Strong affiliate
adjacency (equipment, trackers) under the `CONTENT.md §6` separation rules,
and the natural home for the GLP-1 segment `BUSINESS_PLAN.md §4` names.

### 3.3 Blood-test lifecycle — *M · gate: §8 posture (+ partner for 3.3d)*
`PROFILE.md` covers upload → extract → auto-populate. The retention layer on
top:
- **a. Retest cadence chips** — "ApoB: worth re-checking ~6 months after a
  change" (guideline-cited, never urgent-toned).
- **b. Panel deltas** — two uploads compared: what moved, what likely moved it
  (same engine as 3.1), celebration framing for improvements.
- **c. The GP one-pager** — user-triggered PDF export of their own numbers,
  trends and the questions worth asking — positioned as *"bring better
  questions to your appointment"*, never as clinical interpretation.
  (Clinician *sharing* stays out of scope per `DASHBOARD.md §13`; this is the
  user exporting their own data.)
- **d. Test-kit comparison page** — which UK/US panels cover which biomarkers
  per £ — the highest-intent affiliate surface in the whole plan, held to
  `CONTENT.md` honesty rules (including "you may not need the big panel").

### 3.4 "Ask FitTools" — grounded answers — *M–L · gate: none technically; cost/abuse controls first*
Pulse already proved the pattern that makes this safe: retrieval over a vetted
corpus, model rephrases, server attaches the real citation, refuse outside the
corpus (`PULSE.md §1.1`). Point the same machinery at site search: a question
box that answers *only* from our published content and methodology, with
citations and tool links, and says "we haven't covered that yet" otherwise.
Differentiator vs both calculator farms (no answers) and AI chat (no grounding,
no accountability). Rate-limited free; generous caps as a premium perk.
Bonus: unanswered-question logs become the content roadmap (see 7.1).

---

## 4. Distribution beyond the SERP — the 2026 hedge

`BUSINESS_PLAN.md §13` names SEO ramp as the primary risk. The sharper 2026
version: a growing share of health queries end in an AI answer, not ten blue
links. The strategy is already right for this — open, cited, versioned
methodology is exactly what answer engines want to cite — but only if we make
it machine-legible and claimable.

### 4.1 Answer-engine optimisation (AEO) — *S–M · gate: none*
`llms.txt` + per-tool "citable summary" blocks (the formula, its source, our
implementation notes, canonical URL) + a `/cite` page ("how to cite FitTools",
per-tool citation snippets). Goal: when an assistant answers "what's a good
FFMI?", the cited source is us. Cheap, nobody in the category is doing it
credibly, and it converts the openness principle into distribution.

### 4.2 Open formula API + MCP server — *M · gate: none*
The formulas are pure, tested, SI-typed functions; publish them as (a) a free
rate-limited JSON API and (b) an MCP server so AI assistants can *run* our
tools with citations attached, every response carrying source + link. This is
the `BUSINESS_PLAN.md §7.5` B2B/licensing layer seeded early as developer
goodwill, an authority/backlink engine (`§8` Engine 3), and the strongest
possible claim to "the open reference implementation" position. Keyed tiers
later become coach/B2B revenue without touching the free tier.

### 4.3 Widget gallery — *S · gate: none*
M4 built the embeds (`/embed/[slug]`); nothing markets them. A gallery page
pitched at coaches, PTs and bloggers — live previews, copy-paste snippet,
attribution link built in — turns an existing feature into a standing
link-building engine (`BUSINESS_PLAN.md §8` Engine 3 names embeddable widgets;
this is the missing storefront).

### 4.4 Fact-card export pipeline — *S–M · gate: none*
The Pulse corpus + the OG image pipeline can render vetted, cited fact cards
as story/square images in batch. A weekly founder workflow ("pick 5, post to
IG/TikTok") gets a consistent social cadence at near-zero marginal effort —
the founder-time constraint (`BUSINESS_PLAN.md §9`) is the real bottleneck and
this attacks it. Cards always carry the citation + wordmark: the anti-slop
position *is* the hook.

### 4.5 "Trends, rated" — promote it — *M · gate: none*
`CONTENT-looksmaxxing.md §7` already argues the case; promoting it to a
scheduled build closes a real gap: it is the standing E5 novelty surface
(sleepmaxxing, cortisol-face, fibermaxxing — rated against evidence as they
break), the newsletter's weekly story, a debunk-shaped PR magnet, and the
Pulse F1 ingest pipeline's editorial front-end — one review workflow feeding
two surfaces.

---

## 5. Trust as a feature — compound the moat

Trust is the stated moat; these make it *visible product* rather than internal
discipline.

### 5.1 Public changelog + version chips — *S · gate: none*
`METHODOLOGY.md §2` requires versioned scoring; expose it: a `/changelog` page
(RSS-able) of formula and content revisions, and a small version chip on index
results ("Healthspan Index v1.2 — what changed"). Nerd-credible, backlinkable,
and it makes "openly versioned" a thing users can *see*, not a claim.

### 5.2 Guideline watch — *S recurring · gate: none*
The ACC/AHA 2026 window proved the play. Systematise it: a tracked list of the
guidelines/sources each tool depends on, a CI-style freshness check on
`lastReviewed`, and a standing commitment ("sources re-verified every N
months, next review dated on every page"). When a guideline moves, we ship the
verified update + a Pulse fresh chunk + a newsletter issue while competitors'
pages go quietly stale. Trust *and* a repeatable news hook.

### 5.3 `/why-trust-us` hub — *S · gate: none*
One page assembling what already exists: author credentials, methodology
principles, citation policy, corrections policy (write it), the changelog, the
"free stays free" promise, and the no-dark-patterns monetisation posture from
`MONETISATION.md §2`. YMYL E-E-A-T concentrated on one linkable URL — and the
place the "why is this free?" question gets answered honestly.

### 5.4 Evidence-gated affiliates, stated out loud — *S policy · gate: none*
Make the constraint the marketing: affiliate placements only appear beside
categories that clear an evidence tier — and say so on the disclosure line
("we don't link products the evidence doesn't support"). Converts
`CONTENT.md §1`'s honesty rule into a differentiator buyers can feel, and
plausibly *raises* conversion by pre-filtering for trust.

### 5.5 One-click data export & delete — *S–M · gate: ships with E0*
When accounts land, launch them *with* full self-serve export (JSON/CSV) and
instant delete — not as a GDPR footnote but as a headline feature ("your data
is yours; take it and go"). Cheapest possible contrast with the black-box
trackers, and it forces the §8 data architecture to be clean from day one.

---

## 6. Premium shape — feeding MONETISATION.md §3/§4

Candidates consistent with "persistence and depth, never the answer". None of
this reopens `MONETISATION.md §2`.

- **6.1 The Assessment report** *(with 1.3)* — the Longevity MOT as a designed
  PDF: all numbers, bands, trajectory, next actions. A tangible artefact
  answering "what am I actually paying for?" — and the GP one-pager (3.3c) is
  its sibling.
- **6.2 Depth tiers on the engines** — free: top next action (3.1), headline
  trend; premium: full driver breakdowns, long-window Trajectory, panel-delta
  history (3.3b). The `MONETISATION.md §3` "lighter form free" pattern applied
  concretely.
- **6.3 Cosmetic premium** — card themes/frames for share cards and the
  dashboard (Gen-Z native, zero trust risk, pure identity — pairs with
  `DESIGN.md` v2). Never sells accuracy or answers, so it sits safely outside
  every guardrail.
- **6.4 Coach tier (B2B-lite)** — a keyed tier of 4.2 + 4.3: client links,
  white-label embeds, bulk assessment invites, a roster view. First concrete
  step of `BUSINESS_PLAN.md §7.5`, priced above consumer premium, and it
  reuses rather than forks the consumer product. *(Gate: E0 + demand signal
  from the widget gallery.)*
- **6.5 Founding-member offer** — at premium launch: a one-time lifetime or
  founders'-price tier for the pre-launch audience (newsletter + streak
  holders). Rewards the earliest cohort, seeds testimonials, and creates a
  launch moment without a discount treadmill.

---

## 7. Community without a moderation surface

`PULSE.md §12` rightly excludes comments/UGC. Two shapes deliver community
value with an editorial pipeline instead of a moderation queue:

### 7.1 "Ask the evidence" — *S–M · gate: none*
A question inbox (form, not forum) + optional public upvoting on *questions
only*. The best each week get answered in house style — as a Pulse fresh chunk
(through the §15 PR-gated pipeline), a newsletter section, or a new glossary
entry. Users shape the roadmap and feel heard; every word published still
passes review. Pairs naturally with 3.4's unanswered-question log.

### 7.2 Consented aggregate percentiles → the annual report — *L · gate: E0 + §8 + scale*
Once accounts exist: opt-in, k-anonymous aggregation ("compare me to FitTools
users") feeding (a) segmented percentile chips beside the cited-norm ones
(E4), and (b) the annual **State of Healthspan** report
(`BUSINESS_PLAN.md §7.6`) — the press/backlink asset that compounds yearly and
that no competitor can produce without our combination of scale and consent
posture. Design the consent flow into E0 now; retrofitting consent is far
harder than building it in.

---

## 8. Anti-ideas — considered and rejected

Recording these so they don't get re-litigated later (the `MONETISATION.md §2`
pattern):

- **Comments / forums / user-generated feeds** — moderation burden and
  misinformation surface in a YMYL domain; 7.1 captures the value without the
  risk. (Reaffirms `PULSE.md §12`.)
- **AI-written content pages** — the moat is *hand-verified* citation
  discipline; scaled generation is the calculator-farm playbook with worse
  failure modes. LLMs stay where they are: rephrasing vetted claims (Pulse)
  and grounded answering (3.4), never authorship.
- **Mortality countdowns / risk-of-death outputs** — high-viral, corrosive,
  and already barred by `METHODOLOGY.md §1`. Wrapped and goal-paths get the
  share moment positively.
- **Appearance scoring of any kind** — `CONTENT-looksmaxxing.md §1` is
  binding; nothing in §2 or §6 above may drift toward it.
- **Paywalling any calculation, ever** — settled (`MONETISATION.md §2.1`);
  premium candidates above sell persistence, depth, artefacts and identity
  only.
- **Aggressive push/notification marketing** — one habit surface (2.1) with
  opt-in, protective-only notifications (2.3); attention earned, not taken.
- **Native apps / i18n (for now)** — `SPEC.md §17` stands; 2.3's PWA captures
  most native value at ~zero marginal cost, and English-market depth still
  out-earns breadth.

---

## 9. If only five things get pulled from this doc

Ranked for leverage *from the current state* (post-v1 surfaces live, E0 not
started), respecting that **E0 + E2 remain the keystone** — nothing here
displaces accounts + Trajectory; these multiply around them:

1. **`/today` + the site-wide streak + PWA (2.1–2.3)** — consolidates the
   already-built loops into one daily habit before more surfaces dilute it.
   Cheapest retention multiplier available. *(2.1–2.2 built → TODAY.md;
   2.3 PWA still open.)*
2. **Goal-seek + scenario mode (1.1–1.2)** — the wedge's next differentiation,
   pure client-side, feeds share cards and pre-sells the premium depth story.
3. **AEO + the open API/MCP (4.1–4.2)** — the strategic hedge on the primary
   risk; uniquely ours to claim because the methodology is already open,
   cited and versioned.
4. **The Longevity MOT (1.3)** — day-1 achievement without accounts, the E1
   mega-card, the premium report seed, and the biological-age SEO landing in
   one build.
5. **Trends-rated hub + guideline watch (4.5, 5.2)** — the E5 novelty cadence
   made real, one editorial workflow feeding Pulse, the newsletter and PR.

Everything else queues behind Mat's calls on `MONETISATION.md §4` (the model)
and `DASHBOARD.md §13` (dashboard opens) — several ideas above (3.1, 3.3, 5.5,
6.x, 7.2) exist to make those calls easier, not to pre-empt them.
