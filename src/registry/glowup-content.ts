/**
 * "Glow-up" content section (CONTENT-looksmaxxing.md) — the evidence-based
 * answer to the looksmaxxing search category. Same single-source-of-truth
 * pattern as the recovery-content and peptide registries: this drives routing,
 * the sitemap, the section hub, internal links, the reciprocal
 * tool→content cross-links (§4) and JSON-LD.
 *
 * Hard rules encoded structurally (CONTENT-looksmaxxing §1): every claim is
 * evidence-tiered and health-framed (never appearance-rated); the debunk hub
 * rates *evidence*, never a person; dangerous trends get an honest
 * `not-supported` verdict, never amplification. This launch covers §8 step 1
 * — the skin & sun cluster plus the debunk hub. The body-composition estimator
 * (§6) is deliberately NOT here: it is gated on accounts + the §6.3 guardrails.
 */

import type { EvidenceBasis, EvidenceTier } from "@/registry/peptides";
import type { FaqEntry, Source } from "@/registry/types";
import { getTool, toolPath } from "@/registry/tools";

export const GLOWUP_LAST_REVIEWED = "2026-07-23";

export type GlowUpArticleKind = "authority" | "debunk";

/** An out-of-section link (to a tool, supplement, recovery or peptide page). */
export interface CrossLink {
  href: string;
  title: string;
}

export interface GlowUpArticle {
  slug: string;
  clusterSlug: string;
  kind: GlowUpArticleKind;
  title: string;
  metaDescription: string;
  valueLine: string;
  faq: FaqEntry[];
  /** Sibling article slugs (and the pillar slug) within this cluster. */
  related: string[];
  /** Calculator slugs this page routes into — reciprocated on the tool page (§4). */
  relatedTools: string[];
  /** Explicit out-links to other sections (supplements, recovery, peptides). */
  seeAlso?: CrossLink[];
  lastReviewed: string;
  sources: Source[];
}

export interface GlowUpCluster {
  slug: string;
  title: string;
  pillarValueLine: string;
  metaDescription: string;
  /** Safety box (CONTENT.md §5 house rule) — every cluster carries one. */
  safety: { title: string; points: string[] };
  faq: FaqEntry[];
  relatedTools: string[];
  seeAlso?: CrossLink[];
  lastReviewed: string;
  sources: Source[];
  satellites: GlowUpArticle[];
}

/**
 * A single entry in the debunk hub (§3.5): the myth, its honest verdict tier,
 * a one-line why, and a link to the honest alternative. We rate the claim,
 * never a person (§1.1).
 */
export interface GlowUpMyth {
  slug: string;
  claim: string;
  verdict: Extract<EvidenceTier, "marketing-claim" | "not-supported">;
  basis?: EvidenceBasis;
  verdictLine: string;
  honestAlternative: CrossLink;
  sources: Source[];
}

// --- Shared sources (cited on multiple pages) --------------------------------

const SRC_HUGHES_2013: Source = {
  label:
    "Hughes MCB, Williams GM, Baker P, Green AC. Sunscreen and prevention of skin aging: a randomized trial. Ann Intern Med 2013;158(11):781–790",
  url: "https://www.acpjournals.org/doi/10.7326/0003-4819-158-11-201306040-00002",
};
const SRC_GREEN_2011: Source = {
  label:
    "Green AC, Williams GM, Logan V, Strutton GM. Reduced melanoma after regular sunscreen use: randomized trial follow-up. J Clin Oncol 2011;29(3):257–263",
  url: "https://pubmed.ncbi.nlm.nih.gov/21135266/",
};
const SRC_IARC_SUNBEDS: Source = {
  label:
    "IARC / WHO. Sunbeds and UV radiation — UV-emitting tanning devices classified Group 1, carcinogenic to humans (El Ghissassi F, et al. Lancet Oncol 2009)",
  url: "https://www.iarc.who.int/news-events/sunbeds-and-uv-radiation",
};
const SRC_TRETINOIN_SR: Source = {
  label:
    "Milosheska D, Roškar R (systematic review of RCTs). Topical tretinoin for treating photoaging. Int J Womens Dermatol 2022; PMID 35620028",
  url: "https://pubmed.ncbi.nlm.nih.gov/35620028/",
};
const SRC_MELANOTAN_DERMNET: Source = {
  label:
    "DermNet: Melanotan II — unlicensed tanning peptide; documented melanoma and mole-change case reports; MHRA warns safety not established",
  url: "https://dermnetnz.org/topics/melanotan-ii",
};

