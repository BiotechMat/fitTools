# CONTENT-reference.md — Reference & Lookup Content

Companion to `SPEC.md`, `CONTENT.md`, `CONTENT-peptides.md`. Defines the
**reference/lookup** content layer: pages people search, bookmark and return to
*without doing a calculation*. Content-only — no accounts, no stored data.

**Why this layer:** it ranks (high-volume evergreen search), it gets bookmarked
(return visits with no login), and — the strategic core — it is an
**internal-linking engine**: reference pages link into the calculators and the
calculators link back out, spreading link equity and lifting the whole site's SEO.
It reuses the site's evidence-tiering house style, so it deepens authority rather
than diluting it.

These pages use a **reference template** (no interactive tool above the fold) but
keep the same discipline as the tools: citations, evidence-tiering where claims are
involved, author box, last-reviewed date. No new engineering — this is the
`CONTENT.md` pattern extended to reference content.

---

## 1. Non-negotiable principles

1. **Same evidence honesty.** Any health/performance claim is tiered
   **Well-supported / Preliminary / Unproven**, cited, with human vs animal
   vs in-vitro flagged. This is the differentiator versus the vendor-fluff that
   dominates these searches.
2. **Cross-linking is a first-class requirement, not an afterthought.** Every
   reference page links to the relevant calculator(s); every relevant calculator
   links to the relevant reference page(s). This is the main SEO payoff — build it
   in, don't bolt it on. (See §8.)
3. **Separation of neutral vs commercial.** Where affiliate/own-product links
   appear (e.g. well-supported supplements), keep the evidence assessment honest
   and disclose clearly (`CONTENT.md` §1–4). Neutral reference pages stay clean.
4. **Not medical advice.** Standard medical disclaimer; `SafetyCallout` where a
   topic carries risk.
5. **British English**, consistent with the rest of the site.

---

## 2. Section architecture

Five reference sections, each a hub of pages:

| Section | Route | Priority |
|---|---|---|
| Exercise library | `/exercises/` | **Build first** |
| Supplement database | `/supplements/` | **Build first** |
| Nutrition / food reference | `/nutrition/reference/` (or `/foods/`) | Second |
| Glossary / explainers | `/glossary/` | Layer alongside (cheap, high-leverage) |
| Reference tables & charts | `/reference/` | Second |

Schema: `Article` + `FAQPage` + `BreadcrumbList` throughout; `HowTo` on exercise
pages where appropriate; `Product`/`Review` only on commercial supplement sections.

---

## 3. Exercise library (`/exercises/`) — flagship

**Why:** highest evergreen volume ("how to Romanian deadlift", "X alternatives"),
tightest fit with the strength tools, and the natural home for "which exercise
instead of X" intent no calculator serves.

**Structure:** a page per exercise, grouped by muscle/movement pattern hubs
(e.g. `/exercises/legs/`, `/exercises/push/`). Hub pages list and interlink their
exercises.

**Per-exercise page template:**
1. **What it is** — the lift in one line + movement pattern.
2. **Primary & secondary muscles worked.**
3. **How to perform it** — clear step-by-step (`HowTo` schema).
4. **Common form faults** — and how to fix each (high-value, high-search).
5. **Variations & substitutions** — link to related exercises (internal links).
6. **Programming notes** — rep ranges / where it fits — and **link to the
   relevant calculators** (1RM, training volume, warm-up, plate).
7. FAQ · related exercises · author box · last-reviewed.

**First batch (highest volume, compound-first):** back squat, front squat, romanian
deadlift, conventional deadlift, bench press, incline bench, overhead press,
barbell row, pull-up, lat pulldown, hip thrust, Bulgarian split squat, dumbbell
curl, and the main machine/cable staples. Expand from there.

**Cross-links:** every page → 1RM, training-volume, warm-up, plate calculators.
Those calculators → relevant exercise pages.

---

## 4. Supplement database (`/supplements/`) — differentiator

**Why:** a crowded, vendor-fluff-dominated space where the honest, evidence-tiered,
cited house style is exactly what earns rankings (same logic as the peptides
section). Affiliate-friendly on the well-supported entries without compromising the
evidence pages.

**Per-supplement page template:**
1. **What it is** — plain-language identity.
2. **Claimed benefits** — labelled as claims.
3. **What the evidence shows** — tiered + cited + human/animal/in-vitro flagged.
   This section is the whole point; do not soften weak evidence.
4. **Who it may suit / not suit.**
5. **Practical notes** — forms, timing at an educational level (NOT medical dosing
   advice; keep general and cited, e.g. to ISSN position stands).
