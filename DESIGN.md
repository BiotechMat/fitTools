# DESIGN.md — FitTools v2 visual identity

Design system for the v2 rebrand: Gen-Z fitness × wellness × longevity.
Direction chosen by Mat (2026-07-22). Mockups:
https://claude.ai/code/artifact/6caa375c-4ef2-425b-9cf4-b1d997460ba9

**Status: implemented on the `v2-design` branch (2026-07-22)** — tokens, fonts
(next/font: Anton/Figtree/Space Mono), shared components, page templates and
OG images. Not built: midnight mode (§1, separate decision), the marquee
ticker and number-first tool cards from the mockups, and the §6 components
beyond the "since last time" chip. AA note applied in code: Blaze is
display-size only; small-text accents are Ember; CTAs are ink-on-Blaze.

Tagline for the system: **"Loud enough to lift. Calm enough to live long."**
Blaze orange brings gym-poster intensity; forest green is the health
counterweight. One identity, two energies.

## 1. Colour tokens

| Token | Hex | Role |
|---|---|---|
| `--blaze` | `#FF531A` | Brand. CTAs, scores, highlights. The only colour allowed to shout. |
| `--ember` | `#C63D08` | Burnt sibling. Hover states, links, small labels — depth without noise. |
| `--forest` | `#1F5C3D` | Health & evidence. Longevity tools, Tier-A badges, positive deltas, secondary CTAs. |
| `--matcha` | `#8FBF3F` | Fresh accent. Ticks, "good" zones, small stickers. Never a ground. |
| `--paper` | `#FBF4EC` | Ground. Warm, orange-biased off-white — sunlit, not sterile. |
| `--ink` | `#1C130D` | Text, borders, the inverted score card. Warm near-black ("espresso"), never `#000`. |

