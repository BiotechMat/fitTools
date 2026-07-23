# UTILITY-LOOPS.md — utility that brings its own reason to return

Ideas session (2026-07-23): *"How else can we get the site to provide real
utility and create a loop?"* Companion to ARCADE-IDEAS.md (entertainment
loops) and MICROTOOLS.md (session-time utility). Candidates only — nothing
here is scheduled; STATUS.md §3 remains the execution order.

## 1. The diagnosis — what kind of loop is missing

Every return-visit surface built so far runs on **novelty we manufacture**:
Pulse needs a fed corpus, the dailies need item banks, the arcade needs new
runs to feel fresh. Manufactured novelty is a treadmill — STATUS §2's
"tank near-empty" finding is the bill for it.

The untapped lever is the opposite shape: **utility that rides the user's
own recurring schedule**. Training days, mornings, meal prep, re-test
dates. The user's life supplies the cadence; we only have to be the tool
they reach for when the moment recurs. These loops:

- need no content bank (the user's own data is the content),
- are inherently honest (no engagement psychology required — the return
  visit *is* the use),
- and generate exactly the longitudinal data that Trajectory
  (DASHBOARD §3.5, the keystone) is currently starved of — today only TDEE
  and 1RM persist to `ResultHistory`.

**The bar every candidate must clear** (inherited, binding): registry-driven
with no invented numbers (CLAUDE.md); local-first, zero accounts
(pre-ROADMAP E0); no new dependencies against the ~170 kB JS cap (README);
positive frame only, graceful streaks (ROADMAP §2); premium may later gate
persistence and depth, never the calculation (MONETISATION §2).

## 2. The candidates (ranked by ROI)

### 2.1 Re-test calendar loop — "Remind me to re-test" ⭐ cheapest, do first

Every calculator result is a snapshot that goes stale on a known schedule:
body-fat ~4 weeks, 1RM ~8–12 weeks, blood-panel indices ~3–6 months. Add a
**"Add re-test to calendar"** button beside `ResultHistory`'s save: it
generates a client-side `.ics` file (a template string — zero backend, zero
deps, no push infra, nothing stored, GDPR-clean) whose event links back to
the tool. A `retestIntervalDays` field on `ToolConfig` states the cadence,
justified per tool in the MDX methodology section.

- **Utility:** answers "when should I measure again?" — a question the
  editorial already raises but nothing operationalises.
- **Loop:** converts every one-shot calculator into a longitudinal
  instrument, and delivers the *second data point* Trajectory needs.
- **Build:** ~days. Pure lib (`src/lib/tools/ics.ts`) + button + config
  field. Unit-test the ICS grammar and date maths.

### 2.2 Morning readiness check-in — /tools/check-in

A 20-second daily check-in (sleep hours, soreness, perceived energy;
resting HR optional) feeding the **already-built Recovery Readiness
index** — no new science, new *input path* only. Output is an actual
decision: train as planned / take it easier today, phrased within the
index's existing interpretation bands. Streaks inherit the dailies'
graceful rules (freezes, warm re-entry, no guilt). Each entry persists
locally → the readiness trend becomes Trajectory's first daily-cadence
line.

- **Utility:** a real morning decision, grounded in an index we already
  publish and defend.
- **Loop:** every morning — the strongest honest cadence available, and it
  gives the PWA icon (add-to-home is already shipped) a daily job.
- **Build:** ~days. Form + store + streak reuse; index maths exists.

### 2.3 Set logger + PB book — /tools/log ⭐ the flagship

A local-first **set logger** on the exercise registry (42 exercises): pick
exercise, log weight × reps, repeat. Everything it needs already exists —
the rest timer (/tools/timer) slots between sets; e1RM per lift via the
tested 1RM formulas; PB detection is a comparison against the user's own
history. A new PB is the site's peak-satisfaction moment → share card
(ROADMAP E1's "share at the moment of peak satisfaction", currently only
approximated by games).

- **Utility:** the single most-wanted recurring tool in the space; replaces
  a notes app, not a rival product.
- **Loop:** every training day, 3–5×/week, and it feeds the dashboard the
  richest longitudinal stream of all (e1RM trend per lift).
- **Build:** ~1–2 weeks. Scope discipline is the risk: it is a *set
  logger with a PB book*, not a program tracker. Plain lists, no charts
  beyond Trajectory's own card, no new deps.

### 2.4 Saved plates + day view (plate builder v2)

Let the plate builder **save named plates** locally ("usual breakfast"),
stack saved plates into a day view against the kcal/protein target, and
copy a plain-text shopping list. Turns a five-minute toy into a
meal-planning utility with a natural weekly cadence (meal-prep day).
Build: ~days; store + list UI over the existing totals lib.

### 2.5 Weekly split builder → "today's session" — /tools/plan

Pick training days → pick muscle regions per day (the muscle-map's 14
regions) → get the registry's exercises for each, saved locally, surfaced
as **"today's session"** with one-tap handoff to the logger and timer.
Template scaffolding only — progression advice stays in the
double-progression planner, programming claims stay out. This is the
connective tissue that makes map + timer + logger one workflow. Build
after 2.3 exists to hand off to.

### 2.6 "Your week" recap

A locally-generated Monday recap: sessions logged, readiness trend,
streaks held, game bests, plus that week's Pulse digest link. Pure
presentation over data the other loops create — build last, cheap. Later
becomes the personalised version of the `/pulse/this-week` newsletter once
the email provider is live, and a natural share card.

### 2.7 Web push (parked — recorded so it isn't half-adopted early)

The classic loop closer, but it needs a push service, notification
permissions and real consent care — sequence it **after accounts
(ROADMAP E0)**, and only for user-scheduled events (their re-test, their
check-in), never editorial pings. The `.ics` loop (2.1) buys ~70% of the
value at ~5% of the cost and zero trust risk; ship it first and let it
prove the demand.

## 3. Recommendation

Order: **2.1 re-test calendar → 2.2 check-in → 2.4 saved plates → 2.3
logger → 2.5 plan builder → 2.6 recap.** The first three are days each and
need no unmade decision; the logger is the flagship and earns its 1–2
weeks; 2.5 and 2.6 compound what the others create.

Two caveats, binding:

1. **These loops pay off through the dashboard.** Each one writes local
   history; Trajectory (STATUS Phase 3) is where the user *sees* the loop
   closing. Wire every candidate through the `HistoryProvider` seam so the
   E0 local→authed promotion carries them for free.
2. **This does not jump the queue.** STATUS §3 Phase 1 (fuel +
   instrumentation switches) still returns more per hour than any build.
   These candidates are what "new machine" budget should buy *when* it is
   spent — machines whose fuel the user brings.
