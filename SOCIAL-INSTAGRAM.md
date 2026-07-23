# SOCIAL-INSTAGRAM.md — Instagram plan (working doc)

Companion to `BUSINESS_PLAN.md` (strategy), `ROADMAP.md` (engagement/viral
sequencing), `DESIGN.md` (visual identity + voice), `PULSE.md` and
`DAILY-GAMES.md` (the content engines this plan feeds off), `CONTENT.md` /
`CONTENT-looksmaxxing.md` (editorial guardrails), `MONETISATION.md`
(premium-lean posture). Like `BUSINESS_PLAN.md`, this is **strategy/context
only — never a build instruction**; anything here that needs code (§8.3) is
flagged for its own sign-off.

**Status (2026-07-23): PROPOSED — not signed off.** Handle, launch timing and
cadence need Mat's call (§12). The guardrails in §10 are lifted from docs that
are already binding (ROADMAP §2, DESIGN §4, CONTENT §1, CONTENT-looksmaxxing
§1) and bind here with the same force from day one.

---

## 1. Strategic fit — why Instagram, and what it is for

The growth model (BUSINESS_PLAN §8) runs on three engines: SEO, viral loops,
and authority. Instagram is not a fourth engine — it is an **amplifier for
engines 2 and 3** and a hedge against engine 1's main risk (the 6–12 month SEO
ramp, BUSINESS_PLAN §13):

1. **Viral-loop amplifier (ROADMAP E1).** The share loop is built for
   screenshot culture — flattering achievement cards fired at peak
   satisfaction. Instagram is where those screenshots live. An owned account
   gives shared cards somewhere to point, and reposts user wins (§5.6) so
   sharing is visibly rewarded.
2. **Authority in the feed (Engine 3).** The moat is credibility — open,
   versioned, cited methodology in a category dominated by grifters and
   black boxes. Instagram fitness/wellness is the epicentre of the
   misinformation this site counter-programmes (CONTENT-looksmaxxing §0: ~64%
   of Gen Z have seen sunscreen misinformation; >1 in 3 name influencers as
   their primary skincare source). "The receipts account" is a differentiated
   position in that feed, exactly as it is in search.
3. **Pre-SEO audience.** Social is the only meaningful acquisition channel
   available during the ramp, and it feeds the durable audience assets
   (returning visitors, newsletter — ROADMAP E5) that de-risk everything else.
4. **Audience match.** Target segments 1–3 (optimisers, strength/hybrid
   athletes, GLP-1 users — BUSINESS_PLAN §4) are heavy Instagram users, and
   the v2 identity is a Gen-Z rebrand. US-weighted reach matches the
   revenue-weighted audience.

**What Instagram is NOT for:** it is not the product, not a second content
CMS, and not a hard-sell channel. Every post exists to either (a) earn trust
with a cited fact, or (b) route someone to a tool where the site itself takes
over. The premium-lean posture (DESIGN §5, MONETISATION §2) applies to the
grid: honest and quiet, no urgency theatre, free stays free.

**One-line position for the channel:**
> The fitness account that shows its receipts. Every number cited, every
> formula open, nothing for sale that gates the answer.

---

## 2. Account & profile

- **Handle:** match the final domain/brand name exactly (working name
  FitTools; BUSINESS_PLAN keeps the name bracketed, and the handle decision
  is really the naming decision — §12). Reserve the handle on Instagram *and*
  TikTok/YouTube/X the same day, even though only Instagram launches now.
- **Name field:** `FitTools · Evidence-based fitness` — the name field is
  searchable on Instagram; carry the category keywords.
- **Bio** (matches DESIGN §4 trust signals — concrete, not sloganed):
  - Line 1: `Know your numbers. Then move them.`
  - Line 2: `30+ free calculators · every formula cited · no sign-up`
  - Line 3: `Loud enough to lift. Calm enough to live long.`
  - Link: one link, to the homepage with UTM (`?utm_source=instagram&utm_medium=bio`).
    No third-party link-in-bio service — it's an unnecessary third party
    (SPEC §10 spirit) and the homepage already routes to every hub. Revisit
    only if story-link volume proves a routing page is needed.
