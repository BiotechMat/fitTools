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
ephemeral. Everything durable — likes, saves, seen-set, share URLs, SEO
routes, analytics — keys on the stable **`chunkId`**. The in-memory cache
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
  *phrasings*, never *claims*). The initial corpus is harvested from the
  cold-water and sauna clusters and the ApoB/Lp(a) glossary entries, so it
  spans recovery / cardio / longevity / physiology; growing the other
  categories is the next authoring job.
- Chunks are **harvested from existing content** — the recovery clusters,
  glossary, supplement pages and METHODOLOGY tools are full of card-sized,
  already-sourced claims. Harvesting reuses vetted claims *and* creates natural
  `relatedContent` links back to the source article. Every new chunk must
  bring its own verified primary source (§2.1); no chunk is authored from
  memory.
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
- **Share payload (image card up front — locked §11).** v1 generates the
  flattering **OG-image card** — the branded 1200×630 + 1080×1920 story formats
  (DESIGN §6): espresso ground, the fact in branded type, source credited,
  FitTools watermark. This reuses/pulls forward the E1 image pipeline (a
  dependency to sequence — see §13). The per-chunk URL (`/pulse/<chunkId>`,
  server-rendered, crawlable — §8) is the link target and the copy-link /
  native share-sheet fallback path; it renders the vetted claim, so a shared
  page is deterministic even though feed phrasings vary.
- **Optimism + degradation.** Like/save update instantly and never block on
  storage; if `localStorage` is unavailable (private mode/quota) the action
  degrades to session-only, mirroring `history.ts`'s guarded wrapper — never a
  broken card.

---

## 5. Ordering — engagement-weighted, with anti-bubble guardrails

Chosen model: **weighted by engagement** (the most "social-media" feel). This is
the option with real failure modes (filter bubble, cold start, repeats), so the
guardrails below are part of the spec, not optional polish.

### 5.1 The signal (explicit + dwell — locked §11)

A lightweight, **local** per-category affinity score derived from:

- **Explicit** — likes, saves, `detail` expands, source clicks (positive);
- **Implicit** — dwell time per card and scroll-past (a card scrolled past fast
  with no interaction is a soft negative for its category).

Dwell was chosen in over explicit-only, so it carries a **privacy contract** to
keep it consistent with the site's no-surveillance posture (this is a hard
requirement, not a nicety):

1. **Local-only, never transmitted.** Dwell/scroll timing is computed on-device
   and collapsed *immediately* into the per-category affinity score. Raw
   per-card timings are **not** stored and **not** sent to analytics — no
   `pulse_card_dwell` event exists. What persists is only the aggregated
   affinity vector (§6), the same shape whether the signal came from a like or a
   dwell.
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

For a given draw, each not-recently-seen card gets a score roughly:

```
score = affinity(category) * w_aff
      + freshness(card)     * w_fresh     // newer cards & unseen categories lifted
      + randomJitter()      * w_rand      // keeps it lively, breaks ties
```

Then draw the next batch by weighted sampling (not strict top-N — sampling keeps
it non-deterministic and avoids a frozen "greatest hits").

### 5.3 The guardrails (mandatory)

1. **Diversity floor.** No more than *N* consecutive cards from one category
   (e.g. 2–3); every batch must include at least one card from outside the
   user's top affinities. The bubble cannot fully close.
2. **Novelty injection.** A fixed fraction of every batch (e.g. ~25–30%) is
   drawn *ignoring* affinity — pure freshness/random — so new topics keep
   surfacing.
3. **No-repeat window.** Track recently-seen `id`s (session + a rolling local
   set) and exclude them until the pool is exhausted, then reset. Refreshing the
   page must not replay the same opening cards (the "pure random each load"
   failure mode we explicitly rejected).
4. **Cold start.** With no history, ordering falls back to **seeded shuffle +
   freshness** — indistinguishable from a good default feed. Weighting only
   kicks in once there's signal, and only ever *tilts*, never *dominates*
   (`w_aff` capped so the floor/novelty rules always bind).
5. **No engagement dark patterns.** Weighting optimises *relevance*, not
   time-on-site at any cost. No infinite dwell traps, no variable-reward
   manipulation beyond honest novelty (ROADMAP §2 positive-psychology
   principle).

