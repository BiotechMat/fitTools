# FEEDBACK-LOOPS.md — psychology levers, new verticals, and the share/compare/compete/revisit map

Ideas session (2026-07-24): *"How do we create more feedback loops on the
site; what other health things do people want to focus on; how do we make
people share, compete, compare, revisit; how can we use psychology concepts
here?"* Companion to UTILITY-LOOPS.md (loops that ride the user's own
schedule), ARCADE-IDEAS.md (entertainment loops), PERFORMANCE-LAB.md
(measurement loops) and ROADMAP.md §1–§2 (the evidence basis and the
binding guardrails). **Candidates only — nothing here is scheduled;
STATUS.md §3 remains the execution order.**

## 1. The frame — where feedback loops actually close

A feedback loop is *act → see the consequence → adjust the next act*. The
site already generates plenty of first acts (40 calculators, four games,
two dailies, Pulse); what it mostly lacks is the **see-the-consequence**
half. That half already has a name and a build plan: wire more tools to
`ResultHistory` (STATUS Phase 2) and build **Trajectory** (Phase 3, the
keystone). No idea below substitutes for that spine — the honest answer to
"more feedback loops" starts with the one already specced.

What this doc adds around that spine: loops that close **within a
session** (prediction → result), **between users** (duels, cohorts) and
**across calendar landmarks** (birthdays, year ends) — plus the vertical
gaps where people already want to measure themselves and we have no
instrument.

## 2. The psychology shelf — concept → where it's used → untapped application

The mechanisms below are standard behavioural-science findings. The rule
for using them is inherited and binding (ROADMAP §2): positive frame only,
temporal self-comparison primary, social comparison flattering-by-default
and opt-in, graceful streaks, no dark patterns. A lever that can't be
pulled inside those rules stays on the shelf (§6).

| Concept | The finding | Already used | Untapped application |
|---|---|---|---|
| Variable reward | Unpredictable payoffs sustain checking | Pulse feed, arcade runs | Nothing new needed — fuelling the banks (STATUS Phase 1) is the gap |
| Social comparison (Festinger) | Downward = safe + shareable; upward = motivating but risky | ROADMAP §1's rule; Lab percentiles (specced) | **Today's-cohort percentile with zero accounts** (§3.2) |
| Temporal self-comparison | Safest motivator of all | Trajectory (specced), "since last time" chips | **Prediction vs result** — compare to your own *expectation*, not just your past (§3.1) |
| Curiosity gap (Loewenstein) | A registered guess makes the answer irresistible and memorable | Ballpark's guess-before-reveal | **Guess-first layer on calculators** (§3.1) |
| Endowed progress (Nunes & Drèze) | Progress that starts pre-filled gets finished | Nowhere | **"Your health picture" meter counting tools already used** (§3.5) |
| Goal gradient (Hull) | Effort rises as the goal nears | Nowhere explicit | Show proximity to the *next* milestone (next PB, next badge, next streak freeze earned), never the distant summit |
| Zeigarnik effect | Open tasks pull at memory | "Due a re-run" strip (DASHBOARD §3.6, specced) | **"2 of 8 stations tested" / "3 misses to clear"** — visible unfinished sets (§3.4, §3.5) |
| Fresh-start effect (Dai, Milkman & Riis) | Temporal landmarks reset motivation | Nowhere | **Mondays, month starts, birthdays, new year as re-engagement moments** (§3.6) |
| Implementation intentions (Gollwitzer) | "When-then" plans double follow-through | The re-test `.ics` (UTILITY-LOOPS §2.1) *is* one | Phrase every re-test prompt as when-then ("re-test the Monday after your deload"), not "sometime" |
| Peak-end rule (Kahneman) | Sessions are remembered by peak + ending | Share at peak satisfaction (ROADMAP E1) | Engineer the *end*: a one-line session recap ("2 tools, 1 PB, streak safe") before the tab closes |
| IKEA effect / stored-value investment | Users value what they've put work into | Profile auto-populate (PROFILE.md) | Make the accumulating value *visible*: "142 results saved · 9 months of trend" — the honest anti-churn sentence |
| Identity labelling (self-perception) | Named identities drive consistent behaviour | Archetype quiz (ROADMAP E3, unbuilt) | **Chronotype** as the first named identity — a citable instrument, not an invented quiz (§4.2) |
| Spacing effect (Ebbinghaus) | Spaced re-exposure beats massed | Nowhere | **Misses come back** — spaced repetition of failed dailies (§3.4) |
| Social proof (Cialdini) | "Others are doing this" legitimises the act | Nowhere | Anonymous daily counts once §3.2's aggregate exists: "3,141 played today" |
| Commitment & consistency | Recorded intentions get honoured | Nowhere | A saved goal ("505 kg DOTS total by October") that Trajectory plots toward — self-commitment only, never public by default |

