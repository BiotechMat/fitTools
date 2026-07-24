# Bloodstream Runner — design record

A tools.fit arcade game. Single self-contained `index.html` — no build step, no
dependencies, no network requests. Name **proposed, not locked** (house
convention: Mat locks names).

> **House-rule note.** This game deliberately carries a meta layer the arcade
> bench (ARCADE-IDEAS.md §1.6) forbids for the free siblings: soft currency,
> cosmetic unlocks, streaks, a revive, and ad *stubs*. That exemption was
> confirmed by Mat for this build (2026-07-24) with the MONETISATION §2.6
> boundary intact: currency is **earned in play only, never bought**; it buys
> **cosmetics only**; the revive is an extra, **never a play-limit**; runs are
> unlimited. No real ad code ships — see §5.

---

## 1. Concept

**Pitch.** Temple Run in an artery: you are a white blood cell sprinting down
a vessel with an infection swarm on your tail. Swipe between three lanes,
jump clots, slide under valve flaps, dodge cholesterol plaque, carry oxygen.

**Why the theme is mechanically intrinsic.** The vessel *is* the runner
corridor — a tube is the one environment where an endless lane-runner needs no
framing excuse. Plaque narrowing the lanes is the arterial-health message
expressed as level design. The chase is infection: a stumble doesn't kill you,
it lets the swarm close in — death is always the *second* mistake made too
soon after the first, which is also how the body actually loses fights.

**Score sentence.** "I outran the infection for 842 m — score 3,120."

**Fail cards.** "Clipped a cholesterol plaque · 412 m", "Tripped on a clot",
"Face-first into a heart valve".

**Funnel.** Footer + settings link to tools.fit ("a cartoon, not cardiology");
natural cross-link targets are the Heart Age calculator and the heart-health
content when ported into the site.

