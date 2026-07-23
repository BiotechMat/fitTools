# POWERHOUSE.md — the mitochondria arcade shooter

Spec + build record for **Powerhouse** at `/powerhouse`. Side-scrolling
shooter in the Gradius lineage, reskinned as the site's other thesis organ:
**you are the mitochondrion — the powerhouse of the cell — and the score is
the ATP you make before the junk gets you.** Sibling of Lifeline
(LIFELINE.md): Lifeline is the heart, Powerhouse is the cell.

## 1. Concept

A pixel mitochondrion (sweat-band determination, amber cristae) flies right
through a blood vessel, autofiring ATP bolts. Lifestyle junk streams in from
the right: free radicals, sugar spikes, cortisol clouds, 2am doomscroll
phones, armoured ultra-processed nuggets. Real health levers float by as
power-ups: protein (triple shot), creatine (swole shots), caffeine (rapid
fire), sleep (shield), blueberries (antioxidant burst — clears the screen),
water (+1 heart). Difficulty tiers are **heart-rate training zones**: Zone 1
WARM-UP through Zone 5 VO₂ MAX, then endless REDLINE. The synthesised
heartbeat soundtrack rises with the zone — 70 BPM at warm-up, 185 at
REDLINE. Each zone ends with THE CRASH, a giant energy-drink-can boss.
Losing all three hearts bonks the run: "BONKED IN ZONE 3 · 8,420 ATP ·
cause: cortisol."

## 2. Why it can travel (the Flappy DNA, armed)

- One verb — fly. Firing is automatic; drag or WASD to dodge. No tutorial,
  restart in one tap; the retry loop IS the game.
- "The mitochondria is the powerhouse of the cell" is a meme every player
  already knows. The game is the punchline; the share text leans in
  ("…I was not.").
- Scores carry meaning twice: ATP (bragging number) and the zone you died
  in (training-zone flex — "I redlined" is a sentence people say).
- The kill-streak multiplier (×1–×5, reset on hit) is the greed loop; the
  bonk card is designed to be screenshotted (Anton + stickers + cause gag).
- Web-native share hook: one button copies/shares the score line.

## 3. Guardrails (binding — inherited from LIFELINE.md §3)

- **A cartoon, not cell biology.** The page says so and links the real
  Heart Rate Zone calculator — the game is a funnel to the evidence, never
  a claim about the player. Bonk gags target the cartoon organelle, never
  the user (the ROADMAP positive-frame line, applied to comedy).
- Enemies are habits and molecules, not foods with brand names; power-ups
  are levers the content section actually covers (protein, sleep,
  hydration, berries, creatine, caffeine).
- No dark patterns: no lives meter beyond the run, no timers, no currency,
  nothing bought, no penalty for enemies that fly past.
- Sound is synthesised (WebAudio), starts only after user input, mutable,
  mute persisted. No autoplaying audio, ever.
- Works without sound, without localStorage, on touch, and respects
  `prefers-reduced-motion` (no screen shake).

## 4. Mechanics & tuning (src/lib/powerhouse.ts is the source of truth)

- Logical canvas 420×560 (portrait — mobile-first like Lifeline), player
  clamped to the left 60%; vessel walls top/bottom are boundaries, not
  hazards. Hearts (3) are the fail state; brief invulnerability after hits.
- Zones are boss-gated: THE CRASH spawns 22 s into each zone; killing it
  advances the zone (BPM up, spawns faster, new enemy kind unlocked, next
  can has more HP). Beyond Zone 5, REDLINE scales forever (floors/caps in
  `spawnIntervalFor`/`speedMulFor`/`bossHpFor` keep it survivable-ish).
- Score: enemies drop ATP (25–50, boss 500) × streak multiplier
  (`multiplierFor` = 1 + streak/8, capped ×5, reset when hit); sparks +5.
- Drops: ~9% of kills (`rollDrop`), boss always drops; water only rolls
  when a heart is missing. Buffs last 8 s each and stack across types.
- Enemy behaviours: radical (sine), sugar (fast straight), cortisol (slow,
  aims stress bullets from Zone 3), doomscroll phone (tracks your Y),
  ultra-processed (3 HP tank). Collision is circle-vs-circle
  (`hitsCircle`).
- Seeded RNG (mulberry32, shared with Lifeline) so a daily-seeded mode can
  ship later without a rewrite (DAILY-GAMES ethos: deterministic, no
  runtime LLM).

## 5. Art & sound

Sprites are hand-drawn pixel maps in the component (palette = DESIGN.md
tokens only: ink outlines, Blaze/Ember body, amber cristae, lime ATP
bolts), rendered to offscreen canvases at 2–3× nearest-neighbour. Kinds:
mito (2 engine frames), radical, sugar cube, cortisol cloud, doomscroll
phone, nugget, THE CRASH can, egg, creatine tub, coffee bean, moon,
blueberry, water drop, ATP spark, HUD hearts. Audio is the Lifeline
oscillator synth grown up: pew chirps, pop explosions, pickup dings,
zone-up fanfare, boss klaxon — and a lub-dub heartbeat kick scheduled at
the current zone's BPM (single thump above 140, like a real max-effort
heart).

## 6. Not built yet (sequenced)

- Daily-seeded run + streak + share text (joins /daily).
- /share achievement-card hook ("Redlined · 21,300 ATP · top 4% today").
- Optional leaderboard (accounts-gated, ROADMAP E4 rules apply).

## 7. Status

v1 BUILT (2026-07-23): src/lib/powerhouse.ts (+ unit tests),
src/components/powerhouse/PowerhouseGame.tsx, /powerhouse page, in the
sitemap. Lives in the **/arcade hub** (src/app/arcade/page.tsx +
src/components/arcade/BestChip.tsx) alongside Lifeline and a card for the
dailies; the nav and homepage CTA point at /arcade, and /daily, /lifeline
and /powerhouse cross-link each other. Name "Powerhouse" proposed, not
locked.
