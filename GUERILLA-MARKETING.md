# GUERILLA-MARKETING.md — Zero-budget growth plays

Companion to `BUSINESS_PLAN.md` (§8 growth engines: SEO, viral loops,
authority/PR), `ROADMAP.md` (the engagement loop the plays feed),
`DAILY-GAMES.md` (the watercooler mechanic), `CONTENT-looksmaxxing.md` and
`CONTENT-peptides.md` (the counter-programming clusters), `METHODOLOGY.md`
(the open-formula claim every stunt rests on) and `MONETISATION.md`
(premium-lean posture the marketing must not undercut). This document is the
**tactical acquisition layer**: the unconventional, near-zero-cash,
founder-time-powered plays that get the first thousands of sessions while the
SEO engine ramps over 6–12 months.

**Status (2026-07-23): WORKING PLAN — pending Mat's sign-off.** Nothing here
changes product scope. Plays marked *(build: ≤1 day)* involve small optional
site additions; everything else uses assets already in the tree.

---

## 0. What guerilla means here — and what it never means

Guerilla marketing for this site is **asymmetric effort, not deception**: being
disproportionately useful, surprising, or generous in places where the target
audience already gathers, so that a solo founder with ~£0 outcompetes budgets
with wit and credibility. The moat is trust (`BUSINESS_PLAN.md` §5); any tactic
that spends trust to buy reach is net-negative and is banned here, not merely
discouraged.

**Hard rules (inherit everything, add these):**

1. **No astroturfing, ever.** One account per platform, real name, affiliation
   stated ("I built this"). No sockpuppets, no fake reviews, no seeded
   "organic" mentions. A single discovered fake persona would undo every
   authority signal the site is built on.
2. **Respect community rules.** Read each subreddit/forum's self-promotion
   policy first; keep the ~9:1 give-to-promote ratio; ask moderators before
   AMAs or tool threads. A mod removal is a kill signal (§6), not a retry.
3. **Positive frame only** (ROADMAP §2). No insecurity hooks, no "you're
   probably unhealthy" copy, no shame-bait thumbnails. Marketing uses the same
   psychology as the product: progress, curiosity, flattering achievement.
4. **No health claims beyond what the pages say.** Marketing copy is bound by
   the same YMYL discipline as the site (`METHODOLOGY.md`): estimates not
   diagnoses, no mortality hooks, no medical advice.
5. **The peptides cluster is promoted as education only** (CONTENT-peptides
   §0). Never in a "what to take" frame, never near commerce, no exceptions.
6. **Glow-up marketing follows the minor-safety posture**
   (CONTENT-looksmaxxing §1.3/§6.3): never rate appearance, always route to
   the honest alternative, keep the body-image signpost in reach.
7. **Disclosure everywhere.** ASA (UK) / FTC (US) rules apply to our posts and
   to any creator collaboration; affiliate surfaces already carry disclosure
   (`SPEC.md` §10) and marketing never hides it.
8. **Physical placements only with permission.** No fly-posting; the model is
   "the venue chooses to print it" (§4 P5), which sidesteps the issue
   entirely.
9. **Cold outreach stays targeted and lawful** (UK PECR): individually
   addressed, relevant, B2B (gyms, creators, editors), easy to decline.

**What this plan deliberately is not:** paid ads (no budget and wrong stage),
an AI content mill, engagement-bait, DM spam, link-buying, or growth hacks
that borrow reach from dark patterns. Kill anything that drifts that way.

---

## 1. The arsenal — assets already in the tree

Every play below runs on something already built. This table is the inventory.

