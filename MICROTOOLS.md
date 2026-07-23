# MICROTOOLS.md — the interactive tools suite at /tools

Plan + build record for five interactive micro-tools (Mat, 2026-07-23),
grouped under a new **Tools** nav item and `/tools` hub. Companion to the
calculators: calculators answer a question once; these get *used* — timers
run during sessions, the breath coach runs for two minutes, the maps and
builders get explored. Repeat-visit surfaces, zero accounts.

## 0. Principles (binding, inherited)

- **Registry-driven, never invented.** Muscle map reads
  `src/registry/exercises.ts`, plate builder reads
  `src/registry/food-reference.ts`, the explorer reads
  `src/registry/supplements.ts`. No new nutrition numbers, no invented
  effect sizes — the explorer shows evidence **tiers**, which exist,
  not effect magnitudes, which don't.
- Client-side only, no new dependencies. Timer/breath engines are
  timestamp-based (correct when backgrounded), not frame-counted.
- DESIGN.md §8 rules apply: reduced-motion safe, zero-CLS, aria-labelled
  decoration, one Blaze per view. Sound is synthesised, opt-out, muted
  state persisted (same pattern as Lifeline).
- Pure logic lives in `src/lib/tools/` with unit tests (timer schedules,
  breath cycles, plate totals, muscle normalisation).

## 1. IA & navigation

- Hub: `/tools` — card per tool, riso cards, cross-linked from related
  hubs (exercises page → muscle map; supplements hub → explorer;
  nutrition → plate builder; recovery → breath coach).
- Nav: `{ href: "/tools", label: "Tools", emphasis: true }` after Arcade.
- Routes: `/tools/timer`, `/tools/breath`, `/tools/muscle-map`,
  `/tools/plate-builder`, `/tools/supplement-explorer`.
- Every page: breadcrumb, metadata, JSON-LD breadcrumb (site pattern).

## 2. Gym timers — /tools/timer

Three modes, one engine:
- **Rest**: presets 60/90/120/180s + custom; big Anton countdown.
- **Interval**: work/rest × rounds; Tabata preset (20/10 × 8).
- **EMOM**: minute cap × rounds; shows seconds remaining in the minute.

Engine: `src/lib/tools/timer.ts` — pure `timerStateAt(config, elapsedMs)`
returning phase/round/remaining; component just renders it against
`performance.now()` so tab-switching never drifts. Tests cover phase
edges, round rollover, completion.

UX: synth 3-2-1 ticks + start/end clank (Lifeline `beep` pattern), mute
persisted; shareable/bookmarkable URL params
(`?mode=interval&work=40&rest=20&rounds=8`) read on mount; screen
wake-lock via `navigator.wakeLock` where available (silently skipped
elsewhere); pause/resume/reset; document.title carries the countdown.

## 3. Breath coach — /tools/breath

- Presets (standard patterns, stated plainly, no therapeutic claims):
  **Box 4-4-4-4**, **4-7-8**, **Coherent 5.5-5.5**. Session length 1–5 min.
- The orb: a circle that scales with phase progress (ease-in-out), phase
  label (Breathe in / Hold / Breathe out), remaining time. CSS/rAF, calm
  palette (forest/matcha on paper), reduced-motion → text-only phases.
- Haptic tick at each phase change (`navigator.vibrate`, mobile only);
  optional soft synth tone per phase, off by default here (calm context).
- Cycle logic in `src/lib/tools/breath.ts` (`breathPhaseAt(pattern, tMs)`),
  tested. Editorial context links to the recovery breathwork cluster —
  citations live there, the tool makes no claims of its own.

## 4. Clickable muscle map — /tools/muscle-map

- SVG figure (front + back views), riso style: ink outlines, soft fills;
  each region a `<button>`-semantics path (keyboard focusable, ember
  focus ring). Tap a muscle → panel lists exercises hitting it
  (primary first, then secondary) linking to `/exercises/[slug]`.
- Canonical regions (~14): quads, hamstrings, glutes, calves, chest,
  lats, upper-back, lower-back, shoulders, biceps, triceps, forearms,
  abs, obliques. `src/lib/tools/muscles.ts` maps every registry muscle
  string → region; a unit test asserts the mapping is exhaustive over
  the registry so new exercises can't silently drop off the map.
- Region hover/selected states; count badges per region.

## 5. Plate builder — /tools/plate-builder

- Left: the food registry grouped by category with diet filter
  (`suitableFor`), portion labels shown. Tap to add a portion (repeat to
  stack; adjustable ×0.5/×1/×2).
- Right: the plate — running totals for kcal + protein rolled with
  `RollingNumber`; a target bar comparing against either the macro
  calculator's defaults or a user-entered target (kcal + protein only —
  the registry has no carb/fat split, and we don't invent one).
- Totals math in `src/lib/tools/plate.ts` (portion grams × per-100g),
  tested against hand-computed fixtures from the registry.
- Cross-links: macro calculator, protein tables.

## 6. Supplement evidence explorer — /tools/supplement-explorer

- An interactive **tier board**, not a scatter (no numeric effect sizes
  exist in the registry and none may be invented): columns for
  well-supported / preliminary / marketing-claim, cards sorted A→Z,
  filterable by text and by "related tool" context. Tap a card → inline
  detail: `short`, basis chip, safety flag when present, receipts count,
  link to the full page.
- Pure presentation over `supplements.ts` + `supplementsByTier()` which
  already exists. Tier chips reuse `EvidenceTier` styling rules (tier
  always spelled out, never colour alone).

## 7. Build order & status

ALL BUILT (2026-07-23), one commit each, gated (tests + build) per
commit: hub + nav → timers → breath coach → muscle map → plate builder →
supplement explorer. Libs live in src/lib/tools/ (timer, breath, muscles,
plate) with unit suites; components in src/components/tools/. Browser-
verified: hub cards, muscle-map figures/selection. Possible next steps:
cross-links FROM the related hubs into these tools (§1 lists them), a
tap-tempo heart-rate micro-tool, and dashboard tiles for timer/breath
usage (local-first).
