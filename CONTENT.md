# CONTENT.md — Recovery & Wellness Content

Companion to `SPEC.md`, `METHODOLOGY.md`, `ROADMAP.md`, `BUSINESS_PLAN.md`. This
defines the recovery/wellness **content** section: informational pages that rank,
build authority, and carry affiliate and own-product monetisation — without
diluting the site's evidence-based credibility.

Recovery/wellness content is strategically distinct from the calculators: these
are high-commercial-intent topics researched *before a significant purchase*
(a sauna or plunge tub is a serious buy), and they hold attention for minutes —
lifting ad viewability and click-through in ways the tools structurally can't.

**Status (2026-07-22): IMPLEMENTED — both launch clusters (§3.1, §3.2).**
Routes: pillars at `/recovery/<cluster>`, satellites at
`/recovery/<cluster>/<article>`, driven by the single-source registry
`src/registry/recovery-content.ts`. Cold water immersion (pillar + `ice-bath-
benefits` authority + `best-cold-plunge-tubs` commercial) and sauna therapy
(pillar + `sauna-benefits` authority + `best-home-saunas` commercial) are live,
evidence-tiered, safety-boxed, disclosed on commercial pages, and surfaced from
the recovery hub and sitemap. Commercial pages are deliberately neutral
selection-criteria guides that name no specific products, so no Product/Review
schema is emitted (nothing to review); they defer all health claims to the
evidence-tiered pillar. Covered by `tests/e2e/recovery-content.spec.ts`.

---

## 1. Non-negotiable principles

