# PERFORMANCE-LAB.md — the performance measurement hub

**Spec + build record.** MVP BUILT (2026-07-24, Mat's direction — see §13):
the hub at `/performance-lab` with the top-three stations Reaction, Recall
and Track. The rest of this doc remains the blueprint for the bench
(Vigil, Switch, Steady, Wide Angle, Breathe). Direction and scope for a
"Performance Lab" — a hub of HTML5 stations that measure the player:
reaction time, working memory, peripheral awareness, coordination,
cognitive flexibility, hand–eye, sustained focus, plus one guided
breathing practice. Companion to ARCADE-IDEAS.md, DAILY-GAMES.md,
DASHBOARD.md and DESIGN.md. STATUS.md's directive stands: the near-term
priority is content volume + instrumentation, not new features — this doc
exists so the idea is specced before a build slot opens.

**Direction update (Mat, 2026-07-24):** measuring and comparing the player
is a first-class product feature. The earlier draft's guardrails — the
arcade/Lab "wall", the composite-score and percentile ban, the norms
gating, and the binding timing-protocol rules — are removed; the former
site-wide "never measure the player" rule is retired (ARCADE-IDEAS §5 and
DAILY-GAMES §2 record the scoping). Percentiles, norms, composite scores
and leaderboards are all in scope.

---

## 1. Concept & positioning

The site has three play surfaces — the **arcade** (cartoon games), the
**dailies** (knowledge ritual) and **Pulse** (cited facts). The
Performance Lab is the fourth: **test yourself, get your number, see how
you stack up, come back and beat it.** Lineage: Human Benchmark — a site
whose reaction and memory tests draw tens of millions of visits on a
fraction of our engineering — on our platform, with our funnels.

The differentiation:

1. **Every station is a named, cited paradigm** (psychomotor vigilance,
   Corsi span, task-switching, Fitts tapping, SART — §4), not an invented
   minigame. The station page explains the paradigm and links its lineage,
   the way tool pages cite their formulas.
2. **Comparison is the hook.** Your score, immediately; where you sit
   against other players ("faster than 74%"); your trend over weeks. The
   Lab feeds the dashboard's Trajectory (DASHBOARD §3.5) — it is the only
   surface that can generate frequent, repeatable longitudinal data
   without accounts.
3. **Every station funnels to evidence we already publish.** Reaction time
   and vigilance move with sleep and caffeine → the sleep-environment
   cluster and caffeine content; slow breathing → the breathwork cluster;
   and so on (§4, per-station). The Lab converts curiosity about
   *yourself* into visits to the cited content, which is the whole site
   model.

## 2. Next to the arcade

The arcade games are cartoons about the world; the Lab measures the player
directly. Both live in the same "Play"-adjacent IA and cross-link freely —
the arcade card grid can carry a "test yourself" rail into the Lab and
vice versa. The register differs so the two surfaces stay legible: arcade
pages speak in Anton stickers and gags; Lab stations speak like
instruments — plain stimulus, plain number, stated unit (Space Mono).

Stations that could be mistaken for a medical assessment carry the site's
standard disclaimer component with the *specific* line (§4): the
peripheral station is not perimetry; the focus station is not an
attention-disorder screen; the memory station is not a health screen.
These are the same compliance components every tool page carries and stay
per the standing rule (claude.md Don'ts).

## 3. Scores, comparison and norms (the feature set)

- **Instant score, Human Benchmark model.** Every run ends on the number,
  big, with a one-tap retry.
- **Percentile placement.** "Faster than 74% of players" on the result
  screen. Sources, in order of availability: published normative bands at
  launch; pooled player results once an aggregate endpoint or accounts
  (ROADMAP E0) exist. Percentile lines follow the ROADMAP §2
  flattering-by-default presentation, which already permits "top X%".
- **Composite score.** A cross-station aggregate ("Lab Score") is an open
  product option — one number is the most shareable thing a battery can
  produce. Design detail (weights, naming) belongs to the build spec.
- **Leaderboards.** Open option, accounts-gated (ROADMAP E4 rules apply,
  as for the arcade).
- **Trends.** Every result persists locally; Lab metrics register in
  `src/registry/metrics.ts` so Trajectory charts them beside calculator
  history.
- **Timing note.** Browser input/display latency varies by device and
  browser; how each station samples, averages and presents timings is an
  implementation detail for the build spec, not a product constraint.

## 4. The battery — eight stations

Names proposed, not locked (house convention). Each entry: paradigm and
lineage, loop, the score sentence, funnel, build note. Build shape for
all: pure logic module + tests, canvas or DOM component, station page
(§7).

### 4.1 Reaction — reaction time

- **Paradigm:** simple visual reaction time; lineage the psychomotor
  vigilance task (Dinges & Powell, 1985).
- **Loop:** hold on the pad; after a random delay it changes; tap. Five
  taps, score on the spot.
- **Score sentence:** "231 ms average."
- **Funnel:** sleep-environment cluster + caffeine content — reaction time
  is the classic sleep-debt/caffeine variable; "test it all week" is the
  trend hook.
- **Build note:** cheapest station; ship first.

### 4.2 Recall — working-memory span

- **Paradigm:** visuospatial span; lineage the Corsi block-tapping task
  (Corsi, 1972); digit span (forwards/backwards) as a later second mode.
- **Loop:** a 3×3 grid lights in sequence; reproduce it. Start at 3, +1
  per success, two misses at a length ends the run.
- **Score sentence:** "Span 7."
- **Disclaimer (stays):** not a memory-health screen; the page routes
  health worry to a GP, not to retesting.
- **Funnel:** sleep cluster (consolidation), glossary (working memory),
  Pulse memory cards.
- **Build note:** easy; sequence player + input checker are trivially
  unit-testable pure logic.

### 4.3 Wide Angle — peripheral awareness

- **Paradigm:** central + peripheral dual task; lineage the Useful Field
  of View work (Ball & Owsley).
- **Loop:** eyes on a central pad doing a trivial task; brief targets
  appear at the viewport edges; tap the side. ~16 presentations, accuracy
  scored.
- **Score sentence:** "Caught 13 of 16 at the edges."
- **Disclaimer (stays):** **not perimetry, not an eye exam** — cannot
  detect visual-field loss; anyone noticing a blind region is told to see
  an optometrist, prominently.
- **Funnel:** exercise library (sport/agility content), Pulse attention
  cards.
- **Build note:** medium; best on tablet/desktop where the viewport gives
  real eccentricity.

### 4.4 Steady — fine motor control

- **Paradigm:** path tracing / steadiness; lineage the classic buzz-wire
  and mirror-tracing rigs.
- **Loop:** drag along a winding track without touching the edges; the
  track narrows. Clean distance + touches scored.
- **Score sentence:** "Traced 82% clean."
- **Funnel:** exercise library mobility/warm-up content; recovery clusters
  (the "shaky after leg day" retest hook).
- **Build note:** easy-medium; authored track paths, point-to-path
  distance is the whole engine. Offset the cursor point on touch (finger
  occludes the track).

### 4.5 Switch — cognitive flexibility

- **Paradigm:** task switching; lineage Rogers & Monsell (1995) — the
  switch cost (the penalty when the rule changes) is the measured thing.
- **Loop:** each card shows a coloured shape plus the active rule
  ("COLOUR?" or "SHAPE?"); two answer pads; rules alternate. ~40 trials.
- **Score sentence:** "Switch cost 180 ms."
- **Funnel:** glossary (cognitive flexibility), sleep + breathwork
  clusters.
- **Build note:** medium; purely DOM. The trial classifier/scorer is the
  test-first core.

### 4.6 Track — hand–eye coordination

- **Paradigm:** aimed tapping; lineage Fitts (1954) — target size and
  distance vary, so the score has a principled basis.
- **Loop:** tap the target as it relocates; 30 targets; hits, accuracy and
  speed scored.
- **Score sentence:** "28 of 30, 412 ms to target."
- **Funnel:** exercise library (agility/plyometrics), the workout section.
- **Build note:** easy; the most arcade-adjacent station and a natural
  cross-link to /arcade.

### 4.7 Breathe — the guided practice

- **Paradigm:** paced breathing — box, 4-7-8 and slow-paced (~6
  breaths/min), exactly the protocols the breathwork recovery cluster
  documents with citations.
- **Loop:** hold-and-release against a coach ring (the ARCADE-IDEAS §3.5
  "Exhale" design, which this station **adopts and re-homes** — on
  sign-off, update ARCADE-IDEAS.md to hand it over). Sessions log minutes
  practised; clean-breath streaks can score if the build spec wants a
  number here.
- **Score sentence:** "6 minutes settled."
- **Funnel:** the breathwork cluster — the most direct content funnel in
  the battery.
- **Build note:** easy; widens the Lab's register beyond the stopwatch.

### 4.8 Vigil — sustained attention

- **Paradigm:** the Sustained Attention to Response Task (SART; Robertson
  et al., 1997): frequent go stimuli, rare no-go, the withhold is the
  measure.
- **Loop:** digits appear steadily for ~3 minutes; tap for every digit
  EXCEPT 3. Accuracy scored; a 90-second short mode for mobile attention
  spans.
- **Score sentence:** "Held 94% over 3 minutes."
- **Disclaimer (stays):** not an attention-disorder screen.
- **Funnel:** sleep cluster, caffeine content, breathwork ("try Breathe,
  then retest").
- **Build note:** easy logic; the page warns it needs three undisturbed
  minutes.

## 5. The daily circuit & storage

- A **daily-seeded circuit** ("today's Lab: Reaction + Switch + Breathe")
  gives the ritual shape the dailies proved — one mulberry32 seed per UTC
  day (house convention), same stimulus schedules for everyone, so
  "today's Lab" is a shared, comparable event.
- Results are local-first in a `lab-store` mirroring `daily-store` /
  `dashboard-store`. When accounts land (ROADMAP E0), Lab history rides
  the same HistoryProvider seam and data-protection posture as everything
  else — no special casing.

## 6. Retention & share

- **Percentiles are the share hook.** "Top 12% reaction time" is the card
  people post; cards go through the existing bounded-params pipeline
  (`/api/arcade-card` sibling, forgery posture inherited).
- **Streaks** per the DAILY-GAMES §6 rules (freezes included) on the daily
  circuit.
- **Leaderboards** once accounts exist (ROADMAP E4), per §3.
- **Trajectory** (DASHBOARD §3.5, STATUS Phase 3) charts Lab metrics
  beside calculator history — "your Tuesday reaction times after bad
  sleep" is a retention hook no arcade score can match.
- **The self-experiment framing** is the editorial voice: "test Monday
  morning and Friday night for a month" — and it funnels straight into
  the cited content that explains what moves these numbers.

## 7. Placement & IA

- **Hub:** proposed `/performance-lab` ("the Lab" in copy). NOTE: `/labs`
  is retired and permanently redirects to `/learn/peptides`
  (next.config.ts) — do not reuse `/labs`; weigh whether bare `/lab` is
  too collision-adjacent. Name and URL are Mat's call (§10).
- Stations at `/performance-lab/<station>`; hub card grid in the /arcade
  layout family, instrument register (§2).
- Nav: alongside Arcade/Daily; cross-rails both ways between the Lab and
  the arcade.
- Cross-links: tool pages and content clusters link in where the variable
  is relevant (sleep pages → Reaction/Vigil; breathwork → Breathe) — the
  internal-linking pattern both content docs already mandate.

## 8. Build shape & conventions

Inherits the house build wholesale:

- **Pure logic per station** in `src/lib/lab/<station>.ts` — stimulus
  schedules, scoring — unit-tested; shared timing/seeding utilities in
  `src/lib/lab/core.ts`.
- **Components** in `src/components/lab/*`; canvas only where needed
  (Steady, Track); DOM + CSS for the rest.
- **Registry** `src/registry/lab.ts`: station definitions, disclaimers
  tier, funnel links, norm bands. Routing/sitemap/metadata derive from it,
  like tools do.
- **Store** `src/lib/lab-store.ts`; metrics registered in
  `src/registry/metrics.ts` for the dashboard.
- Typed analytics events (`lab_session_started`, `lab_result_saved`);
  seeded mulberry32; DESIGN.md tokens; British English; zero new
  dependencies; each station lazy-loaded (README JS budget applies).
- Each shipped station's tuning lives in this doc's successor spec — on
  sign-off this blueprint graduates the way ARCADE-IDEAS.md picks
  graduated to MAXOUT.md/FIVEADAY.md.

## 9. Sequencing & effort

Not scheduled — STATUS.md Phases 1–3 come first. When a slot opens:

- **MVP = hub + the top three (picked 2026-07-24): Reaction, Recall,
  Track.** Reaction is the genre's flagship, the cheapest build and the
  strongest funnel (sleep/caffeine); Recall is the second-biggest
  self-test genre on a trivial build with the perfect brag sentence
  ("Span 7"); Track pulls the gamer/aim-trainer audience, is the natural
  cross-rail to the arcade, and its instant retry loop fits the
  comparison-first product better than Vigil's three-minute sit. The trio
  spans speed / memory / precision — three genuinely different axes for a
  composite Lab Score from day one. Breathe joins early if the Exhale
  re-homing is approved.
- Then Vigil and Switch (Vigil's duration makes it a second-wave
  station), then Steady and Wide Angle.
- Percentile bands and the share card land with the MVP — comparison is
  the hook (§3), so shipping bare numbers would undersell it. Trajectory
  wiring lands with the MVP too.

## 10. Open questions (Mat)

1. **Name + URL** — "Performance Lab" at `/performance-lab` is the
   proposal; "the Lab" as shorthand. §7's `/labs` redirect collision
   noted.
2. **The Exhale re-homing** (§4.7) — approve moving the breathwork
   practice from the arcade bench to the Lab?
3. **Composite "Lab Score"** (§3) — in the MVP, or after the battery has
   enough stations to aggregate?
4. **Percentile source at launch** — published norm bands, or wait for
   pooled player data?
5. **The daily circuit vs à-la-carte** — ship the seeded circuit at MVP,
   or stations-only first?

## 11. Kept as-is (scope notes)

- Station-specific medical-style disclaimers (§4.2, §4.3, §4.8) stay —
  they are the same compliance components tool pages carry, under the
  standing claude.md rule against softening disclaimers.
- Camera/microphone-based measurement (breath detection, pupil tracking)
  sits behind the ROADMAP E0 data-protection crossing, like every other
  biometric feature — guided practice needs no sensors.

## 12. Changelog

- 2026-07-23 — first draft, written with a hard arcade/Lab wall and
  binding measurement-honesty rules.
- 2026-07-24 — Mat's direction: those guardrails removed (header note);
  percentiles, norms, composite scores and leaderboards brought into
  scope; comparison made the headline feature.
- 2026-07-24 — top three picked (§9) and the MVP built the same day (§13).

## 13. Build record — MVP (2026-07-24)

**Built:** the `/performance-lab` hub + Reaction, Recall and Track, per
§4.1/§4.2/§4.6 with the character layer that makes scores travel:

- **Tier ladders are the share hook** (in lieu of percentile data at
  launch): Reaction runs LIGHTNING → LOCKED IN → CAFFEINATED → HUMAN →
  NPC → BUFFERING → PING 999; Recall climbs an animal ladder GOLDFISH →
  PIGEON → HUMAN → CROW → DOLPHIN → ELEPHANT → GRANDMASTER → MAINFRAME;
  Track runs AIMBOT → SNIPER → SHARPSHOOTER → HUMAN → CASUAL → BUTTER
  FINGERS, with sub-70% accuracy capped at STORMTROOPER regardless of
  speed. Deliberately memes, not norms — "NPC" travels further than a
  percentile, and nothing is claimed about populations.
- **Share blocks** are Wordle-shaped: header emoji + score sentence +
  tier + a per-round block grid (Reaction) + kicker + station URL, via
  navigator.share with clipboard fallback (`*ShareText` in the libs).
- **Mechanics:** Reaction — 5 scored taps, 1.5–3.2 s seeded waits, early
  taps re-arm as counted "false starts" (gameplay, not a stats rule), avg
  ms scored from `event.timeStamp` against a rAF-stamped onset, silent by
  design (a sound cue would beat the paint). Recall — Simon-style 3×3,
  pentatonic pad tones, start at 3, one wobble replays the pattern, two
  ends it; span = longest completed. Track — 25 targets, radius 34→18 px,
  ≥110 px forced travel between targets, strays scored against accuracy.
- **Files:** logic `src/lib/lab/{reaction,recall,track}.ts` (+ 3 test
  files, house test-first style); components `src/components/lab/
  {ReactionTest,RecallTest,TrackTest}.tsx` + `labSynth.ts` (shared
  WebAudio, one Lab-wide mute key) + `LabBestChip.tsx`; pages
  `src/app/performance-lab/**` + hub OG image; nav "Lab" link; sitemap
  entries; typed analytics (`lab_test_started` / `lab_test_completed`
  with score+tier / `lab_test_shared`); bests in localStorage
  (`fittools.lab.<station>.best`). Arcade hub cross-rails to the Lab and
  back. All DOM+CSS (no canvas needed yet), zero new dependencies,
  reduced-motion safe, works on touch/keyboard/silent/private-mode.

**Share-card unfurls BUILT (2026-07-24, same day):** Lab share links now
carry the score as bounded params on the station's own URL
(`?avg=&row=` / `?span=` / `?ms=&acc=`, validated in
`src/lib/arcade-share.ts` with the pipeline's forgery posture — tiers
recomputed server-side from the number, so a crafted URL can claim a
time, never a title). The station pages' `generateMetadata` unfurls a
shared link as a score card from `/api/arcade-card` (pixel bolt/grid/
target emblems in `src/lib/pixel-art.ts`, Reaction's g/y/r speed row
drawn as squares), og:title carries "231 ms · CAFFEINATED", and bare
station URLs get hero cards through the same route. Manifest entries
added for add-to-home-screen.

**Deliberately deferred** (the §3 feature set beyond MVP): pooled
percentiles/norm bands, the composite Lab Score, leaderboards (all need
data or accounts), the daily-seeded circuit, streaks, and
dashboard/Trajectory metric registration. Names still proposed, not
locked.
