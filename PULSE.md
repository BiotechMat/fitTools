# PULSE.md — Pulse (endless-scroll fact cards)

Companion to `SPEC.md` (the build), `ROADMAP.md` (engagement sequencing),
`DESIGN.md` (visual identity + retention components) and `METHODOLOGY.md`
(evidence posture). This document specifies **Pulse**: an endless-scroll
wall of bite-sized, *cited* fact cards spanning fitness, recovery, nutrition,
sleep, physiology, supplements and longevity, each likeable, bookmarkable,
shareable and filterable by category. Product name **Pulse**; route `/pulse`.

**Status:** in build (2026-07-22, Mat's call — supersedes the earlier "not
ahead of its ROADMAP phase" hold). Corpus registry, grounded generation
pipeline, `/api/pulse`, ranking, local store and the core feed UI exist; saved
view, share image, per-chunk SEO pages and analytics wiring remain (§13).

**Extension "fresh cards" — F0 BUILT (2026-07-23):** recent-discovery
(news-feel) chunks interleaved into the feed with a "New" chip. Decisions in
§11.9–11.11; full spec in §15; as-built in §15.8. F0 is the schema + feed
surface + three verified fresh seed chunks; the ingestion pipeline (F1–F2) and
weekly digest (F3) remain.

**Decisions locked (see §11 for the record):** feed-native category superset ·
name *Pulse* / `/pulse` · OG-image share card built up front · a "fact of the
day" hero · engagement signal includes dwell (local-only, guardrailed per §5.1)
· runtime **grounded generation** over a vetted corpus (2026-07-22) ·
`chunkId` as the canonical card identity.

---

## 1. Strategic fit — why this belongs

Pulse is primarily **ROADMAP Phase E5** (novelty & content cadence): a
recurring reason to return that satisfies this audience's "know it first"
obsession, with a dash of **E3** (like/save as low-friction achievement) and
**E1** (a shared card is a viral on-ramp). It does three jobs:

1. **Return habit.** A bottomless, always-fresh surface is a reason to open the
   site with no goal in mind — the casual-visit complement to the
   goal-driven calculators.
2. **Internal-linking engine (the quiet strategic win).** Every card can point
   into a calculator or an article (`CONTENT-reference.md` §8 cross-linking is a
   build requirement, not optional). Pulse becomes a distribution layer that
   pushes SEO equity and traffic to the tools and content that monetise.
3. **Viral on-ramp.** A shared fact card reuses the E1 achievement-card
   infrastructure (OG image, watermark) to seed referral traffic.

### 1.1 The one contract that protects the moat

**Card copy is generated at runtime, but every claim and every citation is
human-vetted first.** The site's moat is credibility (ROADMAP §1;
METHODOLOGY's entire posture), so generation is *grounded*, never free:

- The unit of truth is a **grounding chunk**: a hand-vetted claim with a
  verified primary source, harvested from content already reviewed elsewhere
  in the repo — the same discipline METHODOLOGY applies to coefficients.
- The model's only job is to **rephrase a supplied chunk** into punchy card
  copy. It is structurally unable to fabricate a citation: it never emits a
  URL, it may only name a `chunkId` we supplied, and the server attaches that
  chunk's pre-vetted source. Drafts naming unknown chunks are dropped
  (`buildCardsFromDrafts`), and the prompt forbids adding facts, numbers or
  causal upgrades not present in the claim.
- Every served card therefore carries a **real source link** (no card exists
  without one), and with no API key configured the route **degrades** to
  serving the vetted claims verbatim — still real, still sourced.
- "Endless novelty" comes from **a growing corpus + smart ordering + fresh
  phrasings**, not from invented facts.

---

## 2. Non-negotiable guardrails

Pulse inherits every ROADMAP §2 guardrail and adds its own.

1. **Every card is sourced.** `source.url` is mandatory on every grounding
   chunk and is server-attached to every served card. A card with no verified
   primary source does not exist, and the model can never supply one (§1.1).
   Secondary/explainer sources are allowed only as a *supplement* to a primary
   one.
2. **Evidence honesty.** Claims are tiered with the existing `<EvidenceTier />`
   vocabulary (`preliminary` / `established` / `marketing-claim`, etc. — types
   reused from the peptides registry so the component renders unchanged). A
   card may debunk as readily as it asserts; "myth" cards are encouraged and
   on-brand.
3. **Positive frame.** No shame, no scare-copy, no body-negative framing
   (ROADMAP §2.1). Facts inform and delight; they don't moralise.
4. **No medical advice, no dosing-as-instruction.** Consistent with
   `CONTENT-peptides.md` (no dosing/protocols by design) and the tool
   disclaimers. A fact about a mechanism is fine; "take X mg of Y" is not.
5. **British English** in all card copy (CLAUDE.md).
6. **No new dependencies** without asking (CLAUDE.md). Pulse is buildable
   with the existing stack.
7. **Filter-bubble guardrails apply to ordering** — see §5.3. Engagement
   weighting must never let a user disappear into one category or re-see the
   same cards.

---

## 3. Content model

### 3.1 The corpus model (`GroundingChunk` → `PulseCard`)

Stored as **structured data** (JSON/TS registry — consistent with
`glossary.ts`, `recovery-content.ts`, `exercises.ts`). The registry is **not a
bank of finished cards**: it is the grounding corpus the generator rephrases,
and the single source of truth for claims, citations and cross-links. Types
live in `src/lib/pulse/types.ts`; the corpus in `src/registry/pulse.ts`.

```ts
// src/lib/pulse/types.ts (as built)
export type PulseCategory =
  | "training" | "nutrition" | "recovery" | "sleep" | "physiology"
  | "supplements" | "longevity" | "cardio" | "mind"; // feed-native superset (locked §11)

// EvidenceTier / EvidenceBasis are reused from the peptides registry so the
// existing <EvidenceTier /> component renders Pulse cards unchanged.

/** A vetted, sourced claim — grounding material, not final card copy. */
export interface GroundingChunk {
  id: string;                  // stable kebab-case — the ONLY thing the model may reference
  claim: string;               // the vetted factual claim, British English
  category: PulseCategory;
  tags: string[];
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  source: Source;              // REAL primary source — the anti-hallucination anchor
  relatedTool?: string;        // validated against the tool registry
  relatedContent?: string;     // validated to resolve
}

/** What the model returns. Note the ABSENCE of any source/url field. */
export interface GeneratedCardDraft {
  chunkId: string;             // must be one of the supplied chunk ids
  fact: string;                // rephrased, 1–2 sentences
  detail?: string;             // optional expand layer
}

/** A served card. `source` is always carried from the chunk, never the model. */
export interface PulseCard {
  id: string;                  // chunkId + content hash — ephemeral presentation id
  chunkId: string;             // the CANONICAL identity (saves, shares, SEO, analytics)
  fact: string;
  detail?: string;
  category: PulseCategory;
  tags: string[];
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  source: Source;
  relatedTool?: string;
  relatedContent?: string;
  generated: boolean;          // false when the vetted claim is served verbatim
}
```

**Identity rule (locked §11):** generated phrasings vary, so the card `id` is
ephemeral. Everything durable — likes, saves, the seen-set, analytics — keys
on the stable **`chunkId`** (share/SEO surfaces per §8). The in-memory cache
(`src/lib/pulse/cache.ts`, 30-min TTL, keyed by chunk) keeps phrasing stable
within a session and bounds LLM cost; a shared KV cache is a later swap behind
the same module surface.

### 3.2 Validation (build-time + runtime)

Following the existing registries' discipline, on the corpus:

- `id` unique across the corpus.
- `source.url` present and non-empty.
- `relatedTool` (if set) exists in the tool registry; `relatedContent` (if set)
  resolves to a real route. Broken cross-links fail the build, exactly as
  glossary/recovery cross-links do today.
- `tags` from a controlled vocabulary (avoids `sleep` vs `sleep-hygiene` drift).
- A unit test asserting the whole corpus type-checks and passes the above — the
  "test the registry" pattern already in the repo.

At runtime, the §1.1 contract is enforced in code, not prompt alone:
structured output constrains `chunkId` to the supplied enum; drafts referencing
unknown chunks are dropped; empty facts are dropped; any chunk the model skips
falls back to its vetted claim verbatim. Generation failures never throw — the
route degrades, it doesn't break.

### 3.3 Authoring & scale

- Seed corpus target for v1: **~60–100 chunks** across all categories (enough
  that the feed feels bottomless for a session — generation multiplies
  *phrasings*, never *claims*). The seed corpus is harvested from sources
  already vetted in the repo (cold-water + sauna clusters, ApoB/Lp(a)
  glossary) and currently spans recovery / cardio / longevity / physiology /
  training / mind (§14); nutrition, supplements and sleep are the thin
  categories to grow next.
- Chunks are **harvested from existing content** — the recovery clusters,
  glossary, supplement pages and METHODOLOGY tools are full of card-sized,
  already-sourced claims. Harvesting reuses vetted claims *and* creates natural
  `relatedContent` links back to the source article. Every new chunk must
  bring its own verified primary source (§2.1); no chunk is authored from
  memory. (§15 adds a second, PR-gated authorship path: *fresh* chunks
  drafted by the discovery pipeline from newly published research.)
- Long-term this is the E5 content cadence: a steady drip of new chunks *is*
  the "what's new" novelty the phase calls for.

---

## 4. Interactions

Each card supports four actions. Icons/placement per DESIGN §6 language.

| Action | Persistence | Purpose | Notes |
|---|---|---|---|
| **Like** ♥ | local (sync-ready) | cheap positive signal; feeds ordering weight | optimistic, instant, no network |
| **Bookmark/Save** ✚ | local (sync-ready) | the retention action — needs a home | powers a "Saved" view |
| **Share** ↗ | — | viral on-ramp | branded OG-image card built up front (DESIGN §6, ROADMAP E1) |
| **Source** ↗ | — | credibility | opens `source.url` in a new tab; always visible, never behind a tap |

Plus **filter**: a sticky category chip bar; **tags**: category-coloured, tap a
tag to filter to it.

- **Saved view.** A dedicated surface (`/pulse/saved` or a Pulse tab) listing
  bookmarked cards. This is where save earns its retention keep; without a home,
  save is a dead gesture.
- **Share payload (image card — locked §11, lands with E1).** The target share
  format is the flattering **OG-image card** — the branded 1200×630 +
  1080×1920 story formats (DESIGN §6): espresso ground, the fact in branded
  type, source credited, FitTools watermark. It depends on the E1 image
  pipeline; until that lands, share is the Web Share sheet / clipboard with
  the card's fact + source and a `/pulse` link (§8, §14). Once the daily page
  ships (§8), shares of the daily card deep-link to its stable
  `/pulse/<date>` URL.
- **Optimism + degradation.** Like/save update instantly and never block on
  storage; if `localStorage` is unavailable (private mode/quota) the action
  degrades to session-only, mirroring `history.ts`'s guarded wrapper — never a
  broken card.

---

## 5. Ordering — engagement-weighted, with anti-bubble guardrails

Chosen model: **weighted by engagement** (the most "social-media" feel). This is
the option with real failure modes (filter bubble, cold start, repeats), so the
guardrails below are part of the spec, not optional polish. Selection runs
**server-side** in the pure `selectChunks()` (`src/lib/pulse/rank.ts`): the
client sends its capped, category-level affinity vector with each batch
request and the server ranks statelessly — nothing is stored server-side
(§5.1.1a).

### 5.1 The signal (explicit + dwell — locked §11)

A lightweight, **local** per-category affinity score derived from:

- **Explicit** — likes, saves, `detail` expands, source clicks (positive);
- **Implicit** — dwell time per card and scroll-past (a card scrolled past fast
  with no interaction is a soft negative for its category).

Dwell was chosen in over explicit-only, so it carries a **privacy contract** to
keep it consistent with the site's no-surveillance posture (this is a hard
requirement, not a nicety):