| Asset | Where | Guerilla use |
|---|---|---|
| ~27 cited calculators, each a landing page | `src/registry/configs/` | The "answer with a link" in every community play (P1) |
| Open, versioned methodology | `METHODOLOGY.md`, `/learn/index-methodology` | The flagship differentiator stunt (P3); the Show HN angle (P2) |
| Share cards (server-rendered OG images) | `/api/share-card`, `/share`, ROADMAP E1 | Screenshot-ready proof in every post; the viral on-ramp |
| Daily games: Ballpark + Myth or Fact? | `/daily`, `DAILY-GAMES.md` | Wordle-style spoiler-free grids — native watercooler content (P6); Product Hunt candidate (P2) |
| React-free HTML embeds with attribution links | `/embed/[slug]` | The link-building giveaway (P4) |
| Looksmaxxing debunk hub + verdict stamps | `/glow-up/looksmaxxing-myths` | Short-form counter-programming format (P8) |
| Peptides education cluster | `/learn/peptides` | High-volume search terms served honestly — community answers where hype dominates (P1, education frame only) |
| Labs tools (blood test, phenotypic age, heart age, CGM metrics) | `/labs`, `/blood-test` | The longevity-community hook; rides the 2026 guideline window (P7) |
| Pulse fact feed | `/pulse` | Ready-made post material: one cited surprising number per post |
| Reference tables, glossary, exercise library | `/reference`, `/glossary`, `/exercises` | "Useful thing to pin" material for wikis and sidebars (P1) |
| Author page (biotech MSc, cited sources) | `/author/mathew-beale` | Podcast/AMA/press credibility (P9, P10) |
| Zero third-party requests with flags off; no signup; fast static pages | README | Exactly the details Hacker News respects (P2) |
| Event instrumentation (`card_generated`, `card_shared`, `affiliate_click`) | SPEC §10 | Measurement backbone (§6) |

---

## 2. Timing windows (use them or lose them)

| Window | Why it's open | Plays |
|---|---|---|
| **Cardiovascular guideline reset** (March 2026 ACC/AHA: ApoB, Lp(a), 30-year risk) | Live search spike, <1% ApoB testing awareness, minimal free tooling (`BUSINESS_PLAN.md` §3) | P7 newsjack now; P1 answers in longevity communities; P10 expert-source pitches |
| **OTC CGMs mainstream** (Stelo, Lingo) | Millions of new glucose data streams with no interpretation layer | CGM metrics tool answers (P1), P7 reaction content on CGM news |
| **GLP-1 era** (~1 in 5 US households) | Muscle-preservation anxiety → protein/FFMI/lean-mass tooling fits | P1 in GLP-1 communities — support frame, never sales frame |
| **MSc completes (Aug 2026)** | "MSc Biotechnology" becomes a finished credential | P9/P10 bios upgrade; University of Reading press/society window (P5) |
| **September** | Gym-joining + freshers wave; societies restart | P5 poster/society push lands late Aug–Sept |
| **New Year** | Biggest annual intent spike in the niche | Prep in Dec: every play at full volume in Jan |

---

## 3. Beachheads — where each segment already gathers

Segments from `BUSINESS_PLAN.md` §4, mapped to specific venues. Presence is
cumulative: pick **two** to be genuinely resident in per month, not ten to
drive-by.

| Segment | Venues | First move |
|---|---|---|
| Optimisers / longevity | r/longevity, r/Biohackers, r/QuantifiedSelf, r/PeterAttia, Huberman/Attia episode discussion threads, longevity X/Twitter | Answer interpretation questions with the labs tools; AMA once resident |
| Strength & hybrid athletes | r/weightroom, r/powerlifting, r/Fitness daily threads, lifting Discords, meet warm-up rooms | Plate/warm-up/DOTS answers; gym poster kit (P5) |
| Runners / hybrid | r/running, r/AdvancedRunning, parkrun communities, club Facebook groups | Race-time predictor + pace tools; parkrun cards with permission (P5) |
| GLP-1 & weight management | r/Semaglutide, r/Zepbound, r/loseit | Muscle-preservation and protein answers; support tone, zero selling |
| Gen-Z glow-up | TikTok, YouTube Shorts, Instagram Reels, r/SkincareAddiction | Verdict-stamp debunk shorts (P8) |
| Builders / early adopters | Hacker News, Product Hunt, r/InternetIsBeautiful, r/SideProject | Launches (P2); the open-methodology story |
| Coaches & content owners | Coaching newsletters, gym owner groups, small fitness blogs | Embed giveaway (P4), creator kits (P9) |

---

## 4. The plays

Each play lists: what, why it works, cost, cadence, measure, watch-outs.
Attribution discipline for every play: a distinct UTM (or short link / QR) per
placement — §6.

