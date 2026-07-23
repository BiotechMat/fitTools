# PERFORMANCE-LAB.md — the honest measurement battery

**BLUEPRINT — not signed off, not scheduled.** Proposal doc in the
CONTENT-looksmaxxing.md mould: direction and guardrails for a "Performance
Lab" — a hub of HTML5 stations that *measure the player* (reaction time,
working memory, peripheral awareness, coordination, cognitive flexibility,
hand–eye, sustained focus) plus one guided breathing practice. Companion to
ARCADE-IDEAS.md (whose §5 anti-idea this must be reconciled with — see §2),
DAILY-GAMES.md, DASHBOARD.md and DESIGN.md. STATUS.md's directive stands:
the near-term priority is content volume + instrumentation, not new
features — this doc exists so the idea is specced and guardrailed *before*
a build slot opens, like ARCADE-IDEAS.md was for the arcade.

---

## 1. Concept & positioning

The site currently has three play surfaces, none of which measures the
player: the **arcade** (cartoons about the world), the **dailies**
(knowledge ritual) and **Pulse** (cited facts). The Performance Lab is the
proposed fourth pillar, and it is a different animal: **a self-testing
bench, not a game hub.** Lineage: Human Benchmark — a site whose reaction
and memory tests draw tens of millions of visits on a fraction of our
engineering — crossed with the site's own thesis.

The differentiation is the same one that carries everything else here:

1. **Every station is a named, cited paradigm** (psychomotor vigilance,
   Corsi span, task-switching, Fitts tapping, SART — §4), not an invented
   minigame. The station page explains the paradigm and links its lineage,
   the way tool pages cite their formulas.
2. **The product is the trend, not the number.** A browser measurement is
   noisy (§3); a browser measurement *of the same person, on the same
   device, over weeks* is genuinely informative. The Lab is a natural
   feeder for the dashboard's Trajectory (DASHBOARD §3.5, the keystone
   anti-churn mechanic) — "your Tuesday reaction times after bad sleep"
   is a retention hook no arcade score can match.
3. **Every station funnels to evidence we already publish.** Reaction time
   and vigilance degrade with sleep debt → the sleep-environment cluster;
   slow breathing → the breathwork cluster; and so on (§4, per-station).
   The Lab converts curiosity about *yourself* into visits to the cited
   content, which is the whole site model.

What it is **not**: brain training. We measure; we never claim the
stations *improve* anything beyond practice at the station itself. That
line is load-bearing (§10 — the Lumosity settlement is the cautionary
tale).

## 2. The wall between the Lab and the arcade (binding)

ARCADE-IDEAS.md §5 rejects "anything that measures the player" — no
reaction-time-as-reflex-age, no scores about you — because in a *cartoon
game* a measurement dressed as a joke becomes a covert claim, and the
cartoon/measurement line is the brand. That rejection **stands, unweakened,
for the arcade**. The Lab is admissible only because it inverts every term
of it, and these rules keep the wall solid:

- **The arcade never measures; the Lab never pretends.** No Lab station
  wears a cartoon fiction ("your neurons", "reflex age"). Stations look
  and speak like instruments: plain stimulus, plain number, stated unit,
  stated protocol. DESIGN.md tokens, but the register is Space Mono, not
  Anton stickers.
- **Separate hubs, no score mixing.** The Lab is not listed on /arcade and
  arcade games are not listed in the Lab; neither surfaces the other's
  numbers. Cross-links are editorial ("prefer a cartoon? → /arcade"), never
  score-adjacent.
- **No composite scores, ever.** No "brain age", "performance score",
  "percentile IQ". Each measurement is reported in its own unit (ms, span
  length, % accuracy) and never aggregated into a single rating of the
  player. Aggregation is where honest numbers become dishonest claims.
