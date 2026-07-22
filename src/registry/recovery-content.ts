/**
 * Recovery & wellness content clusters (CONTENT.md). Pillar + satellite
 * pages under /recovery/<cluster>. Evidence-tiered, non-promotional
 * authority pages plus clearly-disclosed commercial (buying-intent) pages,
 * every physiological-intervention page carrying the safety box.
 *
 * This drives routing, sitemap, the recovery-hub listing, internal links
 * and JSON-LD — the same single-source-of-truth pattern as the tool and
 * peptide registries.
 */

import type { FaqEntry, Source } from "@/registry/types";

export type ArticleKind = "pillar" | "authority" | "commercial";

export interface RecoveryArticle {
  slug: string;
  clusterSlug: string;
  kind: ArticleKind;
  title: string;
  metaDescription: string;
  valueLine: string;
  faq: FaqEntry[];
  related: string[]; // article slugs within recovery content
  lastReviewed: string;
  sources: Source[];
}

export interface RecoveryCluster {
  slug: string;
  title: string;
  pillarValueLine: string;
  metaDescription: string;
  /** Which safety box variant to render. */
  safety: "cold" | "sauna";
  faq: FaqEntry[];
  lastReviewed: string;
  sources: Source[];
  satellites: RecoveryArticle[];
}

const coldWater: RecoveryCluster = {
  slug: "cold-water-immersion",
  title: "Cold Water Immersion: Benefits, Evidence and How to Start",
  pillarValueLine:
    "What ice baths and cold plunges actually do — separating the well-supported effects from the hype.",
  metaDescription:
    "An evidence-tiered guide to cold water immersion: what the research supports (and doesn't) for recovery, mood and metabolism, the timing trade-off with muscle growth, and how to start safely.",
  safety: "cold",
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Does cold water immersion aid recovery?",
      a: "The best-supported effect is short-term: cold water immersion reliably reduces delayed-onset muscle soreness and the feeling of being recovered, especially after hard exercise. Whether that translates to better performance the next day is less certain.",
    },
    {
      q: "Can ice baths blunt muscle growth?",
      a: "Yes — this is the nuance most marketing skips. A 2024 meta-analysis found that cold water immersion done immediately after resistance training tends to blunt the muscle-growth response. If building muscle is the goal, don't ice straight after lifting; separate them by several hours or skip it on those days.",
    },
    {
      q: "Is cold water immersion good for mental health?",
      a: "The mood and stress claims are promising but preliminary. Cold immersion is a strong physiological stressor and some people report feeling better afterwards, but the controlled evidence is limited and mixed — treat mood benefits as plausible, not proven.",
    },
    {
      q: "How cold and how long?",
      a: "Common practice is water around 10–15°C for a few minutes, but there is no single evidence-based prescription, and colder or longer is not automatically better. Start conservatively and never push through warning signs.",
    },
  ],
  sources: [
    {
      label:
        "Piñero A, et al. Throwing cold water on muscle growth: a systematic review with meta-analysis of post-exercise cold water immersion and resistance-training hypertrophy. Eur J Sport Sci 2024",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11235606/",
    },
    {
      label:
        "Cold-water immersion on health and wellbeing: a systematic review and meta-analysis. PLOS One 2025",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/",
    },
  ],
  satellites: [
    {
      slug: "ice-bath-benefits",
      clusterSlug: "cold-water-immersion",
      kind: "authority",
      title: "Ice Bath Benefits — What the Evidence Actually Says",
      metaDescription:
        "An honest, evidence-tiered look at ice bath benefits: recovery and soreness, mood, metabolism and the muscle-growth trade-off — what's well-supported, what's preliminary, and what's marketing.",
      valueLine: "Every claimed ice-bath benefit, sorted by how strong the evidence really is.",
      faq: [],
      related: ["cold-water-immersion", "best-cold-plunge-tubs"],
      lastReviewed: "2026-07-22",
      sources: [
        {
          label: "Piñero A, et al. Eur J Sport Sci 2024 (hypertrophy meta-analysis)",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11235606/",
        },
        {
          label: "Cold-water immersion on health and wellbeing. PLOS One 2025",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/",
        },
      ],
    },
    {
      slug: "best-cold-plunge-tubs",
      clusterSlug: "cold-water-immersion",
      kind: "commercial",
      title: "How to Choose a Cold Plunge Tub — What Actually Matters",
      metaDescription:
        "The selection criteria that genuinely matter when buying a cold plunge tub — chiller, insulation, size, filtration and cost — plus honest DIY alternatives.",
      valueLine: "The criteria that matter when buying a cold plunge — and when a bin of ice does the same job.",
      faq: [
        {
          q: "Do I need an expensive chiller tub?",
          a: "No. A chiller keeps water cold and clean for daily use and is a genuine convenience, but for occasional use a chest freezer conversion or simply a tub with bags of ice delivers the same cold exposure for a fraction of the cost.",
        },
        {
          q: "What actually matters when choosing one?",
          a: "How reliably it holds your target temperature, insulation, whether it filters and sanitises the water (important for repeated use), the internal size for your body, and running cost. Brand and aesthetics matter far less.",
        },
      ],
      related: ["cold-water-immersion", "ice-bath-benefits"],
      lastReviewed: "2026-07-22",
      sources: [
        {
          label: "Cold-water immersion on health and wellbeing. PLOS One 2025 (context)",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/",
        },
      ],
    },
  ],
};

