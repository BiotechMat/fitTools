# DAILY-GAMES.md — Daily ritual games (`/daily`)

Companion to `SPEC.md` (the build), `ROADMAP.md` (engagement sequencing),
`PULSE.md` (the fact feed this shares content DNA with), `DESIGN.md` (visual
identity) and `METHODOLOGY.md` (evidence posture). This document specifies the
**daily ritual games**: small, bounded, source-cited games that give the site a
"same small thing, same time tomorrow" return loop — the Wordle/Duolingo slot
that no other roadmap phase owns.

Two launch games, one surface (route `/daily`):

- **Ballpark** — a daily guess-the-stat: one cited number, one slider, one
  guess, a closeness score and a spoiler-free share grid.
- **Myth or Fact?** — a weekly five-round quiz drawn from the debunk pool.

**Status:** v1 vertical slice **built** (2026-07-23) — registry, deterministic
schedule/scoring/store libs (all unit-tested), the `/daily` UI (both games,
streak, share) and analytics are in the tree and verified (typecheck + tests +
browser run). See §15 for the as-built map and what's deferred. Slots into
ROADMAP **E3** (day-1 achievement, streaks) and **E5** (content cadence), with
**E1** (share loop) as the image-card dependency. Built client-side on the
existing stack — no accounts, no API, no new dependencies.

**Naming note:** *Ballpark* is **locked** (Mat, 2026-07-23) as the name of the
guess-the-stat game — the built routes/keys (`ballpark`) already match. *Myth
or Fact?* remains a working title pending sign-off (§12.1).

---

## 1. Strategic fit — the missing daily loop

Pulse is a bottomless graze: open it any time, scroll as long as you like.
The games are the opposite shape — **bounded, scheduled, and finishable** —
and that shape is what builds a calendar habit:

1. **Appointment mechanics.** One puzzle per calendar day, identical for every
   visitor (§5). Finishing takes under a minute, ends with a win-state, and
   cannot be binged — tomorrow is the only way to get more. Scarcity of the
   *game*, never guilt about the *player*.
2. **Water-cooler comparability.** Because everyone gets the same puzzle, a
   shared result grid is meaningful ("I was 🎯, you were ❄️") — the Wordle
   share loop, powered by the same peak-satisfaction moment ROADMAP §1 calls
   out.
3. **Credibility compounds.** Every reveal is a cited, tiered fact. The game
   *is* an evidence delivery mechanism: the player walks away knowing the real
   number and where it came from — on-brand in a way a trivia gimmick never is.
4. **Internal-linking engine.** Every item deep-links a related tool or article
   (`CONTENT-reference.md` §8 cross-linking is a build requirement). "Guess the
   average adult VO₂max" → reveal → "measure yours" is the cleanest tool
   on-ramp on the site.

---

## 2. Non-negotiable guardrails

The games inherit every ROADMAP §2 guardrail and add their own:

1. **Every answer is sourced.** Same registry discipline as Pulse (§2.1 there):
   `source.url` mandatory, `<EvidenceTier />` badge on the reveal, no item
   ships without a verified primary source. A scored game that's *wrong* is a
   credibility hit worse than no game.
2. **Questions are about the world, never about the player.** Population stats,
   study findings, physiology constants — fine. "Guess *your* body fat" or any
   guess-about-yourself mechanic — never. The player is the guesser, not the
   subject.
