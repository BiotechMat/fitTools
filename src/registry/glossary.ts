/**
 * Glossary / explainers (CONTENT-reference.md §6). One short definitional page
 * per term — the site's internal-linking backbone: every tool and article links
 * its jargon here, and each term links back out to the relevant calculator(s)
 * and related terms. Structured data (not MDX) keeps 20+ short entries
 * maintainable and lets the template wire cross-links automatically.
 *
 * Same single-source-of-truth pattern as the tool, peptide and recovery-content
 * registries: this drives routing, the /glossary hub, sitemap, JSON-LD and the
 * reciprocal cross-links.
 */

import type { Source } from "@/registry/types";

export interface GlossaryEntry {
  slug: string;
  term: string;
  /** Abbreviations or alternate names, shown after the term. */
  aka?: string[];
  /** One-line definition — used in the hub list and meta description. */
  short: string;
  /** Body paragraphs: definition → why it matters → how it's used. */
  body: string[];
  /** Related glossary slugs (validated to exist). */
  relatedTerms: string[];
  /** Related tool slugs (validated to exist in the tool registry). */
  relatedTools: string[];
  sources?: Source[];
}

export const GLOSSARY_LAST_REVIEWED = "2026-07-22";

export const glossaryEntries: GlossaryEntry[] = [
  {
    slug: "hypertrophy",
    term: "Hypertrophy",
    short: "The growth of muscle fibres in size, the goal of most physique training.",
    body: [
      "Hypertrophy is the increase in the cross-sectional size of muscle fibres in response to training. It is distinct from gaining strength (a largely neural adaptation) or gaining weight generally — it specifically means bigger muscle tissue.",
      "It matters because muscle size underpins a lean, strong physique and supports metabolic health and healthy ageing. Training for it is driven mainly by mechanical tension, sufficient training volume applied through progressive overload, and adequate protein and energy to build new tissue.",
      "In practice, hypertrophy training usually means moderate-to-higher rep sets (often ~6–15) taken close to failure, enough weekly sets per muscle, and gradual load or rep increases over time.",
    ],
    relatedTerms: ["mechanical-tension", "progressive-overload", "volume", "protein-synthesis"],
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
  },
  {
    slug: "progressive-overload",
    term: "Progressive overload",
    short: "Gradually increasing the demand on a muscle over time so it keeps adapting.",
    body: [
      "Progressive overload is the principle that, to keep improving, you must gradually increase the stress placed on the body — most commonly by adding weight or reps, but also through more sets, better range of motion, or reduced rest.",
      "It matters because the body adapts to a given stimulus and then stops changing; without a progressive increase, progress stalls. It is the single most important principle behind getting stronger or bigger.",
      "In practice, it is applied by tracking your lifts and beating a previous session — an extra rep, a little more load — in a structured way rather than adding weight randomly.",
    ],
    relatedTerms: ["hypertrophy", "volume", "deload", "periodisation", "one-rep-max"],
    relatedTools: ["double-progression-planner", "training-volume-calculator"],
  },
  {
    slug: "rpe",
    term: "RPE",
    aka: ["Rate of Perceived Exertion"],
    short: "A 1–10 scale for how hard a set felt, used to regulate training intensity.",
    body: [
      "RPE (Rate of Perceived Exertion) rates how hard an effort felt on a scale, most commonly 1–10 in lifting. An RPE of 10 means maximal — no more reps possible; an RPE of 8 means roughly two reps were left in reserve.",
      "It matters because it lets you regulate intensity by feel on the day, accounting for fatigue, sleep and stress, rather than rigidly chasing a fixed number when your body isn't up to it.",
      "In lifting, RPE is closely related to reps in reserve (RIR): RPE 10 ≈ 0 RIR, RPE 9 ≈ 1 RIR, and so on.",
    ],
    relatedTerms: ["rir", "progressive-overload", "one-rep-max"],
    relatedTools: ["double-progression-planner", "one-rep-max-calculator"],
  },
  {
    slug: "rir",
    term: "RIR",
    aka: ["Reps in Reserve"],
    short: "How many more reps you could have done — a way to gauge proximity to failure.",
    body: [
      "RIR (Reps in Reserve) is the number of additional reps you could have completed at the end of a set before hitting failure. Stopping a set at 2 RIR means you could have done two more.",
      "It matters because training close to — but not always at — failure is effective for growth while managing fatigue. RIR gives a practical target for how hard to push each set.",
      "It is the mirror image of RPE: 0 RIR corresponds to RPE 10 (true failure), 2 RIR to RPE 8, and so on.",
    ],
    relatedTerms: ["rpe", "progressive-overload", "volume"],
    relatedTools: ["double-progression-planner"],
  },
  {
    slug: "one-rep-max",
    term: "One-rep max",
    aka: ["1RM"],
    short: "The most weight you can lift for a single rep of an exercise.",
    body: [
      "Your one-rep max (1RM) is the heaviest load you can lift once with good form on a given exercise. It is the standard reference point for strength and for setting training loads as a percentage.",
      "It matters because many programmes prescribe intensity as a percentage of 1RM, and it lets you compare strength over time or against standards. You rarely need to test it directly — it can be estimated from a set taken close to failure.",
      "In practice, an estimated 1RM from a submaximal set (using a formula such as Epley or Brzycki) is safer and nearly as useful as a true max attempt.",
    ],
    relatedTerms: ["rpe", "progressive-overload", "hypertrophy"],
    relatedTools: ["one-rep-max-calculator", "strength-standards"],
  },
  {
    slug: "volume",
    term: "Training volume",
    short: "The total amount of work done, often counted as hard sets per muscle per week.",
    body: [
      "Training volume is the total quantity of work performed. It can be measured as tonnage (sets × reps × load), but for muscle growth it is most usefully counted as the number of hard sets per muscle group per week.",
      "It matters because volume is a primary driver of hypertrophy: within a sensible range, more hard sets tend to produce more growth, up to a point of diminishing returns and recoverability.",
      "In practice, many lifters grow well on roughly 10–20 hard sets per muscle per week, adjusted to individual recovery.",
    ],
    relatedTerms: ["hypertrophy", "progressive-overload", "mechanical-tension", "deload"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "mechanical-tension",
    term: "Mechanical tension",
    short: "The force a muscle produces under load — the primary driver of muscle growth.",
    body: [
      "Mechanical tension is the force generated within a muscle as it contracts against resistance. Sensed by the muscle's mechanoreceptors, it is considered the principal stimulus that triggers the signalling for muscle growth.",
      "It matters because it reframes what makes training effective: not simply feeling a pump or fatigue, but producing high tension through challenging loads and full range of motion across enough hard sets.",
      "In practice, tension is maximised by lifting appreciable loads with control, especially through the lengthened portion of a movement, and taking sets reasonably close to failure.",
    ],
    relatedTerms: ["hypertrophy", "volume", "progressive-overload"],
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
  },
  {
    slug: "tdee",
    term: "TDEE",
    aka: ["Total Daily Energy Expenditure"],
    short: "The total calories you burn in a day, from all activity and metabolism.",
    body: [
      "TDEE (Total Daily Energy Expenditure) is the total number of calories your body uses in a day. It is the sum of your basal metabolic rate, the energy cost of digesting food, deliberate exercise, and all your other daily movement (NEAT).",
      "It matters because it is the anchor for any nutrition goal: eating below your TDEE drives fat loss, above it supports muscle gain and weight gain, and around it maintains weight.",
      "In practice, TDEE is estimated by calculating BMR and multiplying by an activity factor, then adjusted based on real-world weight change over a few weeks.",
    ],
    relatedTerms: ["bmr", "neat", "energy-balance"],
    relatedTools: ["tdee-calculator", "calorie-deficit-calculator"],
  },
  {
    slug: "bmr",
    term: "BMR",
    aka: ["Basal Metabolic Rate"],
    short: "The calories your body burns at complete rest just to stay alive.",
    body: [
      "BMR (Basal Metabolic Rate) is the energy your body uses at complete rest to maintain vital functions — breathing, circulation, cell repair and organ function. It is the largest single component of most people's daily energy use.",
      "It matters because it forms the base of your TDEE and explains why larger and more muscular people burn more calories at rest. Crash dieting can lower it, which is one reason very aggressive cuts backfire.",
      "In practice, BMR is estimated from equations such as Mifflin–St Jeor using your age, sex, height and weight.",
    ],
    relatedTerms: ["tdee", "neat", "energy-balance"],
    relatedTools: ["bmr-calculator", "tdee-calculator"],
  },
  {
    slug: "neat",
    term: "NEAT",
    aka: ["Non-Exercise Activity Thermogenesis"],
    short: "Calories burned through everyday movement outside of formal exercise.",
    body: [
      "NEAT (Non-Exercise Activity Thermogenesis) is the energy you spend on all movement that isn't deliberate exercise — walking, fidgeting, standing, household tasks and general daily activity.",
      "It matters because NEAT varies enormously between people and can change a lot during dieting: the body often unconsciously reduces spontaneous movement when calories are low, blunting fat loss. It is often larger than the calories burned in the gym.",
      "In practice, keeping daily steps up is the simplest lever for maintaining NEAT during a diet.",
    ],
    relatedTerms: ["tdee", "bmr", "energy-balance"],
    relatedTools: ["steps-to-calories-calculator", "tdee-calculator"],
  },
  {
    slug: "energy-balance",
    term: "Energy balance",
    short: "The relationship between calories consumed and calories expended.",
    body: [
      "Energy balance is the difference between the calories you take in from food and drink and the calories you expend. A negative balance (a deficit) leads to weight loss; a positive balance (a surplus) to weight gain; and matching the two maintains weight.",
      "It matters because it is the fundamental principle governing body-weight change. Diet composition, food quality and hormones influence hunger, adherence and body composition, but they operate within this energy-balance framework.",
      "In practice, you create the balance you want by estimating your TDEE and setting intake above or below it for your goal.",
    ],
    relatedTerms: ["tdee", "bmr", "neat"],
    relatedTools: ["calorie-deficit-calculator", "tdee-calculator"],
  },
  {
    slug: "protein-synthesis",
    term: "Muscle protein synthesis",
    aka: ["MPS"],
    short: "The process of building new muscle protein, stimulated by training and protein intake.",
    body: [
      "Muscle protein synthesis (MPS) is the process by which the body builds new muscle protein. Muscle is in constant turnover between synthesis and breakdown; net growth happens when synthesis outpaces breakdown over time.",
      "It matters because resistance training and eating protein both raise MPS, and the balance of synthesis over breakdown across days and weeks is what determines whether you gain muscle.",
      "In practice, spreading adequate protein across the day and training each muscle regularly keeps MPS elevated and supports growth.",
    ],
    relatedTerms: ["hypertrophy", "energy-balance"],
    relatedTools: ["macro-calculator"],
  },
  {
    slug: "vo2max",
    term: "VO₂max",
    short: "The maximum rate at which your body can use oxygen — a key marker of aerobic fitness.",
    body: [
      "VO₂max is the maximum volume of oxygen your body can take in and use per minute during intense exercise, usually expressed relative to body weight (mL/kg/min). It reflects the capacity of your heart, lungs and muscles to deliver and use oxygen.",
      "It matters because it is one of the strongest single markers of cardiorespiratory fitness, and higher values are robustly associated with lower mortality and better healthspan.",
      "In practice, VO₂max is measured precisely in a lab, estimated by fitness watches, or improved through a mix of higher-intensity intervals and steady aerobic work.",
    ],
    relatedTerms: ["zone-2", "lactate-threshold", "hrv"],
    relatedTools: ["heart-rate-zone-calculator", "race-time-predictor"],
  },
  {
    slug: "hrv",
    term: "HRV",
    aka: ["Heart Rate Variability"],
    short: "The variation in time between heartbeats, used as a readiness and recovery signal.",
    body: [
      "HRV (Heart Rate Variability) is the natural variation in the time interval between consecutive heartbeats. Higher variability generally reflects a well-recovered, parasympathetically-dominant state; a sharp drop can signal stress, illness or incomplete recovery.",
      "It matters because tracked against your own baseline, HRV is a useful daily readiness signal — but it is highly individual, so absolute values are best compared only to yourself.",
      "In practice, HRV is measured overnight or on waking by wearables and chest straps, and interpreted as a trend rather than a single number.",
    ],
    relatedTerms: ["vo2max", "insulin-sensitivity"],
    relatedTools: ["recovery-readiness-index"],
  },
  {
    slug: "zone-2",
    term: "Zone 2",
    short: "A moderate aerobic intensity you can sustain while holding a conversation.",
    body: [
      "Zone 2 is a training intensity roughly corresponding to the second of five heart-rate zones — comfortably aerobic, at an effort where you can still hold a conversation, below the point where lactate begins to accumulate rapidly.",
      "It matters because large volumes of Zone 2 work build aerobic base, improve fat oxidation and mitochondrial function, and can be recovered from easily, making it a cornerstone of endurance training.",
      "In practice, Zone 2 is estimated from heart-rate zones or the talk test, and forms the bulk of most well-structured endurance programmes.",
    ],
    relatedTerms: ["vo2max", "lactate-threshold"],
    relatedTools: ["heart-rate-zone-calculator"],
  },
  {
    slug: "lactate-threshold",
    term: "Lactate threshold",
    short: "The intensity above which lactate accumulates faster than the body can clear it.",
    body: [
      "The lactate threshold is the exercise intensity at which blood lactate begins to rise sharply, because production outpaces clearance. Above it, effort becomes unsustainable relatively quickly.",
      "It matters because it is a strong predictor of endurance performance — often more so than VO₂max among trained athletes — and marks the boundary between comfortably-hard and unsustainable pacing.",
      "In practice, threshold pace or heart rate anchors interval and tempo training, and improving it lets you hold a faster pace for longer.",
    ],
    relatedTerms: ["zone-2", "vo2max"],
    relatedTools: ["heart-rate-zone-calculator", "running-pace-calculator"],
  },
  {
    slug: "apob",
    term: "ApoB",
    aka: ["Apolipoprotein B"],
    short: "A marker of the number of atherogenic particles in your blood.",
    body: [
      "ApoB (apolipoprotein B) is a protein found on the potentially artery-clogging (atherogenic) lipoprotein particles in your blood — chiefly LDL. Because there is one ApoB molecule per particle, measuring it counts those particles directly.",
      "It matters because the number of atherogenic particles can be a more precise indicator of cardiovascular risk than standard LDL cholesterol alone, particularly when LDL looks reassuring but particle number is high.",
      "In practice, ApoB is a simple blood test increasingly recommended for refining risk; a lower level is generally more favourable, with targets set by overall risk.",
    ],
    relatedTerms: ["lp-a", "insulin-sensitivity"],
    relatedTools: ["heart-age-calculator", "phenotypic-age-calculator"],
    sources: [
      {
        label:
          "American College of Cardiology. An Update on Lipoprotein(a) and ApoB, 2023 (context on ApoB in risk assessment)",
        url: "https://www.acc.org/Latest-in-Cardiology/Articles/2023/09/19/10/54/An-Update-on-Lipoprotein-a",
      },
    ],
  },
  {
    slug: "lp-a",
    term: "Lp(a)",
    aka: ["Lipoprotein(a)"],
    short: "A largely genetic, independent risk factor for cardiovascular disease.",
    body: [
      "Lipoprotein(a), or Lp(a), is an LDL-like particle with an extra protein attached. Its level is roughly 80–90% genetically determined and stays fairly stable through life, largely unaffected by diet or lifestyle.",
      "It matters because a high Lp(a) is an independent, causal risk factor for heart attack and stroke — and because it is inherited, one measurement can flag lifelong elevated risk that standard cholesterol testing misses.",
      "In practice, guidelines increasingly recommend measuring Lp(a) at least once in adulthood; levels at or above about 125 nmol/L (≈50 mg/dL) are considered high risk.",
    ],
    relatedTerms: ["apob"],
    relatedTools: ["heart-age-calculator"],
    sources: [
      {
        label:
          "Koschinsky ML, et al. A focused update to the 2019 NLA scientific statement on use of lipoprotein(a) in clinical practice. J Clin Lipidol 2024",
        url: "https://www.lipidjournal.com/article/S1933-2874(24)00033-3/fulltext",
      },
    ],
  },
  {
    slug: "autophagy",
    term: "Autophagy",
    short: "The cell's recycling process that clears and reuses damaged components.",
    body: [
      "Autophagy (literally 'self-eating') is a housekeeping process in which cells break down and recycle their own damaged or unneeded components. It is a normal, continuous part of cellular maintenance.",
      "It matters because it is central to cellular quality control and has been linked, largely in animal studies, to healthy ageing. It is often invoked in discussions of fasting, though the human evidence for deliberately maximising it is still preliminary.",
      "In practice, claims that specific fasting protocols reliably 'switch on' beneficial autophagy in humans run ahead of the evidence and should be treated cautiously.",
    ],
    relatedTerms: ["insulin-sensitivity"],
    relatedTools: [],
  },
  {
    slug: "insulin-sensitivity",
    term: "Insulin sensitivity",
    short: "How responsive your cells are to insulin — central to metabolic health.",
    body: [
      "Insulin sensitivity describes how effectively your cells respond to insulin to take up glucose from the blood. High sensitivity means less insulin is needed to manage blood sugar; low sensitivity (insulin resistance) is the opposite.",
      "It matters because insulin resistance is an early step toward type 2 diabetes and is linked to broader metabolic and cardiovascular risk. Improving sensitivity is one of the most valuable metabolic health goals.",
      "In practice, regular exercise, muscle mass, good sleep and avoiding chronic energy surplus all tend to improve insulin sensitivity; markers include fasting glucose and continuous glucose patterns.",
    ],
    relatedTerms: ["hrv", "apob", "autophagy"],
    relatedTools: ["cgm-metrics-calculator", "metabolic-fitness-index"],
  },
  {
    slug: "doms",
    term: "DOMS",
    aka: ["Delayed-Onset Muscle Soreness"],
    short: "The muscle soreness that appears a day or two after unfamiliar or hard exercise.",
    body: [
      "DOMS (Delayed-Onset Muscle Soreness) is the muscle pain and stiffness that peaks roughly 24–72 hours after exercise, especially after unaccustomed training or a lot of lengthening (eccentric) work.",
      "It matters mainly as a point of confusion: DOMS is not a reliable measure of a workout's effectiveness, and its absence does not mean a session was wasted. Soreness reflects novelty and damage more than growth stimulus.",
      "In practice, DOMS fades as you adapt to a movement; managing it is about sensible progression rather than chasing or avoiding soreness.",
    ],
    relatedTerms: ["hypertrophy", "deload", "progressive-overload"],
    relatedTools: [],
  },
  {
    slug: "deload",
    term: "Deload",
    short: "A planned easier period to shed fatigue and allow recovery.",
    body: [
      "A deload is a short, deliberate reduction in training stress — lighter loads, fewer sets, or lower intensity — usually lasting about a week, taken to let accumulated fatigue dissipate.",
      "It matters because training hard indefinitely accumulates fatigue that masks fitness and raises injury risk; a well-timed deload lets adaptations surface and keeps long-term progress on track.",
      "In practice, deloads are scheduled periodically or taken when performance, sleep or motivation dip, and are a normal part of structured programming.",
    ],
    relatedTerms: ["periodisation", "progressive-overload", "volume"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "periodisation",
    term: "Periodisation",
    short: "Structuring training into phases to manage fatigue and peak performance.",
    body: [
      "Periodisation is the planned variation of training variables — volume, intensity and focus — across weeks and months, organised into phases so that fatigue is managed and progress is directed toward a goal.",
      "It matters because it turns training from random hard sessions into a coherent plan: building work capacity, then intensity, then recovering and peaking, rather than grinding at one setting until you stall.",
      "In practice, even simple periodisation — alternating harder and easier blocks and including deloads — outperforms doing the same thing every week indefinitely.",
    ],
    relatedTerms: ["deload", "progressive-overload", "volume"],
    relatedTools: ["double-progression-planner", "training-volume-calculator"],
  },
];

export const glossaryBySlug: ReadonlyMap<string, GlossaryEntry> = new Map(
  glossaryEntries.map((e) => [e.slug, e]),
);

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return glossaryBySlug.get(slug);
}

/** Entries sorted alphabetically by term, for the hub A–Z listing. */
export function glossaryAlphabetical(): GlossaryEntry[] {
  return [...glossaryEntries].sort((a, b) => a.term.localeCompare(b.term, "en-GB"));
}

/** Resolve related glossary slugs to their entries (skips any that don't exist). */
export function resolveRelatedTerms(slugs: string[]): GlossaryEntry[] {
  return slugs.flatMap((slug) => {
    const entry = glossaryBySlug.get(slug);
    return entry ? [entry] : [];
  });
}