### P1 — Be the answer (community residency)
**What:** A standing weekly rhythm (3 × 40 min) answering real questions in
the beachhead communities with a genuinely complete answer — the link is a
footnote, not the point. Set up saved searches/alerts for trigger phrases
("what's my ApoB", "1RM calculator", "is mewing real", "protein on Zepbound",
"CGM spike normal"). Where mods allow, contribute tools to wikis/sidebars —
a wiki placement is permanent, pre-trusted distribution.
**Why it works:** The site's depth is the weapon: every answer can cite
formulas and sources no competitor page carries. Wiki placements compound.
**Cost:** £0. **Cadence:** weekly, forever.
**Measure:** referral sessions per community; wiki/sidebar placements won.
**Watch-outs:** the 9:1 rule; some subs (r/Fitness) effectively ban links —
answer fully anyway, build the account's authority for the AMA later.

### P2 — Launches: Show HN, Product Hunt, r/InternetIsBeautiful
**What:** Three separate launch moments, weeks apart, each with its own angle:
1. **Show HN:** "Fitness calculators where every formula is published,
   versioned and test-vectored" — lead with open methodology, zero third-party
   requests, no signup, static speed. Founder answers every comment for 24 h.
2. **r/InternetIsBeautiful:** the site as a free useful thing (that sub's
   exact remit).
3. **Product Hunt:** launch **Ballpark** (the daily game) as its own product
   later — games outperform utilities there, and it gives a second launch
   without re-launching the site.
**Why it works:** These audiences reward exactly what the site already is;
one front-page hit seeds the backlink graph and the early-adopter base.
**Cost:** £0. **Cadence:** one-off each, sequenced (§5).
**Measure:** launch-day sessions, signups to newsletter if live, backlinks.
**Watch-outs:** launch when the cardio/labs cluster is polished — HN will
stress-test the claims; that scrutiny is the point (see P3).

### P3 — The open-formula challenge (flagship stunt)
**What:** A manifesto moment: *"Health scores shouldn't be secrets. We
published every formula we use — coefficients, sources, changelog. We invite
every wearable and testing company to do the same."* Shipped as:
- a short manifesto page anchored on the existing methodology *(build: ≤1 day)*;
- a respectful open letter/thread naming the category (closed scores), not
  accusing any company of being *wrong* — the ask is "publish", nothing more;
- a **reproducibility bounty**: find an error in any formula → named credit in
  the versioned changelog, fixed within 48 h. Turns the internet's pedants
  into contributors and makes the "versioned, open" claim visibly true.
**Why it works:** It converts the site's core differentiator into a story
journalists and HN can carry; incumbents can't respond without proving the
point. The bounty generates expert scrutiny that *strengthens* the moat.
**Cost:** £0. **Cadence:** one launch + evergreen bounty.
**Measure:** press/newsletter pickups, backlinks, bounty submissions.
**Watch-outs:** tone must stay generous ("we'd love to be second"); never
claim competitor scores are inaccurate — only that they're closed. Honour the
48 h fix SLA or don't offer it.

### P4 — "Steal this calculator" (embed seeding)
**What:** Package the existing React-free embeds (`/embed/[slug]` — a few kB,
attribution link built in) as a giveaway: a one-page "add this to your site in
30 seconds" copy-paste page *(build: ≤1 day)*, then quiet, individual outreach
to coaches, club sites, newsletters and small blogs that already rank for
adjacent terms: "your BMI page would be better with a working calculator on
it — here, free, no tracking."
**Why it works:** Every embed is a permanent attributed backlink from a
relevant site — the SEO engine's fuel — and it seeds the eventual B2B widget
layer (`BUSINESS_PLAN.md` §7.5).
**Cost:** £0. **Cadence:** 5 personalised pitches/week.
**Measure:** live embeds, referring domains, embed-sourced sessions.
**Watch-outs:** PECR-compliant outreach (targeted, B2B, easy no). Keep the
no-tracking promise absolute — it's the pitch.

### P5 — The physical layer (print kit, posters, cards)
**What:** Useful print objects venues *want* on the wall, each QR-coded with a
per-venue code:
- **A3 plate-maths poster** (per-side loading for common targets, kg/lb +
  warm-up percentages) footered "Printed for [Gym Name] · tools.fit" — offer
  the personalised PDF free to gyms and university gyms; they print it.
- **Warm-up protocol cards** (credit-card size, laminated) for meets and
  club nights: warm-up scheme on one side, QR to the warm-up calculator on
  the other.