Reading of the table: the site's specced surfaces already cover variable
reward, downward comparison, temporal comparison and peak-moment sharing.
The genuinely untapped levers are **prediction** (curiosity gap),
**endowed/open progress** (Zeigarnik + endowed progress + goal gradient —
one family), **temporal landmarks** (fresh start) and **spacing**. Those
four families produce the candidates below.

## 3. New loop candidates (ranked by ROI)

### 3.1 Guess first — the prediction layer ⭐ cheapest, most house-native

Before a calculator computes, one optional extra tap: **"What do you think
it'll say?"** Then the result renders beside the guess. Ballpark already
proved the mechanic; this moves it from trivia numbers to *your own*
numbers, where the curiosity gap is strongest.

- **Loop (in-session):** guess → result → surprise → read the methodology
  to understand the gap. The result becomes memorable *because* a
  prediction was registered against it.
- **Loop (longitudinal):** guesses persist with results. Over re-tests a
  **calibration trend** emerges — "you've stopped underestimating your
  TDEE" — a meta-metric only a site with history can offer, and a reason
  to re-run that no single result provides. Frame as *tuning in to your
  body*, never as being "wrong about yourself" (§6).
- **Share:** "I guessed 15% body fat — it's 22%" is a better card than
  either number alone; self-deprecation is self-chosen, so the positive
  frame holds.
- **Build:** small. A `guessable` field on `ToolConfig`, a pre-result
  input, guess stored beside the `ResultHistory` entry. No deps, local
  only, skippable in one tap (autonomy preserved).

### 3.2 Today's cohort — comparison with zero accounts ⭐

The dailies, the arcade daily seeds and the Lab's daily circuit are all
**daily-seeded — everyone plays the same event**. That makes one tiny
aggregate (a per-day count + score histogram, no identity) enough to turn
every score into **"top X% of today's 3,141 players"** — downward-framed
per ROADMAP §1, and the strongest possible upgrade to the share cards.

- **Loop:** today's cohort resets tomorrow — a clean daily reason to
  return that compounds the existing streak mechanics rather than
  competing with them.
- **The honest design:** submit-on-share or explicit opt-in, k-anonymity
  floor before percentiles display (no "top 100% of 3 players"), bounded
  score params reusing the arcade-share forgery posture, no identity —
  a counter, not a profile.
- **Build & the flag:** this is the site's **first server-side state**
  (everything to date is static + local). A Vercel KV/edge counter is
  days of work, but crossing from "zero backend" to "any backend" is a
  posture decision — **Mat's call**, recorded here so it isn't crossed
  casually. Until then the arcade-card pipeline stays percentile-free.
- **Sequencing note:** the anonymous-count API this creates is the same
  primitive ROADMAP E4's percentile pills and challenge counts need —
  building it here is a down-payment, not a detour.

### 3.3 Duels — generalise Lifeline's challenge links

LIFELINE §6 already ships challenge links. Generalise the pattern to every
scored surface (dailies, Max Out's daily bar, Five a Day, the Lab
circuit): a shared link carries the challenger's bounded score for **the
same daily seed**; the recipient plays the identical event, then sees the
side-by-side and gets their own card — which is itself a challenge link.

