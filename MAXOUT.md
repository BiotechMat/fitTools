# MAXOUT.md — the one-rep-max timing game

Spec + build record for **Max Out** at `/max-out`. Stop-the-needle timing
game in the golf-swing-meter lineage, reskinned as the arcade's strength
entry: **you are the cartoon lifter, the score is the kg on the bar, and
the flex is plates a side.** Third sibling in the arcade after Lifeline
(LIFELINE.md) and Powerhouse (POWERHOUSE.md); picked from the
ARCADE-IDEAS.md §3.1 shortlist to serve the lifting audience — a third of
the tool roster with no game until now.

## 1. Concept

A pixel lifter (sweatband, forest singlet) stands over a loaded bar. A
needle ping-pongs along a form meter; tap inside the green window to lock
the rep — clang, chalk puff, plates on. Every clean rep loads the bar on a
real-plate ladder (big warm-up jumps, then the grind, then 2.5 kg
microloads forever), the needle speeds up, and the window narrows. The
inner lime core judges PERFECT: streaks of perfect reps earn chalk (slower
needle for a rep) and the belt (wider window for a rep), and at 140 kg the
spotter wanders over — one free miss. Three form breaks end the lift:
"FORM FAILED AT 240 KG · five plates a side · cause: ego lifting."
Milestone banners fire at each whole-plate boundary; seven plates a side
(300 kg) is deliberately legend territory.

## 2. Why it can travel (the Flappy DNA, chalked)

- One verb — tap (or space). The needle explains itself in one sweep; a
  first-timer scores inside five seconds; restart in one tap.
- The score reads as a sentence twice: "I failed at 240 kg" and "four
  plates a side" both carry meaning in gym culture that "score 240" never
  would.
- The narrowing-window/accelerating-needle pair is the oldest greed loop
  in arcades; the plate ladder gives it visible, countable progress.
- The fail card is designed to be screenshotted (Anton kg + plates phrase
  + cause gag), and the share line leans in: "The bar always wins
  eventually."

## 3. Guardrails (binding — inherited from LIFELINE.md §3)

- **A cartoon, not a training plan.** The page says so and links the real
  One-Rep Max calculator and strength standards — the game is a funnel to
  the evidence, never a claim about the player. Nothing measures the
  player; kg is the cartoon bar's number. Miss gags target the cartoon and
  the bar ("the bar said no"), never the user.
- Aids are real gym levers (chalk, belt, spotter), earned in play — never
  bought. No dark patterns: no lives beyond the run, no timers, no
  currency.
- Sound is synthesised (WebAudio), starts only after user input, mutable,
  mute persisted. Works without sound, without localStorage, on touch, and
  respects `prefers-reduced-motion` (no shake, no hop).

## 4. Mechanics & tuning (src/lib/maxout.ts is the source of truth)

- Logical canvas 420×560 (portrait, DPR-scaled). One input: pointerdown or
  space — starts the run when idle, judges the rep while the needle runs.
  Taps are stamped with their true between-frame needle time (`tapRef`
  carries `liveT + sinceFrame`) so judgement is fair at any frame rate.
- Rep loop: setup (0.55 s) → live (needle runs until the tap) → locked
  (0.6 s) or failed (0.7 s) → setup. Form = 3; a miss burns one and
  retries the same weight; 0 ends the lift at the attempted kg.
- Ladder (`INCREMENT_LADDER`): +40×3, +20×3, +10×3, +5×3, then +2.5
  forever — 60 → 100 → 140 → … → 300 kg at rep 18. `platesPerSide` /
  `platesPhrase` / `milestoneFor` drive the whole-plate banners.
- Needle: linear ping-pong (`needleAt`), speed 0.55 → capped 1.6 sweeps/s
  (`needleSpeedFor`); window 0.26 → floored 0.09 of the track
  (`windowWidthFor`), centre re-rolled per rep (`windowCentreFor`);
  PERFECT = inner 40% (`judge`).
- Aids (`aidFor`): 3-perfect streak → chalk (×0.75 needle), 5-streak →
  belt (×1.4 window), belt outranks chalk on shared multiples; spotter
  earned once at ≥140 kg, auto-consumed on the next miss.
- Seeded RNG (mulberry32, shared with Lifeline) rolls window centres and
  gags, so a daily-seeded bar can ship later without a rewrite.

## 5. Art & sound

Sprites are hand-drawn pixel maps in the component (DESIGN.md tokens
only): the lifter (set-up grit / lockout pride frames, 4× nearest-
neighbour), HUD hearts as form pips. The bar bends under load (quadratic
sag by weight) and plates draw as coloured discs — 20s first so "n plates
a side" reads literally, drawn 20s capped at 8 so legend runs stay on
canvas. Audio: sweep-end ticks (the rhythm cue), clang+thud on locks,
fanfare on plate milestones, crowd-adjacent rumble on misses, descending
bonk on failure.

## 6. Not built yet (sequenced)

- Daily-seeded bar + streaks + share text (joins /daily).
- /share achievement-card hook ("Five plates · top 8% today").
- Optional leaderboard (accounts-gated, ROADMAP E4 rules apply).

## 7. Status

v1 BUILT (2026-07-23): src/lib/maxout.ts (+ unit tests),
src/components/maxout/MaxOutGame.tsx, /max-out page, sitemap entry, typed
analytics events (maxout_run_started / maxout_form_failed), listed in the
/arcade hub with a BestChip (key fittools.maxout.best). Verified:
typecheck + lint + full test suite + production build + a Playwright
browser run (ready → reps → death card, no console errors). Name
"Max Out" proposed, not locked.