const sauna: RecoveryCluster = {
  slug: "sauna-therapy",
  title: "Sauna Therapy: Benefits, Evidence and How to Use It",
  pillarValueLine:
    "Among the better-supported recovery practices — here's what the evidence shows, and where it stops.",
  metaDescription:
    "An evidence-tiered guide to sauna therapy: the strong observational links to cardiovascular and all-cause mortality, blood-pressure benefits, the causation caveat, infrared vs traditional, and how to use it safely.",
  safety: "sauna",
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Is sauna use actually good for your heart?",
      a: "The evidence here is unusually strong for this field, though observational. Large Finnish cohort studies link frequent sauna use (4–7 times a week) to substantially lower cardiovascular and all-cause mortality, and randomised trials show acute blood-pressure reductions. Because the mortality data are observational, they show association, not proven cause.",
    },
    {
      q: "How often and how long?",
      a: "The cohort benefits were largest at 4–7 sessions a week of roughly 15–20 minutes at typical Finnish sauna temperatures (around 80°C). More was associated with more benefit in the data, but hydration and individual tolerance set practical limits.",
    },
    {
      q: "Is infrared as good as a traditional sauna?",
      a: "Not established. The strong cardiovascular and mortality evidence comes from traditional Finnish saunas; infrared has a smaller, more condition-specific research base. Don't assume findings from traditional saunas transfer directly to infrared.",
    },
    {
      q: "Does sauna 'detox' the body or burn meaningful fat?",
      a: "No. Detox claims are marketing — your liver and kidneys handle that — and the weight lost in a session is water that returns on rehydration. The credible benefits are cardiovascular and relaxation-related, not detox or fat loss.",
    },
  ],
  sources: [
    {
      label:
        "Laukkanen T, et al. Association between sauna bathing and fatal cardiovascular and all-cause mortality events. JAMA Intern Med 2015;175:542–548",
      url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
    },
    {
      label:
        "Laukkanen JA, Laukkanen T, Kunutsor SK. Cardiovascular and other health benefits of sauna bathing: a review of the evidence. Mayo Clin Proc 2018;93:1111–1121",
      url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
    },
  ],
  satellites: [
    {
      slug: "sauna-benefits",
      clusterSlug: "sauna-therapy",
      kind: "authority",
      title: "Sauna Benefits — What the Evidence Actually Says",
      metaDescription:
        "An evidence-tiered review of sauna benefits: cardiovascular and mortality associations, blood pressure, recovery and relaxation — clearly separating well-supported effects from detox and weight-loss marketing.",
      valueLine: "Sauna's health claims, sorted by evidence — including its unusually strong cardiovascular data.",
      faq: [],
      related: ["sauna-therapy", "best-home-saunas"],
      lastReviewed: "2026-07-22",
      sources: [
        {
          label: "Laukkanen T, et al. JAMA Intern Med 2015 (mortality cohort)",
          url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
        },
        {
          label: "Laukkanen JA, et al. Mayo Clin Proc 2018 (review)",
          url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
        },
      ],
    },
    {
      slug: "best-home-saunas",
      clusterSlug: "sauna-therapy",
      kind: "commercial",
      title: "Choosing a Home Sauna — Traditional vs Infrared, and What Matters",
      metaDescription:
        "How to choose a home sauna: traditional vs infrared (and why the evidence differs), heater type, size, wiring and cost — with an honest note on which evidence applies to which.",
      valueLine: "How to choose a home sauna — and why the type you pick changes which evidence applies.",
      faq: [
        {
          q: "Traditional or infrared for home use?",
          a: "If you're buying for the well-evidenced cardiovascular and blood-pressure benefits, traditional (hot, higher-temperature) saunas are what those studies used. Infrared runs cooler and is gentler and cheaper to run, but its evidence base is smaller and more condition-specific — a reasonable choice for comfort, less so if you're chasing the Finnish-cohort findings.",
        },
        {
          q: "What matters most when buying?",
          a: "Heater capacity relative to room size (for traditional), the electrical supply it needs, internal dimensions, build quality and wood, and running cost. For infrared, the type and coverage of emitters. Match the type to your actual goal first.",
        },
      ],
      related: ["sauna-therapy", "sauna-benefits"],
      lastReviewed: "2026-07-22",
      sources: [
        {
          label: "Laukkanen JA, et al. Mayo Clin Proc 2018 (traditional-sauna evidence base)",
          url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
        },
      ],
    },
  ],
};

export const recoveryClusters: RecoveryCluster[] = [coldWater, sauna];

export const clustersBySlug: ReadonlyMap<string, RecoveryCluster> = new Map(
  recoveryClusters.map((c) => [c.slug, c]),
);

export function getCluster(slug: string): RecoveryCluster | undefined {
  return clustersBySlug.get(slug);
}

const allArticles = recoveryClusters.flatMap((c) => c.satellites);

export function getArticle(clusterSlug: string, articleSlug: string): RecoveryArticle | undefined {
  return allArticles.find((a) => a.clusterSlug === clusterSlug && a.slug === articleSlug);
}

/** Every static path in the section, for generateStaticParams + sitemap. */
export function allRecoveryContentPaths(): { cluster: string; article?: string }[] {
  return recoveryClusters.flatMap((c) => [
    { cluster: c.slug },
    ...c.satellites.map((a) => ({ cluster: c.slug, article: a.slug })),
  ]);
}

/** Resolve a mix of article slugs (and the pillar slug) to hrefs + titles. */
export function resolveRelated(
  cluster: RecoveryCluster,
  slugs: string[],
): { href: string; title: string }[] {
  return slugs.flatMap((slug) => {
    if (slug === cluster.slug) return [{ href: `/recovery/${cluster.slug}`, title: cluster.title }];
    const article = cluster.satellites.find((a) => a.slug === slug);
    return article
      ? [{ href: `/recovery/${cluster.slug}/${article.slug}`, title: article.title }]
      : [];
  });
}
