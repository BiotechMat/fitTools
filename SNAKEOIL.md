# SNAKEOIL.md — the myth-slicing game

Spec + build record for **Snake Oil** at `/snake-oil`. Swipe-to-slice
arcade game in the Fruit Ninja lineage, reskinned as the site's most
differentiated asset made playable: **fitness claims fly; slice the
myths, spare the truths, and the death card serves the receipt — a real
cited source.** Fourth sibling in the arcade (LIFELINE.md,
POWERHOUSE.md, MAXOUT.md); picked from the ARCADE-IDEAS.md §3.2
shortlist because it converts the debunk bank into reflex gameplay, so
growing the myth registry (STATUS.md Phase 1) makes the game richer for
free.

## 1. Concept

The wellness expo has lost control of its stock. Bottles, tins and flasks
arc across the screen, each flying a slogan chip: "8 GLASSES A DAY",
"SWEAT OUT THE TOXINS", "3–5 G CREATINE WORKS". Swipe to slice. Busting a
myth pays 10 points (multi-myth swipes combo); a fact correctly left to
fall pays 5 ("TRUE · SPARED"). Slice a truth in half — or let a myth
escape off the bottom ("it's loose in the group chat") — and it costs a
heart. Three mistakes and the run ends: "SNAKE OILED · 41 myths busted ·
620 pts", plus the receipt: the registry item behind whichever claim got
you, with its explanation, source link and on-site evidence link. Waves
tighten the tosses, unlock harder claims, and raise the share of facts —
later waves pressure the reading, not just the wrist.

## 2. Why it can travel (the Flappy DNA, bladed)

- One verb — swipe. "Slice the myths, spare the truth" is the whole
  tutorial; restart in one tap.
- Knowledge IS the reflex: the discrimination (myth or fact, at speed) is
  the skill, which makes every run a quiz the player didn't notice
  sitting.
- The score reads as a sentence — "I busted 41 myths" — and the cause
  line is the shareable joke: "Cut '3–5 G CREATINE WORKS' clean in half.
  It was true."
- Credibility compounds (DAILY-GAMES §1.3): every death delivers a cited
  correction at the peak-attention moment. The game is an evidence
  delivery mechanism wearing a blade.

## 3. Guardrails (binding — inherited from LIFELINE.md §3 + DAILY-GAMES §2)

- **Every claim ships with a real source.** The roster derives entirely
  from the daily-games registry (src/registry/daily.ts) — myths as the
  slogan circulating in the wild, facts as the cited correction —
  enforced by `validateClaims` in the unit tests. No claim is authored
  from memory; the receipt's source comes verbatim from the registry.
- Claims are about the world, never the player (DAILY-GAMES §2.2), and
  fail gags target the myths and the cartoon, never the user.
- The container never encodes the verdict — the label is the only tell,
  by design. No dark patterns: no timers, no currency, nothing bought.
- Sound is synthesised (WebAudio), starts only after user input, mutable,
  mute persisted. Works without sound, without localStorage, on touch,
  and respects `prefers-reduced-motion` (fewer particles, no shake).

## 4. Mechanics & tuning (src/lib/snakeoil.ts is the source of truth)

- Logical canvas 420×560 (portrait, DPR-scaled). Pointer strokes queue
  into the frame loop; slicing is segment-vs-circle
  (`segmentHitsCircle`, generous 30 px radius — the label is the
  target), with a 6 px minimum segment so trembles don't slice.
- Roster: 19 claims (9 myths, 10 facts) in CLAIMS, ordered easy → hard;
  order = unlock order (`unlockedClaimCount`: 8 + 2/wave). Three of each
  verdict guaranteed in the opening eight (validated).
- Waves every 10 s: spawn interval 1.5 → floored 0.55 s
  (`spawnIntervalFor`), bursts of up to 3 from wave 3 (`burstSizeFor`),
  fact share 0.28 → capped 0.45 (`factChanceFor`). Identical claims are
  kept out of shared airspace at toss time.
- Tosses (`launch`): arcs that apex in the upper half and stay on
  canvas (unit-tested by simulation); gravity 620 px/s².
- Scoring: myth +10, spared fact +5, combo bonus (n−1)×15 when one swipe
  busts n myths inside a 0.35 s window (`comboBonusFor`). Best persisted
  = myths busted (the sentence number), key fittools.snakeoil.best.
- Receipts (`receiptFor`): myth-derived claims serve the registry
  explanation; ballpark-derived facts serve the registry context; both
  carry source label/url and the item's related tool/content route.
- Seeded RNG (mulberry32, shared with Lifeline) drives picks and tosses,
  so a daily-seeded gauntlet can ship later without a rewrite.

## 5. Art & sound

Sprites are hand-drawn pixel maps in the component (DESIGN.md tokens
only): snake-oil bottle (amber cork, ember glass, paper label), forest
tin, lime-liquid flask — assigned per claim by id hash, uncorrelated
with verdict. Containers spin lazily; the slogan chip stays level because
it IS the game. Sliced containers split into two clipped halves that
tumble; myths splat ember with a "BUSTED +10" toast. The blade is an
ink-and-white polyline with a 0.14 s tail. Audio: slice whoosh, bust
pop+ding, combo arpeggio, dull double-thunk on a sliced truth, sad slide
on an escape, soft ding on a spare.

## 6. Not built yet (sequenced)

- Daily-seeded gauntlet + streaks + share text (joins /daily).
- /share achievement-card hook ("Busted 41 myths · top 5% today").
- Roster growth: new claims ride on myth-bank growth (STATUS.md Phase 1)
  — every new vetted MythItem is a candidate slogan + correction pair.
- Optional leaderboard (accounts-gated, ROADMAP E4 rules apply).

## 7. Status

v1 BUILT (2026-07-23): src/lib/snakeoil.ts (+ unit tests incl. roster
validation), src/components/snakeoil/SnakeOilGame.tsx, /snake-oil page,
sitemap entry, typed analytics events (snakeoil_run_started /
snakeoil_run_ended — counts only, no claim-level judgements), listed in
the /arcade hub with a BestChip. Verified: typecheck + lint + full test
suite + production build + a Playwright browser run (ready → slices →
death card with a live receipt, no console errors). Name "Snake Oil"
proposed, not locked.
