# ROADMAP.md — Engagement, Virality & Growth

Companion to `SPEC.md` (the build) and `METHODOLOGY.md` (the scoring). This
document sequences the features that make the site **sticky, shareable, and
return-driven**. Monetisation (ads + affiliates) is deliberately deferred: build
the audience and the loops first, switch revenue on once traffic arrives. The ad
and affiliate infrastructure is already stubbed behind flags in `SPEC.md` §10.

> **Current build status & execution order live in `STATUS.md`.** This document
> is the *conceptual* phase design (why each mechanic, in what order); several
> phases have since shipped ahead of sequence at Mat's direction (Pulse and the
> daily games as E5/E3 threads, the E1 share card, dashboard D0). Each phase
> below now carries an as-built line; the current cross-cutting priority order
> (fuel the banks → close the half-built loops → Trajectory → accounts →
> monetise) is in `STATUS.md §3`.

**Governing principle:** every mechanic runs on *positive* psychology — progress,
flattering achievement, earned status, novelty. This is a product decision AND a strategic one:
the site's moat is credibility, and shame-driven engagement burns out and
generates backlash while progress-driven engagement compounds.

---

## 1. Evidence basis (why these mechanics, not others)

- **Retention in this category is brutal.** Fitness apps average ~8–12% day-30
  retention (broad health ~3%); standouts reach ~25%. Engagement mechanics are
  existential, not optional.
- **Day-1 achievement is the single biggest retention lever** — ~33% vs ~20%
  retention for users who do vs don't complete an achievement on day one.
- **Progress visualisation prevents churn** — seeing measurable self-improvement
  satisfies the competence need and is a top anti-churn mechanic.
- **Streaks + social visibility add ~34% retention** — but breed guilt on lapse;
  graceful recovery (freezes, no shaming) is mandatory.
- **Time-limited challenges re-engage lapsed users** most effectively.
- **Viral loop shape:** share at the moment of peak satisfaction (right after a
  good result), via a flattering, personalised, screenshot-ready image card.
- **Social-comparison rule (critical):**
  - *"You're in the top X%"* = downward comparison → boosts self-esteem, safe,
    highly shareable. **Lead with this.**
  - *Leaderboard where the user sits below others* = upward comparison →
    motivating for controllable behaviours BUT risks inferiority, obsession, and
    overtraining. Use only with tight segmentation, small attainable gaps,
    personal-best framing, and opt-in.
  - *Progress vs your own past self* (temporal, not social) = safest motivator of
    all. **Make it the core.**

---

## 2. Non-negotiable design guardrails

1. **Positive frame only.** Celebrate; never shame. A weak metric shows the
   modifiable next step, never a verdict on the person.
2. **Temporal comparison is primary.** "You vs you, 3 months ago" is the default
   motivator. Social comparison is secondary and always flattering-by-default.
3. **Social comparison is careful.** Never forced; tightly segmented (age/sex so
   the gap is small and attainable); everyone can be top of *some* board; opt-in.
4. **Graceful streaks.** Streak freezes, rest days, warm re-entry for returners.
   No guilt UX.
5. **Metrics remain estimates.** All scoring obeys `METHODOLOGY.md` (open,
   versioned, non-diagnostic, no mortality figures, body-composition never
   dominant).
6. **Monetisation deferred.** No ads until traffic thresholds (Phase E6). Keep the
   experience clean while building the loops.

---

## 3. The engagement loop (target architecture)

```
        ┌─────────────────────────────────────────────┐
        │                                             │
   ACQUISITION ──► FIRST-VISIT WIN ──► REASON TO RETURN ──► SHARE
   (SEO + viral)   (instant result,    (progress, streaks,   (flattering
        ▲           day-1 achievement)  new content, email)    "top X%" card)
        │                                                        │
        └────────────────────────────────────────────────────────┘
```

Each phase below strengthens one arc of this loop. Build in order — a share loop
with nothing to return to just leaks users.

---

## 4. Phased roadmap

> Depends on `SPEC.md` milestones M0–M4 being complete (the calculators, registry,
> and the composite indices from `METHODOLOGY.md` exist). These phases layer on
> top.

### Phase E1 — The share loop *(highest ROI, lowest risk — do first)*
> **As-built (2026-07-23): PARTIALLY BUILT.** The dynamic OG-image pipeline
> exists — `/api/share-card` renders a branded 1200×630 card, `/share` hosts it,
> and tool results carry a share button. It is **tool-only** (validated against
> the tool registry). Remaining: generalise it so Pulse / Daily / Lifeline shares
> reuse it, and add the 1080×1920 story format (`STATUS.md §3` Phase 2).