- **Profile image:** the wordmark/monogram on Blaze, or Blaze mark on paper —
  same asset family as the OG watermark (DESIGN §6 achievement card).
- **Pinned posts (3):** the manifesto post (§7, post 1), the best-performing
  tool explainer, and the current monthly recap. Rotate the last two.
- **Highlights:** `Start here` · `Ballpark` (daily game) · `Myth or Fact` ·
  `Tools` · `Receipts` (methodology/how we cite). Highlight covers in brand
  tokens — ink icons on paper, one per category colour (DESIGN §3 hub coding).

---

## 3. Audience mapping (who each pillar serves)

| Segment (BUSINESS_PLAN §4) | What they want from the feed | Pillars (§5) |
|---|---|---|
| Optimisers / longevity-minded | New biomarkers, heart age, biological age, CGM literacy, "know it first" novelty | P1, P2, P6 |
| Strength & hybrid athletes | Standards, 1RM/DOTS, training maths, plate-math relatability | P1, P4, P5 |
| GLP-1 & weight-management | Muscle-preservation, protein, TDEE/deficit without shame | P1, P5 (positive-frame rules absolute here) |
| General health searchers / Gen-Z glow-up | Myth debunks, skin/sun, sleep, "is this TikTok trend real?" | P3, P4, P2 |

British English throughout (house style, CLAUDE.md) — it reads as a
credibility marker to a US audience, not a barrier. Units in posts follow the
site rule in spirit (SPEC §6, DESIGN §4): US-facing posts lead imperial with
metric in brackets where a number is the hook.

---

## 4. Visual system on the grid

The feed is the design system, unmodified (DESIGN §1–3). No new visual
language — the grid should look like the site fell onto Instagram:

- **Grounds alternate** paper (`#FBF4EC`) and espresso ink (`#1C130D`) posts
  so the grid has rhythm; espresso is reserved for hero-number cards (the
  ScoreCard inversion rule — the palette goes full volume on the result).
- **Type:** Anton caps for the hook/number, Figtree for supporting copy,
  **Space Mono for the citation footer on every single card** — the receipt
  line (`PREVENT · AHA 2023`, `Li et al · Circulation 2018`). The citation
  IS the brand device. A card with no source line does not post.
- **Components reuse:** 2px ink borders, hard offset shadows, pill chips,
  rotated verdict stamps (`NOT SUPPORTED`, `TIER A`), soft-fill score pills.
  The Pulse card and Ballpark share-grid compositions port directly.
- **One Blaze element per card** (the one-Blaze-button rule, DESIGN §3
  applied to social). Forest owns evidence badges and health wins.
- **Motion is content (§8.2):** the DESIGN §8 effects — odometer roll,
  life-in-months cascade, barbell whip, heartbeat score, the 404 failed-lift
  easter egg — are screen-recorded from the live site as Reels material.
  The interface behaving "like the body it measures" is inherently reelable,
  and it advertises the product by simply being the product.
- **Never:** stock photography, body-transformation imagery, red "danger"
  numbers (semantic scale stays soft, DESIGN §1), clinical grey/pure black.

Accessibility carries over: alt text on every post (it is also Instagram
SEO), no colour-only meaning, captions/subtitles burned into every Reel
(most viewing is muted).

---

## 5. Content pillars

Six pillars, all fed by content that already exists in the repo — the
channel's marginal cost is templating, not authoring. Nothing is written for
Instagram that isn't already vetted for the site (the PULSE §1.1 contract
extends to social: no post without a pre-vetted claim + source behind it).

### P1 — "The number" (tool explainers) · ~2/week
One cited number as the hook, the mechanism in three beats, the tool as the
payoff. Carousel (saves/shares) or Reel (reach).
- Format: slide 1 = Anton number on espresso ("YOUR HEART HAS ITS OWN AGE");
  slides 2–4 = what it means, what moves it (top modifiable driver — the
  positive-frame rule); final slide = tool card + "link in bio" + receipt line.
- Sources: every calculator config already carries `sources` and FAQ; the
  what-moves-the-needle panel (DESIGN, Heart Age) is the middle-slide content.