1. **Raw signal is local-only, never transmitted.** Dwell/scroll timing is
   computed on-device and collapsed *immediately* into the per-category
   affinity score (`applyEngagement`, bounded steps, clamped [-1, 1]). Raw
   per-card timings are **not** stored and **not** sent to analytics — no
   `pulse_card_dwell` event exists. What persists is only the aggregated
   affinity vector (§6), the same shape whether the signal came from a like or
   a dwell.

   **1a. The aggregate crosses the wire, statelessly.** Because ranking runs
   server-side (§5.2), each batch request carries the affinity vector, the
   recent seen-set and any category filter — nine clamped numbers and opaque
   chunk ids, no identity, no cookies, no raw timings. The server uses them
   for that draw and stores nothing. This is the documented data-protection
   posture for `/api/pulse` (SPEC §2): no personal or health data is sent by
   the client or forwarded to the model — the model only ever sees the site's
   own vetted claims.
2. **No identity, no cross-user data, no profiling.** Purely the anonymous local
   user tuning their own shuffle.
3. **Consent-independent.** Because nothing leaves the device, dwell tracking
   does not depend on the analytics/consent gate — but it must still respect
   `prefers-reduced-motion`/reduced-data intent by degrading gracefully.
4. **Bounded influence.** Dwell feeds the *same* capped `w_aff` as explicit
   signal (§5.2–5.3); it can never override the diversity floor or novelty
   injection. A noisy implicit signal therefore can't collapse the feed.