3. **Positive frame (ROADMAP §2.1).** Scoring celebrates closeness; a cold
   guess gets a warm reveal ("most people are way off — the real number
   surprises everyone"), never a dunk on the player.
4. **Graceful streaks only (ROADMAP §2.4).** Played-streaks, not perfect-
   streaks; freezes and rest days; warm re-entry. No loss theatre, no guilt
   copy, no decaying flames.
5. **No runtime LLM — by design, not omission.** Unlike Pulse, the games are
   **hand-authored and deterministic**. A shared daily puzzle must be identical
   for everyone, knowable in advance, and exactly scoreable; generation adds
   cost and risk and buys nothing here. (Claude may help *draft* items
   offline; everything ships through editorial review and the registry.)
6. **British English; no new dependencies; zero-CLS; consent-gated analytics**
   (CLAUDE.md, SPEC §12–§13).

---

## 3. The games

### 3.1 Ballpark (daily)

One numeric question per day: *"What percentage of UK adults meet the
150-minute weekly activity guideline?"* — slider between authored bounds →
lock in → reveal.

- **Guess:** a slider across `[sliderMin, sliderMax]` (authored per item, with
  optional log scale for spans like "steps per day"). One guess per day; the
  slider's starting position is randomised so the default isn't an anchor.
- **Score:** closeness tier by relative error against the slider span:
  🎯 **Bullseye** ≤ 5% · 🔥 **Hot** ≤ 15% · 👍 **Warm** ≤ 30% · ❄️ **Cold**
  otherwise. (Thresholds are tuning constants — §12.) Tiers, not points:
  friendlier, and nothing to leaderboard prematurely.
- **Reveal:** the real number (count-up animation, honouring
  `prefers-reduced-motion`), one sentence of context, the `<EvidenceTier />`
  badge, the source link (always visible), and the related tool/article links —
  the cross-link payoff (§1.4).

### 3.2 Myth or Fact? (weekly — Mondays)

Five statements drawn from the debunk pool (`myth-buster` /
`marketing-claim` tier material): *"Cold plunges after lifting boost muscle
growth — myth or fact?"* Tap a verdict per round; each reveal explains the
truth with its source; finish with a score (*4/5*) and a share row.

Weekly, not daily: the myth pool grows slower than the stat pool, and a
Monday cadence gives the week a second anchor without cannibalising Ballpark.
Promote to daily only if the pool sustains it (§12).

---

## 4. Content model — `src/registry/daily.ts`

Typed registry, same single-source-of-truth pattern as `pulse.ts` / glossary /
recovery. EvidenceTier vocabulary reused from the peptides registry (as Pulse
does).

```ts
// shapes; align imports with src/lib/pulse/types.ts conventions
export interface BallparkItem {
  id: string;                  // stable kebab-case
  question: string;            // the prompt, British English, self-contained
  answer: number;              // the cited value
  unit: string;                // "%", "kcal", "bpm", "hours" …
  sliderMin: number;
  sliderMax: number;           // authored bounds; answer must lie within
  logScale?: boolean;          // for wide spans (steps/day, kcal)
  context: string;             // one-sentence reveal copy
  tier: EvidenceTier;
  source: Source;              // mandatory — no item without one
  relatedTool?: string;        // validated against the tool registry
  relatedContent?: string;     // validated to resolve
  relatedChunk?: string;       // optional Pulse chunk id (validated) — shared DNA
  lastReviewed: string;        // ISO date, registry convention
}

export interface MythItem {
  id: string;
  statement: string;           // phrased as the claim circulating in the wild
  verdict: "myth" | "fact";
  explanation: string;         // the honest, cited resolution (nuance lives here)
  tier: EvidenceTier;
  source: Source;
  relatedTool?: string;
  relatedContent?: string;
  relatedChunk?: string;
  lastReviewed: string;
}
```

**Validation (build-time, registry test):** unique ids; `source.url` non-empty;
`sliderMin < answer < sliderMax`; cross-links (`relatedTool` /
`relatedContent` / `relatedChunk`) resolve; tags-free by design (the games
don't filter). Broken anything fails the build.

**Authoring & scale:** launch targets **~90 Ballpark items** (three months of
dailies) and **~40 Myth items** (eight weeks). Harvest from the Pulse corpus,
recovery clusters, glossary and METHODOLOGY reference data — already-vetted
claims with numbers or popular misconceptions attached. Every new item brings
its own verified primary source; none are authored from memory (CLAUDE.md:
never guess constants).

---

## 5. Determinism & the day boundary

- **Puzzle number.** `N = daysSince(LAUNCH_EPOCH, localDate)` in the player's
  local calendar date — the Wordle convention. Midnight-local roll feels
  natural; cross-timezone comparability holds because shares carry the puzzle
  number, not the date.
- **Selection.** Item for day `N` = a **seeded permutation** of the item list
  indexed by `N` (mulberry32 is already in `src/lib/pulse/rank.ts` — reuse
  it). No repeats until the pool exhausts; new items append to the tail of the
  permutation domain so past days never change retroactively. Myth or Fact
  keys the permutation by ISO week instead.
- **Client-side, answers in the bundle — accepted trade-off.** The `/daily`
  route is its own code-split chunk (the build already splits per tool); the
  registry ships in it, so a determined player can read tomorrow's answer from
  the source. Wordle shipped exactly this way for years — for a casual,
  no-stakes game the simplicity is worth it, and it keeps the surface
  client-side per CLAUDE.md's default. Revisit an API only if integrity ever
  matters (aggregate scoring, prizes — §13).

---

## 6. Streaks & achievements (E3 threads)

- **Played-streak, never perfect-streak.** Showing up counts; the tier doesn't.
- **Freezes:** one earned per completed week, auto-applied on a missed day, no
  ceremony. A returner after a long gap gets warm re-entry copy ("Welcome back
  — day one of a new run"), never a loss screen (ROADMAP §2.4; DESIGN §6's
  no-loss-animation rule).
- **Day-1 badge.** First game completed = the site's cleanest day-1
  achievement ("First rep") — the top retention lever in ROADMAP §1. Feeds the
  E3 badge system when it exists; until then it's local copy.
- **Ember tie-in (later).** Game plays feed the same activity signal as any
  other engagement when the E3 identity/XP layer lands.

---

## 7. Share (E1 thread)

- **Spoiler-free, always.** The share payload never contains the question, the
  answer, or the player's guess — only the game, puzzle number, tier/score and
  a 7-day emoji row:

  ```
  Ballpark #42 🎯
  ❄️👍🔥🎯🔥👍🎯
  fittools.example/daily
  ```

- **v1 = Web Share / clipboard** (same degradation posture as Pulse §4).
  **OG-image card lands with the E1 pipeline** — branded espresso-ground story
  format per DESIGN §6, shared dependency with Pulse's share card; build once,
  serve both.
- Share fires at the reveal — the peak-satisfaction moment (ROADMAP §1).

---

## 8. Persistence — `src/lib/daily-store.ts`

Same local-first, guarded, sync-ready pattern as `pulse-store.ts` /
`history.ts`: pure node-testable core + guarded `localStorage` wrapper +
change event.

- Key `fittools.daily.v1`: a versioned document
  `{ version: 1, results: { [dateISO]: { game, tier | score, guess? } },
  streak: { current, best, freezes, lastPlayed } }`.
- Tolerant parse; corrupt storage degrades to empty; private-mode degrades to
  session-only — never a broken game.
- **E0 merge strategy (documented now):** union `results` by date;
  `max(current, best)` on streaks; freezes take the larger balance. No data
  loss for the anonymous player who later signs up.

---

## 9. SEO & the archive

- `/daily` is a server-rendered canonical page (shell + streak-free copy);
  the puzzle itself hydrates client-side to respect the local date.
- **Archive pages** `/daily/archive/<date>` publish **only after the date has
  rolled** (never same-day — spoilers): question, answer, context, source,
  EvidenceTier and related links, `Question`/`Answer` JSON-LD, sitemap entries
  via the registry. Each archived question is an evergreen long-tail page
  ("what percentage of adults…") that routes into the tools — the same quiet
  strategic win as Pulse §1.2.

---

## 10. Analytics (SPEC §12 — typed events, consent-gated)

```ts
| { name: "daily_game_played"; params: { game: "ballpark" | "myth"; result: string } } // tier or "4/5"
| { name: "daily_game_shared"; params: { game: "ballpark" | "myth" } }
| { name: "daily_streak_freeze_used"; params: Record<string, never> }
| { name: "daily_related_click"; params: { id: string; target: string } }   // cross-link CTR
```

No timing signals, no guess values in events (a guess is the player's own
business). Success metrics: daily players, D7/D30 return among players vs
non-players, share rate, cross-link CTR, streak-active users.

---

## 11. UI & component inventory (DESIGN.md)

Tokens/type per DESIGN §1–§3. Zero-CLS: the reveal panel reserves its height
before the guess.

- **`<DailyHub />`** — the `/daily` page: today's Ballpark, the streak chip,
  and the Myth or Fact entry (Mondays; otherwise a quiet "returns Monday"
  state, no countdown theatre).
- **`<BallparkSlider />`** — a real `input[type=range]`: Anton number readout,
  Space Mono unit label, keyboard steppable, `aria-valuetext` with the unit
  ("about 4,500 steps").
- **`<RevealPanel />`** — count-up to the answer (respects
  `prefers-reduced-motion`), tier emoji + name, `<EvidenceTier />` badge,
  source link always visible, related tool/article links, share row.
- **`<StreakChip />`** — ember motif per DESIGN's Blaze language; shows
  current run and freeze state plainly; no decay animation exists.
- **A11y:** verdict buttons are real buttons with `aria-pressed`; the reveal
  announces via polite `aria-live`; the whole loop is completable by keyboard.

---

## 12. Decisions (2026-07-22) & open questions

Recorded so the rationale survives; changing a locked item is a spec change.

1. **Names — *Ballpark* LOCKED (Mat, 2026-07-23);** *Myth or Fact?* still
   proposed. The guess-the-stat game is *Ballpark* for good; the weekly quiz
   name awaits sign-off. Routes/keys use `daily`, `ballpark`, `myth` — the
   `ballpark` name is now fixed; `myth` stays cheap to rename until confirmed.
2. **Locked: deterministic + hand-authored, no runtime LLM** (§2.5). The
   contrast with Pulse is deliberate and load-bearing.
3. **Locked: local-midnight day boundary, puzzle-number comparability** (§5).
4. **Locked: played-streaks with freezes, never perfect-streaks** (§6).
5. **Locked: spoiler-free share; text v1, OG image with E1** (§7).
6. **Open (tuning):** tier thresholds (5/15/30%), freeze earn rate, slider
   anchor randomisation range — settle against playtesting.
7. **Open (later):** aggregate "closer than X% of players" social proof —
   needs the anonymous count API; sequence with E4 alongside poll
   infrastructure, with its own documented data posture. Myth or Fact daily
   promotion if the pool grows.

---

## 13. Out of scope (v1)

- **Runtime/AI question generation — never.** A scored game with a wrong
  answer is a trust incident; items are hand-authored and reviewed (§2.5).
- Leaderboards and head-to-head (E4 owns social status; duels may build on
  this later).
- Aggregate guess distributions / percentile-of-players (needs the count API —
  §12.7).
- Prizes, notifications/push (E5 newsletter infra), and any monetisation of
  the games surface (E6 posture; keep the ritual clean).

---

## 14. Build sequence (when scheduled)

1. **Registry + validation + test** — `src/registry/daily.ts`, seed ~30
   Ballpark + ~15 Myth items harvested from existing vetted content.
2. **`/daily` hub + Ballpark loop** — slider, reveal, local store, streak
   chip. This alone is the daily habit; ship it first.
3. **Share row** (text/clipboard v1, spoiler-free grid).
4. **Myth or Fact?** weekly loop.
5. **Archive pages + JSON-LD + sitemap** (§9) — the SEO payoff.
6. **Analytics wiring** (§10).
7. **E1 tie-in:** OG-image share cards when the pipeline lands; day-1 badge
   into the E3 achievement system when it lands.
8. Grow the banks to the §4 targets and fold new items into the E5 cadence.

---

## 15. Implementation status (v1 built — 2026-07-23)

A working, deterministic vertical slice is built and verified (typecheck +
46 daily unit tests within a green 423-test suite + a browser run of both
games). What exists:

- **Registry** — `src/registry/daily.ts`: 10 Ballpark + 9 Myth items, each
  citing a source **already vetted elsewhere in the repo** (caffeine/water/
  sleep tool configs, the sauna & cold-water clusters, the ApoB/Lp(a) glossary,
  Tanaka/ISSN/EFSA references). `validateDailyRegistry()` is unit-tested
  (unique ids, real source, answer strictly inside the slider, absolute
  routes). Below the §4 seed target — growing the banks is the next job.
- **Types** — `src/lib/daily/types.ts` (reuses the peptides `EvidenceTier`
  vocabulary so `<EvidenceTier />` renders reveals unchanged).
- **Schedule** — `src/lib/daily/schedule.ts`: pure, seeded day/week selection
  (reuses `mulberry32` from `pulse/rank.ts` — no new dep), no-repeat within a
  cycle, local-date puzzle numbers. Unit-tested.
- **Scoring** — `src/lib/daily/score.ts`: span-relative closeness tiers +
  log-aware slider mapping + deterministic non-anchor default guess.
  Unit-tested.
- **Store** — `src/lib/daily-store.ts`: guarded, versioned, sync-ready local
  store; played-streak with earned freezes (capped), warm re-entry, no loss
  state. Unit-tested incl. freeze/bridge/reset paths.
- **UI** — `src/components/daily/*` + `/daily` page: `DailyHub`, `Ballpark`
  (+ `BallparkSlider`, `RevealPanel`), `MythOrFact`, `StreakChip`. Local-date
  computed on mount (no hydration mismatch); zero-CLS skeletons; a11y
  (labelled range with `aria-valuetext`, `aria-pressed`-free real buttons,
  `aria-live` reveals, reduced-motion count-up).
- **Share** — spoiler-free Web Share/clipboard text (`src/lib/daily/share.ts`,
  unit-tested to leak no answer/question); the branded OG-image card is the
  E1-pipeline follow-on.
- **Analytics** — `daily_*` events added to the typed union (no timing, no
  guess values — §10).
- **Entry points** — nav link (`Daily`) and a homepage banner
  (`Play today's Ballpark`), alongside Pulse.

**Deliberately deferred (flagged to Mat):**
- **Game names:** *Ballpark* is **locked** (Mat, 2026-07-23); *Myth or Fact?*
  remains a proposal (§12.1) — the `myth` route/keys stay cheap to rename until
  it's confirmed.
- **Myth availability:** built as available all week (refreshing Mondays),
  a slight, better-UX deviation from §11's literal "Mondays-only" wording.
- **Saved/archive pages** (`/daily/archive/<date>`, §9) — not built; the daily
  is client-fetched like Pulse's.
- **OG-image share card** (§7) — depends on the E1 pipeline; text share ships now.
- **Bank growth** to the ~90 Ballpark / ~40 Myth v1 targets (§4).