**Visual identity (2026-07-24 rework, Mat's direction).** The game wears the
house arcade look of Lifeline/Powerhouse/Five a Day: warm paper ground
(`#FBF4EC`), Blaze/Ember vessel, flat DESIGN-token colours, ink outlines on
everything, and hand-drawn pixel sprites (string maps → offscreen canvases,
nearest-neighbour — the ARCADE-IDEAS §6 convention, sharing the sibling
games' palette letters: K ink, B blaze, E ember, A amber…). The whole world
renders into a low-resolution buffer (1/`view.pixelScale` of the screen)
upscaled nearest-neighbour, so lines, rings and particles land on the same
chunky pixel grid as the sprites. The infection virus sprite is a deliberate
cousin of Powerhouse's free-radical enemy. DOM chrome matches: card panels
with 2 px ink borders and hard ink drop-shadows, monospace ink numerals,
gold `#C99700` for currency text on paper.

**Controls.** One-finger swipes (left/right/up/down), one-handed portrait.
Keyboard (arrows/WASD/space) and mouse-drag equivalents. Swipe-down mid-air
fast-falls — a small expert technique.

**Run shape.** ~30–90 s. First 10 s nearly unfailable (tier-0 spawns, slow
base speed), then speed ramps linearly and pattern tiers unlock at 22 s and
45 s. Zones cycle by distance (Artery → Heart → Lungs) with palette lerps,
a 72 bpm heartbeat in the Heart, and an O₂-rich Lungs zone.

## 2. Psychological mechanism → concrete feature

| Mechanism | Feature that implements it |
|---|---|
| Sub-100 ms feedback | Every input has same-frame audiovisual response: lane whoosh + lean, jump tone + stretch, slide noise + squash, pickup particles + popup |
| Rising-pitch reward | `AudioSys.pickup(combo)` — orb blips climb a semitone per combo step, capped at +24 |
| Loss aversion (combo) | Combo multiplier ×1–×10 displayed centre-screen; a stumble zeroes it with a shatter animation (`comboBreak`), red flash and a pitch-drop crunch |
| "I almost had it" failure | Chase-gap death machine: a single hit never kills — it breaks combo and pulls the swarm close; only a second hit before the gap regenerates ends the run. Every death is a visible chain of two player mistakes |
| Near-miss thrill | Grazing a plaque mid-dodge (within `nearMissWindow`) pays a CLOSE! bonus + combo — danger is rewarded, so players steer toward it |
| Instant restart | Death → results in 0.7 s; RUN AGAIN / Enter / swipe-up / tap-outside-panel restarts in one input with zero loading |
| One-more-go framing | Results: animated count-up, "★ NEW PERSONAL BEST ★" or "Only 40 from your best!" near-miss line, rewards itemised, XP bar animating |
| Variable-ratio rewards | Each orb slot rolls plasma (14%) or a rare golden cell (1.2%, worth 25–40); power-ups appear at a randomised 220–420 m cadence |
| Second chance | One revive offer per run (only when the run is worth saving, ≥120 m), behind `showRewardedAd`; visible 5 s ring **auto-declines** — the pressure mechanic protects the player, never traps them |
| Endowed progress | XP bar starts 25% filled at every level, including level 1 (`xp.endowedFrac`) |
| Early win | First cosmetic (Matcha skin) costs 150 plasma ≈ reachable in session 2 |
| Escalating sunk value | Skin/trail prices escalate 150 → 1,800; equipped cosmetics visible in-run |
| Habit loop (streak) | Daily flame + 7-dot week, bonus grows +20/day to a 200 cap. A lapse silently resets to day 1 — no guilt copy, no punishment |
| Fresh daily content | 3 challenges picked deterministically from a 12-item pool by date seed (`mulberry32(dayKey)`), each paying plasma |
| Goal gradient | Feats list sorted nearest-completion-first with progress bars; thresholds tuned so 2–3 rows sit at 80–90% after a couple of sessions (`orbs400`, `close40`, `runs20`) |
| Social proof / challenge | Web Share (clipboard fallback) with a `#beat=SCORE` link; recipients get a title banner, an in-HUD target and a CHALLENGE BEATEN! moment |
| Session pacing | Interstitial stub only between runs, every 4th run, ≥150 s apart, never in a session's first 5 runs |

## 3. Engagement architecture map

- **Micro** (moment): combo + pitch-rise + near-miss bonuses + particles/squash/hit-stop/shake.
- **Meso** (run): grace-period ramp, zones as distance milestones, revive, results screen engineered for restart.
- **Macro** (days): plasma economy → cosmetics; XP levels with endowment; daily streak; daily challenges; 18 achievements; share/challenge links.

## 4. Tuning guide (`CONFIG` at the top of the script)

Everything below is hand-tunable; the listed values are the shipped defaults.

| Knob | Default | Effect of raising it |
|---|---|---|
| `run.baseSpeed` / `rampPerSec` / `maxSpeed` | 11.5 / 0.26 / 30 | Faster runs; shorter time-to-death. `rampPerSec` is the main difficulty screw — 0.26 puts the speed cap ~70 s in |
| `run.gracePeriod`, `tier2At`, `tier3At` | 10 / 22 / 45 s | When harder spawn tiers unlock. Push `tier3At` later if new players die before run 3 feels fair |
| `chase.stumbleCost` vs `regenPerSec` | 26 / 3.2 | The forgiveness window: after a stumble you need ~7 clean seconds before a second hit stops killing. Lower `regenPerSec` to make late game more lethal |
| `spawn.baseGap`, `gapShrinkPerSec`, `minGap` | 34 / 0.24 / 15 | Obstacle density over time. `reactSec` (0.55) is the fairness floor — don't go below ~0.4 |
| `scoring.comboStep` / `comboMaxMult` | 8 / 10 | How fast the multiplier climbs. First PB around run 5–8 mostly hangs on players learning to protect a ×3–×4 |
| `scoring.nearMissWindow` | 0.85 | Widen toward 1.0 to make CLOSE! more frequent (and combo cheaper) |
| `drops.plasmaChance` / `goldChance` | 0.14 / 0.012 | Economy faucet. At defaults a decent run banks ~10–25 plasma plus a golden roughly every 6–8 runs |
| `economy.distDivisor` | 45 | Second faucet (distance → plasma). Lower = richer |
| `shop.*.price` | 150…1,800 | Keep the first non-free item ≈ two sessions of earnings (see faucets above) |
| `xp.xpBase` / `xpPow` / `endowedFrac` | 420 / 1.35 / 0.25 | Level cadence; endowment fraction is the "bar starts filled" effect |
| `streak.*` | 40 + 20/day, cap 200 | Daily bonus curve |
| `revive.minDist` | 120 m | Below this the offer is skipped — don't interrupt throwaway runs |
| `ads.*` | every 4 runs, ≥150 s, first 5 free | Interstitial cap. `stubDurationMs` only affects the placeholder |
| `zones[]` | 420/380/380 m | Zone lengths, palettes, `orbMult` (Lungs 1.6 = the oxygen-rich reward zone), `pulse` (heartbeat) |
| `juice.*` | — | Shake px, hit-stop ms, particle cap, count-up ms |
| `view.curveAmp` / `curveK` | 0.8 / 0.0014 | How hard the vessel appears to bend. Purely visual — collisions are lane-based |
| `view.pixelScale` | 3 | World renders at 1/N screen resolution, upscaled nearest-neighbour. Bigger = chunkier pixels (and cheaper frames) |

**Difficulty calibration target.** Typical first session: runs of ~150–400 m
dying to tier-1/2 patterns; PB curve should still be moving at runs 5–8 as
players internalise slide-vs-jump and combo protection. If PBs plateau by run
3, raise `gapShrinkPerSec` or bring `tier2At` earlier; if players die in the
first 15 s, lengthen `gracePeriod`.

## 5. Monetisation stubs (no real ad code)

- `showInterstitial(onDone)` — called from the RUN AGAIN path via
  `maybeInterstitial`, capped by `CONFIG.ads`.
- `showRewardedAd(onReward, onDecline)` — called from the revive offer;
  completing grants the revive, skipping declines cleanly to results.
- Both render a clearly-labelled "AD PLACEHOLDER · STUB" overlay so the
  placements are visible in playtesting; replace the two function bodies with
  an SDK when/if ads are activated. Free-tier/premium split per MONETISATION
  §4.2 (premium removes ads) happens at integration time, not in this file.

## 6. Save schema

`localStorage["bloodstreamRunner.save"]`, versioned (`v: 1`) with a
`migrateSave` seam for future bumps. Holds best score/distance, plasma, XP,
level, unlocks + equipped cosmetics, streak, per-day challenge state, lifetime
counters for feats, settings (sound / haptics / reduced FX), ad pacing
counters. The game runs fine (unsaved) if localStorage is unavailable.
Flushed on `pagehide`.

## 7. Accessibility & guardrails

- `prefers-reduced-motion` auto-enables Reduced effects on first boot
  (toggleable): no shake, dimmed flashes, fewer particles.
- Sound synthesised on first gesture only; mute persisted; game fully
  playable silent.
- No fake scarcity, no countdown-pressure purchases (the only timer
  auto-*declines* the revive), no guilt copy anywhere, streak lapse resets
  silently, currency is never purchasable.
- "A cartoon, not cardiology" disclaimer on the title and in settings,
  with the tools.fit funnel link.

## 8. Five highest-leverage features if it gets traction

1. **Daily-seeded run + ghost replay** — the Lifeline pattern: one shared
   seeded course per day (seeded RNG is already in the file) plus a ghost of
   your best run. Turns solo play into an implicit daily leaderboard and
   doubles down on the streak habit.
2. **Death-card PNG generator** — canvas-composited share image (cause-of-death
   gag + score + skin) instead of plain text; the sibling games' death cards
   are their best organic channel.
3. **Missions-as-mastery ladder** — three persistent multi-run missions
   (e.g. "finish a run in the Lungs twice") that gate the *next* cosmetic
   tier, adding a mid-horizon goal between dailies and feats.
4. **Boss moments** — a scripted set-piece every full body cycle (e.g. the
   heart's valve gauntlet at 1,180 m) with a unique fanfare; gives runs a
   narrative peak, screenshots, and a "did you reach the second heart?" hook.
5. **Site integration + account sync** — move under `/arcade`, register the
   `BestChip` storage key, sync plasma/unlocks/streak through the ACCOUNTS.md
   §6.2 namespace registry, and surface "Bloodstream best" on the dashboard.
   (Placement: `public/` would serve it as-is; a React port is cosmetic since
   all state is in one file.)

## 9. Verification record (2026-07-24)

Headless Chromium (390×844, DPR 2) automated pass, re-run in full after the
pixel-art rework: title → run → forced double-stumble death → revive offer →
decline → results → restart (~70 ms including driver overhead) → second
death → results; save integrity across runs; two-tap shop purchase + equip +
feat unlock; challenge/feat sheets; `#beat=` link banner; interstitial stub
cap logic; jump-clears-clot, slide-clears-valve, clot-stumble-continues,
lane-dodge physics checks; 55–61 fps; zero console/page errors.