### 5.4 Testability

The ranking is a **pure function** `rank(cards, signal, seenSet, seed) →
ordered[]` in `src/lib/pulse/` (mirrors the pure-core/thin-wrapper split in
`history.ts`). Unit tests assert: diversity floor holds, novelty fraction holds,
no-repeat holds, and cold-start === seeded shuffle. Deterministic via injected
seed.

---

## 6. Persistence — local now, designed for sync

Chosen: **local now, shaped for later account sync** (ROADMAP E0). Extend the
existing local-first pattern rather than inventing a new one.

- New module `src/lib/pulse-store.ts` (or extend `history.ts`'s approach):
  guarded `localStorage` wrapper + node-testable pure core, same as
  `history.ts`. Keys namespaced `fittools.pulse.v1` (likes, saves, affinity,
  seen-set).
- **Sync-ready shape:** all state is a serialisable document keyed by stable
  card `id`s (not array indices), with a `version` field and tolerant parse —
  exactly like `HistoryFile`. When E0 accounts land, the same document can be
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
  **Deterministic per-day pick** from the bank (date-seeded, so every visitor
  sees the same daily fact and it's stable across a day's reloads — and so it can
  be pre-rendered and reused as the newsletter's unit-of-one, feeding E5). Fully
  shareable via the same OG-image card. Cheap: it's a selector over the existing
  bank, no new content type.
- **`<PulseCard />`** — espresso/paper card, ink border + hard shadow like the
  tool cards; category accent stripe or tag colour; Anton for any number-forward
  facts, Figtree body, Space Mono for the source label. `<EvidenceTier />` badge.
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
  Built in v1 (§11), so this shares the E1 image pipeline as a dependency.

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
  small "related facts" strip drawn from the bank by shared tag — Pulse
  pushes traffic *and* pulls it. (v1 may ship one direction; the schema supports
  both from day one.)
- Tags map onto existing hubs (nutrition/strength/recovery) so Pulse
  reinforces, not fragments, the site's taxonomy.

---

## 10. Analytics (SPEC §12 — typed events, consent-gated)

Extend the `AnalyticsEvent` union in `src/lib/analytics.ts` (helpers exist now;
GA4 fires post-consent). Proposed events:

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

**Still genuinely open (minor, decide during build):** exact `w_aff/w_fresh/
w_rand` weights and the diversity-floor/novelty-fraction constants (§5) — these
are tuning values to settle empirically against the seed bank, not architecture.

---

## 12. Out of scope (v1)

- Runtime/AI-generated facts (§1.1 — never).
- User-submitted facts / comments (moderation burden; revisit far later).
- Cross-user social graph, following, public profiles (beyond ROADMAP).
- Server-side personalisation or recommendation models (local-only signal by
  design, §5.1). No calc/recommendation API (CLAUDE.md / SPEC §17).
- Monetising Pulse (ad slots in-feed) — deferred to E6 like all monetisation;
  keep the surface clean while the loop forms.

---

## 13. Suggested build sequence (when scheduled)

1. **Bank + registry + validation** — `src/registry/pulse.ts`, types, cross-link
   + source validation, seed ~20 harvested cards, registry test.
2. **Card pages + hub index** (§8) — SEO-durable, crawlable, sitemap/JSON-LD.
   The feature has value even before the scroller exists.
3. **Pulse scroller + filter + tags + `<PulseDaily />`** (§7) — client discovery
   layer, zero-CLS.
4. **Local store: like/save + Saved view** (§6) — `src/lib/pulse-store.ts`, the
   retention actions.
5. **Engagement-weighted ordering + guardrails** (§5) — pure `rank()` in
   `src/lib/pulse/` + tests; explicit signal first, then wire the local
   dwell aggregator (§5.1) behind the privacy contract.
6. **Share — OG-image card up front** (§4, locked §11). This depends on the E1
   image pipeline; if E1 hasn't built it yet, this step includes standing that
   pipeline up. Copy-link/native-share to `/pulse/<id>` is the fallback path.
7. **Analytics wiring + reciprocal cross-links** (§9, §10) — remember: no dwell
   event.
8. Grow the bank to the v1 target and settle into the E5 content cadence.

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
