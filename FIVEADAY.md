# FIVEADAY.md — the produce-slicing game

Spec + build record for **Five a Day** at `/five-a-day`. Swipe-to-slice
arcade game in the Fruit Ninja lineage: **fruit and veg fly; slice them
for portions, never touch the junk.** Fourth sibling in the arcade
(LIFELINE.md, POWERHOUSE.md, MAXOUT.md).

## 1. The pivot (recorded so it isn't retried)

This slot shipped first as **Snake Oil** (ARCADE-IDEAS.md §3.2): flying
myth slogans to slice, cited facts to spare, a sourced receipt on the
death card. Mat's playtest verdict, same day: *the game feel is good, but
text cannot be read at toss speed* — the myth/fact discrimination
overloads exactly the moment the reflex fires. The fix is structural, not
tuning: recognition must be **visual**. Produce good, junk bad, zero
reading. The myth/fact education keeps its home where reading has time —
Myth or Fact? on `/daily` — and the arcade slicer becomes pure reflex.
`/snake-oil` permanently redirects here; the registry-backed claims
roster and receipt machinery were removed with it.

## 2. Concept

The market stall has lost control of its stock. Sixteen pixel fruit and
veg arc across the screen — apple, banana, orange, broccoli, strawberry,
carrot, watermelon, tomato, then an unlockable exotic tail through
pomegranate. Swipe to slice: every one is **+1 portion**. Multi-slices
blend — "SMOOTHIE ×4" (or "CHOPPED SALAD" when it's all veg) pays bonus
portions — and the first slice of each plant kind in a run pays
"NEW PLANT +2", the plant-variety motif built straight into the scoring.
The junk is the arcade's own villains: Lifeline's cigarette and fizzy
can, Powerhouse's CRASH energy drink, doomscroll phone and
ultra-processed nugget. **Slicing junk ends the run instantly**,
bomb-style — fair, because the shapes are unmistakable. Dropping produce
costs one of three hearts ("the broccoli got away"); junk falling
untouched is the correct play. The death card: "COMPOSTED · 87 portions ·
23 different plants · cause: the cigarette. It was never food."

## 3. Why it can travel (the Flappy DNA, juiced)

- One verb — swipe. "Slice the produce, never the junk" is the whole
  tutorial; a first-timer scores in two seconds; restart in one tap.
- Fruit Ninja is the most proven satisfaction loop on touchscreens; this
  keeps its shape exactly and reskins it into the site's world.
- The score reads as a sentence twice: "87 portions" (the five-a-day
  joke) and "23 different plants" (the variety flex).
- The fail is the joke: composting, and a cause line that names the junk
  or the one that got away.

## 4. Guardrails (binding — inherited from LIFELINE.md §3)

- **A cartoon, not nutrition advice.** The page says so and links the
  food reference; nothing measures the player, and junk gags target the
  junk ("the cigarette. It was never food."), never the user — enforced
  by `validateRoster` (no "you/your" in causes).
- Junk is habits and generic products, never real brands (standing rule).
- No dark patterns: no timers, no currency, nothing bought. Sound is
  synthesised (WebAudio), starts only after user input, mutable, mute
  persisted. Works without sound, without localStorage, on touch, and
  respects `prefers-reduced-motion` (fewer particles, no shake).

## 5. Mechanics & tuning (src/lib/fiveaday.ts is the source of truth)

- Logical canvas 420×560 (portrait, DPR-scaled). Pointer strokes queue
  into the frame loop; slicing is segment-vs-circle (`segmentHitsCircle`,
  24 px radius) with a 6 px minimum segment so trembles don't slice.
- Rosters: 16 produce (`PRODUCE`, order = unlock order via
  `unlockedProduceCount`: 8 + 2/wave; fruit AND veg guaranteed in the
  opening eight) and 5 junk kinds (`JUNK`), all junk in play from wave
  one. `validateRoster` runs as a unit test.
- Waves every 10 s: spawn interval 1.5 → floored 0.55 s
  (`spawnIntervalFor`), bursts of up to 3 from wave 3 (`burstSizeFor`),
  junk share 0.10 → capped 0.30 (`junkChanceFor`) — a harvest with
  hazards, not a minefield.
- Tosses (`launch`): arcs apex in the upper half and stay on canvas
  (unit-tested by simulation); gravity 620 px/s²; full tumble spin (no
  text to keep level any more).
- Scoring: produce +1; combo of n in one swipe pays +(n−1)
  (`comboBonusFor`) under the `comboLabelFor` banner; first-of-kind pays
  +2 (`newPlantBonus`). Best persisted = portions
  (fittools.fiveaday.best); best combo shown on the death card.
- Fail: junk sliced → instant run-over with the junk's cause; third
  dropped produce → run-over with `escapedCause(label)`.
- Seeded RNG (mulberry32, shared with Lifeline) drives picks and tosses,
  so a daily-seeded harvest can ship later without a rewrite.

## 6. Art & sound

Sprites are hand-drawn pixel maps in the component (DESIGN.md tokens
only — blaze oranges and carrots, amber bananas, forest broccoli, lime
rind): 16 produce, plus the junk drawn as the sibling games' own sprites
(the CRASH can and doomscroll phone are Powerhouse's maps verbatim).
Sliced items split into clipped halves that tumble; each produce splats
its own juice colour. The blade is an ink-and-white polyline with a
0.14 s tail. Audio: slice whoosh, juicy pop, NEW PLANT ding, combo
arpeggio, dull thud + run-over sting on junk, sad slide on a drop.

## 7. Not built yet (sequenced)

- Daily-seeded harvest + streaks + share text (joins /daily).
- /share achievement-card hook ("87 portions · top 6% today").
- Golden-blueberry frenzy (screen-clear moment, Powerhouse berry motif)
  and a calm no-junk practice mode — candidates, unscheduled.
- Optional leaderboard (accounts-gated, ROADMAP E4 rules apply).

## 8. Status

v1 BUILT (2026-07-23, pivoted from Snake Oil the same day — §1):
src/lib/fiveaday.ts (+ unit tests incl. roster validation),
src/components/fiveaday/FiveADayGame.tsx, /five-a-day page, permanent
redirect from /snake-oil (next.config.ts), sitemap entry, typed
analytics events (fiveaday_run_started / fiveaday_run_ended — counts
only), listed in the /arcade hub with a BestChip. Name "Five a Day"
chosen by Mat (2026-07-23).
