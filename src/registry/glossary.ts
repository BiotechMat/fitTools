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

export const GLOSSARY_LAST_REVIEWED = "2026-07-23";

export const glossaryEntries: GlossaryEntry[] = [
  {
    slug: "hypertrophy",
    term: "Hypertrophy",
    short: "The growth of muscle fibres in size, the goal of most physique training.",
    body: [
      "Hypertrophy is the increase in the cross-sectional size of muscle fibres in response to training. It is distinct from gaining strength (a largely neural adaptation) or gaining weight generally, because it specifically means bigger muscle tissue.",
      "It matters because muscle size underpins a lean, strong physique and supports metabolic health and healthy ageing. Training for it is driven mainly by mechanical tension, sufficient training volume applied through progressive overload, and adequate protein and energy to build new tissue.",
      "In practice, hypertrophy training usually means moderate-to-higher rep sets (often ~6 to 15) taken close to failure, enough weekly sets per muscle, and gradual load or rep increases over time.",
    ],
    relatedTerms: ["mechanical-tension", "progressive-overload", "volume", "protein-synthesis"],
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
  },
  {
    slug: "progressive-overload",
    term: "Progressive overload",
    short: "Gradually increasing the demand on a muscle over time so it keeps adapting.",
    body: [
      "Progressive overload is the principle that, to keep improving, you must gradually increase the stress placed on the body, most commonly by adding weight or reps, but also through more sets, better range of motion, or reduced rest.",
      "It matters because the body adapts to a given stimulus and then stops changing; without a progressive increase, progress stalls. It is the single most important principle behind getting stronger or bigger.",
      "In practice, it is applied by tracking your lifts and beating a previous session, whether that is an extra rep or a little more load, in a structured way rather than adding weight randomly.",
    ],
    relatedTerms: ["hypertrophy", "volume", "deload", "periodisation", "one-rep-max"],
    relatedTools: ["double-progression-planner", "training-volume-calculator"],
  },
  {
    slug: "rpe",
    term: "RPE",
    aka: ["Rate of Perceived Exertion"],
    short: "A 1 to 10 scale for how hard a set felt, used to regulate training intensity.",
    body: [
      "RPE (Rate of Perceived Exertion) rates how hard an effort felt on a scale, most commonly 1 to 10 in lifting. An RPE of 10 means maximal, with no more reps possible, while an RPE of 8 means roughly two reps were left in reserve.",
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
    short: "How many more reps you could have done, a way to gauge proximity to failure.",
    body: [
      "RIR (Reps in Reserve) is the number of additional reps you could have completed at the end of a set before hitting failure. Stopping a set at 2 RIR means you could have done two more.",
      "It matters because training close to failure, though not always at it, is effective for growth while managing fatigue. RIR gives a practical target for how hard to push each set.",
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
      "It matters because many programmes prescribe intensity as a percentage of 1RM, and it lets you compare strength over time or against standards. You rarely need to test it directly, because it can be estimated from a set taken close to failure.",
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
      "In practice, many lifters grow well on roughly 10 to 20 hard sets per muscle per week, adjusted to individual recovery.",
    ],
    relatedTerms: ["hypertrophy", "progressive-overload", "mechanical-tension", "deload"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "mechanical-tension",
    term: "Mechanical tension",
    short: "The force a muscle produces under load, the primary driver of muscle growth.",
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
      "BMR (Basal Metabolic Rate) is the energy your body uses at complete rest to maintain vital functions such as breathing, circulation, cell repair and organ function. It is the largest single component of most people's daily energy use.",
      "It matters because it forms the base of your TDEE and explains why larger and more muscular people burn more calories at rest. Crash dieting can lower it, which is one reason very aggressive cuts backfire.",
      "In practice, BMR is estimated from equations such as Mifflin-St Jeor using your age, sex, height and weight.",
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
      "NEAT (Non-Exercise Activity Thermogenesis) is the energy you spend on all movement that isn't deliberate exercise, such as walking, fidgeting, standing, household tasks and general daily activity.",
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
    short: "The maximum rate at which your body can use oxygen, a key marker of aerobic fitness.",
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
      "It matters because tracked against your own baseline, HRV is a useful daily readiness signal, but it is highly individual, so absolute values are best compared only to yourself.",
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
      "Zone 2 is a training intensity roughly corresponding to the second of five heart-rate zones, comfortably aerobic, at an effort where you can still hold a conversation, below the point where lactate begins to accumulate rapidly.",
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
      "It matters because it is a strong predictor of endurance performance, often more so than VO₂max among trained athletes, and marks the boundary between comfortably-hard and unsustainable pacing.",
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
      "ApoB (apolipoprotein B) is a protein found on the potentially artery-clogging (atherogenic) lipoprotein particles in your blood, chiefly LDL. Because there is one ApoB molecule per particle, measuring it counts those particles directly.",
      "It matters because the number of atherogenic particles can be a more precise indicator of cardiovascular risk than standard LDL cholesterol alone, particularly when LDL looks reassuring but particle number is high.",
      "In practice, ApoB is a simple blood test increasingly recommended for refining risk; a lower level is generally more favourable, with targets set by overall risk.",
    ],
    relatedTerms: ["lp-a", "ldl-cholesterol", "insulin-sensitivity"],
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
      "Lipoprotein(a), or Lp(a), is an LDL-like particle with an extra protein attached. Its level is roughly 80 to 90% genetically determined and stays fairly stable through life, largely unaffected by diet or lifestyle.",
      "It matters because a high Lp(a) is an independent, causal risk factor for heart attack and stroke, and because it is inherited, one measurement can flag lifelong elevated risk that standard cholesterol testing misses.",
      "In practice, guidelines increasingly recommend measuring Lp(a) at least once in adulthood; levels at or above about 125 nmol/L (≈50 mg/dL) are considered high risk.",
    ],
    relatedTerms: ["apob", "ldl-cholesterol"],
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
    short: "How responsive your cells are to insulin, central to metabolic health.",
    body: [
      "Insulin sensitivity describes how effectively your cells respond to insulin to take up glucose from the blood. High sensitivity means less insulin is needed to manage blood sugar; low sensitivity (insulin resistance) is the opposite.",
      "It matters because insulin resistance is an early step toward type 2 diabetes and is linked to broader metabolic and cardiovascular risk. Improving sensitivity is one of the most valuable metabolic health goals.",
      "In practice, regular exercise, muscle mass, good sleep and avoiding chronic energy surplus all tend to improve insulin sensitivity; markers include fasting glucose and continuous glucose patterns.",
    ],
    relatedTerms: ["hrv", "apob", "autophagy", "fasting-glucose", "hba1c"],
    relatedTools: ["cgm-metrics-calculator", "metabolic-fitness-index"],
  },
  {
    slug: "doms",
    term: "DOMS",
    aka: ["Delayed-Onset Muscle Soreness"],
    short: "The muscle soreness that appears a day or two after unfamiliar or hard exercise.",
    body: [
      "DOMS (Delayed-Onset Muscle Soreness) is the muscle pain and stiffness that peaks roughly 24 to 72 hours after exercise, especially after unaccustomed training or a lot of lengthening (eccentric) work.",
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
      "A deload is a short, deliberate reduction in training stress, such as lighter loads, fewer sets, or lower intensity, usually lasting about a week, taken to let accumulated fatigue dissipate.",
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
      "Periodisation is the planned variation of training variables such as volume, intensity and focus across weeks and months, organised into phases so that fatigue is managed and progress is directed toward a goal.",
      "It matters because it turns training from random hard sessions into a coherent plan: building work capacity, then intensity, then recovering and peaking, rather than grinding at one setting until you stall.",
      "In practice, even simple periodisation, such as alternating harder and easier blocks and including deloads, outperforms doing the same thing every week indefinitely.",
    ],
    relatedTerms: ["deload", "progressive-overload", "volume"],
    relatedTools: ["double-progression-planner", "training-volume-calculator"],
  },
  {
    slug: "concentric",
    term: "Concentric",
    aka: ["Concentric phase", "Lifting phase"],
    short: "The phase of a lift where the muscle shortens under load, the 'lifting' part.",
    body: [
      "The concentric phase is the part of a rep where the working muscle shortens as it overcomes the load, such as standing up out of a squat, pressing a bar up, or curling a dumbbell toward you.",
      "It matters because it is the phase most people think of as 'the lift', and it is typically where a rep fails: you can lower far more weight than you can raise. Understanding it helps you set loads and interpret why the sticking point of a lift is where it is.",
      "In practice, driving the concentric with intent, moving the load quickly even when it feels slow under heavy weight, is a common cue for strength and power, paired with a controlled lowering phase.",
    ],
    relatedTerms: ["eccentric", "isometric", "mechanical-tension"],
    relatedTools: ["one-rep-max-calculator"],
  },
  {
    slug: "eccentric",
    term: "Eccentric",
    aka: ["Eccentric phase", "Negative"],
    short: "The phase of a lift where the muscle lengthens under load, the 'lowering' part.",
    body: [
      "The eccentric phase is the part of a rep where the muscle produces force while lengthening, such as lowering into a squat, letting a bar down to your chest, or the descent of a curl. It is often called the 'negative'.",
      "It matters because muscles are strongest eccentrically, the eccentric contributes heavily to the growth stimulus, and it is the main driver of the muscle damage behind next-day soreness. Controlling it rather than dropping the weight is where much of a set's value lies.",
      "In practice, lifters emphasise the eccentric by lowering under control over a couple of seconds; deliberately slow or overloaded eccentrics are a common tool for hypertrophy and tendon work.",
    ],
    relatedTerms: ["concentric", "isometric", "doms", "hypertrophy"],
    relatedTools: ["one-rep-max-calculator"],
  },
  {
    slug: "isometric",
    term: "Isometric",
    aka: ["Isometric hold", "Static hold"],
    short: "A contraction where the muscle produces force without changing length.",
    body: [
      "An isometric contraction is one where the muscle generates tension but its length, and the joint angle, stays the same. Holding a plank, pausing at the bottom of a squat, or pushing against an immovable object are all isometrics.",
      "It matters because isometrics build strength strongly at the specific joint angle trained, are gentle on joints, and are useful for rehab, breaking through sticking points, and building positional strength and tendon stiffness.",
      "In practice, isometrics appear as paused reps, static holds, and 'overcoming' pushes against pins, and are often used where controlled loading is needed without movement.",
    ],
    relatedTerms: ["concentric", "eccentric", "mechanical-tension"],
    relatedTools: [],
  },
  {
    slug: "range-of-motion",
    term: "Range of motion",
    aka: ["ROM"],
    short: "How far a joint or lift travels through its full available movement.",
    body: [
      "Range of motion (ROM) is the extent of movement around a joint, or the distance a load travels during an exercise, from a full deep squat to a shallow partial, for example.",
      "It matters because training through a full range, especially the lengthened (stretched) portion of a movement, tends to produce more muscle growth than short partial reps, while also maintaining mobility. There are specific cases for partials, but full ROM is the sensible default.",
      "In practice, using a controlled full range you can actually stabilise, rather than bouncing through a range you can't own, is a reliable way to get more from each rep.",
    ],
    relatedTerms: ["hypertrophy", "mechanical-tension", "eccentric"],
    relatedTools: [],
  },
  {
    slug: "time-under-tension",
    term: "Time under tension",
    aka: ["TUT"],
    short: "The total time a muscle is loaded during a set.",
    body: [
      "Time under tension (TUT) is the cumulative time a muscle spends working during a set, a function of how many reps you do and how fast each phase moves.",
      "It matters as one way of thinking about the growth stimulus, but it is easy to overstate: deliberately grinding out super-slow reps increases TUT while forcing you to use much lighter loads, which can reduce the mechanical tension that actually drives growth. It is a description of a set, not a magic variable to maximise.",
      "In practice, a controlled tempo with a full range and a challenging load matters more than chasing a specific number of seconds under tension.",
    ],
    relatedTerms: ["mechanical-tension", "volume", "hypertrophy"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "training-to-failure",
    term: "Training to failure",
    aka: ["Muscular failure"],
    short: "Taking a set to the point where another good rep is impossible.",
    body: [
      "Training to failure means continuing a set until you cannot complete another rep with proper form (momentary muscular failure). It is the zero point of reps in reserve.",
      "It matters because how close you train to failure strongly influences the growth stimulus, but going all the way to failure on every set adds a lot of fatigue for little extra benefit and can compromise later sets. Most productive training happens a rep or two short of failure.",
      "In practice, many lifters reserve true failure for the last set of an exercise or for safer isolation movements, and use reps in reserve to stay close to the limit, though not always at it.",
    ],
    relatedTerms: ["rir", "rpe", "hypertrophy"],
    relatedTools: ["double-progression-planner"],
  },
  {
    slug: "compound-exercise",
    term: "Compound exercise",
    aka: ["Multi-joint exercise"],
    short: "An exercise that moves multiple joints and trains several muscles at once.",
    body: [
      "A compound exercise involves movement at more than one joint and recruits several muscle groups together, with squats, deadlifts, presses, rows and pull-ups as the classic examples.",
      "It matters because compounds let you load heavy, train a lot of muscle efficiently, and carry over well to real-world strength, which is why they usually form the backbone of a programme. They are the most time-effective way to build strength and muscle.",
      "In practice, most sessions lead with one or two compound lifts trained fairly heavy, with isolation work added around them to target specific muscles.",
    ],
    relatedTerms: ["isolation-exercise", "progressive-overload", "one-rep-max"],
    relatedTools: ["one-rep-max-calculator", "strength-standards"],
  },
  {
    slug: "isolation-exercise",
    term: "Isolation exercise",
    aka: ["Single-joint exercise"],
    short: "An exercise that moves a single joint to target one muscle.",
    body: [
      "An isolation exercise involves movement at just one joint and focuses the work on a single muscle, such as a biceps curl, a leg extension, or a lateral raise.",
      "It matters because isolation work lets you add targeted volume to a specific muscle, bring up a lagging area, or train a muscle the big compounds miss, with less overall fatigue than a heavy compound.",
      "In practice, isolation movements are typically used as accessories after the main compound lifts, often in higher rep ranges with strict form.",
    ],
    relatedTerms: ["compound-exercise", "hypertrophy", "volume"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "superset",
    term: "Superset",
    short: "Two exercises performed back to back with little or no rest between them.",
    body: [
      "A superset is a pairing of two exercises done one after the other with minimal rest. Pairing opposing muscles (like a push and a pull) is an antagonist superset; stacking two exercises for the same muscle is a common intensity technique.",
      "It matters mainly for efficiency: supersets pack more work into less time, which is useful when time is tight. Pairing non-competing movements lets each recover while the other works, with little performance cost.",
      "In practice, antagonist and unrelated pairings (for example calves with a core exercise) superset well; pairing two heavy compounds that fatigue the same muscles usually just reduces the load you can handle.",
    ],
    relatedTerms: ["volume", "time-under-tension", "isolation-exercise"],
    relatedTools: ["training-volume-calculator"],
  },
  {
    slug: "macronutrient",
    term: "Macronutrient",
    aka: ["Macros"],
    short: "The three energy-providing nutrients: protein, carbohydrate and fat.",
    body: [
      "Macronutrients, namely protein, carbohydrate and fat, are the nutrients the body needs in large amounts and which supply energy (calories). Alcohol also provides calories but isn't an essential nutrient.",
      "They matter because their balance shapes body composition and performance: protein supports muscle, carbohydrate fuels hard training, and fat supports hormones and health. Total calories set weight change, but the macro split influences how you feel, perform and partition that weight.",
      "In practice, people set a protein target first, then divide the remaining calories between carbohydrate and fat to suit their training and preferences.",
    ],
    relatedTerms: ["micronutrient", "energy-balance", "protein-synthesis"],
    relatedTools: ["macro-calculator"],
  },
  {
    slug: "micronutrient",
    term: "Micronutrient",
    aka: ["Vitamins and minerals"],
    short: "Vitamins and minerals the body needs in small amounts for health.",
    body: [
      "Micronutrients are the vitamins and minerals required in comparatively tiny quantities. They provide no calories but are essential for countless processes, from energy metabolism and oxygen transport to bone health and immune function.",
      "They matter because shortfalls of iron, vitamin D or others can quietly impair health, energy and performance even when calories and macros look fine. Chasing macros while ignoring micronutrient quality is a common blind spot.",
      "In practice, a varied diet built around vegetables, fruit, whole foods and adequate protein covers most micronutrient needs, with targeted supplements only to fill a genuine, ideally tested, gap.",
    ],
    relatedTerms: ["macronutrient", "energy-balance"],
    relatedTools: [],
  },
  {
    slug: "glycogen",
    term: "Glycogen",
    short: "The body's stored form of carbohydrate, held in muscle and liver.",
    body: [
      "Glycogen is how the body stores carbohydrate, as chains of glucose kept mainly in the muscles and liver, ready to be broken down for energy. Muscle glycogen fuels the muscle it's stored in; liver glycogen helps maintain blood sugar.",
      "It matters because glycogen is the primary fuel for hard, high-intensity and prolonged exercise; running low contributes to fatigue and 'hitting the wall'. Each gram of glycogen also holds water, which is why carbohydrate intake affects how full or flat muscles look and short-term scale weight.",
      "In practice, carbohydrate around training tops up glycogen, and the water shifts that come with changing carbohydrate intake explain much of the rapid weight change people see when starting or stopping a low-carb diet.",
    ],
    relatedTerms: ["macronutrient", "insulin-sensitivity", "energy-balance"],
    relatedTools: [],
  },
  {
    slug: "leucine",
    term: "Leucine",
    short: "The key branched-chain amino acid that triggers muscle protein synthesis.",
    body: [
      "Leucine is one of the nine essential amino acids and the one most directly responsible for switching on muscle protein synthesis. It acts as a signal that enough building blocks are available to build new muscle.",
      "It matters because reaching a sufficient dose of leucine at a meal (the so-called leucine threshold) helps maximally stimulate muscle building, which is why protein quality, not just quantity, matters, and why complete proteins like whey are effective.",
      "In practice, getting enough total protein from leucine-rich sources across the day covers this automatically; it is the reason animal proteins and good plant blends are emphasised over incomplete protein sources.",
    ],
    relatedTerms: ["protein-synthesis", "essential-amino-acids", "macronutrient"],
    relatedTools: ["macro-calculator"],
  },
  {
    slug: "essential-amino-acids",
    term: "Essential amino acids",
    aka: ["EAAs"],
    short: "The nine amino acids the body can't make and must get from food.",
    body: [
      "Essential amino acids (EAAs) are the nine amino acids your body cannot synthesise and must obtain from protein in the diet. All nine are needed together to build new body proteins, including muscle.",
      "It matters because muscle growth requires the full set of EAAs, not just one or two, which is why a complete protein (containing all nine in good amounts) is more effective than fragments like BCAAs alone, and why protein source quality counts.",
      "In practice, animal proteins and well-combined plant proteins supply all the EAAs; eating enough complete protein across the day is what matters, rather than supplementing isolated amino acids.",
    ],
    relatedTerms: ["leucine", "protein-synthesis", "macronutrient"],
    relatedTools: ["macro-calculator"],
  },
  {
    slug: "body-recomposition",
    term: "Body recomposition",
    aka: ["Recomp"],
    short: "Losing fat and gaining muscle at the same time.",
    body: [
      "Body recomposition is the process of simultaneously reducing body fat and increasing muscle, so your weight may barely change while your shape does. It's the alternative to distinct 'bulk' and 'cut' phases.",
      "It matters because it's most achievable in specific situations, such as beginners, those returning after a break, people carrying higher body fat, or those using well-controlled nutrition, and less so for lean, advanced trainees, for whom dedicated gaining and cutting phases usually work better.",
      "In practice, recomposition is driven by ample protein, progressive resistance training and eating around maintenance calories, with progress judged by the mirror, measurements and strength rather than scale weight alone.",
    ],
    relatedTerms: ["energy-balance", "hypertrophy", "protein-synthesis"],
    relatedTools: ["tdee-calculator", "macro-calculator"],
  },
  {
    slug: "metabolic-adaptation",
    term: "Metabolic adaptation",
    aka: ["Adaptive thermogenesis"],
    short: "The body's tendency to burn fewer calories as you diet.",
    body: [
      "Metabolic adaptation is the reduction in energy expenditure that occurs during prolonged dieting and weight loss, partly from being smaller, and partly from the body defending its weight by lowering metabolic rate and spontaneous movement more than size alone predicts.",
      "It matters because it helps explain why fat loss slows over time and why a deficit that once worked stops producing results, without anyone 'cheating'. It also underlies the weight regain many experience after aggressive diets.",
      "In practice, it's managed with sensible (not extreme) deficits, adequate protein, resistance training to preserve muscle, and periodic breaks at maintenance, and by re-estimating your TDEE as your weight changes.",
    ],
    relatedTerms: ["tdee", "neat", "energy-balance", "bmr"],
    relatedTools: ["tdee-calculator", "calorie-deficit-calculator"],
  },
  {
    slug: "hiit",
    term: "HIIT",
    aka: ["High-Intensity Interval Training"],
    short: "Alternating short, hard efforts with recovery periods.",
    body: [
      "HIIT (High-Intensity Interval Training) alternates brief bouts of near-maximal effort with periods of easier recovery. Sessions are typically short but demanding, in contrast to long steady cardio.",
      "It matters because it's a time-efficient way to improve cardiovascular fitness and VO₂max, and it can burn meaningful calories in little time. But it's taxing to recover from, so more is not better, and done too often it interferes with strength training and recovery.",
      "In practice, a couple of well-placed HIIT sessions a week, balanced with easier aerobic work (like Zone 2), gives most of the benefit without digging a recovery hole.",
    ],
    relatedTerms: ["vo2max", "zone-2", "epoc", "lactate-threshold"],
    relatedTools: ["heart-rate-zone-calculator"],
  },
  {
    slug: "epoc",
    term: "EPOC",
    aka: ["Excess Post-exercise Oxygen Consumption", "Afterburn"],
    short: "The extra calories burned recovering after hard exercise.",
    body: [
      "EPOC (Excess Post-exercise Oxygen Consumption), popularly the 'afterburn', is the elevated oxygen use and calorie burn that continues after exercise as the body restores itself to rest.",
      "It matters mostly as a widely oversold idea: while intense exercise does raise EPOC more than easy exercise, the extra calories are relatively modest and don't come close to justifying claims of huge post-workout fat burning. The calories burned during the session dominate.",
      "In practice, EPOC is a small bonus, not a reason to pick a workout; total energy expenditure and consistency matter far more than chasing the afterburn.",
    ],
    relatedTerms: ["hiit", "tdee", "energy-balance"],
    relatedTools: ["calories-burned-calculator"],
  },
  {
    slug: "resting-heart-rate",
    term: "Resting heart rate",
    aka: ["RHR"],
    short: "Your heart rate at complete rest, a simple fitness and recovery marker.",
    body: [
      "Resting heart rate (RHR) is the number of times your heart beats per minute when you're fully at rest, ideally measured on waking. Typical adult values sit roughly in the 60 to 100 bpm range, with fitter people often lower.",
      "It matters because a lower resting heart rate generally reflects better cardiovascular fitness, and tracking your own trend is useful: a sustained rise above your normal can signal fatigue, stress, illness or under-recovery.",
      "In practice, RHR is best compared to your own baseline over time rather than to others, and works well alongside HRV as a daily readiness signal.",
    ],
    relatedTerms: ["max-heart-rate", "hrv", "vo2max", "zone-2"],
    relatedTools: ["heart-rate-zone-calculator"],
  },
  {
    slug: "max-heart-rate",
    term: "Maximum heart rate",
    aka: ["MHR", "HRmax"],
    short: "The highest rate your heart can beat during all-out effort.",
    body: [
      "Maximum heart rate (MHR) is the fastest your heart can beat during maximal exercise. It's largely determined by age and genetics rather than fitness, and declines gradually as you get older.",
      "It matters because heart-rate training zones are usually set as percentages of it, so an accurate figure makes zone-based cardio more meaningful. Popular age-based formulas (like 220 minus age) are only rough estimates and can be off by a fair margin for an individual.",
      "In practice, a measured max from a hard field test is more accurate than a formula, but for most people an estimate is a workable starting point for setting training zones.",
    ],
    relatedTerms: ["resting-heart-rate", "zone-2", "vo2max"],
    relatedTools: ["heart-rate-zone-calculator"],
  },
  {
    slug: "visceral-fat",
    term: "Visceral fat",
    aka: ["Belly fat (deep)"],
    short: "Fat stored deep around the abdominal organs, linked to metabolic risk.",
    body: [
      "Visceral fat is body fat stored deep in the abdomen, wrapped around organs like the liver and intestines, distinct from the subcutaneous fat just under the skin that you can pinch.",
      "It matters because visceral fat is metabolically active and more strongly associated with insulin resistance, type 2 diabetes and cardiovascular disease than fat elsewhere. Two people at the same weight can carry very different amounts of it.",
      "In practice, waist measurements and waist-to-height ratio give a rough proxy, and it responds well to overall fat loss, regular exercise and reduced excess calories, and there's no way to target it specifically.",
    ],
    relatedTerms: ["insulin-sensitivity", "metabolic-syndrome", "body-fat-percentage"],
    relatedTools: ["body-fat-calculator"],
  },
  {
    slug: "metabolic-syndrome",
    term: "Metabolic syndrome",
    short: "A cluster of risk factors that together raise cardiometabolic risk.",
    body: [
      "Metabolic syndrome is the name for a cluster of conditions that tend to occur together: a large waist, raised blood pressure, high blood sugar, high triglycerides and low HDL cholesterol. Having several of them together defines the syndrome.",
      "It matters because the combination substantially raises the risk of type 2 diabetes, heart disease and stroke, more than any single factor alone. It's common and often silent, driven largely by excess visceral fat and insulin resistance.",
      "In practice, it's assessed from waist, blood pressure and a blood panel, and improves markedly with weight loss, regular exercise, better diet quality and, where needed, medical treatment.",
    ],
    relatedTerms: ["insulin-sensitivity", "visceral-fat", "apob"],
    relatedTools: ["cgm-metrics-calculator", "metabolic-fitness-index"],
  },
  {
    slug: "sarcopenia",
    term: "Sarcopenia",
    short: "The age-related loss of muscle mass, strength and function.",
    body: [
      "Sarcopenia is the progressive loss of muscle mass and, importantly, strength and physical function that tends to accompany ageing if left unchecked. It's a major contributor to frailty and loss of independence in later life.",
      "It matters because muscle underpins metabolism, mobility, balance and resilience; declining muscle and strength are linked to falls, disability and higher mortality. Much of the decline is not inevitable but driven by inactivity.",
      "In practice, resistance training and adequate protein are the most effective defences, which is why building and maintaining muscle throughout life, not just for aesthetics, is a genuine health priority.",
    ],
    relatedTerms: ["hypertrophy", "protein-synthesis", "grip-strength", "lean-body-mass"],
    relatedTools: ["lean-body-mass-calculator", "ffmi-calculator"],
  },
  {
    slug: "biological-age",
    term: "Biological age",
    aka: ["Bio age"],
    short: "An estimate of how old your body seems, versus your calendar age.",
    body: [
      "Biological age is an attempt to gauge how well or poorly your body has aged compared with the years you've lived, using biomarkers rather than your birth date. Various methods exist, from blood-based scores to epigenetic 'clocks'.",
      "It matters because someone's calendar age doesn't fully capture their health or risk: two 50-year-olds can differ greatly. A biological age higher than your calendar age flags elevated risk and, encouragingly, may respond to lifestyle change.",
      "In practice, these estimates are useful for motivation and tracking trends rather than as precise verdicts; different clocks disagree, and the science of measuring ageing is still developing.",
    ],
    relatedTerms: ["healthspan", "all-cause-mortality", "vo2max"],
    relatedTools: ["phenotypic-age-calculator", "pace-of-aging-index"],
  },
  {
    slug: "healthspan",
    term: "Healthspan",
    short: "The years of life spent in good health, free of chronic disease.",
    body: [
      "Healthspan is the portion of life lived in good health and function, as opposed to lifespan, which is simply how long you live. The goal of much longevity thinking is to extend healthspan so it more closely matches lifespan.",
      "It matters because adding years of frailty and disease is a poor prize; compressing illness into as short a period as possible at the end of life is the more meaningful aim. Fitness, muscle, metabolic health and avoiding smoking are among its strongest levers.",
      "In practice, the habits that extend healthspan, such as regular exercise, strength, good sleep, a sensible diet and not smoking, overlap heavily with those that extend lifespan.",
    ],
    relatedTerms: ["biological-age", "all-cause-mortality", "vo2max"],
    relatedTools: ["lifestyle-life-expectancy"],
  },
  {
    slug: "all-cause-mortality",
    term: "All-cause mortality",
    short: "The risk of dying from any cause, a common yardstick in health research.",
    body: [
      "All-cause mortality is the risk of death from any cause over a given period. Health studies often report how a factor such as fitness, a habit or a biomarker relates to it, because it sidesteps the problem of one risk simply shifting deaths from one disease to another.",
      "It matters because a factor linked to lower all-cause mortality is genuinely associated with living longer overall, not just avoiding one specific illness. Cardiorespiratory fitness, strength and not smoking show some of the strongest such links.",
      "In practice, when you read that something is 'associated with lower all-cause mortality', it means people with more of it tended to live longer, though association isn't proof of cause, and context matters.",
    ],
    relatedTerms: ["healthspan", "biological-age", "vo2max", "grip-strength"],
    relatedTools: ["lifestyle-life-expectancy"],
  },
  {
    slug: "grip-strength",
    term: "Grip strength",
    short: "How hard you can squeeze, a surprisingly strong marker of overall health.",
    body: [
      "Grip strength is the force you can generate by squeezing, usually measured with a hand dynamometer. Beyond its obvious role in lifting and daily tasks, it serves as a convenient proxy for whole-body strength.",
      "It matters because low grip strength is consistently associated with higher risk of frailty, disability and all-cause mortality, making it a simple, cheap health marker, a signal of overall muscular fitness rather than a magic number in itself.",
      "In practice, grip is trained indirectly through heavy pulling, carries and hangs; improving general strength and staying active are what the marker really reflects.",
    ],
    relatedTerms: ["all-cause-mortality", "sarcopenia", "one-rep-max"],
    relatedTools: [],
  },
  {
    slug: "body-fat-percentage",
    term: "Body-fat percentage",
    aka: ["Body fat %"],
    short: "The share of your body weight that is fat rather than lean tissue.",
    body: [
      "Body-fat percentage is the proportion of your total body weight made up of fat, with the rest being lean mass (muscle, bone, organs and water). It describes composition in a way that weight or BMI alone cannot.",
      "It matters because two people at the same weight can look and perform very differently depending on how much is fat versus muscle. Tracking it can be more informative than the scale, though every measurement method has meaningful error.",
      "In practice, estimates from calipers, tape formulas, bioelectrical scales and DEXA all vary, so it's best to pick one method and follow the trend rather than fixating on a single exact figure.",
    ],
    relatedTerms: ["visceral-fat", "lean-body-mass", "hypertrophy"],
    relatedTools: ["body-fat-calculator"],
  },
  {
    slug: "lean-body-mass",
    term: "Lean body mass",
    aka: ["LBM", "Fat-free mass"],
    short: "Everything in your body that isn't fat, chiefly muscle, bone and water.",
    body: [
      "Lean body mass (LBM) is your total weight minus your fat mass: muscle, bone, organs, connective tissue and body water. It's the counterpart to body-fat percentage.",
      "It matters because lean mass, especially muscle, drives strength, metabolic rate and function, and preserving it is a key goal when dieting. Many nutrition and dosing calculations are based on lean mass rather than total weight, since fat is less metabolically demanding.",
      "In practice, LBM is estimated from body-fat measurements, and the aim during fat loss is to lose fat while holding on to lean mass through protein and resistance training.",
    ],
    relatedTerms: ["body-fat-percentage", "sarcopenia", "hypertrophy"],
    relatedTools: ["lean-body-mass-calculator", "ffmi-calculator"],
  },
  {
    slug: "glycaemic-index",
    term: "Glycaemic index",
    aka: ["GI"],
    short: "A ranking of how quickly a carbohydrate food raises blood sugar.",
    body: [
      "The glycaemic index (GI) ranks carbohydrate foods by how much and how quickly they raise blood glucose compared with a reference. High-GI foods spike blood sugar faster; low-GI foods release it more gradually.",
      "It matters as a rough guide to blood-sugar response, but it has real limits: GI is measured for foods eaten alone, whereas mixed meals with protein, fat and fibre behave very differently, and individual responses vary. It's a starting point, not a rule.",
      "In practice, overall diet quality, total carbohydrate and how foods are combined matter more than GI alone; continuous glucose monitoring shows just how personal these responses can be.",
    ],
    relatedTerms: ["insulin-sensitivity", "glycogen", "macronutrient"],
    relatedTools: ["cgm-metrics-calculator"],
  },
  {
    slug: "cortisol",
    term: "Cortisol",
    aka: ["Stress hormone"],
    short: "A hormone central to the stress response, energy and recovery.",
    body: [
      "Cortisol is a hormone released by the adrenal glands that helps mobilise energy, regulate metabolism and manage the body's response to stress. It naturally follows a daily rhythm, peaking in the morning and falling at night.",
      "It matters because cortisol is often demonised, but it isn't 'bad'. It's essential, and rises normally with exercise. The concern is chronically elevated cortisol from persistent stress, poor sleep or excessive training, which can impair recovery, sleep and body composition.",
      "In practice, the useful levers are managing overall stress load, sleeping well, and not endlessly overreaching in training, rather than chasing supplements that claim to 'lower cortisol'.",
    ],
    relatedTerms: ["hrv", "insulin-sensitivity", "deload", "testosterone", "tsh"],
    relatedTools: ["recovery-readiness-index"],
  },
  {
    slug: "mtor",
    term: "mTOR",
    aka: ["Mechanistic target of rapamycin"],
    short: "A cellular pathway that drives growth, including muscle building.",
    body: [
      "mTOR (mechanistic target of rapamycin) is a central signalling pathway that senses nutrients, energy and mechanical load and, when activated, switches cells toward growth and building, including muscle protein synthesis.",
      "It matters because resistance training, adequate protein and especially leucine activate mTOR, linking the pathway directly to muscle growth. It also sits at the centre of a longevity debate: constant growth signalling may trade off against cellular clean-up (autophagy), so the ideal is thought to be cycling between the two rather than maximising either.",
      "In practice, you don't manage mTOR directly; training hard and eating enough protein activates it for muscle building, while periods without constant feeding allow the opposing maintenance processes their turn.",
    ],
    relatedTerms: ["protein-synthesis", "leucine", "autophagy"],
    relatedTools: [],
  },

  // ---- Blood-test biomarkers (one entry per marker in the /blood-test panel,
  // src/registry/biomarkers.ts). Educational and non-diagnostic: definitions and
  // context only, deliberately no reference ranges or "optimal" values. ----
  {
    slug: "fasting-glucose",
    term: "Fasting glucose",
    aka: ["Fasting blood glucose", "FBG"],
    short: "Your blood-sugar level after an overnight fast — a first-line metabolic marker.",
    body: [
      "Fasting glucose is the concentration of sugar in your blood measured after not eating for several hours, usually overnight. Taken away from the influence of a recent meal, it reflects how well your body holds blood sugar in a tight range at baseline.",
      "It matters because a persistently raised fasting glucose is one of the earliest routine signs that the body is struggling to manage sugar — often appearing on the road toward prediabetes and type 2 diabetes, well before any symptoms. It sits near the centre of the wider metabolic-health picture.",
      "In practice, fasting glucose is read alongside HbA1c and fasting insulin rather than in isolation, since a single reading can be nudged by stress, illness or a short fast. Regular exercise, muscle mass and avoiding a chronic energy surplus tend to keep it steady.",
    ],
    relatedTerms: ["insulin-sensitivity", "hba1c", "fasting-insulin", "glycaemic-index", "metabolic-syndrome"],
    relatedTools: ["metabolic-fitness-index", "cgm-metrics-calculator"],
  },
  {
    slug: "hba1c",
    term: "HbA1c",
    aka: ["Glycated haemoglobin", "Haemoglobin A1c"],
    short: "A marker of your average blood sugar over roughly the past three months.",
    body: [
      "HbA1c (glycated haemoglobin) reflects the proportion of your haemoglobin — the oxygen-carrying protein in red blood cells — that has sugar stuck to it. Because red cells live for around three months, it acts as a running average of your blood sugar over that period.",
      "It matters because, unlike a single glucose reading, HbA1c smooths out day-to-day spikes and dips, which makes it the standard marker for tracking longer-term glucose control and for screening for prediabetes and diabetes.",
      "In practice, HbA1c is read together with fasting glucose; conditions that change red-cell lifespan (such as anaemia) can distort it, so it is interpreted in context rather than as a lone number.",
    ],
    relatedTerms: ["insulin-sensitivity", "fasting-glucose", "fasting-insulin", "glycaemic-index", "metabolic-syndrome"],
    relatedTools: ["metabolic-fitness-index", "cgm-metrics-calculator"],
  },
  {
    slug: "fasting-insulin",
    term: "Fasting insulin",
    aka: ["HOMA-IR"],
    short: "How much insulin your body needs at rest to keep blood sugar in check.",
    body: [
      "Fasting insulin is the amount of the hormone insulin circulating in your blood after an overnight fast. Insulin is what moves sugar out of the blood and into cells, so the level shows how hard the pancreas is working to keep glucose normal.",
      "It matters because a high fasting insulin — especially alongside still-normal glucose — is a classic early sign of insulin resistance, often flagging a metabolic problem years before glucose itself starts to rise. Combined with glucose it gives the HOMA-IR estimate of insulin resistance.",
      "In practice, fasting insulin adds depth to glucose and HbA1c: someone can keep 'normal' glucose only by pumping out lots of insulin, which fasting insulin exposes. It responds to the same levers — activity, muscle, sleep and avoiding chronic surplus.",
    ],
    relatedTerms: ["insulin-sensitivity", "fasting-glucose", "hba1c", "metabolic-syndrome"],
    relatedTools: ["metabolic-fitness-index", "cgm-metrics-calculator"],
  },
  {
    slug: "triglycerides",
    term: "Triglycerides",
    aka: ["TG"],
    short: "The main form of fat carried in your blood.",
    body: [
      "Triglycerides are the most common type of fat in the body and in the bloodstream. They come both from the fat in food and from the liver, which turns excess energy — particularly from refined carbohydrate and alcohol — into triglycerides for storage.",
      "They matter because raised blood triglycerides often travel with insulin resistance and low HDL cholesterol, forming part of the cluster behind metabolic syndrome and adding to cardiovascular risk. They are one of the more diet-responsive blood markers.",
      "In practice, triglycerides are measured as part of a standard lipid panel and read alongside HDL and LDL; they tend to fall with fewer excess calories, less refined carbohydrate and alcohol, and more regular exercise.",
    ],
    relatedTerms: ["hdl-cholesterol", "ldl-cholesterol", "insulin-sensitivity", "metabolic-syndrome", "apob"],
    relatedTools: ["metabolic-fitness-index", "heart-age-calculator"],
  },
  {
    slug: "total-cholesterol",
    term: "Total cholesterol",
    short: "All the cholesterol carried in your blood, added together.",
    body: [
      "Total cholesterol is the combined amount of cholesterol carried across all the lipoprotein particles in your blood — chiefly LDL and HDL. Cholesterol itself is an essential fatty substance the body uses to build cell membranes and hormones.",
      "It matters as a quick headline number, but on its own it can mislead: a high total can be driven by protective HDL, and a reassuring total can hide an unfavourable balance. The split between the types, and the particle number, matter far more than the sum.",
      "In practice, total cholesterol is always read together with HDL, LDL and triglycerides, and increasingly with ApoB, to judge cardiovascular risk properly rather than from the total alone.",
    ],
    relatedTerms: ["ldl-cholesterol", "hdl-cholesterol", "triglycerides", "apob"],
    relatedTools: ["heart-age-calculator"],
  },
  {
    slug: "ldl-cholesterol",
    term: "LDL cholesterol",
    aka: ["LDL-C", "'Bad' cholesterol"],
    short: "Cholesterol carried on the particles most linked to clogged arteries.",
    body: [
      "LDL cholesterol is the cholesterol carried by low-density lipoproteins (LDL). These particles ferry cholesterol to the body's tissues, and when there are too many of them they can lodge in artery walls and drive the fatty build-up behind heart disease.",
      "It matters because LDL cholesterol is one of the best-evidenced causal factors in cardiovascular disease, and lowering it is among the most reliable ways to reduce that risk. That is why it is often called the 'bad' cholesterol — though the reality is more about particle number than a simple good/bad split.",
      "In practice, LDL is read alongside HDL, triglycerides and ideally ApoB, which counts the atherogenic particles directly and can refine risk when LDL alone looks reassuring.",
    ],
    relatedTerms: ["hdl-cholesterol", "total-cholesterol", "apob", "lp-a", "triglycerides"],
    relatedTools: ["heart-age-calculator"],
  },
  {
    slug: "hdl-cholesterol",
    term: "HDL cholesterol",
    aka: ["HDL-C", "'Good' cholesterol"],
    short: "Cholesterol on the particles that help clear it from the arteries.",
    body: [
      "HDL cholesterol is the cholesterol carried by high-density lipoproteins (HDL), which help move cholesterol away from the tissues and back to the liver for recycling or disposal — a process linked to protecting the arteries.",
      "It matters because higher HDL is generally associated with lower cardiovascular risk, earning it the 'good' cholesterol label. But the relationship is more nuanced than 'more is always better': very high HDL stops adding benefit, and simply forcing it up with drugs has not reliably reduced risk.",
      "In practice, HDL is read alongside triglycerides — a low HDL with high triglycerides is a common fingerprint of insulin resistance — and tends to improve with exercise, not smoking and better metabolic health.",
    ],
    relatedTerms: ["ldl-cholesterol", "total-cholesterol", "triglycerides", "insulin-sensitivity", "apob"],
    relatedTools: ["heart-age-calculator"],
  },
  {
    slug: "hs-crp",
    term: "hs-CRP",
    aka: ["High-sensitivity C-reactive protein"],
    short: "A sensitive blood marker of low-grade inflammation in the body.",
    body: [
      "C-reactive protein (CRP) is made by the liver and rises when there is inflammation in the body. The high-sensitivity assay (hs-CRP) can detect the low, chronic levels that ordinary CRP tests miss, rather than only the large spikes of an acute infection.",
      "It matters because chronic low-grade inflammation is linked to cardiovascular and metabolic risk and to biological ageing, so hs-CRP is used as one input into heart-risk and biological-age assessments. It is non-specific, though — any recent infection, injury or hard training session can raise it temporarily.",
      "In practice, hs-CRP is best measured when you are well and not freshly trained, and is read as part of a wider picture rather than on its own.",
    ],
    relatedTerms: ["biological-age", "metabolic-syndrome", "apob", "homocysteine"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "homocysteine",
    term: "Homocysteine",
    short: "An amino acid tied to B-vitamin status and cardiovascular risk.",
    body: [
      "Homocysteine is an amino acid produced as a normal by-product of the body's metabolism. It is cleared with the help of B vitamins — folate, B12 and B6 — so when those run low, homocysteine tends to build up in the blood.",
      "It matters because raised homocysteine is associated with cardiovascular risk and has been studied in relation to cognitive decline. Usefully, it is often modifiable: correcting a genuine B-vitamin shortfall can bring it down.",
      "In practice, homocysteine is read alongside folate and B12 status; whether lowering it with supplements changes hard outcomes is still debated, so it is treated as one informative marker rather than a target to chase blindly.",
    ],
    relatedTerms: ["folate", "vitamin-b12", "apob", "biological-age"],
    relatedTools: [],
  },
  {
    slug: "albumin",
    term: "Albumin",
    short: "The most abundant protein in blood, made by the liver.",
    body: [
      "Albumin is the main protein circulating in your blood, produced by the liver. It helps hold fluid inside the blood vessels and transports hormones, vitamins and other substances around the body.",
      "It matters because albumin reflects both liver function and overall nutritional and general health, and it tends to fall with age, chronic illness and inflammation. That link to overall condition is why it features in blood-based biological-age scores.",
      "In practice, albumin is read as part of a liver panel and interpreted alongside the other markers; a low level is a non-specific signal that prompts a wider look rather than a diagnosis in itself.",
    ],
    relatedTerms: ["biological-age", "creatinine", "alt"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "creatinine",
    term: "Creatinine",
    aka: ["eGFR"],
    short: "A muscle waste product used to gauge how well the kidneys filter.",
    body: [
      "Creatinine is a waste product made steadily as muscles use energy. The kidneys filter it out of the blood into the urine, so the amount left in the blood reflects how well the kidneys are clearing it.",
      "It matters because creatinine — and the eGFR (estimated glomerular filtration rate) worked out from it — is the standard everyday check of kidney function, and kidney health is one component of overall biological ageing. Because it comes from muscle, very muscular people can read a little higher without any kidney problem.",
      "In practice, creatinine is interpreted as an eGFR adjusted for age and sex and read alongside other markers; a single value tells you less than the trend over time.",
    ],
    relatedTerms: ["biological-age", "albumin"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "alt",
    term: "ALT",
    aka: ["Alanine aminotransferase", "SGPT"],
    short: "A liver enzyme that leaks into the blood when liver cells are stressed.",
    body: [
      "ALT (alanine aminotransferase) is an enzyme concentrated inside liver cells. When those cells are damaged or under strain, ALT leaks into the bloodstream, so a raised level points toward the liver.",
      "It matters because ALT is a sensitive, everyday flag for liver stress — most commonly from non-alcoholic fatty liver disease, which tracks with metabolic health, but also from alcohol, medication and viral causes. It is one of the more actionable liver markers.",
      "In practice, ALT is read alongside other liver enzymes such as alkaline phosphatase; a mildly raised value is common and usually followed up in the context of weight, alcohol and metabolic health rather than treated in isolation.",
    ],
    relatedTerms: ["alkaline-phosphatase", "albumin", "insulin-sensitivity", "metabolic-syndrome"],
    relatedTools: [],
  },
  {
    slug: "alkaline-phosphatase",
    term: "Alkaline phosphatase",
    aka: ["ALP"],
    short: "An enzyme from the liver and bones, read as part of a liver panel.",
    body: [
      "Alkaline phosphatase (ALP) is an enzyme found mainly in the liver and bones, with smaller amounts elsewhere. Levels rise when there is activity or obstruction in the bile ducts of the liver, or increased bone turnover.",
      "It matters because ALP helps tell different kinds of liver issue apart from the other enzymes, and because it also reflects bone activity — which is why it can be naturally higher in growing adolescents and in pregnancy. It contributes to blood-based biological-age scoring.",
      "In practice, ALP is interpreted alongside ALT and the rest of the liver panel; whether a raised level points to liver or bone is usually clarified by the pattern of the other markers.",
    ],
    relatedTerms: ["alt", "albumin", "biological-age"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "white-blood-cells",
    term: "White blood cell count",
    aka: ["WBC", "Leukocytes"],
    short: "The number of infection-fighting cells in your blood.",
    body: [
      "The white blood cell count (WBC) is the total number of immune cells circulating in a volume of blood. These cells are the body's front line against infection, and their number rises and falls with what the immune system is dealing with.",
      "It matters because both unusually high and unusually low counts are informative — a high count often signals infection or inflammation, a low count can reflect certain illnesses or treatments — and the baseline level is one of the markers used in biological-age scoring.",
      "In practice, WBC is read as part of the full blood count, and the differential (the mix of white-cell types, including lymphocytes) adds far more meaning than the total alone.",
    ],
    relatedTerms: ["lymphocyte-percentage", "biological-age", "hs-crp"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "lymphocyte-percentage",
    term: "Lymphocyte percentage",
    aka: ["Lymphocyte %"],
    short: "The share of your white blood cells that are lymphocytes.",
    body: [
      "Lymphocytes are the white blood cells at the heart of the immune system's memory and targeted defence — the T cells and B cells behind long-term immunity. The lymphocyte percentage is the proportion of your total white cells that are lymphocytes.",
      "It matters because the balance between lymphocytes and the other white cells shifts with infection, stress and age, and a relatively lower lymphocyte percentage has emerged as a marker used in biological-age estimates.",
      "In practice, the percentage is read alongside the total white cell count and the rest of the differential; like most single blood markers it is best interpreted in context and over time rather than from one reading.",
    ],
    relatedTerms: ["white-blood-cells", "biological-age"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "mcv",
    term: "Mean corpuscular volume",
    aka: ["MCV"],
    short: "The average size of your red blood cells.",
    body: [
      "Mean corpuscular volume (MCV) is the average size of your red blood cells. It is reported automatically as part of the full blood count and sorts anaemias into useful categories by whether the cells are small, normal or large.",
      "It matters because cell size points toward causes: unusually small red cells often suggest iron deficiency, while unusually large ones can point to low B12 or folate, or to alcohol. MCV also feeds into blood-based biological-age scores.",
      "In practice, MCV is read together with markers like ferritin, B12 and folate to pin down why the cells are the size they are, rather than interpreted on its own.",
    ],
    relatedTerms: ["rdw", "ferritin", "vitamin-b12", "folate", "biological-age"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "rdw",
    term: "Red cell distribution width",
    aka: ["RDW"],
    short: "A measure of how varied your red blood cells are in size.",
    body: [
      "Red cell distribution width (RDW) measures how much your red blood cells vary in size. Where MCV gives the average size, RDW captures the spread — how uniform or mixed the population of cells is.",
      "It matters because a wider distribution has turned out to be a surprisingly strong, general marker of health: a higher RDW is associated with a range of conditions and with biological ageing, even when the other counts look normal, which is why it appears in biological-age scoring.",
      "In practice, RDW is read alongside MCV — the combination helps narrow down causes of anaemia — and is followed as part of the wider blood picture rather than acted on alone.",
    ],
    relatedTerms: ["mcv", "ferritin", "biological-age"],
    relatedTools: ["phenotypic-age-calculator"],
  },
  {
    slug: "testosterone",
    term: "Testosterone",
    short: "A key sex hormone for muscle, bone, mood, energy and libido.",
    body: [
      "Testosterone is a hormone present in everyone, at much higher levels in men than in women. It influences muscle and bone mass, red-blood-cell production, mood, energy and libido, and in men is made mainly by the testes under signals from the brain.",
      "It matters because low testosterone can show up as fatigue, low mood, reduced libido and difficulty building or keeping muscle — but levels vary widely, swing through the day, and dip temporarily with poor sleep, illness and heavy training, so one low reading is not a diagnosis.",
      "In practice, testosterone is best measured in the morning when it peaks, and interpreted alongside symptoms and repeat testing; sleep, body composition and a sensible training load are the everyday levers that most influence it.",
    ],
    relatedTerms: ["cortisol", "sarcopenia", "hypertrophy"],
    relatedTools: [],
  },
  {
    slug: "tsh",
    term: "TSH",
    aka: ["Thyroid-stimulating hormone"],
    short: "The brain's signal that controls the thyroid — the first-line thyroid check.",
    body: [
      "TSH (thyroid-stimulating hormone) is released by the pituitary gland in the brain to tell the thyroid how much thyroid hormone to make. The thyroid, in turn, sets much of the body's metabolic rate.",
      "It matters because TSH is the first-line screen for thyroid problems, and it works by feedback: a high TSH usually means the thyroid is underactive (the brain is shouting for more), while a low TSH suggests an overactive thyroid. Thyroid dysfunction is a common, treatable cause of fatigue, weight change and low mood.",
      "In practice, an abnormal TSH is followed up with thyroid hormone levels (such as free T4) to confirm the picture, since TSH alone does not tell the whole story.",
    ],
    relatedTerms: ["bmr", "cortisol"],
    relatedTools: [],
  },
  {
    slug: "vitamin-d",
    term: "Vitamin D",
    aka: ["25-hydroxyvitamin D", "25(OH)D"],
    short: "The 'sunshine vitamin' — really a hormone — and a very common deficiency.",
    body: [
      "Vitamin D is a fat-soluble nutrient that behaves more like a hormone in the body. Most of it is made in the skin on exposure to sunlight, with a smaller amount from food; the blood test measures 25-hydroxyvitamin D, the stored form.",
      "It matters because vitamin D is important for bone health, immune function and muscle, and deficiency is genuinely common — especially in winter, at higher latitudes and with darker skin or little sun exposure. It is one of the more worthwhile deficiencies to find and correct.",
      "In practice, a low level is usually corrected with supplementation and sensible sun exposure; because it is stored in fat, it is checked periodically rather than day to day.",
    ],
    relatedTerms: ["micronutrient", "ferritin", "vitamin-b12"],
    relatedTools: [],
  },
  {
    slug: "vitamin-b12",
    term: "Vitamin B12",
    aka: ["Cobalamin"],
    short: "A vitamin essential for healthy nerves and red blood cells.",
    body: [
      "Vitamin B12 (cobalamin) is an essential vitamin the body cannot make, obtained almost entirely from animal foods or supplements. It is needed to build healthy red blood cells and to keep the nervous system working.",
      "It matters because a shortfall causes fatigue, a particular type of anaemia and, if prolonged, nerve problems. Deficiency is more common in people eating little or no animal produce, in older adults and where absorption is impaired.",
      "In practice, B12 is read alongside folate and the full blood count — a shortfall of either can enlarge red cells (raising MCV) — and is corrected with diet, supplements or, where absorption is the problem, injections.",
    ],
    relatedTerms: ["folate", "micronutrient", "mcv", "homocysteine"],
    relatedTools: [],
  },
  {
    slug: "ferritin",
    term: "Ferritin",
    short: "A measure of the body's stored iron.",
    body: [
      "Ferritin is the protein that stores iron in the body, and the blood level is used as a proxy for how much iron you have in reserve. Iron is essential for carrying oxygen in the blood and for producing energy in cells.",
      "It matters because low ferritin is one of the most common and most missed causes of fatigue and poor training performance — particularly in menstruating women and endurance athletes — often before full anaemia appears. Very high ferritin warrants attention too, as it can reflect iron overload or inflammation.",
      "In practice, ferritin is read with the full blood count and, because it also rises with inflammation, is interpreted in context; low iron is corrected through diet or supplements, ideally guided by testing rather than guesswork.",
    ],
    relatedTerms: ["micronutrient", "mcv", "rdw", "vitamin-b12"],
    relatedTools: [],
  },
  {
    slug: "folate",
    term: "Folate",
    aka: ["Vitamin B9", "Folic acid"],
    short: "A B-vitamin that partners with B12 for healthy blood and nerves.",
    body: [
      "Folate (vitamin B9) is an essential B-vitamin found in leafy greens, legumes and fortified foods; folic acid is its synthetic form used in supplements. It is needed to make and repair DNA and to build red blood cells.",
      "It matters because folate works hand in hand with B12: a shortfall of either causes a similar large-cell anaemia and pushes up homocysteine. Adequate folate is especially important before and during early pregnancy, when it lowers the risk of neural-tube defects.",
      "In practice, folate is read alongside B12 and the full blood count, since treating one without checking the other can mask a B12 problem; most people meet their needs from a varied diet.",
    ],
    relatedTerms: ["vitamin-b12", "micronutrient", "homocysteine", "mcv"],
    relatedTools: [],
  },
];

export const glossaryBySlug: ReadonlyMap<string, GlossaryEntry> = new Map(
  glossaryEntries.map((e) => [e.slug, e]),
);

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return glossaryBySlug.get(slug);
}

/** Entries sorted alphabetically by term, for the hub A-Z listing. */
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