### P2 — Receipts (Pulse facts) · ~2/week
A Pulse card, essentially verbatim: one vetted claim, its real citation, its
deep link. Single image or 2-slide carousel (claim → context). This is the
highest-volume, lowest-effort pillar — the grounding corpus is the queue,
and every card already links a tool or article (PULSE §1's internal-linking
job becomes a traffic job).

### P3 — Myth or Fact (debunks) · 1/week
The debunk hub (CONTENT-looksmaxxing §3.5) and myth chips, as content:
mewing, bone-smashing, tanmaxxing, sunscreen myths, plus recovery-cluster
myths (ice baths, red light). Format: Reel or carousel ending on the rotated
verdict stamp (`NOT SUPPORTED — here's what actually works →` routing to the
honest alternative, exactly as the hub does). Counter-programming is the
share bait: people tag the friend who mouth-tapes.
Stories tie-in: the weekly Myth or Fact? game gets a poll-sticker version
(§6) the same day.

### P4 — Ballpark (the daily game) · daily, Stories-first
Ballpark is *made* for the Stories slider sticker: "Guess the average adult
resting heart rate" → slider guess → tomorrow's story opens with the reveal
+ citation + "play today's at /daily". Perfect mechanical match, daily
appointment content at near-zero cost (the item pool is authored and cited
in `src/registry/daily.ts`), and it trains the audience that the account is
interactive. Weekly: one feed post of the community's guess spread vs the
answer (the spoiler-free share-grid aesthetic).

### P5 — Evidence tiers (supplements & interventions) · 1/week
The supplement database's tier verdicts as cards: `CREATINE — TIER A` on
forest, `[TRENDING THING] — TIER D` on soft paper, always with the tier
spelled out, the citation, and the one-line honest read. High-save,
high-argument (comment-driving) content. Strict rules in §10 apply
(no dosing protocols, no medical claims, peptides excluded entirely).

### P6 — Open methodology / build-in-public · ~2/month
The trust moat, performed: "every competitor hides their formula — here's
ours, versioned, with a changelog" (methodology chip as a post); "what
changed in v1.3 and why"; founder-voice notes on building evidence-first in
a hype category (Mat's biotech MSc is the E-E-A-T asset — author credibility
is a stated ranking and trust strategy, BUSINESS_PLAN §8). Occasional
behind-the-build Reels (the motion system, the tests, the sources receipt).

**Explicitly not content:** peptides (site section is deliberately
educational-only and no-dosing; on Meta it's a moderation and reputational
minefield — keep it off-channel entirely), blood-test partner promotion
(pre-launch, and health-service promotion has its own compliance bar — wait
for the partner and legal review), anything from the §10 never list.

---

## 6. Formats & cadence

Solo-founder-realistic base cadence (~3–4 h/week after templates exist, §8):

| Surface | Cadence | Job |
|---|---|---|
| Feed (carousel/single) | 3/week — P1, P2 or P5, P3 | Saves, shares, the permanent grid |
| Reels | 1/week (from the feed topics, motion-led) | Reach / non-follower discovery |
| Stories | Daily Ballpark (§P4) + reveal; Friday Myth or Fact poll | Habit, interaction signal, link stickers |
| Monthly recap | 1/month feed post | "New this month" — mirrors the welcome-back strip (DESIGN §6) |

Stretch cadence (if results justify): 4–5 feed/week, 2–3 Reels. Never at the
cost of the citation bar — a missed posting day costs nothing; an uncited or
wrong post spends the moat (BUSINESS_PLAN §13, YMYL risk).

Timing: evenings US Eastern (the revenue-weighted audience), batched
scheduling via Meta's native scheduler — no third-party social tool until
the cadence outgrows it.

Engagement rule: first 30–60 min after posting, reply to every substantive
comment (the algorithmically-weighted window — and the "mate who spots you"
voice is built in replies, not broadcasts). Corrections follow the site's
posture: if a post is wrong, correct it visibly and say what changed —
versioned-methodology culture applied to social.

---

## 7. Launch sequence

**Phase 0 — now (pre-launch, site not yet indexed):** reserve handles (§2);
build the 6 card templates (§8.1); bank a 3-week content buffer (≈10 feed
posts, 20 Ballpark stories) so launch cadence never depends on a good week.

