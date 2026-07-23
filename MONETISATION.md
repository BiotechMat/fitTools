# MONETISATION.md — Revenue direction (working doc)

Companion to `BUSINESS_PLAN.md` (strategy/context), `DESIGN.md` (§5 premium-lean
posture), `SPEC.md` (§10 monetisation infrastructure), `ROADMAP.md` (E2 the
return engine, E6 monetisation activation). This is the **single working record**
for where the site's revenue is heading, so the direction stops living scattered
across those docs.

**Status (2026-07-23, updated same day): WORKING DIRECTION — partially
resolved.** The *shape* is agreed (premium-lean, free-stays-free), and two of
the §4 opens are now **decided by Mat (2026-07-23)**: the free tier will carry
**light, premium-lean ads and paying removes them** (§4.3), and the arcade is
monetised through **extras, never play-limits** (§2.6 — a binding principle).
Still open, still Mat's: the exact free/paid feature line (§4.2 — "save
calculators, bookmark tools" are named candidates; the line itself is
explicitly not decided yet) and the price point (§4.1 — deliberately deferred
to the premium build). Reconciliation of `BUSINESS_PLAN.md §7` /
`ROADMAP.md E6` still waits for the full model (§5).

> **This is a gating decision, not just a doc.** The §4 model choice blocks the
> design of the accounts/premium tier (`STATUS.md §3` Phase 4) — build premium
> around what it actually gates, so decide the model *before* that phase. Listed
> as blocking decision #1 in `STATUS.md §4`.

---

## 1. The direction

**The eventual primary revenue line is a low-cost monthly subscription** that
unlocks premium features — a "small amount a month" tier, not a paywall on the
calculators. Ads and affiliates continue as *supporting* layers, never the thing
the product is built around.

This is a deliberate move away from the original ads-first framing
(`BUSINESS_PLAN.md §7`): monetising an engaged, returning, trusting audience via
subscription yields better unit economics — and protects the credibility moat —
far more than squeezing cold one-off traffic with ad density. `DESIGN.md §5`
already commits the visual system to this ("premium-lean"); this doc makes it the
headline revenue strategy rather than a late add-on.

---

## 2. Principles that already bind (do not reopen these)

These are settled across the existing docs and are **not** part of the open model
question:

1. **Free stays free — the answer is never gated.** Every calculation, its
   result, and its methodology are free forever (`DESIGN.md §5`;
   `BUSINESS_PLAN.md` mission). Gating the number would torch the credibility
   that makes the audience worth monetising at all.
2. **Premium sells *persistence and depth*, never the answer.** What money buys
   is saved history and longitudinal tracking — the things that turn a one-off
   visit into a habit (`SPEC.md §10` Pro-tier note; `ROADMAP.md E2` Trajectory is
   literally the thing being sold; `DESIGN.md §5–§6`).
3. **Premium-lean layout.** No page composes *around* an ad; every layout stands
   complete with `NEXT_PUBLIC_ADS_ENABLED=false`. Ads, if on, stay reserved
   (zero-CLS), consent-gated, lazy, and never above the calculator
   (`SPEC.md §10–§11`, `DESIGN.md §5`).
4. **Honest, quiet upsell — no dark patterns.** One inline "keep this number"
   prompt per result; plain price, plain benefit. Never a blocking modal,
   countdown, or blurred-content teaser (`DESIGN.md §5`).
5. **Never monetise insecurity.** Appearance outputs — including the
   `CONTENT-looksmaxxing.md §6` body-composition estimator — stay free by design;
   charging for an appearance number is exactly the model the strategy rejects.
6. **The arcade is monetised through extras, never limits** (Mat,
   2026-07-23). Free play stays unlimited for everyone; premium may sell
   arcade *depth* — exclusive skins, ghost-run archives, extra modes/stats
   — but never lives, energy, play caps or paid retries. This keeps the
   games' own guardrails (LIFELINE §3 "nothing bought"), their
   acquisition-funnel role, and the Children's Code posture now accounts
   open at 13+ (ACCOUNTS.md §7.7).

---

## 3. What premium plausibly includes (candidates, not locked)