- **Loop:** asynchronous 1-v-1 with no accounts, no server, no
  leaderboard — the K-factor mechanic the share pipeline is missing, and
  the "compete" verb served *before* E0 instead of waiting for it.
- **Psychology:** a named, chosen rival with a small gap is exactly the
  "tight segmentation, attainable gap" upward comparison ROADMAP §1
  permits — the sender self-selects as the recipient's peer.
- **Build:** small-medium. The bounded-params + `generateMetadata` unfurl
  pattern already exists (`src/lib/arcade-share.ts`); this adds a
  challenge param and a side-by-side result state per game.

### 3.4 Misses come back — spaced repetition on the knowledge bank

Wrong Myth-or-Fact answers and far-off Ballpark guesses re-queue at
expanding intervals (local store, classic 1d/3d/7d/21d ladder). A quiet
**"Clear your misses (3)"** chip on /daily; clearing one shows the
citation again.

- **Loop:** Zeigarnik pull (an open set wants closing) + the spacing
  effect doing honest work — the user genuinely *learns* the corpus, which
  is the site's stated mission, and the item banks STATUS Phase 1 is
  filling pay a second time.
- **Positive frame:** "misses" are inventory to clear, never a failure
  tally; no red badges, no decay, the chip disappears when empty.
- **Build:** small. `daily-store` already records results; this adds a
  re-queue schedule and a chip. Zero new content required.

### 3.5 "Your health picture" — the endowed-progress meter

A dashboard module showing **how much of your picture is already filled
in** — "6 of 12 numbers known · body comp ✓ · strength ✓ · heart —" —
seeded from tools the user has *already* used, so the bar never starts at
zero (the endowed-progress effect: pre-credited progress gets finished).

- **Loop:** each empty slot is a named open loop pointing at a specific
  tool; completing the set is a day-1-achievable win (ROADMAP §1's
  biggest retention lever) that needs no new features, only framing.
- **The binding caution:** this measures **completeness of measurement,
  never health**. No composite "health score" emerges from it (METHODOLOGY
  governs scores); an empty slot is an invitation, not a deficiency.
- **Build:** small. The metric registry (`src/registry/metrics.ts`)
  already defines the slots; this is presentation over `ResultHistory`
  coverage.

### 3.6 Landmark moments — the fresh-start calendar

The fresh-start effect says motivation spikes at temporal landmarks. The
site can meet four of them with what it already computes:

- **Monday** — the "Your week" recap (UTILITY-LOOPS §2.6) and Myth-or-Fact
  day already anchor it; add nothing, just protect it.
- **Month start** — the natural window for ROADMAP E4's time-limited
  challenges when they arrive; also the honest re-test cadence for
  body-comp tools (the `.ics` loop can default to month boundaries).
- **Birthday** ⭐ — the site's single most shareable sentence is sitting
  unassembled: **"You turn 34 this week. Your Phenotypic Age says 29."**
  A locally-stored DOB (already part of most tool inputs) plus the
  existing indices makes the week-of-birthday dashboard greeting and its
  card. Positive-frame rule applies: an older-than-calendar result shows
  the modifiable next step, and by default stays on the dashboard, never
  auto-carded (wins only on cards — DASHBOARD §3.7).