- **Race-pace cheat cards** for parkruns/club races — *with the event
  director's permission* — pace bands + QR to the race-time predictor.
- **University of Reading window:** sports societies (powerlifting,
  athletics), campus gym, student paper — while the connection is warm
  (Aug–Oct 2026).
**Why it works:** Zero competition on the gym wall; the poster is genuinely
useful daily, so it stays up for years; the venue's own choice to print it is
the permission mechanism.
**Cost:** ≤£60 (laminating + a short sticker/card run); posters cost us £0.
**Cadence:** 3 venue offers/week during the Sept window, then opportunistic.
**Measure:** per-venue QR scans; posters accepted vs offered.
**Watch-outs:** never post without permission; keep venue codes so a dead
placement is visible and the play can be judged honestly (§6).

### P6 — Ballpark as watercooler (daily-game seeding)
**What:** Use the built spoiler-free share grid (`DAILY-GAMES.md` §1.2) as
daily native content: post the grid (never the answer) to the founder's
accounts each day; run a weekly "Ballpark league" thread in one community
that welcomes it (or its own subreddit/Discord channel when there's a seed
audience); pitch the game to one newsletter/community as "a Wordle for
health facts, every answer cited".
**Why it works:** Same-puzzle-for-everyone grids are the proven
low-cringe share mechanic; every reveal deep-links a tool
(`DAILY-GAMES.md` §1.4), so the game is a tool on-ramp, not a cul-de-sac.
**Cost:** £0. **Cadence:** daily post (2 min), weekly thread.
**Measure:** grid shares, `/daily` DAU, game→tool click-through.
**Watch-outs:** the grid must stay spoiler-free; don't over-post into
communities — one home for the league, not ten.

### P7 — 48-hour newsjacking (standing capability)
**What:** A watchlist (alerts/RSS: ACC/AHA + major journals' cardio updates,
Stelo/Lingo/CGM news, GLP-1 muscle-loss coverage, Attia/Huberman episode
feeds) plus a standing SLA: when a spike-event lands, ship within 48 h the
explainer + tool pairing ("what ApoB targets mean — check yours"), then place
it where the event is being discussed (episode threads, news comments,
relevant subs). The cardiovascular window (§2) is the live proof case — move
on it first.
**Why it works:** Long-tail SEO takes months; discussion threads pay the
same day. The tool+explainer pairing is something news articles never have.
**Cost:** £0. **Cadence:** as events land; expect ~1–2/month worth taking.
**Measure:** time-to-publish; thread referrals; whether the page then ranks.
**Watch-outs:** the 48 h SLA never overrides `METHODOLOGY.md` discipline —
a fast wrong number is the worst outcome available. If the vectors aren't
verified, publish the explainer without the calculator and follow up.

### P8 — Verdict-stamp counter-programming (short-form)
**What:** A repeatable 20–40 s format built from the debunk hub's visual
language (the rotated verdict stamp): hook (the myth as the internet tells
it) → stamp slam (**NOT SUPPORTED**) → two cited evidence beats → the honest
alternative → "full breakdown + sources: tools.fit/glow-up". Batch-produce
5 per session from the myths already shipped (mewing, bone-smashing,
tanmaxxing, mouth-taping, SARMs) and the sunscreen-misinformation cluster;
stitch/duet flagrant examples where the platform allows.
**Why it works:** Debunks are the honest version of rage-bait — high
engagement with the credibility intact; the stamp is an ownable, instantly
recognisable brand asset; the target audience (Gen-Z, 64% exposed to
skincare misinformation — CONTENT-looksmaxxing §0) lives on these platforms
and nobody serves them evidence.
**Cost:** £0 (phone + free editor). **Cadence:** 2–3 posts/week from
batches. **Measure:** completion rate, profile→site taps, `/glow-up`
sessions.
**Watch-outs:** §0 rules bind hard here: never mock a *person*, only a
claim; never rate appearance; body-image signpost stays one tap away.
Debunking named influencers invites pile-ons — target claims, not creators.