**What:** a flattering, screenshot-ready **achievement card** generated at the end
of any calculator or index — "Top 12% cardio fitness for men 30–34", fitness age,
a composite score with percentile. Server-rendered OG image; one-tap share; a
subtle site watermark/link.
**Why:** this is the viral on-ramp and it needs no accounts to ship a v1. Downward
("top X%") comparison is safe and shareable; the card fires at peak satisfaction.
**Key features:** percentile lookup against cited norms (reuse `METHODOLOGY.md`
reference data); card templates per metric; "share / copy link / download";
event: `card_generated`, `card_shared`.
**Success metric:** share rate per result; viral coefficient (K); referral traffic.

### Phase E0 — Engagement foundations *(build alongside E1)*
> **As-built (2026-07-23): NOT STARTED — the gating milestone.** The
> `HistoryProvider` seam exists local-first (`history.ts`, `pulse-store.ts`,
> `daily-store.ts`, `dashboard-store.ts`), so the promotion to authed storage is
> a central swap. Accounts, the consent flow and the published data-protection
> posture are unbuilt; everything sensitive (Dashboard D2–D4, PROFILE.md, the
> estimator, premium) waits here. This is `STATUS.md §3` Phase 4 — the deliberate
> crossing (BUSINESS_PLAN §13, SPEC §17).

**What:** lightweight accounts (email / social sign-in), a `HistoryProvider`
promoted from local-only (per `SPEC.md` §10) to stored profiles, and full event
instrumentation of the loop. The stored profile is the dashboard's
`DashboardProfile` document (`DASHBOARD.md` §5), designed local-first now so
this promotion is one central swap, not a caller sweep.
**Why:** everything after E1 needs identity and saved state. Kept minimal so it
doesn't delay the share loop.
**Success metric:** signup rate from the card CTA; % of calculator users who save
a result.

### Phase E2 — The return loop *(the core stickiness engine)*
> **As-built (2026-07-23): NOT STARTED — but the keystone, and buildable now.**
> Dashboard **D0** (the local scaffold, metric registry and store) exists;
> Trajectory itself is Dashboard **D1**. It needs no accounts — it charts the
> local store — so it is `STATUS.md §3` Phase 3, gated only on wiring more tools
> to `ResultHistory` (Phase 2) so there is data to plot. Keep it dependency-free
> (the ~165 kB shared bundle sits under a 170 kB CI cap).

**What:** **Trajectory** — longitudinal tracking of the open indices and key
metrics, rendered as trend lines with milestones and "what moved this"
annotations. Pure temporal, self-vs-self comparison. It lives on the personal
dashboard (`DASHBOARD.md` §3.5) — the surface that aggregates the metrics it
charts.
**Why:** progress visualisation is the proven anti-churn mechanic and the safest
motivator. This is what converts a one-off calculator visit into a habit.
**Key features:** re-run reminders (opt-in, non-nagging); milestone celebrations
(feeds E1 cards); personal-best markers; simple exportable summary.
**Success metric:** returning-user %, D7/D30 retention, re-runs per user.

### Phase E3 — Identity & gamification
> **As-built (2026-07-23): PARTIALLY BUILT.** The daily games (DAILY-GAMES.md)
> and Lifeline ship the day-1-win and played-streak *threads* — local streaks,
> freezes, warm re-entry, a "first play" moment. The full badge/achievement
> system, the Archetype quiz, and cross-surface behaviour streaks are unbuilt and
> depend on E0 identity.

**What:** (a) **Archetype** — a shareable health-identity quiz assigning a
strengths-plus-growth type ("Recovery-Limited Hybrid — here's your edge and your
next unlock"); (b) **behaviour streaks** (Zone-2 sessions, protein targets, sleep
consistency) with freezes and graceful re-entry; (c) an **achievements/badges**
system engineered to deliver a **day-1 win**.
**Why:** day-1 achievement is the top retention lever; the quiz is a proven viral
format (Spotify/BuzzFeed lineage) and a big email-capture funnel; streaks add
retention when designed without guilt.
**Key features:** archetype result → E1 card + email capture; badge on first
meaningful action; streak freeze + rest-day logic; no loss-shaming copy.
**Success metric:** day-1 achievement completion %; quiz completion + share rate;
streak-active users.

### Phase E4 — Social & earned status
> **As-built (2026-07-23): NOT STARTED.** Percentile pills are specced (DESIGN
> §6) but leaderboards, challenges and cross-user status all need E0 accounts and
> the anonymous-count API first.