Stored beside history (§6), sync-ready. If the aggregation proves noisy in
testing, the fallback is explicit-only — the ranking function is agnostic to
where the affinity vector came from.

### 5.2 The ranking

For a given draw, each not-recently-seen chunk gets a sampling weight (as
built in `rank.ts`):

```
weight = 1                                  // base — every chunk stays drawable
       + clamp(affinity[category]) * cap    // capped affinity tilt (default cap 0.6)
       + jitter                             // seeded random 0–0.25, keeps it lively
```

Then draw the batch by weighted sampling (not strict top-N — sampling keeps it
non-deterministic per seed and avoids a frozen "greatest hits"), with a
fraction of picks ignoring affinity entirely (novelty injection, §5.3.2).

### 5.3 The guardrails (mandatory)

1. **Diversity floor.** No more than `maxRun` consecutive cards from one
   category (default 2) while another category still has cards available. The
   bubble cannot fully close.
2. **Novelty injection.** A fixed fraction of picks (default 0.3) is drawn
   *ignoring* affinity — pure seeded random — so new topics keep surfacing.
3. **No-repeat window.** Track recently-seen `chunkId`s (a rolling local set,
   most recent 200) and exclude them until the pool is exhausted, then reset.
   Refreshing the page must not replay the same opening cards (the "pure
   random each load" failure mode we explicitly rejected).
4. **Cold start.** With no affinity the weight reduces to base + jitter — a
   seeded shuffle, indistinguishable from a good default feed. Weighting only
   ever *tilts*, never *dominates* (the cap keeps the floor and novelty rules
   binding).
5. **No engagement dark patterns.** Weighting optimises *relevance*, not
   time-on-site at any cost. No infinite dwell traps, no variable-reward
   manipulation beyond honest novelty (ROADMAP §2 positive-psychology
   principle).

### 5.4 Testability

The ranking is the **pure function** `selectChunks(pool, opts)` in
`src/lib/pulse/rank.ts` (mirrors the pure-core/thin-wrapper split in
`history.ts`), deterministic via an injected mulberry32 seed. Unit tests
(built — §14) assert: diversity floor holds, novelty fraction holds, no-repeat
holds, and cold-start behaves as a seeded shuffle. `buildCardsFromDrafts` —
the §1.1 enforcement point — is likewise pure and unit-tested.

---

## 6. Persistence — local now, designed for sync

Chosen: **local now, shaped for later account sync** (ROADMAP E0). Extend the
existing local-first pattern rather than inventing a new one.

- Module `src/lib/pulse-store.ts` (built): guarded `localStorage` wrapper +
  node-testable pure core, same as `history.ts`. One namespaced key
  `fittools.pulse.v1` holding a versioned `{ likes, saves, seen, affinity }`
  document, with a change event for `useSyncExternalStore`.
- **Sync-ready shape:** all state is a serialisable document keyed by stable
  `chunkId`s (not array indices or ephemeral card ids), with a `version` field
  and tolerant parse — exactly like `HistoryFile`. When E0 accounts land, the same document can be
  read/written server-side without changing callers (the SPEC §10 /
  `history.ts` promise: "swap to authed storage later without changing
  callers").
- **Merge strategy (documented now, built at E0):** on first login, union local
  + remote (likes/saves are monotonic sets; last-write-wins on affinity). No
  data loss for the anonymous user who later signs up.

---

## 7. UI & component inventory (DESIGN.md)

All tokens/type per DESIGN §1–§3; retention-card language per §6. Zero-CLS
(SPEC §13) — every card reserves its dimensions before content/media loads.

- **`<PulseDaily />`** *(fact of the day — locked §11)* — a single hero card
  pinned at the top of the feed and given headline treatment (larger, Anton-led).
  **Deterministic per-day pick** from the corpus (`dailyChunkIndex`, seeded by
  the server's UTC date, so every visitor sees the same daily fact and it's
  stable across a day's reloads — and so it can be pre-rendered and reused as
  the newsletter's unit-of-one, feeding E5). Fully shareable; the one Pulse
  artefact stable enough to earn its own crawlable page later (§8). Cheap:
  it's a selector over the existing corpus, no new content type.
- **`<PulseCard />`** — espresso/paper card, ink border + hard shadow like the
  tool cards; category accent stripe or tag colour; Anton for any number-forward
  facts, Figtree body, Space Mono for the source label. `<EvidenceTier />` badge;
  when `generated` is true the card carries a quiet "AI-phrased ·
  source-verified" note (honest about the phrasing, confident in the claim).
  Action row (like/save/share/source). Optional expand for `detail`. Reports
  view/dwell to the local signal aggregator (§5.1) — no network.
- **`<PulseFilterBar />`** — sticky category chips; multi-select; active state in
  Blaze; "clear" resets to all. Count of matching cards. Honours
  `prefers-reduced-motion` (no chip-motion theatre).
- **`<PulseTag />`** — small category-coloured pill, tappable → filters.
- **`<PulseScroller />`** — the endless list. `IntersectionObserver` sentinel
  loads the next batch **and** measures per-card visibility/dwell for the local
  signal (§5.1); **skeleton placeholders reserve height** (zero CLS). A visible
  "you're all caught up / shuffling more" state when the pool cycles.
- **Saved view** (`/pulse/saved`) — reuses `<PulseCard />` in a filtered list;
  warm empty state ("Nothing saved yet — tap ✚ on anything worth keeping") per
  DESIGN's warm-empty-state convention.
- **Share card** — the E1 OG/story image (DESIGN §6): espresso ground, the fact
  in the branded type, source credited, FitTools watermark. Wins/insights only.
  Locked as the target format (§11); ships with the E1 pipeline — until then
  share degrades to Web Share/clipboard (§4, §14).

### 7.1 Accessibility

- Cards are articles; actions are real `<button>`s with labels ("Like this
  fact", "Save", "Share", "Open source").
- Filter chips are toggle buttons with `aria-pressed`.
- Endless scroll has a keyboard-reachable "load more" fallback and an
  `aria-live` polite announcement when a batch loads (screen-reader users aren't
  stranded by scroll-only loading).
- Focus states: 2px ember outline (DESIGN §7). WCAG AA on every tag/accent fill.

---

## 8. SEO & rendering (endless scroll is a crawl risk)

Endless-scroll UIs are historically bad for crawlers; this must not silently
sink the internal-linking value that justifies the feature.

**Consequence of runtime generation (decided at build).** Because scroll cards
are *generated on the fly* (§1.1) they are ephemeral — there is no stable per-card
artefact to give its own crawlable page. So the SEO strategy is:

- **The grounding content is the durable SEO surface.** Every card links back to
  the vetted article/tool it was grounded in (`relatedContent` / `relatedTool`,
  §9). Pulse's SEO value is the *link equity it pushes into that content*, not
  crawlable pages of its own generated text.
- **The daily card is the one durable Pulse artefact.** `<PulseDaily />` is
  date-seeded and stable for a day, so it (and only it) can later graduate to a
  crawlable `/pulse/<date>` page + `Claim` JSON-LD + sitemap entry, and doubles
  as the newsletter unit (§7). *(Not built in v1 — the v1 daily is client-fetched
  like the scroll.)*
- **The hub** (`/pulse`) is a normal server-rendered, canonical page.
- If a bank of *finished* cards is ever reintroduced (reversing §1.1), per-card
  crawlable pages become possible again — but that is explicitly not the chosen
  model.

---

## 9. Cross-linking (build requirement, per CONTENT-reference §8)

- Cards → tools/content via `relatedTool` / `relatedContent` (validated).
- **Reciprocal surfacing:** relevant tool result pages and articles can render a
  small "related facts" strip drawn from the corpus by shared tag — Pulse
  pushes traffic *and* pulls it. (v1 may ship one direction; the schema supports
  both from day one.)
- Tags map onto existing hubs (nutrition/strength/recovery) so Pulse
  reinforces, not fragments, the site's taxonomy.

---

## 10. Analytics (SPEC §12 — typed events, consent-gated)

Extend the `AnalyticsEvent` union in `src/lib/analytics.ts` (helpers exist now;
GA4 fires post-consent). Events (wired — §14; `id` carries the `chunkId`):

```ts
| { name: "pulse_card_viewed"; params: { id: string; category: string } }  // sampled, not every card
| { name: "pulse_card_liked";  params: { id: string } }
| { name: "pulse_card_saved";  params: { id: string } }
| { name: "pulse_card_shared"; params: { id: string } }
| { name: "pulse_source_click"; params: { id: string } }
| { name: "pulse_filter_applied"; params: { categories: string } }
| { name: "pulse_related_click"; params: { id: string; target: string } }  // cross-link CTR
```

**Deliberately absent: no dwell event.** Per the §5.1 privacy contract, dwell
never becomes an analytics event — it is aggregated on-device into local
affinity and discarded. `pulse_card_viewed` is a coarse sampled impression, not
a timing signal.

**Success metrics** (ROADMAP §5 funnel): cards/session, save rate, share rate
(→ K), cross-link CTR (the internal-linking payoff), and Pulse-driven
returning-visitor %.

---

## 11. Decisions (resolved 2026-07-22)

Recorded so the rationale survives; changing any of these is a spec change.

1. **Category taxonomy → feed-native superset.** The wide list in §3.1
   (training, nutrition, recovery, sleep, physiology, supplements, longevity,
   cardio, mind), each mapped back to the three hubs for cross-linking. Chosen
   over mirroring the hubs because one-line facts span topics the three hubs
   don't cover cleanly (a sleep or longevity fact has nowhere honest to sit
   otherwise).
2. **Name → Pulse; route `/pulse`.** Distinctive, health-connoted, reads well as
   the share-card watermark. All routes/components/keys use `pulse`.
3. **Engagement signal → explicit + dwell.** Dwell/scroll-past included from v1
   (not the safer explicit-only default), *conditional on* the §5.1 privacy
   contract: local-only, aggregated immediately, never transmitted, no dwell
   analytics event, bounded influence. Explicit-only remains the documented
   fallback if dwell proves noisy.
4. **Share → OG-image card up front.** The branded 1200×630 + story image ships
   in v1 rather than as a fast-follow. **Consequence:** this pulls the E1
   image-rendering pipeline forward as a v1 dependency — sequence accordingly
   (§13). Higher viral quality from day one; slower first ship.
5. **Fact of the day → in.** `<PulseDaily />` hero (§7), date-seeded, doubling as
   the E5 newsletter unit-of-one.
6. **Runtime grounded generation → in (2026-07-22, Mat).** Supersedes the
   original "never runtime-generated" posture. Card *copy* is model-rephrased
   at request time; claims and citations remain hand-vetted corpus data,
   enforced structurally (§1.1, §3.2). Rationale: endless fresh phrasings from
   a compact corpus, with no way for the model to invent a fact or a source.
   Degraded mode (no key) serves claims verbatim, so the feature never depends
   on the API being up.
7. **Canonical identity → `chunkId`.** Generated card ids are phrasing-hashed
   and ephemeral; likes, saves, the seen-set and analytics key on the stable
   chunk id (§3.1). This is what keeps generation compatible with durable
   saves and sync.
8. **Ranking server-side, stateless.** `selectChunks` runs in the route; the
   client sends its capped affinity vector per request; the server stores
   nothing (§5.1.1a). Chosen so selection, caching and generation share one
   draw path.

**Resolved 2026-07-23 (fresh cards — §15):**

9. **Fresh-chunk trust gate → PR review.** The discovery pipeline may *draft*
   chunks; only a PR Mat merges *publishes* them. Human-vetted by construction
   (§1.1 stays literally true), zero new infrastructure, no admin surface
   needed pre-E0, and a retraction is a revert. Auto-publish — any path where
   pipeline output reaches the feed without a merged review — is out of scope
   (§12) and would be a §1.1 spec change.
10. **Discovery → allowlisted feeds + AI web search.** Structured sources are
    the backbone (PubMed E-utilities, journal/EurekAlert RSS, medRxiv–bioRxiv
    API); Claude web search is a secondary channel for big stories the feeds
    miss, and any result not resolving to an allowlisted domain is dropped.
    Chosen over search-only (noisy input) and over runtime per-request search
    (rejected outright — §15 intro).
11. **Placement → interleaved with a "New" chip.** Freshness is a
    cross-cutting chunk attribute (`kind: "fresh"`), NOT a tenth category — a
    new creatine trial is still `supplements`. Capped freshness boost +
    reserved slots in the existing feed; no separate route in v1 (the weekly
    digest page is the later F3 artefact, §15.7).

**Still genuinely open (minor, decide during build):** the tuning constants —
affinity cap (0.6), novelty fraction (0.3), `maxRun` (2), cache TTL (30 min),
engagement steps (§6) — to settle empirically against the grown corpus; and
the generation model (default Opus 4.8; consider Haiku 4.5 for this
high-volume, low-complexity workload — §14).

---

## 12. Out of scope (v1)

- **Ungrounded generation — never.** The model may rephrase vetted claims
  (§1.1); it may not originate facts, statistics or sources. Any change that
  lets model output reach the feed without a vetted chunk behind it is a spec
  change to §1.1, not an implementation detail.
- **Unreviewed pipeline output — never.** §15's discovery pipeline may draft
  fresh chunks, but nothing enters the corpus without a merged PR (§11.9).
  Removing that gate is a §1.1 spec change, not a pipeline optimisation.
- User-submitted facts / comments (moderation burden; revisit far later).
- Cross-user social graph, following, public profiles (beyond ROADMAP).
- Stored server-side personalisation: no profiles, no server-kept affinity, no
  request logging for recommendation. Ranking is stateless per-request
  (§5.1.1a); the durable signal lives on-device until E0 sync.
- Monetising Pulse (ad slots in-feed) — deferred to E6 like all monetisation;
  keep the surface clean while the loop forms.

---

## 13. Remaining work (as-built state in §14)

The v1 vertical slice is built (§14). Still to do, in suggested order:

1. **Saved view** (`/pulse/saved`, §4/§7) — the store already supports it.
2. **Corpus growth** to the ~60–100 chunk v1 target (§3.3) — nutrition,
   supplements and sleep are the thin categories.
3. **Daily `/pulse/<date>` page** + JSON-LD + sitemap entry (§8) — the durable
   SEO/share artefact; unlocks deep-linked daily shares.
4. **Share — OG-image card** (§4, locked §11) — with/after the E1 image
   pipeline; also unlocks achievement-card reuse everywhere else.
5. **Reciprocal "related facts" strips** on tool/article pages (§9).
6. **Tuning pass** on the §11 constants against the grown corpus.
7. **Fresh cards** (§15) — the recent-discovery extension, in its own build
   order: F0 schema/feed → F1 harvest session → F2 scheduled automation →
   F3 weekly digest (§15.7).

---

## 14. Implementation status (v1 built — 2026-07-22)

A working retrieval-grounded vertical slice is built and verified (typecheck +
21 unit tests + browser run). What exists:

- **Grounding corpus** — `src/registry/pulse.ts`: seed chunks, each citing a
  source already vetted elsewhere in the repo (cold-water + sauna clusters,
  ApoB/Lp(a) glossary). `validateCorpus()` is unit-tested. Coverage is currently
  recovery / cardio / longevity / physiology / training / mind; growing the other
  categories is the E5 cadence and each new chunk must bring its own source.
- **Types** — `src/lib/pulse/types.ts` (reuses the peptides `EvidenceTier`
  vocabulary so the existing `<EvidenceTier />` renders cards).
- **Selection/ordering** — `src/lib/pulse/rank.ts`: pure, seeded `selectChunks`
  with the §5.3 guardrails (diversity floor, novelty injection, no-repeat,
  cold-start) + `dailyChunkIndex`. Unit-tested.
- **Generator** — `src/lib/pulse/generator.ts`: provider-abstracted; the Claude
  impl calls the Messages API over **`fetch`** (no new dependency — CLAUDE.md),
  structured output, and the **chunkId-only anti-hallucination contract** (§2.1):
  `buildCardsFromDrafts` drops any draft whose `chunkId` we didn't supply and
  attaches the real source server-side. Unit-tested.
- **API** — `src/app/api/pulse/route.ts` (POST): selection → cache → single
  batched generation → **vetted-claim fallback**, so the feature works with **no
  API key** (serves claims verbatim, `degraded: true`) and upgrades to generated
  phrasings when a key is set. In-memory TTL cache (`cache.ts`) bounds cost.
- **Local store** — `src/lib/pulse-store.ts`: likes/saves/seen/affinity, guarded
  + `useSyncExternalStore`-friendly, sync-ready. The dwell privacy contract
  (§5.1) is enforced — `applyEngagement` folds dwell into affinity; raw timings
  are never stored. Unit-tested.
- **UI** — `PulseCard` / `PulseFilterBar` / `PulseScroller` (keyed `PulseFeed`
  with IntersectionObserver infinite scroll + per-card dwell) / `PulseDaily`, and
  the `/pulse` page. Zero-CLS skeletons; a11y (aria-pressed chips, labelled
  actions, load-more fallback).
- **Analytics** — Pulse events added to the typed union; **no dwell event**.

**Configuration (env):** `ANTHROPIC_API_KEY` (or `PULSE_LLM_API_KEY`) enables
generation; `PULSE_LLM_MODEL` overrides the model (default `claude-opus-4-8` —
consider `claude-haiku-4-5` for this high-volume, low-complexity workload);
`PULSE_LLM_PROVIDER=none` forces degraded mode. No key set → the site serves
vetted claims and never breaks.

### ⚠️ PRODUCTION TODO — revisit after launch (2026-07-23)

Pulse is merged to `main` and deployed, but **runs in degraded mode in
production until an API key is set** (deliberate — deferred by Mat). To switch
generation on:

- [ ] **Set `ANTHROPIC_API_KEY`** in the Vercel project env (Production scope),
      then redeploy. *(Credential/settings step — must be done in the Vercel
      dashboard; cannot be done from the repo.)*
- [ ] *(Recommended)* **Set `PULSE_LLM_MODEL=claude-haiku-4-5`** — far cheaper
      and faster than the Opus default for this high-volume rephrasing workload.
- [ ] Separately (SEO, not Pulse-specific): **`NEXT_PUBLIC_SITE_URL`** is still
      unset, so the whole site — Pulse included — is `noindex`. Set it when
      ready for search engines to index `/pulse`.

**What flips the moment `ANTHROPIC_API_KEY` is live** (no code change, no
redeploy beyond picking up the env var):

- `getGenerator()` returns the Claude generator instead of the null one, so the
  API stops returning `degraded: true` and the yellow "showing source-verified
  facts directly" banner disappears.
- Cards become **LLM-generated rephrasings** of the vetted claims (varied,
  punchy) instead of the raw claim text; `card.generated` flips `false → true`,
  and the same chunk yields different wording over time (the endless-novelty
  feel). The 30-min per-chunk cache keeps phrasing stable within a session and
  bounds cost.
- **Credibility is unchanged**: every card still carries the same real,
  pre-vetted source — the `chunkId → source` mapping is untouched; only the
  wording is generated. The chunkId-only anti-hallucination contract (§1.1)
  still holds, and any failed/invalid generation still falls back per-card to
  the vetted claim.
- Cost/latency appears: one Messages API call per cache-miss batch (and for the
  daily hero). This is why Haiku is recommended above.

**Deliberately deferred (flagged to Mat):**
- **Branded OG-image share card** (§4, locked §11) depends on the E1 image
  pipeline, which doesn't exist yet. v1 ships functional share (Web Share /
  clipboard of the fact + `/pulse` link); the image card is the E1 follow-on.
- **Saved view** (`/pulse/saved`, §4/§7) — store supports it; page not built.
- **Reciprocal "related facts" strips** on tool/article pages (§9) — schema
  supports it; not wired.
- **Daily `/pulse/<date>` SEO page + JSON-LD + sitemap** (§8) — daily is
  client-fetched in v1.
- **`@anthropic-ai/sdk`** — using `fetch` to avoid a dependency-approval gate;
  swapping to the SDK is a small change if desired.

---

## 15. Fresh cards — the recent-discovery extension (specced 2026-07-23; not built)

Extends Pulse with news-feel cards about **newly published research** ("fresh"
chunks). Decisions locked with Mat 2026-07-23 (§11.9–11.11). The design
principle: **the runtime does not change** — no live web search in
`/api/pulse`, no per-request news fetch. What becomes dynamic is the
**corpus**: a discovery pipeline drafts new grounding chunks from recent
studies and lands them through a PR gate. The feed then *feels* like a
dynamically generated news feed because new chunks keep arriving and the
existing generator keeps rephrasing them — while the §1.1 contract (every
claim and citation human-vetted before serving) stays literally true. This is
the ROADMAP E5 "content cadence", partially automated.

**Runtime web search — rejected.** Live search returns *real* URLs but not
*vetted* sources (the moat is vetted — §1.1): open-web results happily include
tabloid health headlines and supplement-brand press releases. It would also add
per-request cost/latency, break the stable `chunkId` identity that
likes/saves/seen key on, give every user a different unreviewed feed, and make
arbitrary web content a prompt-injection surface feeding served copy. Rejecting
it is a consequence of §1.1, not a new rule.

### 15.1 Trust model (locked §11.9)

The pipeline may **draft**; only a **merged PR publishes**. Drafted chunks
arrive as a PR against the registry; Mat reviews claim, tier, caveat and
source before merge. Consequences: human-vetted by construction, zero new
infrastructure (no KV, no admin auth pre-E0), retractions are a revert, and
publish latency is merge + deploy — acceptable because the cadence is
weekly-ish (§15.7), which is honest for this domain: studies don't break
hourly, and "fresh this week" framing beats fake urgency.

### 15.2 Discovery (locked §11.10 — feeds + AI web search)

- **Backbone — allowlisted structured sources:** PubMed E-utilities (free JSON
  API; one saved query per Pulse category), journal / EurekAlert RSS, and the
  medRxiv–bioRxiv API (preprints, always labelled as such in `study.design`).
  Deterministic, free, and buildable with `fetch` — no new dependency for the
  JSON paths; ask before adding any RSS/XML parsing dependency (CLAUDE.md).
- **Secondary — Claude web search** (the API's web-search tool) to catch big
  stories the feeds miss (conference findings, major reviews). Any result
  whose final URL does not resolve to an **allowlisted domain is dropped**.
  The allowlist lives in the pipeline config; changing it is itself a
  reviewed change.
- **Press releases are leads, not sources.** An EurekAlert item must be traced
  to the paper it describes; the chunk cites the paper (primary), the release
  at most as a secondary explainer (§2.1).
- **Dedupe before drafting** by DOI/URL against the entire corpus, so the same
  study covered by five outlets yields one chunk.

### 15.3 Drafting rules (the AI step)

- Model: Haiku-class (`PULSE_NEWS_MODEL`, default `claude-haiku-4-5`), same
  key infra as generation (`ANTHROPIC_API_KEY`). Two passes: **triage**
  (audience-fit score over discovered items) then **draft** for the keepers.
- A draft supplies: `claim` (British English), `category`/`tags` (controlled
  vocabulary), proposed `tier` — **defaulting to `preliminary`**; a fresh
  single study ships as anything stronger only if the reviewer upgrades it —
  and the mandatory `caveat` (§15.4).
- **Citations are captured mechanically** from feed/search metadata (title,
  journal, year, URL, DOI) by code. The model never emits a URL — the same
  structural anti-hallucination contract as runtime generation (§1.1).
- **The reality-check voice is the product.** Every health-news aggregator
  amplifies hype; Pulse's fresh cards lead with the finding *and* always show
  what it actually is — "one RCT, n = 43, untrained men", "in mice",
  "correlational", "industry-funded". Evidence discipline as voice, matching
  the Myth-or-Fact / debunk posture.

### 15.4 Data model

Freshness is **cross-cutting, not a tenth category** (locked §11.11).
`GroundingChunk` gains:

```ts
kind?: "evergreen" | "fresh";  // absent → evergreen (back-compatible)
addedAt?: string;              // ISO date the chunk entered the corpus
study?: {                      // fresh chunks: what the evidence actually is
  doi?: string;
  journal?: string;
  design?: string;             // "RCT", "cohort", "meta-analysis", "preprint"…
  n?: number;
  population?: string;         // "untrained men", "mice"…
};
caveat?: string;               // REQUIRED when kind === "fresh" — the honesty line
```

`validateCorpus` additions: `caveat` and `addedAt` required when
`kind === "fresh"`; `study.doi` unique across the corpus; preprints must say so
in `study.design`.

### 15.5 Feed integration (locked §11.11 — interleaved + "New" chip)

- **Ranking:** `selectChunks` (rank.ts) gains a freshness term — a boost
  decaying from `addedAt` (half-life ≈ 7 days, zero by ~30) — **capped like
  affinity**, so the §5.3 diversity floor and novelty injection still bind;
  plus up to 2 reserved fresh picks per batch while unseen fresh chunks exist.
  Constants join the §11 "settle empirically" list.
- **UI:** a "New · x days ago" badge; the `caveat` line always visible (never
  behind the expand); the existing `<EvidenceTier />` badge does the rest.
  `PulseFilterBar` gains a **"New" chip** filtering `kind === "fresh"` across
  categories.
- **Daily hero:** may feature a fresh chunk via a deterministic rule (e.g.
  when any chunk is < 7 days old, `dailyChunkIndex` draws over the fresh
  subset) — still stable per UTC day for every visitor.
- **Cross-links unchanged:** a fresh creatine trial still sets
  `relatedTool`/`relatedContent`, so news feeds the internal-linking engine
  too (§9).

### 15.6 Lifecycle

- The freshness boost decays to zero; at each harvest PR, aged fresh chunks
  are either **graduated** to evergreen (tier upgraded only with corroborating
  sources — normal §2 vetting) or **pruned** in the same PR.
- **Retraction or correction → remove the chunk** (a revert). Because saves
  key on `chunkId`, the saved view must tolerate a chunk that no longer
  exists (small UI requirement; applies to any pruned chunk).

### 15.7 Ops, cost & build order

- **F0 — schema + feed surface. ✅ BUILT (2026-07-23, §15.8).** The §15.4
  fields + validation, the ranking boost, the "New" chip and card badge,
  seeded with a handful of hand-authored fresh chunks. Proves the loop with no
  pipeline at all.
- **F1 — harvest as a session.** A repeatable, Mat-initiated Claude Code
  harvest run (feeds + web search → triage → draft → PR). No standing
  infrastructure; PRs remain ask-first (CLAUDE.md workflow).
- **F2 — scheduled automation.** A weekly GitHub Action running the same
  script (needs a repo token — ask first).
- **F3 — the weekly digest.** "This week in the science": a crawlable page
  built from the week's fresh chunks, doubling as the E5 newsletter unit.
  Unlike generated phrasings, fresh chunks are **stable artefacts**, so this
  becomes the durable Pulse SEO surface §8 currently lacks.
- **Cost bound:** triage ≤ ~50 items/run, ≤ ~6 drafts per PR; Haiku-class →
  pennies per run. Per-request runtime cost is untouched (the request path
  doesn't change).

### 15.8 F0 implementation status (BUILT — 2026-07-23)

The schema + feed surface is built and unit-tested (37 Pulse tests, all 470
repo tests green; typecheck clean for the Pulse files). No pipeline yet — the
fresh seeds are hand-authored, proving the loop end-to-end. What exists:

- **Types** — `src/lib/pulse/types.ts`: `PulseChunkKind`, `PulseStudy`, and the
  `kind` / `addedAt` / `study` / `caveat` fields on both `GroundingChunk` and
  `PulseCard` (optional → fully back-compatible with evergreen chunks).
- **Corpus + validation** — `src/registry/pulse.ts`: three verified fresh seed
  chunks (creatine timing pilot RCT · creatine-in-postmenopausal-women
  meta-analysis · multi-ingredient-protein-in-women meta-analysis), each read
  from its PubMed record (the §15.2 backbone), extending coverage into the thin
  supplements + nutrition categories. `validateCorpus` now enforces the §15.4
  fresh invariants: caveat + well-formed `addedAt` required when `kind==="fresh"`,
  DOIs unique across the corpus, preprints must be labelled in `study.design`,
  and caveat/study may not be set on a non-fresh chunk.
- **Ranking** — `src/lib/pulse/rank.ts`: a capped, decaying freshness tilt
  (half-life `freshHalfLifeDays`=7, cap `freshnessCap`=0.6, → ~0 by 30 days),
  applied to *everyone* (editorial recency, so NOT gated by novelty injection);
  a `freshReserve` (default 2) that guarantees fresh picks per batch only at the
  tail, so it never front-loads or breaks the diversity floor; and `freshOnly`
  for the "New" chip (strict — empty pool → honest empty state). Evergreen-only
  pools are provably unchanged (back-compat test).
- **API** — `src/app/api/pulse/route.ts`: parses `freshOnly`; the daily hero
  prefers a fresh chunk added within `DAILY_FRESH_WINDOW_DAYS` (7), still
  date-seeded and identical for every visitor.
- **UI** — `PulseCard` renders a matcha "New · Nd ago" badge and an
  always-visible "What it shows:" caveat line with compact study meta (design ·
  n · population · journal); hero fresh cards read "Discovery of the day".
  `PulseFilterBar` gains a "New" chip (coexists with category filters).
  `PulseScroller` threads `freshOnly` through state, the remount key and the
  request, with a fresh-specific empty state. `--color-fresh` (matcha) is used
  as border/dot only — never small-text fill — to stay AA (DESIGN §1 note).
- **Constants to tune** (join the §11 list): `freshnessCap`, `freshHalfLifeDays`,
  `freshReserve`, `DAILY_FRESH_WINDOW_DAYS`.

**Not verified in-browser at build time:** a concurrent session had an
unfinished edit to `src/app/share/page.tsx` (an unclosed `<HoloTilt>` tag) that
breaks `pnpm build` / full `pnpm typecheck` repo-wide; left untouched. The
Pulse changes are covered by unit tests; the visual pass is pending a clean
tree.