### P9 — Micro-creator kits (borrowed reach, no budget)
**What:** For creators with 1k–50k engaged followers (lifting, running,
longevity, skincare-science): a personal note plus a **kit** — their numbers
pre-rendered as share cards, an embed for their site, and the offer that
converts: *"tell me the calculator your audience keeps asking for and I'll
build it, cited and free, with your name in the changelog."* Separately:
pitch the founder as a guest to small podcasts (biotech MSc + "why we
publish our formulas" is a real segment, stronger after Aug 2026).
**Why it works:** Small creators get a genuinely valuable free thing and a
story; a bespoke tool costs near-zero marginal effort (`SPEC.md` §5: config +
formula + content) and creates a permanently invested advocate.
**Cost:** £0 + build time for won pitches. **Cadence:** 3 personal pitches/
week; cap bespoke builds at 1/month so it can't eat the roadmap.
**Measure:** kits accepted, creator-sourced sessions, podcast bookings.
**Watch-outs:** disclosure both directions (§0.7); bespoke tools still pass
full `METHODOLOGY.md` review — the creator gets credit, not editorial say.

### P10 — Expert-source PR and the desk-research data play
**What:** Two prongs:
1. **Journalist source platforms** (Qwoted, Featured, Source of Sources —
   the post-HARO ecosystem): respond weekly to fitness/longevity/wearable
   queries as "founder, tools.fit; MSc Biotechnology" with genuinely quotable
   evidence summaries.
2. **Desk-research data stories** that need no user data: e.g. *"We checked
   the maths behind 30 popular fitness calculators"* (uncited coefficients,
   wrong formulas, decades-old equations presented as current) or *"Every
   biological-age formula, ranked by the evidence behind it."* Publish, then
   pitch the finding — not the site — to newsletters and journalists.
   (The consented-data "State of Healthspan" report stays a later-phase
   asset — `BUSINESS_PLAN.md` §7.6.)
**Why it works:** Press links are the highest-authority links available at
£0; the data stories give journalists a finding to cite, which is what
actually gets covered.
**Cost:** £0. **Cadence:** 30 min/week on source queries; one data story per
quarter. **Measure:** quotes/links landed, referring domains.
**Watch-outs:** critique competitor *categories and patterns*; name specific
sites only for verifiable, in-public facts, stated neutrally.

### P11 — Directory & roundup sweep (background radiation)
**What:** One batch afternoon: submit to free-tool directories, "best free
fitness calculator" roundups (pitch the authors of ranking listicles),
AlternativeTo (as the open alternative to closed score apps), relevant
awesome-lists. Log every placement.
**Why it works:** Individually tiny, collectively a steady drip of referrals
and links; costs one afternoon ever.
**Cost:** £0. **Cadence:** once, refreshed quarterly.
**Measure:** placements live; referral sessions.
**Watch-outs:** skip paid listings and link schemes entirely.

**Parked for later phases:** "Wrapped"-style year-in-review cards (needs E2
longitudinal history), community leaderboard events (needs E3/E4 segmented
boards), the consented-data annual report (needs scale + data posture).
Park them; don't pre-build.

---

## 5. The 90-day plan

Assumes ~6 h/week of founder marketing time alongside the build: three 40 min
community blocks (P1), one 2 h play block, 30 min measurement (§6). Cash
budget for the whole quarter: **≤£150** (§7).

| Weeks | Focus | Ships |
|---|---|---|
| 1–2 | **Foundations.** Platform accounts unified (real name, disclosed); alert/watchlist live (P7); UTM/short-link scheme (§6); embed giveaway page + manifesto page drafted *(the two ≤1-day builds)*; begin P1 residency in two communities | Watchlist, tracking, both micro-pages |
| 3–4 | **Launch window 1.** Show HN, then r/InternetIsBeautiful (P2); founder on comments; P11 directory sweep afternoon; P1 continues | Two launches + directory batch |
| 5–6 | **Flagship stunt.** Open-formula challenge + reproducibility bounty live (P3); pitch the story to 5 newsletters/journalists (P10); first cardio-window newsjack shipped (P7) | Manifesto live, bounty open, first newsjack |
| 7–8 | **Distribution objects.** Embed outreach rhythm starts (P4, 5/wk); poster/card PDFs finalised; first venue offers (P5) as the September window opens; P8 first shorts batch | Embeds in the wild, print kit ready, 5 shorts |
| 9–10 | **Borrowed reach.** Creator kits out (P9, 3/wk); podcast pitches; Ballpark daily rhythm + league thread home found (P6); Reading societies push (P5) | Kits, league, campus placements |
| 11–12 | **Review + launch window 2.** Product Hunt: Ballpark (P2); quarter review against §6 — kill, iterate, or scale each play; write next quarter's plan from the survivors | PH launch + scored scorecard |