**What:** (a) **tightly-segmented leaderboards** on *behaviours and personal
bests* (not bodies) — VO₂max/age band, sleep consistency, streak length —
segmented so gaps are small and attainable; (b) **percentile benchmarking**
("you're top 15% for your age") woven through the dashboard; (c) **time-limited
challenges** to re-engage lapsed users.
**Why:** status drives return visits; upward comparison motivates *controllable*
behaviours — but only with small gaps and personal-best framing to avoid
inferiority/overtraining. Challenges are the best lapsed-user re-activation tool.
**Key features:** opt-in leaderboards; multiple boards so everyone tops one;
"personal best" emphasis over rank; challenge start/end + completion cards (feeds
E1).
**Success metric:** lapsed-user reactivation rate; opt-in %; sessions/user.

### Phase E5 — Novelty & content cadence
> **As-built (2026-07-23): PARTIALLY BUILT — ahead of sequence.** Pulse
> (PULSE.md) is the novelty surface, and its fresh-cards pipeline (F0–F3) is the
> "Trend Radar": a weekly PubMed harvest Action opening a review PR, plus the
> crawlable `/pulse/this-week` digest built as the newsletter unit. **Remaining:**
> the pipeline runs in degraded mode until `ANTHROPIC_API_KEY` is set, the corpus
> is far below its 60–100 target (`STATUS.md §2`), and no newsletter provider is
> wired. The annual Longevity Index report is unbuilt.

**What:** **Trend Radar** — a credibility-filtered weekly "what's new in longevity"
feed (new research, biomarkers, interventions — signal over hype), plus a
**newsletter**. Optionally the annual **Longevity Index** report from aggregate
data.
**Why:** this audience is obsessed with knowing first; a weekly cadence builds a
recurring return habit and the newsletter is a durable, algorithm-proof audience
asset. The Index compounds into authority and backlinks (SEO).
**Success metric:** newsletter signups + open rate; weekly returning-visitor %.

### Phase E6 — Monetisation activation *(only once traffic arrives)*
> **As-built (2026-07-23): NOT STARTED — infra stubbed, all flags OFF.** The ad
> slots, CMP, affiliate registry and analytics all exist behind env flags
> (SPEC §10). **The revenue *model* has shifted since this phase was written:**
> the current direction is **premium-lean, subscription-led** (MONETISATION.md),
> not ads-first — this phase owes reconciliation to that doc (`STATUS.md §6`), and
> premium activation additionally waits on the model decision (MONETISATION §4).

**What:** switch on the pre-built ad slots (Journey by Mediavine at ~1k
sessions/mo → Raptive/Mediavine at threshold) and contextual affiliate placements
(protein, CGMs, wearables, testing kits), and scaffold a premium tier
(ad-free + deeper Trajectory + advanced cards).
**Why:** monetising an engaged, returning, proud audience yields far better RPMs
and affiliate conversion than monetising cold one-off traffic. Deferring protects
the loops while they're forming.
**Success metric:** session RPM, affiliate CTR, premium conversion.

---

## 5. Success metrics (the funnel, tracked throughout)

- **Virality:** share rate, viral coefficient (K), referral traffic share.
- **Acquisition:** organic sessions + US share (per `SPEC.md`).
- **Activation:** day-1 achievement completion %.
- **Retention:** D1 / D7 / D30; returning-user %; sessions per user.
- **Audience asset:** email/newsletter subscribers.
- **Revenue (Phase E6+):** session RPM, affiliate CTR, premium conversion.

---

## 6. Sequencing summary

1. **E1 + E0** — ship the share loop and the account/instrumentation base together
   (viral on-ramp + identity).
2. **E2** — Trajectory: the return engine. *This is the keystone.*
3. **E3** — identity, day-1 achievement, streaks.
4. **E4** — segmented status, challenges, reactivation.
5. **E5** — weekly content + newsletter (recurring habit + owned audience).
6. **E6** — turn on ads, affiliates, premium.

Start with E1/E0. The keystone build is **E2 (Trajectory)** — it is the safest,
strongest motivator and the thing that makes every other phase pay off.

> **Note (2026-07-23):** the *conceptual* order above still holds, but because
> E1/E3/E5 shipped ahead of E0, the current **execution** order differs — fuel
> the content banks and turn on measurement first, then close the half-built
> loops (extend the share card, SEO artefacts, history wiring), then build
> Trajectory on the local store, and only then take the E0 accounts crossing.
> The live, cross-cutting sequence is in **`STATUS.md §3`**.
