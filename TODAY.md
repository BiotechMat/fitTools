# TODAY.md — `/today` & the site-wide streak

Spec + build record for the single daily surface (IDEAS.md §2.1–§2.2, pulled
by Mat 2026-07-23) — the consolidation of the return loops that already exist:
Pulse's fact of the day, the daily games, local result history. Companion to
`DAILY-GAMES.md` (the games), `PULSE.md` (the feed), `DASHBOARD.md` (the other
personal surface), `DESIGN.md` §6 (the component states this reuses) and
`ROADMAP.md` §2 (the guardrails that bind).

**Status (2026-07-23): v1 BUILT** (§9). PWA installability and notifications
(IDEAS.md §2.3) are explicitly **not** part of this build (§8).

---

## 1. Strategic fit — one habit, not five features

Post-v1 the site has four return reasons (Pulse, the games, the dashboard,
per-tool history chips), each its own page. The risk as loops multiply is
five weak habits instead of one strong one. `/today` is the anchor: one page
composing what exists into a one-minute ritual, and one generous site-wide
streak that any meaningful action anywhere feeds. It is the canonical
bookmark destination and, later, the natural landing for E5 notifications and
the PWA home-screen icon.

**Composition, not content.** `/today` renders nothing that doesn't already
exist elsewhere. The games live on `/daily`; the feed lives on `/pulse`; the
aggregate lives on `/dashboard`. If a future block needs new content, it
belongs in one of those specs first.

## 2. Non-negotiable guardrails

1. **ROADMAP §2 binds.** Positive frame only; the streak celebrates and never
   shames; no countdown, no "streak at risk" alarm, no loss animation
   (DESIGN.md §6 no-loss rule).
2. **One umbrella streak.** The site-wide run is satisfied by ANY qualifying
   action (§5). Parallel per-surface guilt loops are exactly what ROADMAP
   §2.4 warns against — the daily games' own streak remains the games'
   ritual measure (DAILY-GAMES.md §6 unchanged), but no further per-surface
   streaks may be added without revisiting this section.
3. **Local-first, private.** Same posture as every store: localStorage,
   versioned, tolerant-parsed, sync-ready for E0. Streak state is never
   transmitted (§7).
4. **Showing up counts, the score doesn't.** Qualifying actions are
   completions/engagements, never results or values.

## 3. The streak rules (shared core)

One ruleset for every run on the site, extracted from the daily store into
`src/lib/streak.ts` (`advanceRun`):

- same day already counted → idempotent;
- consecutive day → +1;
- missed day(s) within the earned-freeze balance → bridged, freezes spent;
- larger gap → warm reset to 1, best kept, no ceremony;
- one freeze earned per completed week, capped at 3.

`daily-store.ts` delegates to the same core (its stored schema and public API
unchanged), so the games streak and the site streak can never drift apart in
behaviour. `runAlive` derives the display state (alive vs warm re-entry) —
display only, never a countdown.

## 4. Qualifying actions ("what counts")

An action marks the local calendar day active, tagged by source:

| Source | Action | Hook |
|---|---|---|
| `calc` | A calculator result banks (the existing debounced, user-driven save — the `calc_completed` rule; a defaults render never counts) | `ResultHistory` save |
| `daily` | A daily game completes (Ballpark scored, or a Myth round finishing) | `Ballpark`/`MythOrFact` submit |
| `pulse` | A Pulse fact is liked or saved (toggled ON — un-liking never counts) | `PulseScroller`/`PulseDaily` handlers |

Passive reading deliberately does not count in v1 — a streak you can earn by
merely loading a page is a visit counter, not a ritual. Revisit only with
evidence (e.g. scroll-depth engagement from Pulse's local affinity).

## 5. Persistence — `src/lib/activity-store.ts`

`fittools.activity.v1`: `{ version: 1, streak: StreakRun, todayDate,
todayDone: ActivitySource[] }` — the run plus a per-day source checklist
(presentational ticks only). Pure node-testable core (`markActive`,
`isDoneOn`) + the guarded localStorage wrapper, change events, and
`markActiveToday(source)` as the one app-facing call. Storage failure
degrades silently; a streak is never worth a broken surface. E0 adopts the
document server-side without changing callers (the `history.ts` pattern).

## 6. Page composition (`/today`, top → bottom)

1. **Header** — "Today", one-line promise, device-only privacy note.
2. **Streak panel** (`TodayStreak`) — DESIGN.md §6 states: flame chip +
   "banked today ✓" when counted; quiet "one small thing keeps it going"
   when not yet; freeze chips visibly protective; lapsed = warm re-entry
   copy with best kept; never-started = invite. Plus the three-item
   "what counts" checklist with ticks.
3. **Fact of the day** (`PulseDaily`, unchanged) + link into `/pulse`.
4. **Today's games** (`TodayGames`) — played/unplayed status rows linking to
   `/daily`; a doorway, not a second mount of the games.
5. **Due a re-run** (`TodayReruns`) — soft-amber chips (DESIGN.md §6
   welcome-back strip) for tools whose latest local save is ≥ 30 days old
   (`RERUN_DUE_AFTER_DAYS`), capped at 3, oldest first; hidden entirely when
   nothing is due. Links prefill nothing; they open the tool.
6. **Footer link** — the dashboard for the bigger picture.

## 7. SEO, analytics, performance

- **Noindexed, out of the sitemap** (the `/dashboard` precedent): the page is
  personal and its content is duplicated from `/pulse` and `/daily`, which
  remain the canonical, indexable homes. Nav link is fine.
- **Analytics:** one new typed event, `today_rerun_click {tool}` — does the
  nudge convert. Streak state, checklist state and dates are never
  transmitted (SPEC §12 posture).
- **Performance:** client components are small local-store readers; the page
  reuses the Pulse daily card. Server passes the re-run chips a plain
  slug→title list — the tool registry (with its Zod schemas) must never
  enter a client bundle (SPEC §13 budget; README).

## 8. Out of scope (v1)

- **PWA / installability / notifications** (IDEAS.md §2.3) — separate
  decision; nothing here assumes it.
- **Retiring the games' own streak** — DAILY-GAMES.md §6 stands untouched.
- **A "fresh discovery" block** — Pulse F0's "New" chips already surface in
  the feed; duplicating them here can wait for evidence the page needs it.
- **Server-side anything** — no accounts, no sync, no streak leaderboards
  (E4 owns social status).

## 9. Implementation status (v1 built — 2026-07-23)

- `src/lib/streak.ts` — shared streak core (`advanceRun`, `runAlive`,
  freeze constants); `daily-store.ts` refactored to delegate (schema/API
  unchanged).
- `src/lib/activity-store.ts` — the activity store per §5.
- Marking wired per §4: `ResultHistory`, `Ballpark`, `MythOrFact`,
  `PulseScroller`, `PulseDaily`.
- `/today` route (noindexed) + `TodayStreak` / `TodayGames` / `TodayReruns`
  per §6; "Today" first in the main nav; `today_rerun_click` event.
- Tests: `tests/unit/streak.test.ts`, `tests/unit/activity-store.test.ts`;
  existing daily-store suite passes unchanged against the delegated core.