Drawn from `DESIGN.md §6` and `ROADMAP.md E2/E6` — the retention surfaces are the
product being charged for:

- **Saved results & history** — the `HistoryProvider` promoted from local-only to
  an account (`ROADMAP.md E0`; `SPEC.md §10`).
- **Trajectory** — longitudinal tracking of the open indices and key metrics,
  trend lines, "what moved this" annotations (`ROADMAP.md E2` — the keystone).
- **Advanced / branded share cards** (the E1 OG-image pipeline, richer formats).
- **Ad-free** — now a confirmed benefit: the free tier will carry light ads
  (§4.3 resolved), so paying removes them.
- **Arcade extras** — exclusive skins, ghost-run archive, extra modes/stats
  (§2.6: extras, never play-limits).
- **Bookmark/favourites depth** — "bookmark tools" is on Mat's candidate
  gated list (§4.2); the surface itself is designed in ACCOUNTS.md §6.2.
- Deeper cuts of features that ship free in a lighter form (e.g. longer history
  windows, more detail in breakdowns).

Free-tier engagement features (Pulse, the daily games, day-1 wins, basic streaks)
stay free — they're the acquisition and habit layer that *feeds* conversion, not
the thing sold.

---

## 4. Open questions (need Mat's decision — model not yet confirmed)

1. **Price point.** "Small amount a month" — the actual number, and monthly vs
   annual (and whether regional pricing applies). *(2026-07-23: deliberately
   deferred by Mat — set at the premium build/E6; not needed for the E0
   accounts build.)*
2. **The free/paid line.** Exactly which features are free vs premium — where does
   "saved results" sit (a teaser of N saves free?), how much Trajectory history is
   free before it's paid. *(2026-07-23: Mat's sketch recorded — the gated set
   will be "stuff like save calculators, bookmark tools" plus arcade extras
   (§2.6) — but the exact line is explicitly not decided yet. Candidate
   shapes on the table: (a) fun layer syncs free, the numbers archive is
   premium; (b) everything syncs free with a capped history window and
   premium lifts the caps; (c) depth-only premium. Binding consequence
   whichever is chosen: **nothing launches free and is walled later** —
   gating is additive (caps lifted, extras added), so any surface that might
   be gated ships capped or ships with the tier — see ACCOUNTS.md §9.9.)*
3. **Ads in the free tier — or not at all?** ***RESOLVED (Mat, 2026-07-23):
   option (a)*** — the free tier carries light, premium-lean ads and paying
   removes them. The SPEC §10–§11 rules bind unchanged (consent-gated,
   reserved dimensions, lazy, never above the calculator, no layout depends
   on an ad); with accounts open at 13+ (ACCOUNTS.md §7.7), under-18 users
   get **non-personalised serving only**, per the Children's Code posture.
   "Ad-free" is thereby a confirmed premium benefit (§3).
4. **Trial / freemium mechanics.** Free trial, or a permanent free tier with a
   paid upgrade (the `DESIGN.md §5` "30 days free, full history paid" note is a
   candidate, not a decision).
5. **Timing.** Premium is *monetised retention*, so it activates once accounts
   (`ROADMAP.md E0`) and the return loop (`E2`) exist and traffic justifies it
   (`E6`). Sequencing vs the ad switch-on is part of the model decision.

---

## 5. Reconciliation owed (coherence note)

Once the model is confirmed, these docs should be updated to match — they pre-date
this direction and currently read ads-first:

- **`BUSINESS_PLAN.md §7` (revenue streams) & §11 (financial plan)** — reorder to
  lead with subscription; ads/affiliates as supporting lines. `DESIGN.md §5`
  already flags this doc as needing the update.
- **`ROADMAP.md E6`** — elevate premium from "scaffold a tier once traffic
  arrives" to a first-class outcome the earlier phases (especially E2) are built
  toward.
- **`claude.md` / `SPEC.md §10`** — state the "premium gates persistence & depth,
  never the calculation" rule as a product principle, not only a design note.

Until then, **this file is the source of truth for revenue direction**; where it
and an older doc disagree, this file's principles (§2) win, and its open questions
(§4) are genuinely open.