const collagenSeeAlso: CrossLink = { href: "/supplements/collagen", title: "Collagen — what the evidence says" };
const redLightSeeAlso: CrossLink = {
  href: "/recovery/red-light-therapy",
  title: "Red light therapy — the evidence",
};
const melanotanSeeAlso: CrossLink = {
  href: "/learn/peptides/melanotan-2",
  title: "Melanotan II (peptides reference)",
};

// --- Skin & sun cluster (§3.1 — launch cluster) ------------------------------

const skin: GlowUpCluster = {
  slug: "skin",
  title: "The Evidence-Based Glow-Up: What Actually Improves Your Skin",
  pillarValueLine:
    "Skip the 10-step shelf and the jaw exercises. Here's what genuinely changes how your skin looks — sorted by how strong the evidence is.",
  metaDescription:
    "The honest, evidence-tiered glow-up for skin: sun protection (the single biggest lever), retinoids, a routine that actually matters, and the trends to ignore. Health-framed, cited, no hype.",
  safety: {
    title: "Safety — skin, sun and your skin health",
    points: [
      "The point of sun protection is health first: UV is the main preventable cause of skin cancer, and the appearance benefit (less ageing) is a bonus, not the reason.",
      "See a doctor about any mole or patch that changes in size, shape or colour, itches or bleeds — don't wait, and don't rely on any online tool for this.",
      "Retinoids and some acids increase sun sensitivity; use sunscreen, and avoid retinoids in pregnancy. Patch-test actives and introduce one at a time.",
      "This is general information, not a diagnosis or a treatment plan. If you have a skin condition, see a GP or dermatologist.",
    ],
  },
  relatedTools: ["sleep-calculator"],
  seeAlso: [collagenSeeAlso, redLightSeeAlso],
  lastReviewed: GLOWUP_LAST_REVIEWED,
  faq: [
    {
      q: "What's the single most effective thing for my skin?",
      a: "Daily broad-spectrum sun protection. It's the one habit with randomised-trial evidence for both preventing skin cancer and slowing visible ageing — it out-performs any serum. Everything else is a distant second.",
    },
    {
      q: "Do I need an expensive multi-step routine?",
      a: "No. The evidence supports a short routine: sunscreen every morning, a gentle cleanser, a moisturiser, and — if you want to target ageing — a retinoid at night. A ten-product shelf mostly adds cost and irritation, not results.",
    },
    {
      q: "Is 'tanmaxxing' a shortcut to looking better?",
      a: "No — it's the opposite. Deliberate UV exposure and tanning injections like Melanotan are dermatologist-flagged as dangerous, and a tan is literally your skin responding to DNA damage. See the tanmaxxing debunk below.",
    },
    {
      q: "Does sleep really affect my skin?",
      a: "Plausibly, yes — skin does much of its repair overnight, and poor sleep is linked to slower barrier recovery and more visible signs of ageing in small studies. It's a promising, low-cost lever, so it earns a place alongside sun protection.",
    },
  ],
  sources: [SRC_HUGHES_2013, SRC_GREEN_2011, SRC_IARC_SUNBEDS],
  satellites: [
    {
      slug: "sunscreen",
      clusterSlug: "skin",
      kind: "authority",
      title: "Sunscreen: the One Habit the Evidence Actually Backs",
      metaDescription:
        "Why daily sunscreen is the highest-evidence 'glow-up': the randomised trials on skin ageing and melanoma, how much to use, SPF vs broad-spectrum, and the myths to drop.",
      valueLine: "The one skincare step with randomised-trial evidence behind it — for cancer risk and for how your skin ages.",
      faq: [
        {
          q: "How much sunscreen, and how often?",
          a: "Most people under-apply. Aim for roughly two finger-lengths for the face and neck, every morning you'll be in daylight, and reapply if you're outdoors for long or after swimming or sweating. An under-applied high SPF behaves like a much lower one.",
        },
        {
          q: "Do I need it indoors or in winter?",
          a: "UVA passes through cloud and windows year-round, so daily use is the simplest reliable habit. If you're genuinely indoors away from windows all day, the stakes are lower — but a morning routine you don't have to think about is easier to keep.",
        },
      ],
      related: ["skin", "sunscreen-myths"],
      relatedTools: [],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_HUGHES_2013, SRC_GREEN_2011],
    },
    {
      slug: "retinoids",
      clusterSlug: "skin",
      kind: "authority",
      title: "Retinoids Explained: OTC vs Prescription (and the Hype)",
      metaDescription:
        "An evidence-tiered guide to retinoids for skin ageing: what tretinoin and retinol actually do, over-the-counter vs prescription, how to start without wrecking your barrier, and the age and pregnancy notes.",
      valueLine: "After sunscreen, retinoids are the best-evidenced 'anti-ageing' active — here's the honest version.",
      faq: [
        {
          q: "Retinol or prescription tretinoin?",
          a: "Prescription tretinoin has the strongest trial evidence for photoageing; over-the-counter retinol is weaker but gentler and still reasonable. Start low and infrequent whichever you use — irritation is the main reason people quit.",
        },
        {
          q: "Is there an age or pregnancy note?",
          a: "Retinoids aren't recommended in pregnancy. And most under-18s don't need an anti-ageing retinoid at all — for teenage acne that's a conversation with a GP or pharmacist, not a looksmaxxing purchase.",
        },
      ],
      related: ["skin", "skincare-routine", "skincare-ingredients"],
      relatedTools: [],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_TRETINOIN_SR],
    },
    {
      slug: "skincare-routine",
      clusterSlug: "skin",
      kind: "authority",
      title: "The Honest Skincare Routine: the 3 Steps That Matter",
      metaDescription:
        "The evidence-based minimum skincare routine: cleanse, moisturise, protect — plus an optional retinoid. Why a short routine beats a ten-step shelf, and what each step is actually for.",
      valueLine: "Three steps do most of the work. Here's the routine the evidence supports — and what's just shelf decoration.",
      faq: [
        {
          q: "What are the three steps?",
          a: "A gentle cleanser, a moisturiser suited to your skin, and sunscreen every morning. That covers barrier health and the single biggest lever (sun protection). A night-time retinoid is the one worthwhile add-on if ageing is your goal.",
        },
        {
          q: "What can I drop?",
          a: "Toners, essences, multiple serums and '10-step' routines are mostly optional. More products means more cost, more irritation risk, and more chances to quit — not better skin.",
        },
      ],
      related: ["skin", "retinoids", "skincare-ingredients"],
      relatedTools: ["sleep-calculator"],
      seeAlso: [collagenSeeAlso],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_HUGHES_2013],
    },
    {
      slug: "skincare-ingredients",
      clusterSlug: "skin",
      kind: "authority",
      title: "Niacinamide, Vitamin C and the Ingredient Reality",
      metaDescription:
        "What the popular skincare actives — niacinamide, vitamin C, hyaluronic acid, collagen — actually do, evidence-tiered. Which are worth it, which are oversold, and why the basics still win.",
      valueLine: "The trendy actives, sorted by evidence — and why none of them out-rank sunscreen and sleep.",
      faq: [
        {
          q: "Is niacinamide worth it?",
          a: "It's one of the better-tolerated actives, with reasonable evidence for supporting the skin barrier and calming redness. A sensible, low-risk add — just not a miracle, and not a replacement for sun protection.",
        },
        {
          q: "Does drinking or applying collagen help skin?",
          a: "The evidence for collagen supplements on skin is preliminary and industry-funded studies dominate — treat it as promising-at-best, not established. Topical collagen mostly sits on the surface. See our collagen page for the honest breakdown.",
        },
      ],
      related: ["skin", "skincare-routine", "retinoids"],
      relatedTools: [],
      seeAlso: [collagenSeeAlso],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_TRETINOIN_SR],
    },
    {
      slug: "tanmaxxing",
      clusterSlug: "skin",
      kind: "debunk",
      title: "Tanmaxxing and Melanotan: an Honest Debunk",
      metaDescription:
        "Tanmaxxing — deliberate UV exposure and Melanotan tanning injections — is a dermatologist-flagged danger, not a glow-up. The evidence on tanning beds, Melanotan and melanoma risk, clearly rated.",
      valueLine: "Deliberate tanning and Melanotan injections are dangerous, not aspirational. Here's the evidence, not the hype.",
      faq: [
        {
          q: "Isn't a base tan protective?",
          a: "No. A tan is your skin reacting to DNA damage; a 'base tan' offers a sun protection factor of roughly 3 at best and still adds to your lifetime UV damage. It's not protection — it's more of the exposure that causes the harm.",
        },
        {
          q: "Are Melanotan tanning injections or nasal sprays safe?",
          a: "They're unlicensed, sold on the black market with unknown contents, and dermatologists have documented melanoma and rapid mole changes in users. UK regulators warn their safety hasn't been established. This is a clear 'not supported'.",
        },
      ],
      related: ["skin", "sunscreen", "sunscreen-myths"],
      relatedTools: [],
      seeAlso: [melanotanSeeAlso],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_IARC_SUNBEDS, SRC_MELANOTAN_DERMNET, SRC_GREEN_2011],
    },
    {
      slug: "sunscreen-myths",
      clusterSlug: "skin",
      kind: "debunk",
      title: "Sunscreen Myths: Base Tans, Indoor Tanning and 'Sunscreen Is Toxic'",
      metaDescription:
        "The common sunscreen and tanning myths — base tans, 'safe' indoor tanning beds, sunscreen scaremongering — rated against the evidence, with the honest advice that replaces each.",
      valueLine: "The myths that keep people out of sunscreen and into tanning beds, rated against the evidence.",
      faq: [
        {
          q: "Are tanning beds a safer way to tan?",
          a: "No. UV-emitting tanning devices are classified by the WHO's cancer agency as Group 1 carcinogens — the same category as tobacco — and starting before age 30 raises melanoma risk substantially. There is no safe tanning bed.",
        },
        {
          q: "Is sunscreen itself dangerous?",
          a: "The online 'sunscreen is toxic' claims run far ahead of the evidence. Regulators continue to review ingredient absorption, but the well-established, large risk is UV exposure and skin cancer — not wearing sunscreen. Don't let scaremongering talk you out of the one habit with trial evidence.",
        },
      ],
      related: ["skin", "sunscreen", "tanmaxxing"],
      relatedTools: [],
      lastReviewed: GLOWUP_LAST_REVIEWED,
      sources: [SRC_IARC_SUNBEDS, SRC_HUGHES_2013],
    },
  ],
};

