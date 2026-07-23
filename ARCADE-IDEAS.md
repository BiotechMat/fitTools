# ARCADE-IDEAS.md — candidate games for the /arcade roster

Brainstorm doc, 2026-07-23. **Proposals, not build instructions** — nothing
here is scheduled, specced or signed off. Companion to LIFELINE.md and
POWERHOUSE.md (the built siblings), DAILY-GAMES.md (the ritual games) and
DESIGN.md (identity). When an arcade build slot next opens (STATUS.md says
the near-term priority is content volume + instrumentation, not new
features), pick from here; each pick then gets its own spec doc before code,
like its siblings did.

---

## 1. The formula, distilled (the bar every idea must clear)

Lifeline and Powerhouse work because they share a shape. A candidate that
can't tick every box doesn't belong in the arcade:

1. **One verb.** Tap, drag, swipe, hold — one. No tutorial; a first-timer
   scores within five seconds.
2. **The retry loop IS the game.** Restart in one tap, run length 30–120 s.
3. **The score reads as a sentence.** "I flatlined at 61", "I made 8,420
   ATP" — never a bare number. If you can't say the score out loud and sound
   interesting, the theme is wrong.
4. **The fail state is the joke.** A screenshottable card (Anton + stickers +
   cause-of-death gag) that targets the cartoon, never the player.
5. **A funnel to real evidence.** Every game is a front door to a named
   calculator or content cluster; the page says "a cartoon, not advice" and
   links it.
6. **Guardrails inherited wholesale** (LIFELINE.md §3): no dark patterns, no
   currency, nothing bought; synthesised WebAudio only after input, mute
   persisted; works on touch, without sound, without localStorage; respects
   `prefers-reduced-motion`; seeded RNG (mulberry32) from day one so a
   daily-seeded mode is cheap; deterministic, no runtime LLM.

## 2. Gaps the next picks should fill

- **Audience:** both built games are cardio/cell. The lifting audience — 1RM,
  plate maths, DOTS, FFMI, strength standards, warm-up, volume: a third of
  the tool roster — has no game. Recovery (eight content clusters) and gut/
  nutrition have none either.
- **Verbs:** tap-to-flap and drag-to-dodge are taken. Unused and proven:
  time-the-press, swipe-to-slice, drag-a-paddle, swipe-to-steer, tap-to-drop,
  hold-and-release, alternate-tap.
- **Emotional range:** both games are adrenaline. One deliberately calm game
  would widen the arcade's register and funnel the breathwork cluster.

---

## 3. The candidates

Ordered by recommendation strength. All names proposed, not locked.

### 3.1 Max Out — the one-rep-max timing game ⭐ recommended

- **Lineage:** the golf-swing / stop-the-needle meter. **Verb:** tap at the
  right moment.
- **Loop:** a form meter sweeps; tap inside the green "perfect form" window
  to lock out a rep and add plates to the bar. Each rep the needle speeds up
  and the window narrows; the bar visibly bends, plates clang, the crowd
  synth rumbles. Three form breaks and the lift fails.
- **Score:** kg on the bar — "Max Out: 312.5 kg". Instantly meaningful to
  every lifter and absurd enough to share.
- **Fail card:** "FORM FAILED AT 240 KG · cause: ego lifting."
- **Power-ups (real levers only):** chalk (needle slows briefly), belt (one
  widened window), spotter (one free miss — the Lifeline check-up shield
  pattern), creatine (site has the calculator).