**Phase 1 — soft open (with the domain going live):** publish the first
9-post grid as a coherent opening statement, then start the §6 cadence.
The opening nine (one candidate set, all from live site content):

1. **Manifesto** (P6, pin): "Fitness content has a receipts problem. Every
   number we post is cited. Every formula we use is public." — the
   positioning statement as a carousel.
2. **Heart age** (P1): "Your heart has its own age" — PREVENT/AHA 2023, the
   March 2026 guideline window (BUSINESS_PLAN §3's live traffic spike).
3. **Caffeine half-life** (P2): "Half your 4pm coffee is still in your blood
   at 10pm" — caffeine calculator link.
4. **Mewing debunk** (P3): verdict stamp + the honest alternative route.
5. **1RM / strength standards** (P1): "How strong are you, actually?" —
   percentile framing, flattering by default (ROADMAP §2).
6. **Creatine Tier A** (P5): the most defensible supplement verdict first —
   establishes the tier device on a claim nobody credible disputes.
7. **Ballpark announcement** (P4): the game, the share grid, "same puzzle,
   everyone, every day".
8. **Life in months** (P1, Reel): the LifeMonthsGrid cascade screen-recorded
   — Li 2018's five factors, gains-animate framing.
9. **Sunscreen myths** (P3): the AAD-survey hook (64% have seen
   misinformation) — the glow-up cluster's counter-programming flag planted.

**Phase 2 — steady state:** §6 cadence; monthly recap; repost user share
cards as they start appearing (§5.6 → §10 wins-only rule); review monthly
against §11.

---

## 8. Production system

### 8.1 Templates (one-off setup)
Six reusable card templates matching §4 — number card (espresso), Pulse fact
(paper), verdict/debunk stamp, tier card, carousel body slide, recap. Built
once in any design tool with the brand fonts/tokens; exact hexes from DESIGN
§1. Portrait 4:5 (1080×1350) for feed; 9:16 (1080×1920) for Stories/Reels.

### 8.2 Repurposing pipeline (the actual workflow)
Weekly batch, in order of least effort: pick Pulse/daily items → drop into
templates → screen-record any motion piece → write captions (hook line,
context, receipt line, one CTA) → alt text → schedule. The caption's first
line repeats the card's hook (feed truncates at ~1–2 lines); keyword-led
captions and alt text carry Instagram SEO the way page titles carry Google.

### 8.3 Possible build support (flagged, NOT scheduled — needs its own call)
- **Story-format share card:** DESIGN §6 already specs a 1080×1920 story
  variant of the achievement card; `/api/share-card` currently renders
  1200×630 only. Building the story size makes every user win
  Instagram-native — the single highest-leverage build item for this channel.
- **`utm_source=instagram` convention** on all bio/story links so referral
  shows up distinctly in analytics from day one.
- **Batch card export:** if templating becomes the bottleneck, a small script
  rendering Pulse/daily items through the existing OG-image pipeline at 4:5
  would automate P2/P4 asset production. Nice-to-have, not now.

---

## 9. Growth tactics (beyond posting)

- **Instagram SEO first, hashtags second.** Keyword name-field, captions and
  alt text (§2, §8.2). Hashtags: a small rotating set (~5–10) of niche tags
  per pillar (e.g. `#evidencebasedfitness`, `#longevity`, `#strengthtraining`,
  `#zone2`) — never 30-tag blocks, never `#fitspo`-adjacent tags (wrong
  audience, wrong psychology).
- **Tag-a-mate mechanics** built into content shapes: debunks ("send this to
  the mouth-taper"), Ballpark spread posts, strength standards. Sharing is
  the KPI that matters (§11).
- **Collabs (Phase 2+):** Instagram Collab posts with evidence-based
  creators (small science-communicator accounts, not transformation
  influencers) — a Myth-or-Fact done jointly doubles reach at zero cost and
  the co-author choice is itself a positioning signal.
- **Embeds → follows loop:** the embeddable widgets (M4) carry the wordmark;
  the account link belongs in the embed footer alongside the site link.
- **Cross-posting:** Reels are format-portable to TikTok/YouTube Shorts.
  Park the content there unedited once Instagram cadence is stable — reach
  hedge at near-zero marginal cost, same handle (§2). Instagram remains the
  primary channel (grid identity + the segments' home platform).
- **Newsletter hand-off:** stories push the newsletter (ROADMAP E5) once it
  exists — social reach is rented, email is owned (BUSINESS_PLAN §13
  platform-dependence mitigation).

---

## 10. Guardrails (binding — inherited, not new)

Everything below restates rules already binding elsewhere; social gets no
exemption and no softer register. **The account is the site's evidence
posture in public — one uncited viral post can cost more than the channel
earns.**

1. **Every factual claim carries its citation on the card itself** (Space
   Mono receipt line). No source, no post. Corrections are visible, not
   deleted (§6).
2. **Positive frame only (ROADMAP §2).** Wins, progress, "top X%",
   you-vs-you. Never shame, fear hooks ("your heart age will terrify you" is
   banned), loss theatre, or a deficit number without its modifiable driver
   and next step.
3. **Wins only on shares/reposts (DESIGN §4).** User cards reposted with
   permission, flattering percentile framing, no commentary on bodies.
4. **No appearance rating, ever (CONTENT-looksmaxxing §1).** No face/physique
   scoring, no before/after "potential", no transformation content. We rate
   evidence, never a person.
5. **No medical advice; educational framing throughout (CONTENT §1).**
   Longevity metrics are estimates; no diagnosis, no mortality countdowns, no
   promising outcomes. Where the site shows a disclaimer, the caption carries
   its plain-language equivalent ("estimate, not a diagnosis — methodology at
   the link").
6. **Supplements: tier + honesty, no protocols (CONTENT §1, P5).** No dosing
   instructions in social copy beyond what the cited page states; nothing for
   under-18-coded content. **Peptides: entirely off-channel (§5).**
7. **Safety boxes travel (CONTENT §5).** Cold-immersion/sauna content carries
   the risk line in-frame, not buried in the caption.
8. **Disclosure from the first monetised post (CONTENT §1, legal/affiliate
   page).** When affiliates/own products eventually appear: `#ad`/clear
   disclosure per ASA (UK) and FTC (US) rules, and the honest-evidence rule
   holds even where inconvenient. Until then: nothing is promoted at all.
9. **Body-image care (CONTENT-looksmaxxing §1.3).** Glow-up content links the
   support signpost where the site page does; comment moderation removes
   body-shaming; no engagement-baiting on insecurity, full stop.
10. **Premium-lean voice (DESIGN §5).** No urgency theatre, no countdowns, no
    "last chance". The site never dark-patterns; neither does the grid.

---

## 11. Measurement

Reviewed monthly against the ROADMAP §5 funnel (Instagram feeds its top):

- **Primary: qualified referral** — sessions from `utm_source=instagram`, and
  % landing on a tool page (not just the homepage). The channel exists to
  put people in front of a calculator.
- **Health of the loop:** shares and saves per post (the two signals that
  match the site's psychology — sends are the viral coefficient's social
  twin), story-slider participation on Ballpark, profile-visit → link-click
  rate.
- **Audience asset:** follower growth (secondary — a lagging vanity metric on
  its own), newsletter signups attributed to social once E5 lands.
- **Kill/scale criteria (honest review at month 3):** if referral sessions
  and saves/shares aren't trending up by then, cut cadence to the P2+P4
  low-effort floor rather than abandoning the handle — the account's
  existence (squatted handle, pinned manifesto, live grid) has standing
  value even at minimal cadence during the SEO ramp.

---

## 12. Open questions (Mat's call)

1. **Handle/name:** locks with the domain decision — the working name is
   still bracketed in BUSINESS_PLAN. Reserve-now-rename-later is possible
   but costs early equity; naming first is cleaner.
2. **Launch timing:** soft-open with the domain, or bank the buffer and
   launch when Ballpark/Pulse have a few weeks of live history to point at?
3. **Story-format share card (§8.3):** approve as a build item? (It is the
   one engineering task this plan genuinely wants.)
4. **Founder face:** P6 works faceless (build-in-public, receipts culture)
   or founder-fronted (stronger E-E-A-T, more work, more exposure). Which
   register?
5. **Cadence commitment:** base (§6) vs low-effort floor to start — what is
   sustainably fundable in founder time alongside the MSc until August?