export const glowUpClusters: GlowUpCluster[] = [skin];

// --- Debunk hub (§3.5 — the shareable authority anchor) ----------------------

/**
 * "Looksmaxxing myths, rated." Each is a claim + one-line verdict + a route to
 * the honest alternative. Dangerous trends are rated `not-supported`, never
 * amplified or both-sidesed (§1.4). New myths append here as trends break.
 */
export const glowUpMyths: GlowUpMyth[] = [
  {
    slug: "mewing",
    claim: "Mewing (tongue-on-palate) reshapes an adult jawline",
    verdict: "not-supported",
    basis: "human",
    verdictLine:
      "The American Association of Orthodontists says there's no clinical evidence that tongue posture reshapes the adult facial skeleton. Posture won't move bone.",
    honestAlternative: {
      href: "/glow-up/skin",
      title: "The parts of your appearance you can actually change",
    },
    sources: [
      {
        label:
          "American Association of Orthodontists — 'Is mewing bad for you?' (no clinical evidence that mewing changes facial structure)",
        url: "https://aaoinfo.org/whats-trending/is-mewing-bad-for-you/",
      },
    ],
  },
  {
    slug: "bone-smashing",
    claim: "'Bone smashing' — hitting your face to sharpen the bone",
    verdict: "not-supported",
    basis: "human",
    verdictLine:
      "Dangerous and unsupported. Blunt facial trauma fractures bone and damages nerves; it does not remodel a sharper jaw. Documented hospitalisations. Never do this.",
    honestAlternative: {
      href: "/glow-up/skin",
      title: "Health-framed changes that actually work",
    },
    sources: [
      {
        label:
          "American Association of Orthodontists — viral jawline trends: no evidence, real risk of harm",
        url: "https://aaoinfo.org/whats-trending/is-mewing-bad-for-you/",
      },
    ],
  },
  {
    slug: "tanmaxxing",
    claim: "'Tanmaxxing' — deliberate UV and Melanotan for a better look",
    verdict: "not-supported",
    basis: "human",
    verdictLine:
      "UV tanning devices are Group 1 carcinogens; Melanotan is unlicensed with melanoma case reports. A tan is DNA damage, not a glow-up.",
    honestAlternative: {
      href: "/glow-up/skin/tanmaxxing",
      title: "Tanmaxxing and Melanotan — the full debunk",
    },
    sources: [SRC_IARC_SUNBEDS, SRC_MELANOTAN_DERMNET],
  },
  {
    slug: "mouth-taping",
    claim: "Mouth-taping at night for a better jaw and sleep",
    verdict: "marketing-claim",
    basis: "human",
    verdictLine:
      "A 2025 systematic review found limited benefit and a real asphyxiation risk for anyone with nasal obstruction. Loud snoring or gasping needs a doctor, not tape.",
    honestAlternative: {
      href: "/recovery/sleep-environment",
      title: "Sleep environment — what actually helps",
    },
    sources: [
      {
        label:
          "Systematic review: safety and efficacy of mouth taping in mouth breathing / sleep-disordered breathing / OSA. PLOS One 2025; PMID 40397877",
        url: "https://pubmed.ncbi.nlm.nih.gov/40397877/",
      },
    ],
  },
  {
    slug: "sarms",
    claim: "SARMs are a safe 'research chemical' shortcut to a physique",
    verdict: "not-supported",
    basis: "human",
    verdictLine:
      "The FDA links SARMs to life-threatening reactions including liver injury and raised heart-attack and stroke risk, and warns consumers to stop using them.",
    honestAlternative: {
      href: "/glow-up/skin",
      title: "The boring, effective route: training, protein and sleep",
    },
    sources: [
      {
        label:
          "US FDA — bodybuilding products with SARMs put consumers at risk of heart attack, stroke and serious liver damage",
        url: "https://www.fda.gov/drugs/fraudulent-products/certain-bodybuilding-products-put-consumers-risk-heart-attack-stroke-serious-liver-damage-and-more",
      },
    ],
  },
];