- **Funnel:** `one-rep-max-calculator` + `strength-standards` ("now find
  your REAL one-rep max — no needle").
- **Build note:** the cheapest build on this list — one screen, no scrolling
  world, pure timing; all the work is feel (thump, clang, near-miss wobble).
  Daily-seeded "daily bar" mode is natural.

### 3.2 Snake Oil — the myth-slicing game ⭐ recommended

- **Lineage:** Fruit Ninja. **Verb:** swipe to slice.
- **Loop:** claims fly up as bottles and cards with big 1–3 word Anton
  labels ("DETOX TEA", "SPOT REDUCTION", "8 GLASSES A DAY", "CREATINE
  WORKS"). Slice the myths — paper shreds, ink-splat "BUSTED" — but spare
  the facts: slicing a truth is a strike, three strikes ends the run. Combo
  multiplier for multi-myth slices. Knowledge IS the reflex.
- **Score:** myths busted — "I busted 41 myths, then I cut 'creatine works'
  in half."
- **Reveal:** the end card cites one busted myth with its real source and
  link — the Lifeline death-card fact pattern, powered by the **existing
  myth registry** (`src/registry/daily.ts`). Only `myth-buster`-tier items
  with settled verdicts qualify; every claim ships with its citation.
- **Funnel:** Myth or Fact? weekly, the debunk content, the supplement
  database.
- **Build note:** medium (canned projectile arcs + swipe trail + slice
  halves; no physics engine). Strategic synergy: STATUS.md Phase 1 is
  already growing the myth bank — this makes that work pay twice.

### 3.3 Knots — the foam-roller breakout

- **Lineage:** Breakout/Arkanoid. **Verb:** drag the paddle.
- **Loop:** the paddle is a foam roller, the ball a trigger-point ball, the
  brick wall a slab of pixel muscle with glowing knots. Break every knot to
  clear the region; levels tour the body (calves → quads → glutes → the
  T-spine boss). Power-ups drop from broken knots, all from the recovery
  clusters: massage gun (multiball), sauna (wide roller), sleep (slow-mo),
  compression (sticky paddle), heat (piercing ball).
- **Score:** knots released — "84 knots released · tightest spot: left
  glute."
- **Fail card:** "SEIZED UP · 84 knots · the left glute won."
- **Funnel:** the foam-rolling + recovery clusters and
  `recovery-readiness-index` — the recovery section's missing front door.
- **Build note:** medium; breakout physics is simple, level layouts are
  authored. "Release the knots" is literal foam-rolling language — the
  satisfaction is thematic for free.

### 3.4 Gut Feeling — the microbiome snake

- **Lineage:** Snake. **Verb:** swipe to turn.
- **Loop:** you're a friendly gut microbe colony snaking through a pixel
  gut. Eat plants to grow — and the twist carries the evidence meme:
  **variety scores**. A repeat plant is +1; a NEW species is +5 and adds a
  new-coloured segment. Chasing "30 plants" is the flex. Hazards are habits
  and molecules (ultra-processed blobs shrink you, stress bolts, 3am snack
  clouds) — never medicine (no antibiotics-as-enemy) and never real branded
  foods. Bite your own tail: dysbiosis.
- **Score:** species diversity — "23 species strong."
- **Fail card:** "DYSBIOSIS AT 23 SPECIES · cause: the 3am snack cloud."
- **Funnel:** the food reference (fibre), the supplement database
  (probiotics), future gut content. Gut health is enormous with exactly the
  Gen-Z audience DESIGN.md targets.
- **Build note:** easy-to-medium; snake is trivial, the variety/species
  system is the design work.

### 3.5 Exhale — the calm corner

- **Lineage:** none needed — breathwork itself. **Verb:** hold and release.
- **Loop:** hold to inhale as your ring grows, release to exhale as it
  shrinks; match the coach ring through box-breathing and 4-7-8 patterns.
  Clean breaths build a streak. **You cannot die in the breathing game** —
  by design there is no fail card; a session caps at ~2 minutes and ends
  "settled". The only arcade game where the high score lowers your heart
  rate.
- **Score:** longest clean-breath streak.
- **Funnel:** the breathwork recovery cluster (already written and cited).
- **Build note:** easy. Widens the arcade's emotional range from pure
  adrenaline; naturally reduced-motion- and silence-friendly. Keep it out
  of medal/best comparisons with the adrenaline games.

### 3.6 Cadence — the footstrike rhythm runner

- **Lineage:** rhythm games / Timberman. **Verb:** alternate taps (L/R
  footfalls).
- **Loop:** hold ~175 steps-per-minute to a synth beat (the evidence-backed
  cadence band); Perfect/Early/Late judgement windows; kerbs demand a timed
  double-tap hop. Three stumbles and you trip.
- **Score:** distance — "Faceplanted at 3.4 km."
- **Funnel:** `running-pace-calculator`, `race-time-predictor`,
  `heart-rate-zone-calculator`. Serves the runner audience.
- **Build note:** easy-medium; Powerhouse already proved the WebAudio
  BPM-scheduling this needs.

### 3.7 Backbone — the vertebra stacker

- **Lineage:** Stacker / Tower Bloxx. **Verb:** tap to drop.
- **Loop:** vertebrae swing across the screen; tap to drop each onto the
  spine. Overhang shears off (the classic satisfying slice); off-centre
  drops add lean and wobble — the spine slouches — while a perfect drop
  straightens it back (posture redemption). Topple = game over.
- **Score:** spine height — "1.92 m of spine, 24 vertebrae."
- **Fail card:** "SLOUCHED · undone by a wonky T7."
- **Funnel:** the exercise library's mobility work. Weakest strategic fit on
  this list (no dedicated posture tool to funnel) — ranked accordingly, but
  the theme is memeable ("my posture in a game").

### 3.8 Gains — the muscle merge jar (parked: heaviest build)

- **Lineage:** Suika / watermelon game. **Verb:** drag and drop.
- **Loop:** drop amino-acid blobs into a jar; identical ones merge up the
  ladder — amino acid → peptide → protein → myofibril → muscle fibre →
  MUSCLE, each tier a chunkier pixel blob with a face. Overflow the jar:
  "OVERTRAINED."
- **Score:** total gains.
- **Funnel:** the macro calculator (protein), `creatine-calculator`,
  `ffmi-calculator`.
- **Build note:** the one idea needing real 2D circle physics, written from
  scratch under the no-new-dependencies rule. Genuinely the most addictive
  lineage of 2023–24, but park it until someone wants to fund the physics.

---

## 4. Recommendation

Next slot: **Max Out** and **Snake Oil**, in that order.

- Max Out fills the biggest audience gap (lifters), is the cheapest build,
  and has the purest "one more go" loop — a narrowing timing window is the
  oldest greed mechanic there is.
- Snake Oil converts the site's most differentiated asset (the cited debunk
  bank) into reflex gameplay, rides on content work Phase 1 is already
  doing, and its share line does credibility marketing on its own.

Then **Knots** (the recovery section's front door), with **Exhale** as the
low-cost wildcard whenever a small slot appears. Gut Feeling and Cadence are
solid bench; Backbone needs a funnel to earn its place; Gains waits for a
physics appetite.

## 5. Anti-ideas (rejected on guardrails — recorded so they stay rejected)

- **Anything that measures the player.** No reaction-time-as-"reflex age",
  no balance-test scoring, no "guess your body fat" mechanics. Questions and
  scores are about cartoons and the world, never the player (DAILY-GAMES §2,
  LIFELINE §3). The line between Lifeline's cartoon age and a game that
  claims to measure you is the whole brand.
- **Craving/food-whacking or calorie games.** Punishing food desire is
  disordered-eating-adjacent; the fail joke would land on eating itself.
- **Idle/clicker with offline accrual.** Engineered compulsion — collides
  with the no-dark-patterns posture.
- **Cold-plunge endurance chicken.** "Hold it longer" inverts the actual
  evidence message (more is not better) and has safety optics.
- **Real branded foods as enemies** — standing rule from Powerhouse.

## 6. Shared build conventions (inherited by any pick)

Portrait 420×560 logical canvas, DPR-scaled; hand-drawn pixel sprite maps
rendered to offscreen canvases, nearest-neighbour; DESIGN.md tokens only;
pure logic module in `src/lib/<game>.ts` with unit tests + component in
`src/components/<game>/`; mulberry32-seeded from day one; typed analytics
events; arcade hub card + `BestChip` storage key; cross-links from the
sibling games' pages. Each shipped game gets its own spec doc
(<GAME>.md) recording concept, guardrails, tuning and status — this file
stays a brainstorm.
