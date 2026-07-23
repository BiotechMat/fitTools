# CONTENT — Peptides (educational cluster)

Extends `CONTENT.md` (same evidence-tiering, safety box, disclosure and template
conventions). This cluster is **educational and about the peptides themselves** —
what they are, how they're proposed to work, what the human evidence shows, and
their legal/sourcing reality.

## 0. Scope & hard boundaries (read first)

- **No dosing. No protocols. No administration instructions.** This cluster does
  not tell anyone how to use, dose, inject, cycle, stack, or source these
  compounds. It explains what each compound *is*. This is a deliberate editorial
  decision, not an oversight — state it plainly on the pillar page.
- **Evidence honesty is the whole point.** The fitness internet overstates these
  compounds badly. Our differentiator is separating *claimed* from *shown*, and
  being explicit about how thin the human data usually is.
- **Legality and sourcing are part of the education.** Most of these are not
  approved medicines for these uses, are sold as "research chemicals" outside any
  quality control, and several are prohibited in sport. That context is not a
  footnote — it belongs on every page.
- **Not medical advice.** Standard medical disclaimer plus the enhanced safety/
  legality box (§4) on every page.

## 1. Why this cluster exists

People search these compound names in large volume and mostly find hype or vendor
copy. An accurate, evidence-tiered, non-promotional explainer is genuinely useful,
ranks on credibility in a YMYL-adjacent space, and fits the site's honest house
style. It intentionally does **not** serve "how to take X" intent — that's the
responsible and strategically sound line.

## 2. Section architecture

Hub: `/learn/peptides/` (a *learn/reference* section, deliberately separate from
the commercial recovery pages in `CONTENT.md` — no product sales on these pages;
keeps the educational layer clean).

- **1 pillar page** — "Peptides in fitness: what they are, and what the evidence
  actually says." Explains what peptides are, the categories, the research-chemical
  and legality problem, the "claimed vs shown" framing, and the explicit no-dosing
  stance.
- **Per-compound pages** — one page each (or grouped by class), to the template in
  §3.

## 3. Per-compound page template

Each compound page covers, in this order:

1. **What it is** — plain-language identity: peptide vs peptide hormone vs
   secretagogue; natural analogue if any.
2. **Composition / makeup** — chemical nature at a lay-technical level: that it's a
   short chain of amino acids, sequence length/origin where well-established,
   what larger molecule it mimics or is derived from. Accurate but not a synthesis
   route.
3. **Proposed mechanism** — how it is *said* to act (receptor, axis, pathway).
4. **Claimed benefits** — what the community/vendors claim, clearly labelled as
   claims.
5. **What the evidence shows** — graded on the medal ladder: **Gold / Silver /
   Bronze** for genuine evidence (strong human → some human → early/animal-only),
   with **Unproven** and **Not supported** earning no medal — with citations,
   and explicit note of whether evidence is human, animal, or in-vitro only
   (that basis is what splits Silver from Bronze). For most of these, honestly:
   limited human data, so expect a lot of Bronze and Unproven.
6. **Legal & regulatory status** — approval status (usually not approved for these
   uses), research-chemical sale, WADA/sport-prohibition status.
7. **Known risks & unknowns** — documented adverse effects and, importantly, the
   unknowns (purity, contamination, long-term safety).
8. **Safety & legality box** (§4).

Explicitly **omit** any dose, frequency, route, cycle, or sourcing detail.

## 4. Safety & legality box (required, every page)

Distinct box stating: not approved for these uses / sold without quality control /
purity and contamination cannot be assumed / limited or no long-term human safety
data / may be prohibited in sport / consult a qualified clinician. Build as a
reusable component (reuse/extend `SafetyCallout` from `CONTENT.md`).

## 5. Compound list (commonly discussed in fitness)

Grouped by category. Each is a page (or class-grouped page) to the §3 template.
The one-line notes below are orientation for the writer, **not** the page content.

**Growth-hormone secretagogues / GH-releasing peptides (GHRPs & GHRHs)**
- **Sermorelin** — GHRH analogue; proposed to stimulate endogenous GH release.
- **CJC-1295** — long-acting GHRH analogue.
- **Ipamorelin** — selective GHRP/ghrelin-receptor agonist.
- **GHRP-2** and **GHRP-6** — earlier GHRPs; GHRP-6 noted for strong appetite
  stimulation.
- **Hexarelin** — potent GHRP.
- **MK-677 (Ibutamoren)** — orally-active ghrelin-receptor agonist (a
  secretagogue; technically not a peptide — note this distinction on the page).
- **Tesamorelin** — GHRH analogue; the one with the most robust clinical data
  (approved for HIV-associated lipodystrophy) — a useful contrast case for the
  evidence tiering.

**"Healing" / recovery peptides**
- **BPC-157** — synthetic peptide derived from a gastric protein fragment; heavily
  claimed for tendon/gut healing; human evidence very limited (animal-dominated).
- **TB-500 / Thymosin Beta-4** — actin-regulating peptide; recovery/repair claims.

**Melanocortin peptides**
- **Melanotan I (afamelanotide)** and **Melanotan II** — melanocortin agonists;
  tanning and (MT-II) libido claims; note the meaningful risk profile and that
  afamelanotide has a narrow approved medical use.
- **PT-141 (Bremelanotide)** — melanocortin agonist; approved in a specific
  context (hypoactive sexual desire) — another good evidence-contrast case.

**Metabolic / other (context pages, high search interest)**
- **GLP-1 receptor agonists (semaglutide, tirzepatide, etc.)** — approved
  medicines; treat these distinctly from the research-chemical peptides — real
  clinical evidence, prescription-only, cross-link to the site's GLP-1 tooling.
  Their inclusion here is to *contrast* rigorously-evidenced, regulated peptides
  with the unregulated ones.
- **Fragment 176-191** — a GH fragment; strong fat-loss claims vs weak human
  evidence — a clear "Unproven" (no-medal) example.

> The list is extensible. Prioritise pages by search volume. Lead the pillar +
> the highest-interest compounds (BPC-157, the GH secretagogues, GLP-1 context).
> Tesamorelin, PT-141 and GLP-1s are valuable precisely because they show what
> *real* evidence looks like, anchoring the tiering for the rest.

## 6. Definition of done (per page)
- [ ] What-it-is, composition, mechanism, claimed benefits, evidence (tiered +
      cited + human/animal/in-vitro flagged), legal status, risks/unknowns.
- [ ] Safety & legality box present.
- [ ] **No dose, route, frequency, cycle, or sourcing information anywhere.**
- [ ] Evidence honestly tiered — preliminary/animal-only labelled as such, not
      dressed up.
- [ ] Medical disclaimer; correct schema (Article/FAQ); author box + last-reviewed.
- [ ] No product sales on these pages (educational layer kept clean).