1. **Evidence-tiering is the house style.** Every health claim is graded by
   strength of evidence on the **medal ladder** — **Gold** (strong human
   evidence) / **Silver** (some human evidence) / **Bronze** (early or
   animal-only) for genuine evidence, with **Unproven** (oversold) and
   **Not supported** (contradicted) earning no medal — always with citations.
   (The medal is a presentation grade derived from the stored evidence
   tier + basis; the internal ids — `well-supported` / `preliminary` /
   `marketing-claim` / `not-supported` — are unchanged. See DESIGN §3.) This is the differentiator: the wellness industry
   overclaims, and honest separation out-ranks (Google's YMYL scrutiny rewards it)
   and out-converts (readers trust it enough to buy on your recommendation).
2. **Own-product conflict is managed explicitly.** Where we sell our own product,
   the evidence assessment stays scrupulously honest *even where inconvenient*.
   Keep neutral "what does the evidence say" pages structurally separate from
   commercial "what we sell / recommend" pages so the authority layer stays clean
   (see §4). The credibility that makes the site work is worth more than any single
   sale.
3. **Disclosure everywhere.** Affiliate and own-product relationships disclosed on
   every commercial page — ASA/CMA expectations for UK readers, FTC for US.
   (Reuse the `AffiliateBlock` disclosure component from `SPEC.md` §10.)
4. **Safety box is mandatory** on every physiological-intervention page (§5).
   Cold immersion carries cardiac and cold-shock risk; sauna has contraindications.
   This is both responsible and another trust signal Google looks for.
5. **No medical advice / claims discipline.** Educational framing; no treatment or
   cure claims; no promising specific health outcomes from a product.

---

## 2. Section architecture

New hub: `/recovery/` (or extend the existing recovery hub from `SPEC.md`). Each
**topic** is a small cluster, not a single page:

- **1 pillar page** — targets the broad head term, ranks as the cluster anchor,
  links to all satellites.
- **Several satellite pages** — target specific, high-intent long-tail searches.
  Informational satellites build authority; buying-intent satellites carry the
  monetisation.
- **Internal linking:** pillar ⇄ every satellite, and lateral links between
  related satellites. The informational pages are what make the commercial pages
  rank.

Content lives in MDX alongside the tool editorial (`SPEC.md` §4). Schema:
`Article`, `FAQPage`, `BreadcrumbList`, plus `Product`/`Review` schema on
buying-intent pages.

---

## 3. Launch clusters

### 3.1 Cold water immersion
**Pillar:** `/recovery/cold-water-immersion/` — "Cold water immersion: benefits,
evidence, and how to start."

**Satellites:**
| Page | Target intent | Type |
|---|---|---|
| Ice bath benefits (what the evidence says) | informational | authority |
| Cold plunge vs cold shower | comparison | authority + light commercial |
| How cold, how long, how often (protocols) | informational | authority |
| Contrast therapy (hot/cold) | informational | authority |
| Cold plunge and recovery / DOMS | informational | authority |
| **Best cold plunge tubs [year]** | buying intent | **commercial** |
| Cold plunge cost / DIY vs bought | buying intent | **commercial** |

**Evidence-tiering starting points (verify + cite at build):** cardiovascular/
metabolic and mood signals — promising but preliminary; acute recovery/DOMS —
mixed evidence and may blunt hypertrophy adaptations if used right after strength
training (an honest nuance most competitors omit); many performance claims —
marketing. Do NOT overstate.

### 3.2 Sauna / heat therapy
**Pillar:** `/recovery/sauna-therapy/` — "Sauna therapy: benefits, evidence, and
how to use it."

**Satellites:**
| Page | Target intent | Type |
|---|---|---|
| Sauna benefits (what the evidence says) | informational | authority |
| Infrared vs traditional sauna | comparison | authority + light commercial |
| How often / how long / temperature | informational | authority |
| Sauna and cardiovascular health | informational | authority |
| Sauna after workout / recovery | informational | authority |
| **Best home saunas [year]** | buying intent | **commercial** |
| Infrared sauna cost / blanket vs cabin | buying intent | **commercial** |

**Evidence-tiering starting points (verify + cite at build):** regular sauna use
and cardiovascular outcomes / all-cause mortality associations — among the better-
supported (observational, note causation limits); recovery and relaxation —
reasonable; detox and weight-loss claims — marketing. Traditional vs infrared
evidence differs — don't transfer traditional-sauna findings onto infrared
uncritically.

### 3.3 Future clusters (same pattern)
Compression therapy/boots · massage guns/percussion · red light therapy · sleep
environment (cooling, light) · breathwork · foam rolling/mobility. Prioritise by
search demand + affiliate/product value; build the two above first.

---

## 4. Page templates

### 4.1 Informational (authority) page
H1 + one-line summary → **evidence-tiered benefits** (each claim labelled + cited)
→ how to do it / protocols → **safety box (§5)** → who it's best/least suited for →
FAQ → related pages → author box (credentials, last-reviewed date). Ad slots per
`SPEC.md` §10. Light, contextual product mentions allowed but this page's job is
trust, not selling.

### 4.2 Buying-intent (commercial) page
H1 → short intro → **honest selection criteria** (what actually matters when
buying) → options/recommendations (affiliate and/or own product, clearly
disclosed) → price/value guidance → **safety box (§5)** → FAQ → link back to the
informational pillar for the evidence. `Product`/`Review` schema. Disclosure
block mandatory.

**Own-product placement rule:** if our product appears alongside alternatives,
present the selection criteria neutrally and let our product meet them honestly —
don't rig the criteria around it. If it genuinely isn't the best fit for a use
case, say so; credibility banked there pays back across the whole site.

---

## 5. Safety box (required component)

A visually distinct box on every physiological-intervention page:

- Who should be cautious or avoid it (e.g. cold immersion: heart conditions,
  uncontrolled blood pressure, pregnancy, never alone/after alcohol; sauna:
  pregnancy, certain cardiovascular conditions, alcohol, dehydration).
- The specific acute risks (cold-shock response and cardiac stress for cold;
  overheating/dehydration/fainting for heat).
- "Consult a doctor before starting if you have any medical condition or are
  pregnant."

Build as a reusable `SafetyCallout` component so it's consistent and can't be
forgotten.

---

## 6. Monetisation mapping

- **Affiliate:** tubs, saunas, chillers, infrared blankets, accessories on
  buying-intent pages; direct brand programmes over generic marketplaces where
  available (higher rates).
- **Own product:** where applicable, on commercial pages per §4.2 rules, kept
  separate from the neutral evidence pages.
- **Display ads:** standard slots on all pages (`SPEC.md` §10); recovery content's
  longer dwell time improves viewability vs tool pages.
- **Email:** recovery guides make good lead magnets (e.g. a protocol cheat-sheet)
  feeding the newsletter (`ROADMAP.md` E5).

**Build status (2026-07-23):** the affiliate placement layer is built — every
cluster pillar and buying-guide page renders the shared "Our recommendation"
card (`src/components/RecommendationCard.tsx`) from the surface-keyed registry
`src/registry/affiliates.ts` (disclosure line, `rel="sponsored nofollow"` and
`affiliate_click` events built in). Product-type picks are seeded per cluster
and render as editorial content now; the "View at" button and disclosure appear
per pick once its affiliate URL is pasted into the registry entry, so
monetising a placement is a one-line edit per product. `Product`/`Review`
schema (§4.2) is still owed once specific partner products are named.

---

## 7. Definition of done (per page)
- [ ] Every health claim evidence-tiered and cited (primary sources where possible).
- [ ] Safety box present on intervention pages.
- [ ] Disclosure block on any page with affiliate/own-product links.
- [ ] Correct schema (Article/FAQ; Product/Review on commercial pages).
- [ ] Author box + last-reviewed date.
- [ ] Internal links: pillar ⇄ satellites wired.
- [ ] Own-product pages: selection criteria neutral, product meets them honestly.
