# LIFELINE.md — the heartbeat arcade game

Spec + build record for **Lifeline** at `/lifeline`. One-button arcade game
in the Flappy Bird lineage, reskinned as the site's thesis: **you are the
heartbeat, and the score is the age you reach.**

## 1. Concept

A pixel heart flies right, drawing an ECG trace behind it. Tap to flap;
gravity pulls you down. Risk-factor columns (sugar, smokes, all-nighters,
stress, the sofa) scroll toward you with gaps to thread. Healthspan pickups
(broccoli +2 yrs, sleep +1 yr) float in awkward spots. Hitting anything
flatlines the run: "FLATLINED AT 61 · cause: the sofa". Age starts at 18
and climbs with survival time; each decade raises the tempo and narrows the
gaps. Reaching 100 (the centenarian club) is intentionally near-impossible.

## 2. Why it can travel (the Flappy DNA)

- One input, no tutorial, restart in one tap — the retry loop IS the game.
- The fail state is the joke: cause-of-death gags make losses shareable.
- Scores are ages: "I flatlined at 43" carries meaning "score 43" never did.
- Medals at 40/60/80/100 (bronze/silver/gold/centenarian), best persisted.
- The game-over card is designed to be screenshotted (Anton + stickers).

## 3. Guardrails (binding)

- **A cartoon, not a prediction.** The page says so explicitly and links the
  real Heart Age calculator — the game is a funnel to the evidence, never a
  claim about the player. Death gags target the cartoon heart, not the user
  (the ROADMAP positive-frame line, applied to comedy).
- No dark patterns: no lives, no timers, no currency, nothing bought.
- Sound is synthesised (WebAudio), starts only after user input, mutable,
  mute persisted. No autoplaying audio, ever.
- Works without sound, without localStorage, and on touch.

## 4. Mechanics & tuning (src/lib/lifeline.ts is the source of truth)

- Logical canvas 420×560 (portrait), DPR-scaled, nearest-neighbour sprites.
- Physics: gravity 1500 px/s², flap impulse −420 px/s, terminal fall
  520 px/s; heart rotates with velocity (the Flappy nod).
- Age = 18 + 1.5·seconds + pickup bonuses. Speed, spawn interval and gap
  width are functions of age (see `speedAt/spawnIntervalAt/gapAt`): speed
  150→, gap 118px floor 66px, spawn 1.45s floor 0.9s.
- Pickups: ~35% of columns carry one in/near the gap. Veg +2 yrs, sleep +1.
- Collision is circle-vs-column rects (`hitsColumn`) plus canvas edges.
- Seeded RNG (`mulberry32`) so a daily-seeded mode can ship later without a
  rewrite (DAILY-GAMES ethos: deterministic, no runtime LLM).

## 5. Art & sound

Sprites are hand-drawn pixel maps in the component (palette = DESIGN.md
tokens: ink outlines, Blaze heart, paper wing shine), rendered to offscreen
canvases at 4× nearest-neighbour. Kinds: heart (2 wing frames), fizzy can,
cigarette, moon, sofa, broccoli, Z-tile. Audio is a tiny oscillator synth:
flap blip, pickup ding, decade tick, flatline tone.

## 6. Not built yet (sequenced)

- Daily-seeded run + streak + Wordle-style share text (joins /daily).
- /share achievement-card hook ("Lived to 92 · top 6% today").
- Optional leaderboard (accounts-gated, ROADMAP E4 rules apply).

## 7. Status

v1 BUILT (2026-07-23): src/lib/lifeline.ts (+ unit tests),
src/components/lifeline/LifelineGame.tsx, /lifeline page, linked from
/daily. Name "Lifeline" proposed, not locked. Now listed in the /arcade
hub next to its sibling Powerhouse (POWERHOUSE.md), which also gave it a
sitemap entry and an Arcade breadcrumb.