- **Year end** — **"Your year in numbers"**: a locally-generated Wrapped
  (results saved, PBs, streak high-water marks, Lab trends, games played)
  in the death-card house style. Spotify proved the December share moment;
  a local-first version is pure presentation over `ResultHistory`, and it
  makes January (the category's biggest traffic month) the re-test month.
- **Build:** small each, sequenced after Trajectory exists so the
  landmarks have trends to show. The birthday moment needs only a stored
  DOB and a dashboard greeting; Wrapped is a season's polish on stores
  that already exist.

## 4. What else people want to measure — the vertical gaps

The 40-tool roster covers body composition, nutrition/energy, strength,
running/cardio, sleep timing, hydration, caffeine and the longevity
indices. Set against what the audience measurably searches for and tracks,
four gaps stand out — ordered by fit with the house pattern (cited
instrument → your number → norms → trend):

### 4.1 The Physical Bench ⭐ — field tests with norms (the Lab's body sibling)

PERFORMANCE-LAB.md measures cognition in-browser. The body-side equivalent
needs no sensors — **guided field tests** where the site supplies the
protocol, the timer (already built at /tools/timer), the cited age/sex
norm table, the percentile and the trend:

- **Dead-hang** · **plank hold** · **wall sit** — timed holds, published
  normative data, instantly meaningful scores.
- **One-leg balance stand** — flamingo/stork test; balance has genuine
  longevity literature and an older-audience hook the arcade can't reach.
- **30-second chair stand** and **push-up max** — both carry established
  norm tables (CDC/ACSM lineage) across age bands.
- **Sit-and-reach** — the flexibility number, feeding the mobility
  content the muscle-map already fronts.
- **Cooper 12-minute run** — the classic VO₂max field estimate; the
  vo2max calculator gains a first-party test protocol instead of asking
  for a lab value.

Why this is the strongest single answer to "what else do people want to
focus on": it is the **test yourself → get your number → see how you stack
up → come back and beat it** shape the Lab bet is already making, applied
to the body, where search demand is proven ("average plank time",
"dead hang test") and no one owns the category the way Human Benchmark
owns reaction time. Every station is a re-test loop (UTILITY-LOOPS §2.1's
`.ics` slots straight in), a Trajectory feed, a percentile share card and
a funnel to existing strength/mobility content. Build shape: each station
is a protocol page + timer + norms lookup — calculator-tier effort, not
game-tier. Candidate home: the Lab hub as its "body wing", or
/tools — decide with PERFORMANCE-LAB's IA question (its §7).

### 4.2 Sleep & chronotype — the identity instrument

The sleep calculator handles bedtime maths; the cluster handles the
environment. Missing:

- **Chronotype** via a *citable* instrument (MEQ/µMEQ lineage, stated and
  licensed appropriately) — the site's first identity label (§2's
  self-perception lever) and the natural v1 of ROADMAP E3's Archetype
  quiz: shareable ("moderate evening type"), honest, and it cross-links
  the sleep cluster, the caffeine calculator and training-time content.
- **Sleep debt** — a rolling 14-day ledger fed by the morning check-in
  (UTILITY-LOOPS §2.2) rather than a new input surface; output phrased in
  the recovery index's existing bands.

### 4.3 Stress & mind — careful, citable, small

The check-in already touches perceived energy. If the vertical is entered
at all, enter it the Lab way: a **named, cited instrument** (PSS-10
lineage) with norms, presented as self-knowledge — never screening, with
signposting per the site's medical-disclaimer discipline. Recorded as a
candidate; the YMYL bar is higher here and the call is Mat's.

### 4.4 Women's health — the largest underserved segment

Cycle-aware training and menopause-adjacent fitness content are the
biggest audience-sized holes in the roster, and the current tool set
implicitly defaults male in places (DOTS/FFMI norms aside). This is a
**flagged direction, not a casual candidate**: it needs its own evidence
review, likely its own DPIA thinking (cycle data is special-category with
extra sensitivity), and Mat's explicit call. Recorded so the gap is on the
map, not because a brainstorm can size it.

Deliberately **not** proposed: alcohol tracking (the positive frame is
hard to hold and the fail joke lands on the person), fertility/hormone
tools (evidence + sensitivity), and anything requiring wearable
integrations (a platform decision, not a loop).

## 5. The verb map — share / compare / compete / revisit

Where each mechanic (built ○, specced ◐, proposed ● from this doc) serves
each verb, and what it waits on:

