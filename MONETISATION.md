# MONETISATION.md — Revenue direction (working doc)

Companion to `BUSINESS_PLAN.md` (strategy/context), `DESIGN.md` (§5 premium-lean
posture), `SPEC.md` (§10 monetisation infrastructure), `ROADMAP.md` (E2 the
return engine, E6 monetisation activation). This is the **single working record**
for where the site's revenue is heading, so the direction stops living scattered
across those docs.

**Status (2026-07-23): WORKING DIRECTION — not signed off.** The *shape* below
is agreed in spirit (premium-lean, free-stays-free); the **model itself is not
yet confirmed** — price, exactly what's gated, and whether the free tier carries
ads at all are open questions (§4). Nothing here locks a decision; it records the
intent and the principles that already bind, and flags what still needs Mat's
call. When the model is confirmed, `BUSINESS_PLAN.md §7` and `ROADMAP.md E6` get
reconciled to it (they currently pre-date this direction — §5).

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

---

## 3. What premium plausibly includes (candidates, not locked)

Drawn from `DESIGN.md §6` and `ROADMAP.md E2/E6` — the retention surfaces are the
product being charged for:

- **Saved results & history** — the `HistoryProvider` promoted from local-only to
  an account (`ROADMAP.md E0`; `SPEC.md §10`).
- **Trajectory** — longitudinal tracking of the open indices and key metrics,
  trend lines, "what moved this" annotations (`ROADMAP.md E2` — the keystone).
- **Advanced / branded share cards** (the E1 OG-image pipeline, richer formats).
- **Ad-free** — the clean-surface benefit, only meaningful if the free tier ever
  carries ads (see §4).
- Deeper cuts of features that ship free in a lighter form (e.g. longer history
  windows, more detail in breakdowns).

Free-tier engagement features (Pulse, the daily games, day-1 wins, basic streaks)
stay free — they're the acquisition and habit layer that *feeds* conversion, not
the thing sold.

---

## 4. Open questions (need Mat's decision — model not yet confirmed)

1. **Price point.** "Small amount a month" — the actual number, and monthly vs
   annual (and whether regional pricing applies).
2. **The free/paid line.** Exactly which features are free vs premium — where does
   "saved results" sit (a teaser of N saves free?), how much Trajectory history is
   free before it's paid.
3. **Ads in the free tier — or not at all?** Two coherent options:
   (a) free tier carries light, premium-lean ads and paying removes them; or
   (b) the site is ad-free for everyone and premium sells depth only (cleanest for
   the trust positioning, forgoes ad revenue). This is the biggest open call.
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