- **Not diagnostic, and each station says so specifically.** Not generic
  boilerplate — the *specific* disclaimer per station: the peripheral
  station is not perimetry and cannot detect visual-field loss (see an
  optometrist); the focus station is not an attention-disorder screen; the
  reaction station is not a fitness-to-drive assessment. Tier the pages
  like tool pages, with the disclaimer component, per the standing rule
  (claude.md Don'ts: never soften disclaimers).
- **Scores about yourself are yours to share.** The share loop (§6) renders
  what the player chose to publish about themselves — that is honest in a
  way an arcade card claiming to measure them never could be. Cards state
  the protocol ("median of 7") so shared numbers carry their own context.

## 3. Honest measurement in a browser (binding engineering rules)

The browser is a hostile lab bench, and pretending otherwise is the fast
route to publishing junk. These constraints shape every station:

- **The timing chain adds real latency.** Touch/mouse input pipelines and
  display output add tens of milliseconds, varying by device, refresh rate
  (60 vs 120 Hz changes stimulus-onset quantisation) and browser; timer
  resolution is deliberately coarsened (Spectre mitigations) to ~0.1–1 ms.
  Consequences, all binding:
  - Timestamp from `event.timeStamp` of the pointer event, not
    handler-execution time; present stimuli on `requestAnimationFrame`
    boundaries and record the frame timestamp as onset.
  - **Report medians, never means**, over a stated trial count; discard a
    practice trial; a response under 100 ms is a false start (the
    psychomotor-vigilance convention), flagged and excluded.
  - **Within-device trends are the product.** Results are stored with a
    coarse device class (touch/pointer, refresh rate if knowable) and the
    UI says plainly that numbers are comparable on the same device, not
    across devices — and never against a friend's phone.
- **No population norms at v1.** House rule (claude.md): never guess
  constants. Percentile bands go live only if/when normative tables are
  verified against primary sources with reproduced test vectors, per
  METHODOLOGY.md discipline — and even then per-station, never composite.
  Until then the only comparison shown is *you vs your history*.
- **Protocols are versioned.** Each station records a `protocolVersion`
  with every result; any tuning change bumps it, and trend charts never
  splice across versions. (The registry §8 owns protocol definitions.)
- **Determinism where it matters.** Stimulus schedules draw from seeded
  mulberry32 (house convention) so a daily-seeded "same test for everyone
  today" mode is cheap, and so unit tests can assert exact schedules.
- **Accessibility is a validity issue, not a checkbox.** Stimuli never rely
  on red/green hue alone (luminance + shape change too); stations work with
  keyboard and touch; `prefers-reduced-motion` swaps decorative motion out
  of *chrome* but task stimuli are exempt where motion IS the measurement
  (stated on the page). A station that can't be made non-discriminatory
  ships with an honest "this test requires X" note.

## 4. The battery — eight stations

Names proposed, not locked (house convention). Each entry: paradigm and
lineage, loop, the score sentence, what it does NOT claim, funnel, build
note. Build shape for all: pure logic module + tests, canvas or DOM
component, station page (§8).

### 4.1 Reaction — simple reaction time

- **Paradigm:** simple visual RT; lineage the psychomotor vigilance task
  (Dinges & Powell, 1985) — the sleep-research workhorse.
- **Loop:** hold on the pad; after a random 2–5 s delay (seeded schedule)
  the pad changes (luminance + symbol, not hue alone); release/tap. Seven
  scored trials, first trial practice, <100 ms = false start.
- **Score sentence:** "Median 231 ms over 7 trials."
- **Does not claim:** reflex "age", driving fitness, athletic ability.
- **Funnel:** sleep-environment cluster + caffeine content — RT is the
  classic sleep-debt/caffeine-response variable; "measure it all week" is
  the trend hook.
- **Build note:** cheapest station; the timing rules in §3 ARE the build.

### 4.2 Recall — working-memory span

- **Paradigm:** visuospatial span; lineage the Corsi block-tapping task
  (Corsi, 1972), with digit span (forwards/backwards) as a possible second
  mode later.
- **Loop:** a 3×3 grid of pads lights in sequence; reproduce the sequence
  by tapping. Start at 3, +1 per success, two misses at a length ends the
  run.
- **Score sentence:** "Span 6."
- **Does not claim:** memory health, dementia risk (explicitly — this is
  the station most likely to attract worried self-testing; the page routes
  that worry to "talk to a GP", not to retesting).
- **Funnel:** sleep cluster (consolidation), glossary entries (working
  memory), Pulse cards on memory.
- **Build note:** easy; the sequence player and input checker are trivially
  unit-testable pure logic.

### 4.3 Wide Angle — peripheral awareness

- **Paradigm:** dual-task central + peripheral detection; lineage the
  Useful Field of View work (Ball & Owsley) — *awareness under central
  load*, which is trainable attention, not optics.
- **Loop:** eyes on a central pad doing a trivial task (count its blinks);
  brief targets appear at the viewport edges; tap the side they appeared
  on. Accuracy across ~16 presentations at fixed eccentricities
  (normalised to viewport — and the page is honest that a phone's small
  field limits eccentricity; best on tablet/desktop).
- **Score sentence:** "Caught 13 of 16 at the edges."
- **Does not claim:** THE heavy one — **not perimetry, not an eye exam,
  cannot detect glaucoma or visual-field loss**; anyone noticing a blind
  region is told to see an optometrist, prominently.
- **Funnel:** exercise library (sport/agility content), Pulse attention
  cards.
- **Build note:** medium; the honesty work (fixation compliance is
  unverifiable without eye tracking — say so; score is "awareness", not
  "vision") outweighs the code.

### 4.4 Steady — fine motor control

- **Paradigm:** path tracing / steadiness; lineage the classic buzz-wire
  and mirror-tracing rigs.
- **Loop:** drag continuously along a winding track without touching the
  edges; track narrows over its length. Time on task + edge touches; three
  touches ends the run at that point.
- **Score sentence:** "Traced 82% clean, 3 touches."
- **Does not claim:** tremor assessment, neurological screening (stated).
- **Funnel:** exercise library mobility/warm-up content; recovery clusters
  (the "shaky after leg day / no sleep" retest hook).
- **Build note:** easy-medium; authored track paths, point-to-path distance
  is the whole engine. Touch and mouse parity needs care (finger occludes
  the track — offset the cursor point on touch, and say so in methods).

### 4.5 Switch — cognitive flexibility

- **Paradigm:** task switching; lineage Rogers & Monsell (1995), Monsell
  (2003) — the *switch cost* (RT penalty on trials where the rule
  changes) is the measured thing.
- **Loop:** each card shows a coloured shape plus the active rule
  ("COLOUR?" or "SHAPE?"); two answer pads. Rules alternate on a seeded
  schedule; ~40 trials, 2 practice. Score = median repeat-trial RT vs
  median switch-trial RT.
- **Score sentence:** "Switch cost 180 ms."
- **Does not claim:** intelligence, multitasking ability as a life skill.
- **Funnel:** glossary (cognitive flexibility), sleep + breathwork clusters
  (both have cited attention effects in our content).
- **Build note:** medium; purely DOM, no canvas needed. The scoring module
  (trial classification, median split, error handling) is the test-first
  core.

### 4.6 Track — hand–eye coordination

- **Paradigm:** aimed tapping; lineage Fitts (1954) — target size and
  distance vary on a seeded schedule, so the score has a principled basis
  (effective throughput) without surfacing the jargon.
- **Loop:** tap the target as it relocates; 30 targets, sizes/distances
  scheduled; misses cost. Score = hits, on-target %, and median
  movement time.
- **Score sentence:** "28 of 30, median 412 ms to target."
- **Does not claim:** esports rank, sporting ability.
- **Funnel:** exercise library (agility/plyometric entries), the workout
  section.
- **Build note:** easy; closest cousin to an arcade loop, so the §2
  register rules matter most here — instrument framing, no juice, no
  combo meters.

### 4.7 Breathe — the guided practice (not a test)

- **Paradigm:** paced breathing — box, 4-7-8 and slow-paced (~6
  breaths/min) patterns, exactly the protocols the breathwork recovery
  cluster already documents with citations.
- **Loop:** hold-and-release against a coach ring (the ARCADE-IDEAS §3.5
  "Exhale" design, which this station **adopts and re-homes** — its
  no-fail, no-death shape always sat awkwardly in the arcade formula, and
  a calm practice station is native to a lab bench. On sign-off, update
  ARCADE-IDEAS.md to hand it over).
- **Score sentence:** none — deliberately. Sessions log minutes practised
  ("6 minutes settled"), which can feed a streak, but there is no
  performance number, no best, no comparison. **Breathing is the one
  station that is practice, not measurement**, and the hub labels it so.
- **Does not claim:** treatment of anxiety or any condition; HRV effects
  are described only via the cited cluster content. No camera/microphone
  measurement, ever (§10).
- **Funnel:** the breathwork cluster (already written and cited) — the
  most direct content funnel in the whole battery.
- **Build note:** easy; and it widens the Lab's register the way Exhale
  was meant to widen the arcade's.

### 4.8 Vigil — sustained attention

- **Paradigm:** the Sustained Attention to Response Task (SART; Robertson
  et al., 1997): frequent go stimuli, rare no-go, and the *withhold* is
  the measure.
- **Loop:** digits appear steadily for ~3 minutes; tap for every digit
  EXCEPT 3. Score = no-go accuracy (commission errors) + RT variability
  on go trials. The long-for-a-browser duration is the point — it is a
  focus test — and the page warns it needs three undisturbed minutes.
- **Score sentence:** "Held 94% over 3 minutes."
- **Does not claim:** an attention-disorder screen (stated specifically).
- **Funnel:** sleep cluster, caffeine content, breathwork ("try Breathe,
  then retest" — an honest, self-verifiable claim of the kind we like).
- **Build note:** easy logic, but the only station where session length
  fights mobile attention spans; consider a 90 s "short vigil" variant as
  a separate protocol version from day one.

## 5. Protocol & scoring rules (binding, all stations)

- Fixed, versioned protocols (§3); the station page's methods section
  states trial counts, timing rules and exclusions — like a tool page's
  methodology block, because it is one.
- Practice trials are marked and never scored; false starts flagged, shown
  and excluded; a result only saves when the protocol completes.
- Medians throughout; no means, no "best single trial" as a headline
  (bests breed twitch-farming, which destroys the trend signal — the
  history keeps them visible but the sentence is the median).
- A **daily-seeded circuit** ("today's Lab: Reaction + Switch + Breathe")
  gives the ritual shape the dailies proved, one seed per UTC day, same
  stimulus schedules for everyone — comparable *protocol*, still
  device-caveated numbers.
- Results are local-first in a `lab-store` mirroring `daily-store` /
  `dashboard-store`; nothing leaves the device (until ROADMAP E0 accounts,
  at which point Lab history rides the same HistoryProvider seam and
  data-protection posture as everything else — no special casing).

## 6. Retention: the trend is the game

- **Trajectory integration is the payoff.** Lab metrics (median RT, span,
  switch cost, vigil accuracy) register in `src/registry/metrics.ts` so
  the dashboard's Trajectory (DASHBOARD §3.5, STATUS Phase 3) charts them
  beside the calculator history — the Lab is the only surface that can
  generate *frequent, repeatable* longitudinal data without accounts.
- **Streaks** per the DAILY-GAMES §6 rules (freezes included), on the
  daily circuit, not per-station.
- **Share cards** through the existing bounded-params pipeline
  (`/api/arcade-card` sibling; forgery posture inherited): the card carries
  the sentence, the protocol ("median of 7 · protocol v1") and the
  station's unit — never a composite, never a rank (§2).
- **The self-experiment framing** is the editorial voice: "measure Monday
  morning and Friday night for a month" — honest, curiosity-driven, and it
  funnels straight into the cited content that explains what moves these
  numbers.

## 7. Placement & IA

- **Hub:** proposed `/performance-lab` ("the Lab" in copy). NOTE: `/labs`
  is retired and permanently redirects to `/learn/peptides`
  (next.config.ts) — do not reuse `/labs`, and weigh whether bare `/lab`
  is too collision-adjacent to those redirects; `/performance-lab` is the
  safe proposal. Name and URL are Mat's call (§11).
- Stations at `/performance-lab/<station>`; hub card grid mirrors /arcade's
  layout but in the instrument register (§2).
- Nav: alongside Arcade/Daily under whatever "Play" grouping the IA evolves
  — but visually and verbally distinguished ("Measure", not "Play").
- Cross-links: tool pages and content clusters link *in* where the
  variable is relevant (sleep pages → Reaction/Vigil; breathwork →
  Breathe), which is the SEO/internal-linking pattern both content docs
  already mandate.

## 8. Build shape & conventions

Inherits the house build wholesale:

- **Pure logic per station** in `src/lib/lab/<station>.ts` — stimulus
  schedules, trial classification, scoring — unit-tested test-first (the
  scoring rules in §3/§5 are exactly the kind of thing tests must pin).
  Shared timing/seeding utilities in `src/lib/lab/core.ts`.
- **Components** in `src/components/lab/*`; canvas only where needed
  (Steady, Track); DOM + CSS for the rest — cheaper and more accessible.
- **Registry** `src/registry/lab.ts`: station definitions, protocol
  versions, disclaimers tier, funnel links, (later) source-verified norm
  tables with citations. Routing/sitemap/metadata derive from it, like
  tools do.
- **Store** `src/lib/lab-store.ts` (results keyed by station + protocol
  version + device class), metrics registered in
  `src/registry/metrics.ts` for the dashboard.
- Typed analytics events (`lab_session_started`, `lab_result_saved`);
  seeded mulberry32; DESIGN.md tokens; British English; zero new
  dependencies (nothing here needs one — charts stay within the
  dependency-free Trajectory approach, JS budget per README applies, each
  station lazy-loaded).
- Each shipped station's tuning lives in this doc's successor spec —
  on sign-off this blueprint graduates the way ARCADE-IDEAS.md picks
  graduated to MAXOUT.md/FIVEADAY.md.

## 9. Sequencing & effort

Not scheduled — STATUS.md Phases 1–3 come first, and nothing here jumps
that queue. When a slot opens:

- **MVP = hub + three stations: Reaction, Recall, Vigil** — the cheapest
  builds, the strongest paradigms, and between them they cover the
  sleep-content funnel from three angles. Breathe joins early if the
  Exhale re-homing is approved (it was already the arcade's low-cost
  wildcard).
- Then Switch and Track (medium), then Steady, with Wide Angle last — it
  carries the heaviest honesty burden (§4.3) and benefits most from the
  disclaimer/methods patterns the earlier stations will have established.
- Trajectory wiring (§6) lands with the MVP, not after — the trend IS the
  product, and shipping numbers without history would make us exactly the
  bare-number site we're differentiating from.

## 10. Anti-ideas (rejected on guardrails — recorded so they stay rejected)

- **Brain-training claims.** We never claim transfer ("improves your
  memory/focus/driving"). Lumosity paid $2m to the FTC (2016) for exactly
  those claims. Practice effects at the station are disclosed as practice
  effects.
- **Composite scores** — "brain age", "reflex age", "Lab score",
  percentile IQ. Rejected in §2; recorded here so it survives every future
  "one number would be great for sharing" conversation. It would.
  That's the problem.
- **Cross-device/global leaderboards.** Device latency differences make
  them a hardware benchmark wearing a skill costume; also collides with
  the honest-numbers posture. "You vs you" only (accounts change nothing
  here).
- **Camera/microphone measurement** (breath detection, pupil tracking,
  tremor from the camera). Biometric capture sits behind the ROADMAP E0
  data-protection crossing at minimum, and most of it fails the honesty
  bar anyway. Guided practice needs no sensors.
- **Diagnostic framing of any kind** — including soft framing ("worried
  about your memory? test it here"). The worry route goes to a
  professional, every time.
- **Anything that scores the breathing.** A graded breathing test inverts
  the practice's purpose and re-imports the adrenaline register the
  station exists to escape (same logic that kept Exhale out of medals).

## 11. Open questions (Mat)

1. **Name + URL** — "Performance Lab" at `/performance-lab` is the
   proposal; "the Lab" as shorthand. §7's `/labs` redirect collision
   noted.
2. **The Exhale re-homing** (§4.7) — approve moving the breathwork
   practice from the arcade bench to the Lab? (ARCADE-IDEAS.md gets a
   pointer either way.)
3. **Dashboard entry at v1** — do Lab metrics enter the metrics registry
   from the first release (recommended, §9) or after a settling period?
4. **Norms** — appetite for sourcing verified normative tables later, or
   is "you vs you" the permanent posture? (Permanent is a defensible
   brand answer.)
5. **The daily circuit vs à-la-carte** — ship the seeded circuit at MVP,
   or stations-only first and add the ritual once three-plus stations
   exist?