Supporting values used in mockups (derive, don't multiply):
- Card surface: `#FFFDF9`; soft surface: `#F3E7D8`; hairline: `#E7D8C6`.
- Soft fills for chips: orange `#FFE1D3`, green `#E4F2D2`, amber `#FBEECB`.
- Semantic band scale (scores/zones): `#8FBF3F` → `#E8C33C` → `#FF531A` → `#C63D08`.

### Colour rules
- **One Blaze button per view.** Everything else is forest, outline, or text link.
- Blaze owns actions and hero numbers. Forest owns evidence, health wins and
  reassurance. Ember is for small interactive accents (links, hovers, eyebrows).
- Matcha is an accent, never a background for body text (contrast).
- Semantic state colours (good/warn/critical) never rely on colour alone —
  always paired with a label, and band position carries meaning on gauges.
- No clinical grey, no pure white, no pure black. Neutrals stay warm/orange-biased.

### Midnight mode (dark) — proposed, new scope
Current site is light-only; dark mode is a separate decision. If built:
warm espresso grounds (`#171009` bg, `#221810` card, `#3B2C1F` line), never
grey-black; ink flips to `#F6EDE2`; Blaze brightens to `#FF6231` and Matcha to
`#9CCB50` to hold contrast.

## 2. Typography

| Role | Face | Rules |
|---|---|---|
| Display | **Anton** | Caps only. h1/h2, hero numbers/scores, hub names. Tight line-height (~0.9–0.95). Never body text. |
| Body | **Figtree** (variable 300–900) | All UI copy and editorial. ~65ch measure for long-form. |
| Utility | **Space Mono** | Labels, units, citations, eyebrows, tickers. Uppercase with letter-spacing (~0.12–0.18em) for labels. |

- Load via `next/font`, self-hosted — zero CLS, consistent with SPEC §13 budgets.
- Numbers that line up in columns get `font-variant-numeric: tabular-nums`.
- Units and methodology citations are always Space Mono (the "receipts" voice):
  `kcal / day`, `mmol/L`, `PREVENT · AHA 2023`.

## 3. Component language

- **Borders & shadows:** cards and controls sit on a `2px` ink border with a
  hard offset shadow (`3–5px` x/y, no blur, ink colour) — riso-print / sticker
  feel. No soft drop shadows.
- **Radii:** cards 16–20px; inputs 12px; buttons and chips fully rounded pills.
  Sticker elements (highlights, stamps) may rotate ±2°.
- **Buttons:** pill-shaped, 2px ink border, hard shadow. Primary = Blaze fill,
  secondary = card fill with ink text, evidence/health = Forest fill, tertiary =
  Ember underlined text link.
- **Evidence tiers (supplements/claims):** Tier A forest fill → Tier B matcha →
  Tier C amber → Tier D soft paper. Tier is always spelled out in the badge,
  never colour alone.
- **Score states:** soft-fill pills with dark text (`On track` green /
  `Keep an eye` amber / `Needs work` orange) — legible on paper and midnight.
- **Result cards:** the score card inverts to ink ground so the Blaze number
  carries maximum contrast — the one place the palette goes full volume.
- **Hub colour coding:** orange = strength, matcha = fuel/nutrition, soft paper
  = recovery, forest = longevity.
- **Disclaimers & compliance:** keep their own bordered component (soft surface,
  ink border, ember `!` mark). Restyle only — copy, size and prominence are
  never reduced (see CLAUDE.md Don'ts).
- **Below the fold (hybrid page):** the editorial half of every tool page
  (methodology, formula, limitations, FAQ — SPEC §11) gets full typographic
  care, not leftovers: 65ch prose, ink-bordered FAQ accordions, and a
  **versioned methodology chip** near the top of the section
  (`Methodology v1.3 · open · changelog →`, Space Mono, forest) — the open
  scoring from METHODOLOGY.md is the trust moat; wear it visibly.
- Zero-CLS rule still applies: late-loading elements reserve dimensions.

## 4. Voice & copy

- British English (per CLAUDE.md). Punchy, warm, evidence-first — "a mate who
  spots you, not a consultant who bills you".
- Headlines are claims, not slogans ("Know your numbers. Then move them.").
- Numbers lead: tool cards show the output number before the tool name.
- Trust signals stay concrete: "No sign-up", "Every formula cited",
  "Runs in your browser · nothing stored · nothing sent".
- Playful is fine ("Zone 2 is the new rave"); flippant about health outcomes
  is not. Disclaimers keep their serious register.

### Positive-frame rules (binding — from ROADMAP §2)
- A weak or regressed metric is always shown **with its top modifiable driver
  and next step**, never as a verdict on the person. "Elevated — mostly your
  systolic BP" + fix list: yes. A bare red "+7 yrs" with no path: no.
- **Share surfaces carry wins only** — percentiles, personal bests, milestones,
  progress. Deficit numbers stay on-page next to their fix list; nobody shares
  shame, and we don't ask them to.
- Temporal comparison ("you vs you") is the default motivator; social
  comparison is secondary and flattering-by-default ("top X%").
- Streak/lapse copy is never accusatory. No "you lost your streak", no guilt
  animations, no loss theatre.
- Units follow SPEC §6: geo-defaulted (imperial-first for US visitors) with the
  persisted toggle. Mockups show metric; US-first surfaces must be designed and
  QA'd imperial-first, since US traffic is the revenue-weighted audience.

## 5. Monetisation posture — premium-lean

Decision (Mat, 2026-07-22): v2 is designed **premium-lean**. The layouts must
stand complete with ads disabled; ad slots are optional inserts, never
structural. (BUSINESS_PLAN §7 still describes the ads→affiliates→premium
ordering — updating that doc is a separate strategy call; this section governs
design only.)

- **No layout depends on an ad.** Every page composes cleanly with
  `NEXT_PUBLIC_ADS_ENABLED=false`. If ads are switched on later, the existing
  SPEC rules bind unchanged: reserved dimensions (zero CLS), consent-gated,
  lazy, and never above the calculator (SPEC §10–11).
- **What premium sells is persistence**, per SPEC §10's Pro-tier note and
  ROADMAP E2/E6: saved results, Trajectory (longitudinal tracking), advanced
  share cards, ad-free. Those surfaces are designed first-class in §6 — they
  are the product being charged for, not bolt-ons.
- **Free stays free.** A calculation, its result and its methodology are never
  gated (BUSINESS_PLAN mission; the credibility moat). Premium gates
  *persistence and depth*, never the answer.
- **Upsell style: honest and quiet.** One inline "keep this number" prompt per
  result (forest outline card, plain price, plain benefit). Never a blocking
  modal, never a countdown timer, never blurred-content teasers or other dark
  patterns — they'd torch the trust positioning that justifies the fee.

## 6. Return-visit & retention components

The v1 mockups cover the first visit. Retention lives in the return visit, and
premium is monetised retention — so these components are part of the core
design system, not an engagement afterthought. Each ships with its ROADMAP
phase (noted); this section styles them, it does not schedule them
(CLAUDE.md: no implementing ahead of milestones). ROADMAP §2 guardrails bind
every component below.

- **"Since last time" delta chip** *(HistoryProvider is local-only today —
  earliest buildable)*. On any result card when a prior run exists:
  improvement = forest soft-fill pill (`▼ 0.8 yrs since March ✓`); flat or
  regressed = soft-paper pill, neutral tone, always paired with the top
  modifiable driver. Never red, never a sad state. This is the temporal
  "you vs you" comparison ROADMAP names the safest, strongest motivator —
  the keystone chip of the whole system.
- **Trajectory trend card** *(E2 — the keystone build)*. Chart language:
  hairline grid (`#E7D8C6`), 2px ink trend line with a soft blaze area fill
  (~10% opacity), endpoint emphasised with a Blaze dot and tabular-nums label.
  Personal bests = rotated matcha `PB` sticker; milestones = sticker flags;
  "what moved this" annotations in Space Mono. Charts reserve dimensions
  (zero CLS). Empty state invites the first save, warmly.
- **Achievement / share card** *(E1 — fires at peak satisfaction)*. Formats:
  1200×630 OG + 1080×1920 story. Composition: espresso ground, huge Anton
  number in Blaze, flattering percentile pill (`Top 12% · men 30–34`,
  forest), matcha tick sticker, small FitTools wordmark + link as watermark.
  Wins only (see §4). This card *is* the brand in the wild — it gets the same
  design budget as the homepage hero.
- **Day-1 win badge** *(E3 — the single biggest retention lever)*. First
  completed calculation earns a sticker-style badge moment ("First number
  banked ✓" — matcha sticker, slight rotation, one restrained pop animation,
  `prefers-reduced-motion` honoured). Celebration register, shown once.
- **Streak chip** *(E3)*. Active: Blaze flame + count. Freeze: forest
  `freeze on · safe` state — visibly protective, not punitive. Lapsed: warm
  re-entry banner ("Good to have you back — pick up where it counts"), streak
  restarts without ceremony. No loss animation exists in this system.
- **Welcome-back strip** *(returners; feeds E5)*. "Since your last visit":
  new tools/content flagged with a rotated matcha `NEW THIS WEEK` sticker
  (novelty cue), plus soft-amber "due a re-run" chips
  (`TDEE — last run 92 days ago`). Opt-in email reminders reuse the same
  visual language.
- **Percentile & status** *(E4)*. Default: downward-flattering forest pill
  (`Top 15% for your age band`). Leaderboards are opt-in, tightly segmented,
  personal-best framed; never a forced upward comparison.
- **Challenge card** *(E4 — lapsed-user re-activation)*. Time-limited, Space
  Mono countdown, ink border + hard shadow like tool cards; completion state
  feeds the share card.
- **Rest nudge** *(ROADMAP §2.7 harm guardrail)*. When usage patterns suggest
  overreaching (e.g. low readiness + repeated re-checks), a forest,
  care-register card nudges toward rest — never gamified, never dismissible
  into a streak penalty.
- **Premium surfaces** *(E6)*. The save prompt ("Keep this number — free
  account"), the Trajectory depth upsell (30 days free, full history paid),
  and the ad-free benefit line — all styled per §5's honest-and-quiet rules:
  forest outline, plain copy, stated price, no urgency theatre.

## 7. Implementation notes

- Tokens drop into `src/app/globals.css` as custom properties replacing the
  current teal set (`--primary` etc.). Components already read from variables,
  so the swap is central; then sweep for hard-coded Tailwind colour utilities.
- Fonts via `next/font` (Anton, Figtree, Space Mono) replacing Geist.
- Rollout order: tokens + nav + homepage → tool template (one change restyles
  all tools) → library/reference templates → content pages.
- Performance budgets (SPEC §13) and accessibility are unchanged requirements:
  visible focus states (2px ember outline suggested), WCAG AA contrast on all
  text-bearing fills, `prefers-reduced-motion` honoured for marquee/ticker and
  any hover motion.