January (New Year window) is the second big moment: everything that survived
the quarter runs at full volume through December prep into January.

---

## 6. Measurement, attribution, kill rules

- **Instrument once, at the edges.** Per-placement UTMs / short links / QR
  codes for every play (`?src=poster-<venue>`, `?src=embed-<domain>`,
  launch-specific links). Existing events (`card_generated`, `card_shared`,
  game shares) cover the loop; GA4 stays consent-gated as built — accept
  undercounting rather than weakening consent (SPEC §10).
- **Dark-social honesty.** Much referral traffic will arrive naked. Judge
  plays on their tagged floor plus direct-traffic deltas around known
  moments, and say so in the log — no flattering guesswork.
- **The weekly 30 minutes:** update one running scorecard — sessions by
  source, placements won (wikis, embeds, posters, quotes), share/grid
  events, bounty submissions. One line of notes per play.
- **Timeboxes and verdicts.** Every play gets two consecutive scored periods
  (community residency: monthly; everything else: fortnightly), then a
  verdict: **scale** (more of the same), **iterate** (one variable changed),
  or **kill** (logged, with reason). No zombie channels.
- **Hard kill signals** (immediate, no second period): a moderator removal
  (that community's approach dies, per §0.2); any factual error shipped in
  marketing (pull, correct publicly, post-mortem); any play that only works
  with a negative frame.
- **The one number:** weekly sessions from non-SEO sources. Everything above
  exists to move it while the SEO engine ramps; K-factor from share events
  becomes the second number once volume exists (ROADMAP E1).

---

## 7. Budget

| Item | Cost |
|---|---|
| Community, launches, outreach, PR, shorts, embeds | £0 |
| Laminated warm-up/pace cards (short run) | ~£30 |
| Sticker run (meets, laptops — optional) | ~£40 |
| Print kit | £0 (venues print) |
| Short-link/QR tooling | £0 (free tiers) |
| Contingency (one small paid print run if a venue asks) | ~£50 |
| **Quarter total** | **≤£150** |

The real budget is founder time: ~6 h/week, protected by the §5 structure and
the §6 kill rules so it cannot silently swallow build weeks.

---

## 8. Risks & mitigations

- **Community backlash / spam perception** — the biggest single risk to the
  moat. *Mitigation:* §0 hard rules, residency-before-promotion (P1), mod
  removal = kill signal, give:promote ratio logged on the scorecard.
- **A stunt lands wrong** (open letter read as attack). *Mitigation:* the ask
  is only "publish"; generous tone reviewed cold before posting; never claim
  competitor outputs are wrong; don't tag individuals.
- **Marketing outruns YMYL discipline** (newsjacking speed vs accuracy).
  *Mitigation:* P7's rule — no verified vectors, no calculator; explainer
  first, tool after.
- **Founder-time creep.** Ten simultaneous half-plays beat nothing at nothing.
  *Mitigation:* two resident communities/month, capped cadences, §6
  verdicts.
- **Bounty bad-faith swarm.** *Mitigation:* scope it (formulas and sources,
  not opinions), template the report, 48 h applies to confirmed errors.
- **Physical-placement liability** (fly-posting, event rules). *Mitigation:*
  §0.8 permission-only; venues print their own; parkrun/meets via
  organisers.
- **Platform dependence of any single channel.** *Mitigation:* the plays are
  deliberately spread (communities, launches, print, embeds, PR, short-form);
  the scorecard keeps no channel above ~40% of non-SEO sessions without a
  diversification note.
- **Vulnerable-audience exposure in glow-up marketing.** *Mitigation:*
  §0.6 binds shorts exactly as it binds pages; claims not creators; support
  signpost in every bio/landing.

---

## 9. Reconciliation

When Mat signs this off: `BUSINESS_PLAN.md` §8 gains a one-line pointer to
this doc as the tactical layer of Engines 2–3; the §5 weekly rhythm goes in
the calendar; the two ≤1-day builds (embed giveaway page, manifesto page) get
scheduled against the roadmap like any other work. Until then, nothing here
blocks or changes the build.