6. **Safety & interactions** — `SafetyCallout` where relevant.
7. FAQ · related supplements · disclosure (if commercial) · author box ·
   last-reviewed.

**First batch (by search volume & evidence interest):** creatine monohydrate,
whey/protein powder, caffeine, beta-alanine, citrulline malate, ashwagandha,
creatine forms compared, magnesium, vitamin D, omega-3/fish oil, electrolytes,
collagen, ZMA, pre-workout (what's in it). Lead with the ones that have *real*
evidence (creatine, caffeine, protein) — they anchor the tiering and build trust
for the honest "weak evidence" verdicts on others.

**Cross-links:** creatine ↔ creatine calculator; protein/caffeine ↔ macro, protein,
caffeine calculators. Evidence pages stay separate from any "best X" commercial
pages (`CONTENT.md` §4).

---

## 5. Nutrition / food reference (`/nutrition/reference/`)

**Why:** solid volume, pairs with the macro/protein calculators. More commoditised
than §3–4, so second priority — but strong internal-linking value.

**Pages (mostly list/table-style):** protein content of common foods; high-protein
food lists (by diet: omnivore, vegetarian, vegan); calorie reference for common
foods; "how much protein in [food]"; fibre / micronutrient reference lists; common
portion sizes.

**Template:** intro → reference table(s) → short evidence-based notes → **link to
macro/protein/TDEE calculators** → FAQ → author box. Keep tables scannable and
bookmarkable.

---

## 6. Glossary / explainers (`/glossary/`) — cheap, high-leverage

**Why:** individually low-stakes, but a glossary is an **internal-linking machine**
— every guide and tool links its jargon here, spreading link equity site-wide.
Disproportionate SEO value for low production cost. Build alongside everything else.

**Structure:** one short definitional page per term (200–400 words): definition,
why it matters, how it's used, links to related terms and any relevant
tool/reference page.

**First batch:** hypertrophy, progressive overload, RPE, RIR, 1RM, volume,
mechanical tension, TDEE, BMR, NEAT, energy balance, protein synthesis, VO₂max,
HRV, zone 2, lactate threshold, ApoB, Lp(a), autophagy, insulin sensitivity,
DOMS, deload, periodisation. Expand as new content references new terms.

**Rule:** whenever a tool or article uses a jargon term, link its first use to the
glossary page. This is where the SEO compounding comes from.

---

## 7. Reference tables & charts (`/reference/`)

**Why:** "look it up" content people bookmark. A *static reference* captures
different intent from an interactive calculator, and is highly bookmarkable.

**Pages:** strength standards by bodyweight (chart form); running pace charts;
heart-rate-zone tables by age; plate-loading charts; "good VO₂max / grip strength
by age" tables; protein-target quick-reference.

**Template:** intro → the table/chart → how to read it → **link to the interactive
calculator** that computes the personalised version → sources → author box.

**Note on overlap:** these deliberately complement, not duplicate, the calculators
— static lookup vs interactive computation serve different searches. Each links to
its calculator counterpart.

---

## 8. Cross-linking map (the SEO payoff — build this in)

| Reference page | Links to calculator(s) |
|---|---|
| Any exercise page | 1RM, training volume, warm-up, plate |
| Creatine (supplement) | Creatine calculator |
| Protein / whey (supplement) | Macro, protein, TDEE |
| Caffeine (supplement) | Caffeine half-life |
| Food/protein reference | Macro, protein, TDEE |
| Strength standards table | Strength standards tool, 1RM |
| Pace charts | Running pace, race predictor |
| HR-zone tables | Heart-rate-zone calculator |
| Glossary terms | The tool/reference page for that concept |

And reciprocally: each calculator links out to its related exercise/supplement/
glossary/reference pages. Every jargon term's first use links to its glossary page.

---

## 9. Definition of done (per page)
- [ ] Correct template (§3–7) followed for its section.
- [ ] Any health/performance claim evidence-tiered, cited, and human/animal/
      in-vitro flagged; weak evidence labelled honestly, not softened.
- [ ] Cross-links wired **both ways** (reference ↔ calculator) per §8; jargon links
      to glossary.
- [ ] `SafetyCallout` present where the topic carries risk.
- [ ] Disclosure block on any commercial page; neutral pages kept clean.
- [ ] Correct schema (Article/FAQ; HowTo on exercises; Product/Review only on
      commercial supplement pages).
- [ ] Medical disclaimer; author box + last-reviewed date.
