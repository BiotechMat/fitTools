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
  /** Safety box content (CONTENT.md §5) — mandatory on every intervention page. */
  safety: { title: string; points: string[] };
  faq: FaqEntry[];
  lastReviewed: string;
  sources: Source[];
  satellites: RecoveryArticle[];
}

const coldWater: RecoveryCluster = {
  slug: "cold-water-immersion",
  title: "Cold Water Immersion: Benefits, Evidence and How to Start",
  pillarValueLine:
    "What ice baths and cold plunges actually do, separating the well-supported effects from the hype.",
  metaDescription:
    "An evidence-tiered guide to cold water immersion: what the research supports (and doesn't) for recovery, mood and metabolism, the timing trade-off with muscle growth, and how to start safely.",
  safety: {
    title: "Cold water immersion safety",
    points: [
      "Cold immersion is a strong stressor on the heart and circulation. The cold-shock response (gasping, spiking heart rate and blood pressure) is the main acute danger, especially in very cold water.",
      "Be cautious or avoid it with heart conditions, uncontrolled high blood pressure, or during pregnancy, and never immerse alone or after alcohol.",
      "Enter gradually, keep sessions short, and get out at any warning sign.",
      "Consult a doctor before starting if you have any medical condition or are pregnant.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Does cold water immersion aid recovery?",
      a: "The best-supported effect is short-term: cold water immersion reliably reduces delayed-onset muscle soreness and the feeling of being recovered, especially after hard exercise. Whether that translates to better performance the next day is less certain.",
    },
    {
      q: "Can ice baths blunt muscle growth?",
      a: "Yes, and this is the nuance most marketing skips. A 2024 meta-analysis found that cold water immersion done immediately after resistance training tends to blunt the muscle-growth response. If building muscle is the goal, don't ice straight after lifting; separate them by several hours or skip it on those days.",
    },
    {
      q: "Is cold water immersion good for mental health?",
      a: "The mood and stress claims are promising but preliminary. Cold immersion is a strong physiological stressor and some people report feeling better afterwards, but the controlled evidence is limited and mixed, so treat mood benefits as plausible, not proven.",
    },
    {
      q: "How cold and how long?",
      a: "Common practice is water around 10 to 15°C for a few minutes, but there is no single evidence-based prescription, and colder or longer is not automatically better. Start conservatively and never push through warning signs.",
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
      title: "Ice Bath Benefits: What the Evidence Actually Says",
      metaDescription:
        "An honest, evidence-tiered look at ice bath benefits: recovery and soreness, mood, metabolism and the muscle-growth trade-off, covering what's well-supported, what's preliminary, and what's marketing.",
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
      title: "How to Choose a Cold Plunge Tub: What Actually Matters",
      metaDescription:
        "The selection criteria that genuinely matter when buying a cold plunge tub, namely chiller, insulation, size, filtration and cost, plus honest DIY alternatives.",
      valueLine: "The criteria that matter when buying a cold plunge, and when a bin of ice does the same job.",
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
    "Among the better-supported recovery practices. Here's what the evidence shows, and where it stops.",
  metaDescription:
    "An evidence-tiered guide to sauna therapy: the strong observational links to cardiovascular and all-cause mortality, blood-pressure benefits, the causation caveat, infrared vs traditional, and how to use it safely.",
  safety: {
    title: "Sauna use safety",
    points: [
      "The main risks are overheating, dehydration and fainting. Hydrate before and after, and don't stay in longer than feels comfortable.",
      "Be cautious or avoid it with certain cardiovascular conditions, unstable angina, recent heart attack, or during pregnancy, and never combine sauna with alcohol.",
      "Cool down gradually and stand up slowly to avoid dizziness.",
      "Consult a doctor before starting if you have any medical condition or are pregnant.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Is sauna use actually good for your heart?",
      a: "The evidence here is unusually strong for this field, though observational. Large Finnish cohort studies link frequent sauna use (4 to 7 times a week) to substantially lower cardiovascular and all-cause mortality, and randomised trials show acute blood-pressure reductions. Because the mortality data are observational, they show association, not proven cause.",
    },
    {
      q: "How often and how long?",
      a: "The cohort benefits were largest at 4 to 7 sessions a week of roughly 15 to 20 minutes at typical Finnish sauna temperatures (around 80°C). More was associated with more benefit in the data, but hydration and individual tolerance set practical limits.",
    },
    {
      q: "Is infrared as good as a traditional sauna?",
      a: "Not established. The strong cardiovascular and mortality evidence comes from traditional Finnish saunas; infrared has a smaller, more condition-specific research base. Don't assume findings from traditional saunas transfer directly to infrared.",
    },
    {
      q: "Does sauna 'detox' the body or burn meaningful fat?",
      a: "No. Detox claims are marketing, since your liver and kidneys handle that, and the weight lost in a session is water that returns on rehydration. The credible benefits are cardiovascular and relaxation-related, not detox or fat loss.",
    },
  ],
  sources: [
    {
      label:
        "Laukkanen T, et al. Association between sauna bathing and fatal cardiovascular and all-cause mortality events. JAMA Intern Med 2015;175:542-548",
      url: "https://pubmed.ncbi.nlm.nih.gov/25705824/",
    },
    {
      label:
        "Laukkanen JA, Laukkanen T, Kunutsor SK. Cardiovascular and other health benefits of sauna bathing: a review of the evidence. Mayo Clin Proc 2018;93:1111-1121",
      url: "https://www.mayoclinicproceedings.org/article/s0025-6196(18)30275-1/fulltext",
    },
  ],
  satellites: [
    {
      slug: "sauna-benefits",
      clusterSlug: "sauna-therapy",
      kind: "authority",
      title: "Sauna Benefits: What the Evidence Actually Says",
      metaDescription:
        "An evidence-tiered review of sauna benefits: cardiovascular and mortality associations, blood pressure, recovery and relaxation, clearly separating well-supported effects from detox and weight-loss marketing.",
      valueLine: "Sauna's health claims, sorted by evidence, including its unusually strong cardiovascular data.",
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
      title: "Choosing a Home Sauna: Traditional vs Infrared, and What Matters",
      metaDescription:
        "How to choose a home sauna: traditional vs infrared (and why the evidence differs), heater type, size, wiring and cost, with an honest note on which evidence applies to which.",
      valueLine: "How to choose a home sauna, and why the type you pick changes which evidence applies.",
      faq: [
        {
          q: "Traditional or infrared for home use?",
          a: "If you're buying for the well-evidenced cardiovascular and blood-pressure benefits, traditional (hot, higher-temperature) saunas are what those studies used. Infrared runs cooler and is gentler and cheaper to run, but its evidence base is smaller and more condition-specific, making it a reasonable choice for comfort, less so if you're chasing the Finnish-cohort findings.",
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

const compression: RecoveryCluster = {
  slug: "compression-therapy",
  title: "Compression Boots: Benefits, Evidence and How to Use Them",
  pillarValueLine:
    "What pneumatic compression boots actually do for recovery, the real effects versus the marketing.",
  metaDescription:
    "An evidence-tiered guide to pneumatic compression boots: what the research supports for recovery and soreness, what it doesn't, who should be cautious, and how to use them.",
  safety: {
    title: "Compression therapy safety",
    points: [
      "Avoid if you have or are at risk of a blood clot (DVT), serious circulation problems, or an active leg injury or infection, because squeezing the leg could be harmful.",
      "Stop if you get numbness, tingling or pain, and don't use over open wounds.",
      "Consult a doctor first if you have any vascular condition, are pregnant, or have any doubt.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Do compression boots aid recovery?",
      a: "The best-supported effect is on how recovered you feel and on reducing muscle soreness after hard exercise. Whether they meaningfully improve next-day performance is far less clear, and the effect sizes are modest.",
    },
    {
      q: "How do they work?",
      a: "They inflate in a sequence to squeeze the legs, which is thought to help move fluid and blood flow. The medical version of this (for conditions like lymphoedema) is well established; the athletic-recovery use is a different, weaker evidence base.",
    },
    {
      q: "Are they worth the money?",
      a: "They're a convenience and a 'feel-good' recovery tool rather than a proven performance booster. Gentle movement, sleep and nutrition do more for recovery, and cost nothing.",
    },
    {
      q: "How long should I use them?",
      a: "Typical sessions are 15 to 30 minutes at a comfortable pressure. More isn't necessarily better, and there's no strong evidence for a precise protocol.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: intermittent pneumatic compression and exercise recovery / delayed-onset muscle soreness (trials and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+pneumatic+compression+exercise+recovery",
    },
  ],
  satellites: [],
};

const massageGuns: RecoveryCluster = {
  slug: "massage-guns",
  title: "Massage Guns (Percussive Therapy): What the Evidence Says",
  pillarValueLine:
    "What percussive massage devices do for soreness and range of motion, and what they don't.",
  metaDescription:
    "An evidence-tiered guide to massage guns: the preliminary evidence for short-term range of motion and soreness relief, the overblown claims, and how to use one safely.",
  safety: {
    title: "Massage gun safety",
    points: [
      "Keep them on muscle. Avoid bones, joints, the neck/throat, the spine, nerves and any injured, bruised or inflamed area.",
      "Don't use over numbness, recent injuries, blood clots or if you're on blood thinners without medical advice.",
      "Keep sessions short and pressure moderate, because more force and time is not better, and can bruise.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Do massage guns work?",
      a: "For a short-term increase in range of motion and some relief of muscle soreness, the evidence is modest but real. As a way to feel looser and more recovered before or after training, they're reasonable, just don't expect performance gains.",
    },
    {
      q: "Do they improve performance or build muscle?",
      a: "No. There's no good evidence that percussive therapy boosts strength, speed or muscle growth. Its role is comfort and short-term mobility, not adaptation.",
    },
    {
      q: "Before or after training?",
      a: "Brief use before can aid warm-up mobility without the strength loss long static stretching can cause; after, it may ease soreness. Both are low-stakes.",
    },
    {
      q: "How long should I use it?",
      a: "Short bouts of roughly 1 to 2 minutes per muscle are plenty. Prolonged, aggressive use risks bruising and offers no extra benefit.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: percussive / vibration massage therapy, range of motion and muscle soreness (trials and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=percussive+massage+therapy+range+of+motion+soreness",
    },
  ],
  satellites: [],
};

const redLight: RecoveryCluster = {
  slug: "red-light-therapy",
  title: "Red Light Therapy (Photobiomodulation): Benefits and Evidence",
  pillarValueLine:
    "What red and near-infrared light therapy is claimed to do, and where the evidence actually stands.",
  metaDescription:
    "An evidence-tiered guide to red light therapy (photobiomodulation): the preliminary and mixed evidence for recovery, skin and muscle, the marketing claims to ignore, and safety.",
  safety: {
    title: "Red light therapy safety",
    points: [
      "Protect your eyes, so don't stare into the light source; use goggles for facial or near-eye use.",
      "It is generally low-risk on skin, but stop if you get irritation, and be cautious if you take photosensitising medication or have a light-sensitive condition.",
      "Devices vary widely in power and quality; follow the manufacturer's distance and time guidance.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Does red light therapy work?",
      a: "It's genuinely being researched, with preliminary and mixed evidence for muscle recovery, some skin outcomes and pain. It's one of the more plausible 'light' treatments, but the evidence is early and the consumer market overpromises.",
    },
    {
      q: "What are the credible uses?",
      a: "The better-studied areas are skin (wrinkles, some healing) and short-term muscle recovery/soreness. Even there, results are inconsistent and depend heavily on dose and device.",
    },
    {
      q: "What claims should I ignore?",
      a: "Sweeping promises of fat loss, anti-ageing across the whole body, or dramatic performance gains run well ahead of the evidence.",
    },
    {
      q: "Do cheap panels work like the studies?",
      a: "Not necessarily. Wavelength, power output and distance matter a lot, and inexpensive devices may not deliver a dose comparable to research equipment.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: photobiomodulation and red light therapy for muscle recovery, skin and performance (trials and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=photobiomodulation+red+light+therapy+muscle+recovery+OR+skin",
    },
  ],
  satellites: [],
};

const sleepEnvironment: RecoveryCluster = {
  slug: "sleep-environment",
  title: "Optimising Your Sleep Environment: Temperature, Light and Sound",
  pillarValueLine:
    "The bedroom factors that genuinely affect sleep, and the gadgets that mostly don't.",
  metaDescription:
    "An evidence-based guide to your sleep environment: the well-supported basics (cool, dark, quiet), what the research says about temperature and light, and which gadgets are hype.",
  safety: {
    title: "Sleep safety",
    points: [
      "Persistent poor sleep, loud snoring or gasping, or daytime exhaustion can signal a treatable sleep disorder, so see a doctor rather than relying on gadgets.",
      "This is general information about your environment, not treatment for insomnia or a sleep disorder.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "What actually matters for sleep environment?",
      a: "The well-supported basics: a cool room, darkness, and quiet. Your body lowers its core temperature to sleep, so a slightly cool room (often cited around 16 to 19°C) and light control are the highest-value changes.",
    },
    {
      q: "Does room temperature really matter?",
      a: "Yes. Temperature is one of the better-supported environmental factors. Too warm a room is a common, fixable cause of restless sleep.",
    },
    {
      q: "Are sleep gadgets worth it?",
      a: "Most are preliminary at best. Blackout, quiet and a cool room deliver the reliable wins; cooling mattresses, trackers and the like are optional extras, not fundamentals.",
    },
    {
      q: "What about light at night?",
      a: "Darkness supports melatonin and sleep; bright light, especially in the hours before bed, works against it. Reducing evening light and blocking morning light where needed both help.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: bedroom environment and the effects of ambient temperature, light and noise on sleep (reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+environment+temperature+light+noise+review",
    },
  ],
  satellites: [],
};

const breathwork: RecoveryCluster = {
  slug: "breathwork",
  title: "Breathwork for Recovery and Stress: What the Evidence Shows",
  pillarValueLine:
    "What breathing techniques can and can't do for stress, recovery and focus, honestly assessed.",
  metaDescription:
    "An evidence-tiered guide to breathwork: the reasonable evidence for slow breathing and acute stress relief, the overblown claims, and important safety limits.",
  safety: {
    title: "Breathwork safety",
    points: [
      "Never do breath-holds or hyperventilation-style techniques (e.g. Wim Hof) in or near water, while driving, or standing, because fainting can cause drowning or injury. Do them seated or lying down.",
      "Intense hyperventilation methods can cause dizziness, tingling and blackouts. Be cautious with heart or lung conditions, epilepsy, high blood pressure or pregnancy, and seek medical advice first.",
      "Gentle slow breathing is low-risk for most people; stop any technique that makes you feel unwell.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Does breathwork reduce stress?",
      a: "Slow, controlled breathing (around six breaths a minute) has reasonable evidence for acutely calming the nervous system, lowering stress and nudging heart-rate variability. It's a genuinely useful, free tool for in-the-moment stress.",
    },
    {
      q: "What about the more extreme methods?",
      a: "Intense hyperventilation-and-hold methods (such as the Wim Hof method) have some preliminary research and passionate advocates, but the evidence for lasting benefits is early, and the safety cautions above are important.",
    },
    {
      q: "Can it help recovery or sleep?",
      a: "Slow breathing before bed or after training can aid relaxation, which supports winding down. Treat it as a relaxation aid rather than a proven recovery accelerator.",
    },
    {
      q: "How long do I need to do it?",
      a: "Even a few minutes of slow breathing can shift how you feel. Consistency matters more than long sessions.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: slow-paced breathing and breathwork for stress, heart-rate variability and wellbeing (trials and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=slow+breathing+breathwork+stress+heart+rate+variability",
    },
  ],
  satellites: [],
};

const foamRolling: RecoveryCluster = {
  slug: "foam-rolling",
  title: "Foam Rolling & Mobility: Benefits and Limits",
  pillarValueLine:
    "What foam rolling actually does for mobility and soreness, and the myths worth dropping.",
  metaDescription:
    "An evidence-tiered guide to foam rolling: the real short-term benefits for range of motion and soreness, the myths about 'breaking up' fascia, and how to use it well.",
  safety: {
    title: "Foam rolling safety",
    points: [
      "Roll muscle, not joints or bone. Avoid rolling directly over the lower back (spine), the neck, the front of the knee, or any injured or inflamed area.",
      "Ease off if you get sharp pain, numbness or tingling. Some discomfort is normal, pain is not.",
      "Keep pressure moderate; grinding hard on a spot offers no extra benefit.",
    ],
  },
  lastReviewed: "2026-07-22",
  faq: [
    {
      q: "Does foam rolling work?",
      a: "For a short-term increase in range of motion, without the temporary strength loss long static stretching can cause, and for modestly easing muscle soreness, yes. Those short-term effects are its real, evidence-based value.",
    },
    {
      q: "Does it 'break up' fascia or knots?",
      a: "No. The popular idea that rolling physically breaks up fascia or 'knots' isn't supported; the effects are more likely neural (changing how tight a muscle feels) and short-lived.",
    },
    {
      q: "Does it improve long-term flexibility?",
      a: "The range-of-motion boost is mostly acute. For lasting flexibility, regular mobility and strength work through a full range does more than rolling alone.",
    },
    {
      q: "When should I foam roll?",
      a: "It works well as part of a warm-up to feel looser, or afterwards for soreness. A minute or so per muscle is plenty.",
    },
  ],
  sources: [
    {
      label:
        "PubMed: foam rolling and self-myofascial release for range of motion and muscle soreness (trials and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=foam+rolling+self-myofascial+release+range+of+motion+soreness",
    },
  ],
  satellites: [],
};

export const recoveryClusters: RecoveryCluster[] = [
  coldWater,
  sauna,
  compression,
  massageGuns,
  redLight,
  sleepEnvironment,
  breathwork,
  foamRolling,
];

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