// --- Lookups & helpers -------------------------------------------------------

const clustersBySlug: ReadonlyMap<string, GlowUpCluster> = new Map(
  glowUpClusters.map((c) => [c.slug, c]),
);

export function getGlowUpCluster(slug: string): GlowUpCluster | undefined {
  return clustersBySlug.get(slug);
}

const allArticles = glowUpClusters.flatMap((c) => c.satellites);

export function getGlowUpArticle(
  clusterSlug: string,
  articleSlug: string,
): GlowUpArticle | undefined {
  return allArticles.find((a) => a.clusterSlug === clusterSlug && a.slug === articleSlug);
}

/** Every article across the section (for the reciprocal cross-link index). */
export function allGlowUpArticles(): GlowUpArticle[] {
  return allArticles;
}

/** Every static path in the section, for generateStaticParams + sitemap. */
export function allGlowUpPaths(): { cluster: string; article?: string }[] {
  return glowUpClusters.flatMap((c) => [
    { cluster: c.slug },
    ...c.satellites.map((a) => ({ cluster: c.slug, article: a.slug })),
  ]);
}

/** Resolve sibling article slugs (and the pillar slug) to hrefs + titles. */
export function resolveGlowUpRelated(
  cluster: GlowUpCluster,
  slugs: string[],
): CrossLink[] {
  return slugs.flatMap((slug) => {
    if (slug === cluster.slug) return [{ href: `/glow-up/${cluster.slug}`, title: cluster.title }];
    const article = cluster.satellites.find((a) => a.slug === slug);
    return article
      ? [{ href: `/glow-up/${cluster.slug}/${article.slug}`, title: article.title }]
      : [];
  });
}

/** Resolve calculator slugs to live tool links — never a dead link (§4). */
export function resolveGlowUpTools(slugs: string[]): CrossLink[] {
  return slugs.flatMap((slug) => {
    const tool = getTool(slug);
    if (!tool) return [];
    return [{ href: toolPath(tool), title: tool.title }];
  });
}
