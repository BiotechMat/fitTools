# MONETISATION.md — Revenue direction (working doc)

Companion to `BUSINESS_PLAN.md` (strategy/context), `DESIGN.md` (§5 premium-lean
posture), `SPEC.md` (§10 monetisation infrastructure), `ROADMAP.md` (E2 the
return engine, E6 monetisation activation). This is the **single working record**
for where the site's revenue is heading, so the direction stops living scattered
across those docs.

**Status (2026-07-23): MODEL CONFIRMED (Mat).** The revenue order is decided:
**premium sign-ups are the main revenue line** (a very low amount a month, or
possibly a one-off lifetime unlock — £10 lifetime is the working example),
**blood-test profit is the second line**, and **affiliate marketing is a small
supporting line**. Display ads are *optional and undecided* — the free tier may
or may not carry some ad space (§4.2). `BUSINESS_PLAN.md §7/§11` and
`ROADMAP.md E6` were reconciled to this model on 2026-07-23 (§5).

> **What still gates Phase 4 (accounts/premium tier design — `STATUS.md §3`):**
> the §4 detail questions — the exact price and monthly-vs-lifetime mechanics,
> the precise free/paid line, and the free-tier-ads call. Decide those before
> building the tier, so premium is built around what it actually gates. Tracked
> as blocking decision #1 in `STATUS.md §4`.

---

## 1. The direction

**The primary revenue line is premium sign-ups** — a low-cost premium tier at
"a very low amount a month", or possibly a one-off lifetime unlock (£10
lifetime is the working example; mechanics open in §4.1). Not a paywall on the
calculators.

**The second revenue line is blood-test profit** — margin/commission on tests
ordered through the site's `/blood-test` offering once the fulfilment partner
is signed (`STATUS.md §4` decision #5). High revenue per conversion, exactly
matched to the audience's intent, and it compounds the retention moat: results
land in the dashboard and feed the biological-age tools.

**Affiliate marketing continues as a small supporting line.** Display ads are
*optional*: the free tier may or may not carry some ad space (§4.2) — the
product is never built around them.

This is a deliberate move away from the original ads-first framing: monetising
an engaged, returning, trusting audience via premium and blood tests yields
better unit economics — and protects the credibility moat — far more than
squeezing cold one-off traffic with ad density. `DESIGN.md §5` already commits
the visual system to this ("premium-lean"); `BUSINESS_PLAN.md §7` now leads
with these lines.

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

## 4. Open questions (detail decisions — the model order itself is confirmed)

1. **Price point & mechanics.** The monthly number ("a very low amount"), and
   whether the offer is monthly, annual, or a one-off lifetime unlock (£10
   lifetime is the working example — early cash and a very easy yes, traded
   against recurring revenue). Regional pricing TBD.
2. **Ads in the free tier — or not at all?** Still genuinely open ("may or may
   not"): (a) the free tier carries light, premium-lean ads and paying removes
   them; or (b) the site is ad-free for everyone and premium sells depth only
   (cleanest for the trust positioning, forgoes a small revenue line). The
   infrastructure exists behind flags either way (`SPEC.md §10`).
3. **The free/paid line.** Exactly which features are free vs premium — where does
   "saved results" sit (a teaser of N saves free?), how much Trajectory history is
   free before it's paid.
4. **Trial / freemium mechanics.** Free trial, or a permanent free tier with a
   paid upgrade (the `DESIGN.md §5` "30 days free, full history paid" note is a
   candidate, not a decision). A lifetime unlock reshapes this question.
5. **Blood-test commercials.** Partner choice, margin/commission per order, and
   whether a test purchase bundles premium. Gated on the partner decision
   (`STATUS.md §4` #5).
6. **Timing.** Premium is *monetised retention*, so it activates once accounts
   (`ROADMAP.md E0`) and the return loop (`E2`) exist and traffic justifies it
   (`E6`).

---

## 5. Reconciliation record (done 2026-07-23)

The model was confirmed on 2026-07-23 and the owed reconciliation is complete:

- **`BUSINESS_PLAN.md §7` (revenue streams) & §11 (financial plan)** — reordered
  to lead with premium sign-ups, then blood-test profit; affiliates a small
  supporting line; free-tier ads optional.
- **`ROADMAP.md E6`** — rewritten around premium + blood-test activation, with
  free-tier ads an optional extra.
- **`SPEC.md §1/§10`** — revenue summary updated; "premium gates persistence &
  depth, never the calculation" stated as a binding product principle.

**This file remains the source of truth for revenue direction**; where it and an
older doc disagree, this file's principles (§2) win, and its open questions (§4)
are genuinely open.