| Mechanic | Share | Compare | Compete | Revisit | Waits on |
|---|---|---|---|---|---|
| ○ Tool/arcade share cards | ✓ | | | | — (fuel only) |
| ○ Streaks + freezes (dailies) | | | | ✓ | — |
| ◐ Re-test `.ics` (UTILITY-LOOPS §2.1) | | | | ✓ | build slot |
| ◐ Trajectory + PB markers (D1) | ✓ | ✓ self | | ✓ | STATUS Phase 3 |
| ◐ Lab percentiles vs norms | ✓ | ✓ | | ✓ | Lab build |
| ● Guess first (§3.1) | ✓ | ✓ self | | ✓ | build slot |
| ● Misses come back (§3.4) | | | | ✓ | build slot |
| ● Health picture meter (§3.5) | | | | ✓ | build slot |
| ● Landmarks: birthday/Wrapped (§3.6) | ✓ | ✓ self | | ✓ | Trajectory first |
| ● Duels (§3.3) | ✓ | ✓ | ✓ | ✓ | build slot |
| ● Today's cohort (§3.2) | ✓ | ✓ | ✓ | ✓ | **first-server-state call** |
| ● Physical Bench (§4.1) | ✓ | ✓ | | ✓ | build slot + spec doc |
| ◐ Leaderboards, challenges (E4) | ✓ | ✓ | ✓ | ✓ | E0 accounts |

Two readings worth stating. **Every verb is servable before accounts** —
compete included (duels need no server; cohorts need one counter) — so E0
is not the gate to a complete loop, only to *persistent identity* across
it. And **"revisit" is the crowded column**: the marginal candidate should
be judged on share/compare/compete, where the roster is thinnest.

## 6. Anti-ideas — psychology this site refuses (recorded so they stay refused)

- **Fear appeals & countdowns.** No mortality figures (METHODOLOGY,
  binding), no "your body is declining" framing, no ticking-clock UX.
  The Lifeline game jokes about death; the tools never do.
- **Body-comparison social features.** Boards rank behaviours and
  personal bests, never bodies or appearance (ROADMAP E4, CONTENT-
  looksmaxxing §1's no-rating rule). The estimator, if built, never
  feeds any comparison surface.
- **Guilt mechanics.** No streak-loss theatre, no red decay badges, no
  "don't lose your progress!" interstitials. Graceful streaks are
  binding (ROADMAP §2).
- **Manufactured scarcity & FOMO.** No countdown offers, no "only today"
  content gates. Daily seeds create *shared* time, not *pressured* time.
- **Calibration-shaming.** §3.1's guess layer never scores the user's
  self-knowledge as a failing ("you don't know your own body") — the
  frame is tuning in, and the guess is always skippable.
- **Notification pressure.** Web push stays parked per UTILITY-LOOPS
  §2.7 — user-scheduled events only, after accounts, never editorial
  pings. The `.ics` file remains the consent-free reminder channel.
- **Engineered compulsion.** The idle-clicker rejection (ARCADE-IDEAS §5)
  generalises: no mechanic whose *only* function is return frequency.
  Every loop here pays the user in information, skill or utility.

## 7. Recommendation

Within this doc's remit, the order that compounds best:

1. **§3.1 Guess first** — days, no decisions needed, upgrades every
   calculator and every future share card, and starts the calibration
   trend Trajectory can later chart.
2. **§3.4 Misses come back** — days, makes Phase 1's content-bank work
   pay twice, purely local.
3. **§3.5 Health picture meter** — days, gives the dashboard its day-1
   win before Trajectory lands.
4. **§3.3 Duels** — the missing K-factor mechanic, on pipes that exist.
5. **§3.6 Landmarks** — birthday first (one stored field, one greeting,
   the site's best sentence), Wrapped in Q4, both after Trajectory.
6. **§3.2 Today's cohort** — highest ceiling of the loop candidates, but
   it crosses the zero-backend line: take to Mat as a posture decision.
7. **§4.1 Physical Bench** — the one *new vertical* worth a spec doc now;
   propose alongside PERFORMANCE-LAB's IA call. Chronotype (§4.2) rides
   whenever the Archetype/E3 slot opens; §4.3–§4.4 are flagged for Mat,
   not queued.

And the standing caveat, inherited verbatim from UTILITY-LOOPS §3: **none
of this jumps the queue.** STATUS §3 Phase 1 (fuel + switches) and Phases
2–3 (history wiring + Trajectory) still return more per hour than any
candidate above — these are what the *next* new-machine budget should buy,
chosen so each one strengthens the loop the spine is already closing.
