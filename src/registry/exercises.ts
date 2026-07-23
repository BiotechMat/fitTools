/**
 * Exercise library (CONTENT-reference.md §3) — the flagship reference section.
 * A page per exercise, grouped into movement-pattern hubs, each with HowTo
 * steps, form faults, substitutions and programming notes that link out to the
 * strength calculators (§8). Structured data (not MDX) so the HowTo schema and
 * cross-links generate consistently.
 *
 * Same single-source-of-truth pattern as the other registries: drives routing,
 * the /exercises hubs, sitemap, JSON-LD and cross-links.
 */

import type { FaqEntry } from "@/registry/types";

export type MovementPattern = "legs" | "push" | "pull" | "core";

export interface ExercisePattern {
  slug: MovementPattern;
  title: string;
  description: string;
}

export interface FormFault {
  fault: string;
  fix: string;
}

export interface ExerciseEntry {
  slug: string;
  name: string;
  aka?: string[];
  pattern: MovementPattern;
  /** One-line identity for hub lists and meta description. */
  short: string;
  whatItIs: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  /** Ordered how-to steps (HowTo schema). */
  steps: string[];
  formFaults: FormFault[];
  /** Related exercise slugs (validated to exist). */
  substitutions: string[];
  programmingNote: string;
  /** Related tool slugs (validated to exist in the tool registry). */
  relatedTools: string[];
  faq: FaqEntry[];
}

export const EXERCISES_LAST_REVIEWED = "2026-07-22";

export const exercisePatterns: ExercisePattern[] = [
  {
    slug: "legs",
    title: "Legs — squat, hinge & single-leg",
    description:
      "The big lower-body lifts: squats, hip hinges and single-leg work that drive most of your strength and muscle.",
  },
  {
    slug: "push",
    title: "Push — chest, shoulders & triceps",
    description:
      "Horizontal and vertical pressing: the movements that build the chest, shoulders and triceps.",
  },
  {
    slug: "pull",
    title: "Pull — back & biceps",
    description:
      "Horizontal and vertical pulling: the movements that build a strong back and biceps.",
  },
  {
    slug: "core",
    title: "Core — abs & trunk",
    description:
      "Anti-extension, anti-rotation and flexion work that builds a strong, stable midsection to brace and protect the spine.",
  },
];

const BARBELL_TOOLS = [
  "one-rep-max-calculator",
  "training-volume-calculator",
  "warmup-calculator",
  "plate-calculator",
];

export const exercises: ExerciseEntry[] = [
  // ---------- LEGS ----------
  {
    slug: "back-squat",
    name: "Back squat",
    aka: ["Barbell squat"],
    pattern: "legs",
    short: "The classic barbell squat — a cornerstone lower-body strength lift.",
    whatItIs:
      "A squat with the barbell resting across your upper back, lowering your hips down and back and driving up. It is the benchmark lower-body strength movement.",
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Spinal erectors", "Core"],
    steps: [
      "Set the bar on your upper traps (high bar) or rear delts (low bar), grip just outside the shoulders, and un-rack it by standing up and stepping back.",
      "Set your feet about shoulder-width, toes turned out slightly, and brace your core as if about to be punched.",
      "Break at the hips and knees together, lowering under control until your hip crease is at least level with the top of your knee.",
      "Drive through the whole foot to stand back up, keeping your chest up and knees tracking over your toes.",
    ],
    formFaults: [
      {
        fault: "Knees caving inward on the way up.",
        fix: "Consciously push the knees out to track over the toes; strengthen glutes and reduce load if it only happens when heavy.",
      },
      {
        fault: "Heels lifting or weight shifting onto the toes.",
        fix: "Keep weight mid-foot, widen the stance slightly, and consider mobility work or a small heel raise for ankle range.",
      },
      {
        fault: "Rounding the lower back at the bottom ('butt wink').",
        fix: "Stop just above the depth where it happens, brace harder, and work on hip mobility; don't chase depth you can't control.",
      },
    ],
    substitutions: ["front-squat", "bulgarian-split-squat"],
    programmingNote:
      "A staple main lift. Strength work often sits around 3–6 reps, hypertrophy around 6–12. Warm up in ramped sets and progress gradually.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "High bar or low bar squat?",
        a: "High bar (bar on the traps) stays more upright and emphasises the quads; low bar (bar lower, on the rear delts) allows more weight and involves the hips and back more. Choose based on goal and comfort — both are effective.",
      },
      {
        q: "How deep should I squat?",
        a: "At least to parallel — hip crease level with the top of the knee — if your mobility allows it with a controlled, neutral spine. Deeper is fine if you can maintain position; forcing depth you can't control is not worth it.",
      },
    ],
  },
  {
    slug: "front-squat",
    name: "Front squat",
    pattern: "legs",
    short: "A squat with the bar on the front of the shoulders — quad-focused and upright.",
    whatItIs:
      "A squat holding the barbell across the front of your shoulders. The front-loaded position forces a more upright torso and shifts emphasis toward the quads.",
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Glutes", "Upper back", "Core"],
    steps: [
      "Rest the bar on the front of your shoulders, elbows high, using a clean grip or crossed-arm hold to keep it secure.",
      "Un-rack, step back and set your feet about shoulder-width, toes slightly out.",
      "Brace and squat straight down, keeping the torso tall and elbows pointing forward.",
      "Descend to at least parallel, then drive up through mid-foot without letting the elbows drop.",
    ],
    formFaults: [
      {
        fault: "Elbows dropping, letting the bar roll forward.",
        fix: "Actively drive the elbows up throughout; improve wrist and lat mobility so the rack position is easier to hold.",
      },
      {
        fault: "Rounding forward out of the bottom.",
        fix: "Reduce load, keep the brace tight, and think 'elbows up, chest up' as you drive out of the hole.",
      },
    ],
    substitutions: ["back-squat", "bulgarian-split-squat"],
    programmingNote:
      "Excellent quad-focused main or secondary lift. Rack position usually limits load before the legs do, so build the position gradually.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "Why can I lift less on front squats?",
        a: "The front-loaded position demands a very upright torso and is limited by your upper-back and core's ability to resist folding forward — so loads are typically lower than the back squat, which is normal.",
      },
      {
        q: "My wrists hurt in the rack position.",
        a: "That's usually a mobility issue. A clean-grip with fingers under the bar (rather than a full grip) and some wrist and lat mobility work usually fixes it; a cross-arm grip is a fine alternative.",
      },
    ],
  },
  {
    slug: "romanian-deadlift",
    name: "Romanian deadlift",
    aka: ["RDL"],
    pattern: "legs",
    short: "A hip-hinge that targets the hamstrings and glutes through the stretch.",
    whatItIs:
      "A hip-dominant lift where you hinge at the hips with soft knees, lowering the bar along your legs to load the hamstrings and glutes, then driving the hips forward to stand.",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Spinal erectors", "Lats", "Core"],
    steps: [
      "Stand holding the bar at the top of a deadlift, feet hip-width, knees slightly bent.",
      "Push your hips back and let the bar travel down close to your legs, keeping your back flat.",
      "Lower until you feel a strong hamstring stretch (usually around mid-shin), without rounding the back.",
      "Drive the hips forward to return to standing, squeezing the glutes at the top.",
    ],
    formFaults: [
      {
        fault: "Rounding the lower back to reach lower.",
        fix: "Only go as far as you can keep a flat back; the range comes from hip mobility, not from bending the spine.",
      },
      {
        fault: "Turning it into a squat by bending the knees too much.",
        fix: "Keep the shins near-vertical and push the hips back — it's a hinge, not a squat.",
      },
      {
        fault: "Bar drifting away from the body.",
        fix: "Keep the lats engaged and the bar dragging lightly along your legs the whole way.",
      },
    ],
    substitutions: ["conventional-deadlift", "hip-thrust"],
    programmingNote:
      "A top hamstring/glute builder. Often trained in the 6–12 rep range with a focus on the stretch; leave a rep or two in reserve to keep form tight.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "RDL vs conventional deadlift — what's the difference?",
        a: "The Romanian deadlift starts from the top and emphasises the hamstring stretch with minimal knee bend and the weight never resting on the floor. The conventional deadlift starts from the floor and involves more quad and overall drive.",
      },
      {
        q: "How low should the bar go?",
        a: "To the point of a strong hamstring stretch while keeping a flat back — for most people that's around mid-shin, but it depends on your hip mobility. Don't chase the floor by rounding your back.",
      },
    ],
  },
  {
    slug: "conventional-deadlift",
    name: "Conventional deadlift",
    aka: ["Deadlift"],
    pattern: "legs",
    short: "A full-body pull from the floor — one of the best total strength builders.",
    whatItIs:
      "Lifting a barbell from the floor to a standing position by extending the hips and knees. It trains nearly the whole posterior chain and is a benchmark of total-body strength.",
    primaryMuscles: ["Glutes", "Hamstrings", "Spinal erectors"],
    secondaryMuscles: ["Quadriceps", "Lats", "Traps", "Forearms", "Core"],
    steps: [
      "Set up with mid-foot under the bar, shins close, feet about hip-width.",
      "Hinge down and grip just outside your legs; drop the hips so the shoulders are slightly ahead of the bar.",
      "Take the slack out of the bar, brace hard, and push the floor away while keeping the bar against your legs.",
      "Stand tall by driving the hips through; lower under control by hinging back and bending the knees.",
    ],
    formFaults: [
      {
        fault: "Lower back rounding under load.",
        fix: "Brace before you pull, engage the lats to set the back flat, and reduce load until you can keep a neutral spine.",
      },
      {
        fault: "Hips shooting up first, turning it into a stiff-legged pull.",
        fix: "Push with the legs and keep the chest and hips rising together off the floor.",
      },
      {
        fault: "Bar drifting forward away from the shins.",
        fix: "Keep the lats tight and the bar dragging up your legs; think of pulling the bar back into you.",
      },
    ],
    substitutions: ["romanian-deadlift", "back-squat"],
    programmingNote:
      "Highly fatiguing, so most people need less volume than on other lifts. Strength work often sits at 1–5 reps; keep the reps clean rather than grinding with poor form.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "Should my back be completely vertical at the start?",
        a: "No — in a conventional deadlift the hips sit higher than in a squat and the shoulders are slightly ahead of the bar, so there is some forward torso lean. What matters is that the spine stays neutral (flat), not that the torso is upright.",
      },
      {
        q: "Mixed grip, double overhand or straps?",
        a: "Double-overhand builds grip but fails first as weights climb; a mixed grip or lifting straps let you hold heavier loads. Many lifters train lighter sets double-overhand and use straps for heavy work.",
      },
    ],
  },
  {
    slug: "hip-thrust",
    name: "Hip thrust",
    aka: ["Barbell glute bridge"],
    pattern: "legs",
    short: "A hip-extension movement that loads the glutes directly.",
    whatItIs:
      "With your upper back on a bench and a barbell across your hips, you drive the hips up to full extension. It loads the glutes through their strongest range with minimal lower-back strain.",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Quadriceps"],
    steps: [
      "Sit on the floor with your upper back against a bench and roll a (padded) barbell over your hips.",
      "Plant your feet flat, about shoulder-width, so your shins are roughly vertical at the top.",
      "Brace your core, tuck your chin, and drive through your heels to lift the hips to full extension.",
      "Squeeze the glutes hard at the top, then lower under control without dumping into the lower back.",
    ],
    formFaults: [
      {
        fault: "Over-arching the lower back at the top instead of using the glutes.",
        fix: "Tuck the chin, keep the ribs down, and think about a posterior tilt — finish with the glutes, not the spine.",
      },
      {
        fault: "Feet too far forward or back, reducing glute tension.",
        fix: "Position the feet so the shins are vertical at full lockout.",
      },
    ],
    substitutions: ["romanian-deadlift", "bulgarian-split-squat"],
    programmingNote:
      "A great glute-focused accessory. Responds well to higher reps (8–15) with a deliberate top squeeze and full range.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "Do hip thrusts build the glutes better than squats?",
        a: "They load the glutes through a different, shortened range with high tension at lockout, which complements squats and hinges rather than replacing them. Using a mix of movements is more effective than arguing over a single 'best' one.",
      },
      {
        q: "The bar hurts my hips.",
        a: "Use a barbell pad or a folded towel, and make sure the bar sits on the hip bones rather than the soft abdomen. A thicker pad makes heavier loads far more comfortable.",
      },
    ],
  },
  {
    slug: "bulgarian-split-squat",
    name: "Bulgarian split squat",
    aka: ["Rear-foot-elevated split squat"],
    pattern: "legs",
    short: "A single-leg squat that builds the quads and glutes and exposes imbalances.",
    whatItIs:
      "A single-leg squat with your rear foot elevated on a bench. The front leg does almost all the work, building the quads and glutes while challenging balance and evening out side-to-side differences.",
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    steps: [
      "Stand a stride's length in front of a bench and place the top of your rear foot on it.",
      "Hold dumbbells at your sides (or a barbell on your back) and set the front foot far enough forward that the knee can track over the foot.",
      "Lower straight down until your front thigh is roughly parallel to the floor.",
      "Drive through the front heel to stand, keeping most of the weight on the front leg.",
    ],
    formFaults: [
      {
        fault: "Front foot too close, so the knee travels far past the toes and the rear leg takes over.",
        fix: "Step the front foot further forward until the front leg clearly does the work.",
      },
      {
        fault: "Losing balance side to side.",
        fix: "Fix your gaze, brace the core, and hold a rack or light support while you learn the pattern.",
      },
    ],
    substitutions: ["back-squat", "front-squat"],
    programmingNote:
      "An excellent unilateral builder that's easy on the spine. Usually programmed 8–15 reps per leg; start light — it's humbling.",
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
    faq: [
      {
        q: "Why are Bulgarian split squats so hard?",
        a: "One leg supports nearly all the load while also balancing, so the working muscles and stabilisers are taxed heavily at once. That difficulty is exactly why they build strength and expose left-right imbalances.",
      },
      {
        q: "Where should I feel it?",
        a: "In the front-leg quad and glute. A more upright torso emphasises the quad; leaning slightly forward from the hips shifts more onto the glute.",
      },
    ],
  },
  {
    slug: "leg-press",
    name: "Leg press",
    pattern: "legs",
    short: "A machine squat pattern that lets you load the legs with a supported back.",
    whatItIs:
      "A machine exercise where you press a weighted platform away with your legs from a seated or reclined position. It trains the squat pattern's muscles while supporting the spine, allowing heavy loading with less technical and balance demand.",
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings"],
    steps: [
      "Sit in the machine with your whole back and head supported, feet flat on the platform about shoulder-width.",
      "Release the safety catches and take the platform's weight with legs almost — but not fully — locked out.",
      "Lower the platform under control by bending the knees until your thighs approach your torso, without your lower back rounding off the pad.",
      "Press back up through the whole foot to just short of lockout, keeping tension on the legs.",
    ],
    formFaults: [
      {
        fault: "Lowering so deep that the hips curl and the lower back lifts off the pad.",
        fix: "Stop at the depth where the pelvis stays neutral against the pad; a slightly higher foot position can help.",
      },
      {
        fault: "Snapping the knees into full lockout under load.",
        fix: "Stop just short of locking out to keep tension on the muscles and spare the knee joints.",
      },
    ],
    substitutions: ["back-squat", "leg-extension"],
    programmingNote:
      "A joint-friendly way to add quad and glute volume without the stability demand of a barbell squat. Usually trained 8–15 reps; a good option for pushing close to failure safely.",
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
    faq: [
      {
        q: "Is the leg press as good as squats?",
        a: "It trains the same major muscles and lets you load them heavily with the back supported, which is great for volume and for people who struggle with barbell squats. Squats add more core, balance and whole-body carryover, so the two complement each other.",
      },
      {
        q: "Where should I place my feet?",
        a: "A higher, wider foot placement shifts more onto the glutes and hamstrings; a lower, closer one emphasises the quads. Keep your heels down and don't let the knees cave inward.",
      },
    ],
  },
  {
    slug: "goblet-squat",
    name: "Goblet squat",
    pattern: "legs",
    short: "A dumbbell or kettlebell squat held at the chest — great for learning the pattern.",
    whatItIs:
      "A squat performed holding a single dumbbell or kettlebell vertically against your chest. The front-loaded, easy-to-learn position encourages an upright torso and good depth, making it ideal for beginners and for higher-rep leg work.",
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Core", "Upper back"],
    steps: [
      "Hold a dumbbell or kettlebell close to your chest with both hands, elbows tucked down.",
      "Stand with feet about shoulder-width, toes turned out slightly, and brace your core.",
      "Squat straight down between your legs, keeping your chest up and heels planted, until your thighs are at least parallel.",
      "Drive up through the whole foot to standing, keeping the weight tight to your chest.",
    ],
    formFaults: [
      {
        fault: "Letting the weight drift away from the chest, pulling you forward.",
        fix: "Keep the dumbbell pinned against your body and elbows down throughout.",
      },
      {
        fault: "Heels lifting as you descend.",
        fix: "Keep weight mid-foot and work on ankle mobility; a slight heel elevation can help while you learn.",
      },
    ],
    substitutions: ["back-squat", "bulgarian-split-squat"],
    programmingNote:
      "An excellent teaching tool and higher-rep leg builder. Load is limited by what you can hold at the chest, so it's usually programmed 8–15+ reps rather than for maximal strength.",
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
    faq: [
      {
        q: "Are goblet squats good for beginners?",
        a: "Yes — holding the weight at the chest naturally counterbalances you into a more upright, controlled squat, which makes it one of the best ways to learn the pattern before progressing to a barbell.",
      },
      {
        q: "Can I build muscle with just goblet squats?",
        a: "For a while, yes, especially as a newer trainee. Eventually the load you can hold at your chest becomes the limit, at which point a back squat, front squat or leg press lets you keep progressing.",
      },
    ],
  },
  {
    slug: "walking-lunge",
    name: "Walking lunge",
    pattern: "legs",
    short: "A travelling single-leg lunge that builds the quads and glutes and challenges balance.",
    whatItIs:
      "A lunge performed by stepping forward continuously, alternating legs as you travel. Each rep loads one leg at a time, building the quads and glutes while training balance and coordination.",
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    steps: [
      "Stand tall holding dumbbells at your sides (or bodyweight), core braced.",
      "Take a controlled step forward and lower until both knees are bent around 90°, the front thigh roughly parallel to the floor.",
      "Drive through the front heel to bring the rear foot forward into the next step.",
      "Continue alternating legs for the prescribed distance or reps, staying tall throughout.",
    ],
    formFaults: [
      {
        fault: "Short steps that push the front knee far past the toes and onto the ball of the foot.",
        fix: "Take a slightly longer step and sit back into the heel so the shin stays more vertical.",
      },
      {
        fault: "Torso pitching forward and losing balance.",
        fix: "Keep the chest up and eyes forward; slow down and shorten the range until balance improves.",
      },
    ],
    substitutions: ["bulgarian-split-squat", "back-squat"],
    programmingNote:
      "A great unilateral builder and conditioning tool. Often programmed for distance or 8–12 steps per leg; expect it to be humbling and elevate the heart rate.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Walking lunges or split squats?",
        a: "Walking lunges add a dynamic, balance and conditioning element as you travel; Bulgarian split squats keep you in place for more stable, focused loading. Both build the same muscles — pick based on space, goal and preference.",
      },
      {
        q: "Why do my knees feel it more than my muscles?",
        a: "Usually the step is too short, driving the knee forward over the toes. Lengthening the step and sitting into the front heel shifts the work onto the quads and glutes and eases the knee.",
      },
    ],
  },
  {
    slug: "leg-extension",
    name: "Leg extension",
    pattern: "legs",
    short: "A machine isolation exercise that targets the quadriceps directly.",
    whatItIs:
      "A seated machine exercise where you extend your knees against a padded lever, isolating the quadriceps. It loads the quads — including through the lengthened position — without involving the hips or requiring balance.",
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Hip flexors"],
    steps: [
      "Sit in the machine with your back against the pad and knees aligned with the machine's pivot.",
      "Set the shin pad to rest just above your ankles and hold the handles.",
      "Extend your knees to raise the pad until your legs are nearly straight, squeezing the quads.",
      "Lower under control to a full stretch without letting the weight stack crash down.",
    ],
    formFaults: [
      {
        fault: "Using momentum to swing the weight up.",
        fix: "Slow down and control both directions; reduce the load so the quads, not a heave, do the work.",
      },
      {
        fault: "Only doing the top half of the movement.",
        fix: "Lower to a full stretch each rep — the lengthened portion is a key part of the stimulus.",
      },
    ],
    substitutions: ["leg-press", "back-squat"],
    programmingNote:
      "A useful quad-isolation accessory, especially for adding volume or bringing up the quads. Typically 10–20 reps; a good movement to take close to failure safely.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Are leg extensions bad for the knees?",
        a: "For most healthy people used sensibly — controlled reps, reasonable loads — they're a fine quad-building exercise. If you have specific knee issues, moderate the load and range and see how your knees respond, or get individual advice.",
      },
      {
        q: "Do I need them if I squat?",
        a: "Not essential, but they add focused quad volume that compounds don't isolate as directly. They're a helpful accessory if quad size is a priority.",
      },
    ],
  },
  {
    slug: "lying-leg-curl",
    name: "Lying leg curl",
    aka: ["Hamstring curl"],
    pattern: "legs",
    short: "A machine isolation exercise that trains the hamstrings' knee-bending role.",
    whatItIs:
      "A machine exercise where you curl a padded lever toward your glutes by bending the knees, isolating the hamstrings. It trains the hamstrings' knee-flexion function, complementing hip-hinge work like the Romanian deadlift.",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    steps: [
      "Lie face down with the pad resting just above your heels and your knees just off the edge of the bench.",
      "Grip the handles and brace so your hips stay down on the pad.",
      "Curl the pad up toward your glutes by bending the knees, squeezing the hamstrings.",
      "Lower under control to a full stretch without letting your hips pop up.",
    ],
    formFaults: [
      {
        fault: "Hips lifting off the pad to help heave the weight.",
        fix: "Reduce the load and keep the hips pressed down so the hamstrings do the work.",
      },
      {
        fault: "Rushing the lowering phase.",
        fix: "Control the descent to a full stretch — the eccentric is valuable for hamstring growth and health.",
      },
    ],
    substitutions: ["romanian-deadlift", "leg-press"],
    programmingNote:
      "Trains the hamstrings' knee-flexion role that hinges miss, so it pairs well with Romanian deadlifts. Usually 8–15 reps with a controlled tempo.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Do I need leg curls if I do Romanian deadlifts?",
        a: "They're complementary. Hinges like the RDL train the hamstrings' role at the hip, while leg curls train their role at the knee. Doing both covers the muscle more completely than either alone.",
      },
      {
        q: "Lying or seated leg curl?",
        a: "Both work the hamstrings effectively. The seated version trains them in a more lengthened position, which some evidence suggests is a slight advantage for growth, but either is a solid choice.",
      },
    ],
  },
  {
    slug: "standing-calf-raise",
    name: "Standing calf raise",
    pattern: "legs",
    short: "The main isolation exercise for the calves, emphasising the gastrocnemius.",
    whatItIs:
      "An exercise where you rise onto the balls of your feet against resistance, training the calf muscles. Performed with straight legs, it emphasises the larger gastrocnemius muscle of the calf.",
    primaryMuscles: ["Calves (gastrocnemius)"],
    secondaryMuscles: ["Soleus"],
    steps: [
      "Stand with the balls of your feet on a step or machine platform, heels hanging off, legs straight.",
      "Hold onto a support or the machine's pads for balance and load.",
      "Lower your heels below the step to feel a full calf stretch.",
      "Rise up onto your toes as high as possible, pause briefly at the top, then lower under control.",
    ],
    formFaults: [
      {
        fault: "Bouncing quickly through a short range.",
        fix: "Slow down and use a full range — a deep stretch at the bottom and a high squeeze at the top.",
      },
      {
        fault: "Bending the knees and turning it into a partial leg press.",
        fix: "Keep the legs straight so the emphasis stays on the gastrocnemius.",
      },
    ],
    substitutions: ["leg-press", "walking-lunge"],
    programmingNote:
      "The calves tolerate and often need higher reps and frequency. Train through a full range, 10–20+ reps, with a pause in the stretched and contracted positions.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Why won't my calves grow?",
        a: "Calves are used to constant walking, so they often need higher volume, more frequency and a genuinely full range with a strong stretch to grow. Half-repping heavy loads is a common reason progress stalls.",
      },
      {
        q: "Straight or bent legs?",
        a: "Straight-leg raises (standing) bias the gastrocnemius; bent-leg raises (seated) bias the deeper soleus. Training both positions covers the whole calf.",
      },
    ],
  },
  // ---------- PUSH ----------
  {
    slug: "bench-press",
    name: "Bench press",
    aka: ["Flat barbell bench"],
    pattern: "push",
    short: "The benchmark horizontal press for chest, shoulders and triceps.",
    whatItIs:
      "Lying on a bench, you lower a barbell to your chest and press it back up. It is the standard measure of upper-body pressing strength.",
    primaryMuscles: ["Chest (pectorals)"],
    secondaryMuscles: ["Front deltoids", "Triceps"],
    steps: [
      "Lie back with eyes under the bar, feet planted, and set a slight natural arch with your shoulder blades pulled together and down.",
      "Grip a little wider than shoulder-width and un-rack to lockout over your chest.",
      "Lower the bar under control to your lower chest, keeping the elbows around 45–75° from your torso.",
      "Press up and slightly back toward the shoulders to lockout, keeping the shoulder blades set.",
    ],
    formFaults: [
      {
        fault: "Elbows flaring straight out to the sides.",
        fix: "Tuck the elbows to roughly 45–75° from the torso to protect the shoulders and press more efficiently.",
      },
      {
        fault: "Bouncing the bar off the chest.",
        fix: "Lower under control and touch lightly; a brief pause builds control and keeps it honest.",
      },
      {
        fault: "Shoulder blades unset, shoulders rolling forward.",
        fix: "Retract and depress the shoulder blades before un-racking and keep them set throughout.",
      },
    ],
    substitutions: ["incline-bench-press", "overhead-press"],
    programmingNote:
      "A primary push lift. Strength work sits around 3–6 reps, hypertrophy 6–12. Always bench with safeties or a spotter.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "Is arching my back cheating?",
        a: "A moderate, natural arch that keeps your shoulder blades set and feet planted is normal and safer for the shoulders. It's only a problem if it becomes an extreme, uncomfortable arch used purely to shorten the range.",
      },
      {
        q: "How wide should my grip be?",
        a: "Usually a little wider than shoulder-width, so your forearms are roughly vertical when the bar touches your chest. Too wide stresses the shoulders; too narrow shifts work to the triceps.",
      },
    ],
  },
  {
    slug: "incline-bench-press",
    name: "Incline bench press",
    pattern: "push",
    short: "A bench press on an incline that emphasises the upper chest and shoulders.",
    whatItIs:
      "A barbell (or dumbbell) press performed on a bench inclined roughly 15–30°, shifting emphasis toward the upper chest and front deltoids.",
    primaryMuscles: ["Upper chest (clavicular pectorals)"],
    secondaryMuscles: ["Front deltoids", "Triceps"],
    steps: [
      "Set the bench to about 15–30°; steeper turns it into more of a shoulder press.",
      "Set your shoulder blades, plant your feet, and un-rack the bar over your upper chest.",
      "Lower the bar to your upper chest just below the collarbone, elbows moderately tucked.",
      "Press back up to lockout over the same point, keeping the shoulder blades set.",
    ],
    formFaults: [
      {
        fault: "Setting the incline too steep.",
        fix: "Keep it around 15–30°; much steeper shifts most of the work to the front delts.",
      },
      {
        fault: "Lowering the bar too high, toward the neck.",
        fix: "Touch the upper chest just below the collarbone, not the throat.",
      },
    ],
    substitutions: ["bench-press", "overhead-press"],
    programmingNote:
      "A strong upper-chest developer, often used alongside or in place of flat bench. Typically 6–12 reps for hypertrophy.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "What incline is best for upper chest?",
        a: "Around 15–30° hits the upper chest well while keeping the shoulders from taking over. Once you get much past 45° it becomes essentially a shoulder press.",
      },
      {
        q: "Barbell or dumbbell incline?",
        a: "Both work. Dumbbells allow a greater range of motion and even out side-to-side strength; the barbell lets you load more weight and is easier to progress precisely.",
      },
    ],
  },
  {
    slug: "overhead-press",
    name: "Overhead press",
    aka: ["Standing press", "Military press", "OHP"],
    pattern: "push",
    short: "A standing vertical press that builds strong, capable shoulders.",
    whatItIs:
      "Pressing a barbell from the front of your shoulders to overhead while standing. It builds the shoulders and triceps and demands full-body stability.",
    primaryMuscles: ["Shoulders (deltoids)"],
    secondaryMuscles: ["Triceps", "Upper chest", "Core"],
    steps: [
      "Take the bar at shoulder height, hands just outside the shoulders, elbows slightly in front of the bar.",
      "Brace your core and glutes so your torso is a solid pillar; keep the ribs down.",
      "Press the bar straight up, moving your head back slightly so the bar clears your chin.",
      "Once past your forehead, push your head 'through' so the bar locks out over the mid-foot; lower under control.",
    ],
    formFaults: [
      {
        fault: "Leaning back excessively and turning it into an incline press.",
        fix: "Brace the core and squeeze the glutes to keep the torso vertical; reduce load if you can't press without heaving.",
      },
      {
        fault: "Pressing the bar around the face instead of moving the head back.",
        fix: "Tuck the chin and move the head back slightly to let the bar travel in a straight vertical line.",
      },
    ],
    substitutions: ["bench-press", "incline-bench-press"],
    programmingNote:
      "Progresses more slowly than the bench because less muscle is involved — small jumps and patience pay off. Usually 3–8 reps for strength, 8–12 for size.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "Why is my overhead press so much weaker than my bench?",
        a: "The press uses a smaller muscle mass through a longer range and demands full-body stability, so far lower numbers are completely normal — a press around two-thirds of your bench is a common ballpark.",
      },
      {
        q: "Standing or seated press?",
        a: "Standing trains more core and full-body stability and carries over well to athletic tasks; seated (with a back support) removes the balance demand and lets you focus load on the shoulders. Both are useful.",
      },
    ],
  },
  {
    slug: "dumbbell-bench-press",
    name: "Dumbbell bench press",
    aka: ["DB bench"],
    pattern: "push",
    short: "A bench press with dumbbells — greater range and even side-to-side loading.",
    whatItIs:
      "A horizontal press performed with a dumbbell in each hand while lying on a bench. The independent weights allow a greater range of motion and force each side to work equally, building the chest, front shoulders and triceps.",
    primaryMuscles: ["Chest (pectorals)"],
    secondaryMuscles: ["Front deltoids", "Triceps"],
    steps: [
      "Sit on the bench with the dumbbells on your thighs, then lie back, using your legs to help hoist them to your shoulders.",
      "Set your shoulder blades back and down, feet planted, and press the dumbbells to lockout over your chest.",
      "Lower the weights under control to chest level, letting them travel a little wider than a barbell for a full stretch.",
      "Press up and slightly together to lockout, keeping the shoulder blades set.",
    ],
    formFaults: [
      {
        fault: "Letting the dumbbells drift and wobble out of the groove.",
        fix: "Control the path and keep the wrists stacked over the elbows; drop the weight if you can't stabilise it.",
      },
      {
        fault: "Clashing the dumbbells together at the top and losing tension.",
        fix: "Stop just short of touching to keep constant tension on the chest.",
      },
    ],
    substitutions: ["bench-press", "incline-bench-press"],
    programmingNote:
      "A great chest builder with a bigger stretch than the barbell and no bar to pin you. Usually 6–15 reps; getting heavy dumbbells into position is the main practical limit.",
    relatedTools: ["one-rep-max-calculator", "training-volume-calculator"],
    faq: [
      {
        q: "Dumbbell or barbell bench press?",
        a: "Dumbbells give a greater range of motion, even out left-right strength and are safer to bail without a spotter; the barbell lets you load more weight and progress in smaller, precise jumps. Many programmes use both.",
      },
      {
        q: "How do I get heavy dumbbells into position safely?",
        a: "Sit with them on your thighs and 'kick' them up one at a time as you lie back, keeping them close to your body. Reverse the process to put them down rather than dropping them from lockout.",
      },
    ],
  },
  {
    slug: "dip",
    name: "Dip",
    aka: ["Chest dip", "Parallel bar dip"],
    pattern: "push",
    short: "A bodyweight vertical press for the lower chest, triceps and shoulders.",
    whatItIs:
      "A bodyweight exercise where you support yourself on parallel bars and lower and press your whole body up. Leaning forward emphasises the chest; staying upright emphasises the triceps.",
    primaryMuscles: ["Chest (lower pectorals)", "Triceps"],
    secondaryMuscles: ["Front deltoids"],
    steps: [
      "Grip parallel bars and press up to a supported start position with arms straight.",
      "Set the shoulder blades down and brace the core; choose a slight forward lean for chest or upright for triceps.",
      "Lower under control until your upper arms are roughly parallel to the floor, feeling a stretch across the chest and shoulders.",
      "Press back up to lockout without shrugging the shoulders up toward your ears.",
    ],
    formFaults: [
      {
        fault: "Dropping too deep and stressing the shoulders.",
        fix: "Lower only to about upper-arm-parallel, or the depth your shoulders tolerate comfortably.",
      },
      {
        fault: "Shoulders creeping up toward the ears.",
        fix: "Keep the shoulder blades pulled down throughout to protect the shoulder joint.",
      },
    ],
    substitutions: ["bench-press", "push-up"],
    programmingNote:
      "A strong pressing builder that scales from assisted (band or machine) to weighted with a belt. Train 5–12 reps; ease off the depth if the shoulders complain.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Are dips bad for the shoulders?",
        a: "They're demanding on the shoulders at deep ranges, but for most healthy people, dipping to about upper-arm-parallel with the shoulder blades set is fine and productive. If you feel pinching, reduce the depth.",
      },
      {
        q: "How do I make dips harder or easier?",
        a: "Make them easier with a band or an assisted-dip machine and slow negatives; make them harder by adding weight with a dip belt once bodyweight reps become easy.",
      },
    ],
  },
  {
    slug: "dumbbell-shoulder-press",
    name: "Dumbbell shoulder press",
    aka: ["Seated dumbbell press"],
    pattern: "push",
    short: "A vertical press with dumbbells that builds the shoulders through a full range.",
    whatItIs:
      "A press of a dumbbell in each hand from shoulder height to overhead, usually seated with back support. The independent weights allow a natural path and full range while building the shoulders and triceps.",
    primaryMuscles: ["Shoulders (deltoids)"],
    secondaryMuscles: ["Triceps", "Upper chest"],
    steps: [
      "Sit with back support, dumbbells at shoulder height, palms facing forward (or slightly turned in).",
      "Brace your core and keep your ribs down so you don't arch to press.",
      "Press the dumbbells up and slightly together until your arms are nearly straight overhead.",
      "Lower under control back to shoulder height for a full stretch.",
    ],
    formFaults: [
      {
        fault: "Arching the lower back to turn it into an incline press.",
        fix: "Keep the ribs down and core braced; lower the weight if you have to lean back to move it.",
      },
      {
        fault: "Flaring the elbows straight out and clanging the dumbbells overhead.",
        fix: "Keep a slight forward angle to the elbows and stop just short of clashing the weights.",
      },
    ],
    substitutions: ["overhead-press", "incline-bench-press"],
    programmingNote:
      "A shoulder builder that's easier on the joints than a barbell for many, with a bigger range. Typically 8–12 reps; getting the dumbbells up is the main limit when heavy.",
    relatedTools: ["training-volume-calculator", "one-rep-max-calculator"],
    faq: [
      {
        q: "Dumbbell or barbell overhead press?",
        a: "Dumbbells allow a more natural, individual pressing path and a fuller range, and even out side-to-side strength; the barbell lets you load and progress more precisely. Both build strong shoulders.",
      },
      {
        q: "Seated or standing?",
        a: "Seated with back support lets you focus load on the shoulders; standing adds core and full-body stability but limits the weight. Choose based on whether your goal is shoulder size or overall pressing strength.",
      },
    ],
  },
  {
    slug: "lateral-raise",
    name: "Lateral raise",
    aka: ["Side raise", "Dumbbell lateral raise"],
    pattern: "push",
    short: "The key isolation exercise for the side delts and shoulder width.",
    whatItIs:
      "An isolation exercise where you raise dumbbells out to the sides to shoulder height, targeting the side (lateral) deltoids that give the shoulders their width.",
    primaryMuscles: ["Side deltoids"],
    secondaryMuscles: ["Traps", "Front deltoids"],
    steps: [
      "Stand holding light dumbbells at your sides, a slight bend in the elbows.",
      "Keep the torso still and lead with the elbows, raising the weights out to the sides.",
      "Stop at about shoulder height, hands roughly level with the elbows.",
      "Lower under control all the way down, resisting the urge to let them drop.",
    ],
    formFaults: [
      {
        fault: "Swinging the torso and using momentum to throw the weights up.",
        fix: "Use a lighter weight and keep the body still — the side delts respond to control, not heaving.",
      },
      {
        fault: "Shrugging so the traps take over.",
        fix: "Keep the shoulders down and lead with the elbows rather than lifting toward the ears.",
      },
    ],
    substitutions: ["dumbbell-shoulder-press", "overhead-press"],
    programmingNote:
      "Almost everyone chasing wider shoulders benefits from direct side-delt work. Go light with high reps (12–20+) and strict form; leave the ego weights for the presses.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Why can't I go heavy on lateral raises?",
        a: "The side delt is a small muscle working at a long lever, so it's easily overwhelmed and the body starts cheating with momentum and traps. Lighter weight with strict form trains it far better than heaving heavy dumbbells.",
      },
      {
        q: "Do presses train the side delts enough?",
        a: "Presses hit the front delts hard but the side delts less directly, which is why most people who want capped, wider shoulders add dedicated lateral raises.",
      },
    ],
  },
  {
    slug: "cable-fly",
    name: "Cable fly",
    aka: ["Cable crossover", "Pec fly"],
    pattern: "push",
    short: "A cable isolation movement that trains the chest through a big stretch and squeeze.",
    whatItIs:
      "An isolation exercise where you bring two cable handles together in front of you in an arcing, hugging motion with slightly bent arms. Cables keep constant tension on the chest through a full stretch and contraction.",
    primaryMuscles: ["Chest (pectorals)"],
    secondaryMuscles: ["Front deltoids"],
    steps: [
      "Set the pulleys and grab a handle in each hand, taking a staggered stance in the middle.",
      "With a slight, fixed bend in the elbows, start with arms open and a stretch across the chest.",
      "Bring the handles together in an arc in front of you, squeezing the chest at the end.",
      "Return under control to the open, stretched position without losing tension.",
    ],
    formFaults: [
      {
        fault: "Bending and straightening the elbows, turning it into a press.",
        fix: "Keep a fixed, slight elbow bend so the movement comes from the shoulder joint and the chest.",
      },
      {
        fault: "Going so heavy the shoulders roll forward at the stretch.",
        fix: "Reduce the load and keep the shoulder blades set; the stretch should be felt in the chest, not the shoulder joint.",
      },
    ],
    substitutions: ["bench-press", "dumbbell-bench-press"],
    programmingNote:
      "A good chest-isolation accessory that keeps tension where dumbbells lose it. Usually 10–15 reps with a deliberate stretch and squeeze, done after the main presses.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Do I need flyes if I bench press?",
        a: "Not essential, but flyes add a stretch-focused, isolated chest stimulus that presses don't emphasise. They're a useful accessory if chest development is a priority.",
      },
      {
        q: "Cables or dumbbells for flyes?",
        a: "Cables keep tension on the chest throughout, including at the top; dumbbell flyes load the stretch heavily but lose tension near the top. Cables are generally the smoother choice for constant tension.",
      },
    ],
  },
  {
    slug: "push-up",
    name: "Push-up",
    aka: ["Press-up"],
    pattern: "push",
    short: "A scalable bodyweight press for the chest, shoulders and triceps.",
    whatItIs:
      "A bodyweight exercise where you lower and press your body up from a plank position on your hands. It trains the same pushing muscles as the bench press while also demanding core stability.",
    primaryMuscles: ["Chest (pectorals)"],
    secondaryMuscles: ["Front deltoids", "Triceps", "Core"],
    steps: [
      "Set your hands a little wider than shoulder-width, body in a straight line from head to heels.",
      "Brace your core and glutes so your hips don't sag or pike.",
      "Lower under control until your chest is just above the floor, elbows around 45° from the torso.",
      "Press back up to full arm extension, keeping the body rigid throughout.",
    ],
    formFaults: [
      {
        fault: "Hips sagging or piking up instead of a straight body line.",
        fix: "Brace the core and squeeze the glutes so the body stays rigid like a plank.",
      },
      {
        fault: "Flaring the elbows straight out to the sides.",
        fix: "Tuck the elbows to around 45° to protect the shoulders and press more efficiently.",
      },
    ],
    substitutions: ["bench-press", "dip"],
    programmingNote:
      "Endlessly scalable: elevate the hands to make it easier, elevate the feet or add load to make it harder. Great for volume and can be trained frequently in the 8–20+ rep range.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Are push-ups enough to build a chest?",
        a: "For beginners and for endurance, yes for a while. As you get stronger you'll need to make them harder — feet elevated, weighted, or slower — to keep progressing, or add loaded pressing like the bench press.",
      },
      {
        q: "How do I make push-ups harder without equipment?",
        a: "Elevate your feet, slow the lowering phase, pause at the bottom, or move toward single-arm progressions. Adding reps only takes you so far; increasing difficulty keeps the stimulus growing.",
      },
    ],
  },
  {
    slug: "triceps-pushdown",
    name: "Triceps pushdown",
    aka: ["Cable pushdown"],
    pattern: "push",
    short: "A cable isolation exercise for the triceps.",
    whatItIs:
      "An isolation exercise where you push a cable attachment down by extending your elbows, isolating the triceps. Constant cable tension makes it a reliable, joint-friendly way to add triceps volume.",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Forearms"],
    steps: [
      "Set a high pulley with a bar or rope, and stand close with a slight forward lean.",
      "Tuck your elbows to your sides and grip the attachment with forearms roughly parallel to the floor.",
      "Extend the elbows to push the attachment down until your arms are straight, squeezing the triceps.",
      "Return under control to the start without letting the elbows drift forward.",
    ],
    formFaults: [
      {
        fault: "Elbows flaring out and drifting forward, recruiting the shoulders and chest.",
        fix: "Pin the elbows to your sides so the movement comes only from the elbow joint.",
      },
      {
        fault: "Leaning the whole bodyweight into the weight to force it down.",
        fix: "Reduce the load and keep the torso still, letting the triceps do the work.",
      },
    ],
    substitutions: ["dip", "overhead-press"],
    programmingNote:
      "A staple triceps accessory that spares the elbows compared to heavy pressing. Usually 10–20 reps; a rope lets you spread the ends at the bottom for a stronger contraction.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Do I need direct triceps work if I press a lot?",
        a: "Pressing already trains the triceps heavily, so it isn't essential — but a little direct work like pushdowns is an efficient way to add arm size and can be gentler on the elbows than more heavy pressing.",
      },
      {
        q: "Bar or rope attachment?",
        a: "A straight or angled bar lets you load a bit more; a rope lets you spread the ends apart at the bottom for a stronger squeeze. Rotating between them over time is a sensible approach.",
      },
    ],
  },
  // ---------- PULL ----------
  {
    slug: "barbell-row",
    name: "Barbell row",
    aka: ["Bent-over row"],
    pattern: "pull",
    short: "A hinged horizontal pull that builds a thick, strong back.",
    whatItIs:
      "Hinging at the hips with a flat back, you row a barbell to your torso. It builds the mid-back, lats and rear shoulders and reinforces the hinge position.",
    primaryMuscles: ["Lats", "Mid-back (rhomboids, traps)"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Spinal erectors"],
    steps: [
      "Hinge at the hips with a flat back until your torso is roughly 15–45° above horizontal, knees softly bent.",
      "Let the bar hang with arms straight, gripping around shoulder-width.",
      "Pull the bar to your lower ribs / upper stomach, leading with the elbows and squeezing the shoulder blades.",
      "Lower under control to full arm extension without letting the torso rise.",
    ],
    formFaults: [
      {
        fault: "Standing up / using the torso to heave the weight.",
        fix: "Keep the torso angle fixed and let the arms and back do the work; lighten the load if you're jerking it.",
      },
      {
        fault: "Rounding the lower back.",
        fix: "Brace hard, set the back flat before pulling, and reduce load to hold position.",
      },
    ],
    substitutions: ["lat-pulldown", "pull-up"],
    programmingNote:
      "A key back builder that also strengthens the hinge. Usually 6–12 reps; keep the torso still so the back, not momentum, does the work.",
    relatedTools: BARBELL_TOOLS,
    faq: [
      {
        q: "What angle should my torso be?",
        a: "Anywhere from roughly 15° to 45° above horizontal works; more horizontal targets the mid-back and lats more but is harder on the lower back. Pick an angle you can hold steady for every rep.",
      },
      {
        q: "Overhand or underhand grip?",
        a: "An overhand grip emphasises the upper back and rear delts; an underhand (supinated) grip lets the biceps assist and often shifts the pull lower toward the lats. Both are useful variations.",
      },
    ],
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    aka: ["Chin-up (underhand)"],
    pattern: "pull",
    short: "A bodyweight vertical pull and a benchmark of relative upper-body strength.",
    whatItIs:
      "Hanging from a bar and pulling your chin over it. It builds the lats and upper back and is a strong marker of strength relative to bodyweight.",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Mid-back", "Biceps", "Rear deltoids", "Core"],
    steps: [
      "Hang from the bar with an overhand grip around shoulder-width, shoulders active (not fully slack).",
      "Set the shoulder blades down and back, and brace the core.",
      "Pull your elbows down toward your ribs until your chin clears the bar.",
      "Lower under control to a full hang without letting the shoulders go completely loose.",
    ],
    formFaults: [
      {
        fault: "Kipping or swinging to generate momentum.",
        fix: "Brace the core and pull from a controlled hang; if you can't do a strict rep, use assistance rather than swinging.",
      },
      {
        fault: "Half reps that don't reach full range.",
        fix: "Start from a full hang and pull until the chin clears the bar; reduce difficulty with a band or machine if needed.",
      },
    ],
    substitutions: ["lat-pulldown", "barbell-row"],
    programmingNote:
      "If you can't yet do one, build with band-assisted or machine-assisted reps and slow negatives. Once you can do many, add load with a belt. Train in the 4–12 rep range.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Pull-up vs chin-up?",
        a: "A pull-up uses an overhand grip and leans more on the lats and upper back; a chin-up uses an underhand grip and lets the biceps contribute more, so most people find chin-ups slightly easier.",
      },
      {
        q: "How do I get my first pull-up?",
        a: "Combine band- or machine-assisted pull-ups, slow lowering (negatives) from the top, and back work like rows. Training the movement two to three times a week with gradually less assistance builds it up.",
      },
    ],
  },
  {
    slug: "lat-pulldown",
    name: "Lat pulldown",
    pattern: "pull",
    short: "A cable vertical pull — the scalable stand-in for the pull-up.",
    whatItIs:
      "Seated at a cable machine, you pull a bar down to your upper chest. It trains the same vertical-pull pattern as the pull-up with easily adjustable load.",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Mid-back", "Biceps", "Rear deltoids"],
    steps: [
      "Set the thigh pad so you're anchored, and grip the bar a little wider than shoulder-width.",
      "Sit tall, then set the shoulder blades down before you begin the pull.",
      "Pull the bar to your upper chest by driving the elbows down and back, keeping a slight torso lean.",
      "Return under control to full stretch overhead without shrugging up into the shoulders.",
    ],
    formFaults: [
      {
        fault: "Leaning way back and using momentum.",
        fix: "Keep the torso fairly upright with only a slight lean; let the lats, not a body swing, move the weight.",
      },
      {
        fault: "Pulling the bar behind the neck.",
        fix: "Pull to the upper chest in front — behind-the-neck pulldowns stress the shoulders for no added benefit.",
      },
    ],
    substitutions: ["pull-up", "barbell-row"],
    programmingNote:
      "A reliable lat builder and pull-up regression/accessory. Typically 8–15 reps with a focus on feeling the lats and a full stretch at the top.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Is the lat pulldown as good as pull-ups?",
        a: "It trains the same pattern and is excellent for building the lats, with the advantage of adjustable load. Pull-ups add a greater core and stabilisation demand, so the two complement each other well.",
      },
      {
        q: "Wide grip or close grip?",
        a: "A wide overhand grip biases the upper lats and back width; a closer or underhand grip increases biceps involvement and range. Varying grips over time is a sensible approach.",
      },
    ],
  },
  {
    slug: "dumbbell-curl",
    name: "Dumbbell curl",
    aka: ["Biceps curl"],
    pattern: "pull",
    short: "The classic isolation exercise for the biceps.",
    whatItIs:
      "Curling a dumbbell from a straight arm to full flexion, isolating the biceps. A simple, effective accessory for arm size.",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms", "Front deltoids"],
    steps: [
      "Stand or sit holding dumbbells at your sides, palms facing forward (or neutral to start).",
      "Keep your elbows pinned to your sides and your torso still.",
      "Curl the weight up by flexing the elbow, squeezing the biceps at the top.",
      "Lower under control all the way to a straight arm before the next rep.",
    ],
    formFaults: [
      {
        fault: "Swinging the torso to heave the weight up.",
        fix: "Keep the torso still and elbows fixed; if you have to swing, the weight is too heavy.",
      },
      {
        fault: "Cutting the range short at the bottom or top.",
        fix: "Straighten the arm fully each rep and curl to full flexion — partial reps leave gains on the table.",
      },
    ],
    substitutions: ["pull-up", "barbell-row"],
    programmingNote:
      "An accessory, not a main lift — the big pulls already train the biceps. Higher reps (8–15) with strict form work well; leave the ego at the door.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Do I even need direct biceps work?",
        a: "Rows and pull-ups already train the biceps heavily, so they aren't essential — but a little direct curl work is an efficient way to add arm size if that's a goal.",
      },
      {
        q: "Should I curl both arms together or alternate?",
        a: "Both are fine. Alternating lets you focus on each arm and often allows slightly stricter form; curling together is more time-efficient. Pick whichever keeps your form clean.",
      },
    ],
  },
  {
    slug: "seated-cable-row",
    name: "Seated cable row",
    aka: ["Cable row"],
    pattern: "pull",
    short: "A supported horizontal pull with constant cable tension for the mid-back.",
    whatItIs:
      "A seated exercise where you pull a cable handle to your torso, training the mid-back and lats. The supported position and constant tension make it easy to load the back without the lower-back demand of a bent-over row.",
    primaryMuscles: ["Lats", "Mid-back (rhomboids, traps)"],
    secondaryMuscles: ["Rear deltoids", "Biceps"],
    steps: [
      "Sit with feet braced and knees softly bent, holding the handle with arms extended and a tall torso.",
      "Set the shoulder blades down, then pull the handle to your lower ribs by driving the elbows back.",
      "Squeeze the shoulder blades together at the end without leaning far back.",
      "Return under control to a full stretch, letting the shoulder blades travel forward without slumping.",
    ],
    formFaults: [
      {
        fault: "Heaving the torso back and forth to move the weight.",
        fix: "Keep the torso fairly upright and still; let the arms and back do the work, not a rowing-machine swing.",
      },
      {
        fault: "Rounding the back at the stretch.",
        fix: "Allow the shoulder blades to move but keep the spine neutral rather than slumping forward.",
      },
    ],
    substitutions: ["barbell-row", "lat-pulldown"],
    programmingNote:
      "A back-thickness builder that's easy on the lower back, so it suits higher volume. Usually 8–15 reps with a focus on squeezing the mid-back and a full stretch.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Seated cable row or barbell row?",
        a: "The cable row supports your torso and keeps constant tension, making it easier to target the back with less lower-back fatigue; the barbell row trains more of the whole posterior chain and hinge. They complement each other well.",
      },
      {
        q: "Which handle should I use?",
        a: "A close-grip handle is the standard for the mid-back; a wide bar shifts emphasis toward the upper back and rear delts. Varying the handle over time trains the back from different angles.",
      },
    ],
  },
  {
    slug: "dumbbell-row",
    name: "Dumbbell row",
    aka: ["One-arm row", "Single-arm dumbbell row"],
    pattern: "pull",
    short: "A single-arm horizontal pull that builds the back and evens out imbalances.",
    whatItIs:
      "A single-arm row, usually braced with a hand and knee on a bench, pulling a dumbbell to your side. Working one side at a time builds the lats and mid-back and evens out left-right differences.",
    primaryMuscles: ["Lats", "Mid-back"],
    secondaryMuscles: ["Rear deltoids", "Biceps"],
    steps: [
      "Place one knee and hand on a bench, back flat and roughly parallel to the floor, dumbbell in the free hand.",
      "Let the dumbbell hang with the shoulder blade slightly protracted, then set it down and back.",
      "Pull the dumbbell to your hip/lower ribs, driving the elbow up and back.",
      "Lower under control to a full stretch without rotating the torso to help.",
    ],
    formFaults: [
      {
        fault: "Twisting the torso to heave the weight up.",
        fix: "Keep the shoulders and hips square to the floor; reduce the load if you have to rotate to lift it.",
      },
      {
        fault: "Shrugging the weight up toward the ear instead of rowing.",
        fix: "Drive the elbow back toward the hip and keep the shoulder down.",
      },
    ],
    substitutions: ["barbell-row", "seated-cable-row"],
    programmingNote:
      "An excellent unilateral back builder with a big range of motion and low lower-back stress. Usually 8–15 reps per side with a controlled stretch.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Why single-arm rows?",
        a: "Working one side at a time lets you brace the torso, use a bigger range of motion, and even out any strength difference between sides — while keeping the lower back supported rather than holding a hinge.",
      },
      {
        q: "Where should I pull the dumbbell to?",
        a: "Toward your hip or lower ribs rather than straight up to the chest, driving the elbow back. That path keeps the lats and mid-back working rather than turning it into a shrug.",
      },
    ],
  },
  {
    slug: "face-pull",
    name: "Face pull",
    pattern: "pull",
    short: "A cable pull to the face that builds the rear delts and upper-back health.",
    whatItIs:
      "A cable exercise where you pull a rope toward your face, elbows high, training the rear deltoids and upper-back muscles. It's a staple for shoulder health and posture, balancing all the pressing most people do.",
    primaryMuscles: ["Rear deltoids", "Mid-back (rhomboids, traps)"],
    secondaryMuscles: ["Rotator cuff"],
    steps: [
      "Set a pulley to roughly head height with a rope attachment and grip both ends.",
      "Step back to tension, arms extended, and set a tall posture.",
      "Pull the rope toward your face, spreading the ends apart so your hands finish beside your ears, elbows high.",
      "Squeeze the rear delts and upper back, then return under control.",
    ],
    formFaults: [
      {
        fault: "Turning it into a heavy row with the elbows dropping low.",
        fix: "Keep the elbows high and the pull aimed at the face; use lighter weight and focus on the rear delts.",
      },
      {
        fault: "Using so much weight the whole body leans back.",
        fix: "Reduce the load and stay tall so the rear delts and upper back do the work.",
      },
    ],
    substitutions: ["seated-cable-row", "lateral-raise"],
    programmingNote:
      "A high-value 'prehab' accessory that balances pressing volume and supports shoulder health. Train light with high reps (12–20+) and a deliberate squeeze; hard to do too much of.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Why should I do face pulls?",
        a: "Most people press far more than they pull horizontally at shoulder height, which can leave the rear delts and upper back underdeveloped. Face pulls target exactly those muscles and are widely used to support shoulder health and posture.",
      },
      {
        q: "How heavy should face pulls be?",
        a: "Light. They're about control and a strong contraction in small muscles, not maximal load. If your form breaks down or the body starts heaving, the weight is too high.",
      },
    ],
  },
  {
    slug: "barbell-curl",
    name: "Barbell curl",
    pattern: "pull",
    short: "A barbell biceps curl that lets you load the arms with the most weight.",
    whatItIs:
      "A curl of a barbell (straight or EZ-bar) from a straight-arm hang to full flexion, isolating the biceps. Both arms working together on a bar allow heavier loading than single dumbbells.",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    steps: [
      "Stand holding the bar with an underhand, shoulder-width grip, arms straight.",
      "Keep the elbows pinned to your sides and the torso still.",
      "Curl the bar up by flexing the elbows, squeezing the biceps at the top.",
      "Lower under control to a full stretch before the next rep.",
    ],
    formFaults: [
      {
        fault: "Swinging the torso and using the hips to heave the bar up.",
        fix: "Keep the torso still and elbows fixed; if you have to swing, reduce the weight.",
      },
      {
        fault: "Not straightening the arms at the bottom.",
        fix: "Lower to a full stretch each rep rather than cutting the range short.",
      },
    ],
    substitutions: ["dumbbell-curl", "hammer-curl"],
    programmingNote:
      "The heaviest-loading direct biceps exercise. Usually 6–12 reps; an EZ-bar is friendlier on the wrists than a straight bar for many people.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Straight bar or EZ-bar?",
        a: "An EZ-bar's angled grips are easier on the wrists and elbows for most people, while a straight bar keeps the hands fully supinated for slightly more direct biceps work. Use whichever lets you train pain-free.",
      },
      {
        q: "Barbell or dumbbell curls?",
        a: "The barbell lets you load the most weight and progress precisely; dumbbells allow supination, even out side-to-side differences and let each arm move naturally. Using both over time is a good approach.",
      },
    ],
  },
  {
    slug: "hammer-curl",
    name: "Hammer curl",
    aka: ["Neutral-grip curl"],
    pattern: "pull",
    short: "A neutral-grip curl that builds the biceps and the brachialis and forearms.",
    whatItIs:
      "A dumbbell curl performed with a neutral (palms-facing) grip throughout. The position emphasises the brachialis beneath the biceps and the forearm, adding thickness to the arm.",
    primaryMuscles: ["Biceps", "Brachialis"],
    secondaryMuscles: ["Forearms"],
    steps: [
      "Stand holding dumbbells at your sides with palms facing your thighs (neutral grip).",
      "Keep the elbows pinned and torso still.",
      "Curl the weights up while keeping the palms facing inward the whole time.",
      "Squeeze at the top, then lower under control to a straight arm.",
    ],
    formFaults: [
      {
        fault: "Rotating the wrists as you curl.",
        fix: "Keep the palms facing inward throughout — that neutral grip is the whole point of the movement.",
      },
      {
        fault: "Swinging the torso for momentum.",
        fix: "Keep the elbows fixed and the body still; drop the weight if you have to heave.",
      },
    ],
    substitutions: ["dumbbell-curl", "barbell-curl"],
    programmingNote:
      "A great addition for arm thickness and forearm involvement, and often more comfortable than a supinated curl. Usually 8–15 reps as an accessory.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "What's the difference from a normal curl?",
        a: "The neutral (palms-in) grip shifts emphasis onto the brachialis — a muscle under the biceps that pushes the biceps up when developed — and the forearm, whereas a supinated curl targets the biceps more directly.",
      },
      {
        q: "Do hammer curls build bigger arms?",
        a: "They can add thickness by developing the brachialis and forearms alongside the biceps, which is why many people rotate them in with supinated curls rather than choosing one or the other.",
      },
    ],
  },
  {
    slug: "shrug",
    name: "Shrug",
    aka: ["Barbell shrug", "Dumbbell shrug"],
    pattern: "pull",
    short: "A direct trap-builder — elevating the shoulders against load.",
    whatItIs:
      "An exercise where you elevate your shoulders straight up against a loaded barbell or dumbbells, isolating the upper trapezius. It's the main direct movement for building the upper traps.",
    primaryMuscles: ["Traps (upper)"],
    secondaryMuscles: ["Forearms"],
    steps: [
      "Stand holding a barbell or dumbbells at arm's length, shoulders relaxed down.",
      "Brace the core and keep the arms straight throughout.",
      "Elevate the shoulders straight up toward your ears as high as possible.",
      "Pause briefly at the top, then lower under control to a full stretch.",
    ],
    formFaults: [
      {
        fault: "Rolling the shoulders in circles.",
        fix: "Shrug straight up and down — rolling adds no benefit and can irritate the shoulders.",
      },
      {
        fault: "Bending the elbows to help lift.",
        fix: "Keep the arms straight so the traps, not the biceps, do the work.",
      },
    ],
    substitutions: ["barbell-row", "seated-cable-row"],
    programmingNote:
      "A simple, effective upper-trap builder. Usually 8–15 reps with a pause at the top; a full range and controlled tempo beat bouncing heavy weight.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Do I need to train traps directly?",
        a: "Deadlifts, rows and carries already train the traps hard, so direct shrugs aren't essential. They're a useful add-on if bigger upper traps are a specific goal.",
      },
      {
        q: "Should I roll my shoulders when shrugging?",
        a: "No — shrug straight up and down. Rolling the shoulders adds no extra benefit and puts the joint in a weaker position under load.",
      },
    ],
  },
  // ---------- CORE ----------
  {
    slug: "plank",
    name: "Plank",
    aka: ["Front plank"],
    pattern: "core",
    short: "An isometric hold that trains the core to resist extension and stay rigid.",
    whatItIs:
      "An isometric exercise where you hold a straight-body position on your forearms and toes. It trains the core's main job — resisting movement (here, anti-extension) to keep the spine stable — rather than crunching.",
    primaryMuscles: ["Core (rectus abdominis, deep core)"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    steps: [
      "Set your forearms on the floor under your shoulders, legs extended behind you on your toes.",
      "Form a straight line from head to heels, tucking the pelvis slightly so the lower back doesn't sag.",
      "Brace the abs and squeeze the glutes, keeping the neck neutral.",
      "Hold for time, breathing steadily, and stop when your form starts to break.",
    ],
    formFaults: [
      {
        fault: "Hips sagging toward the floor.",
        fix: "Tuck the pelvis and squeeze the glutes and abs to keep a straight line; shorten the hold if you can't hold position.",
      },
      {
        fault: "Hips piking up into an easy tent shape.",
        fix: "Bring the hips down in line with the shoulders and heels so the core actually works.",
      },
    ],
    substitutions: ["hanging-leg-raise", "ab-wheel-rollout"],
    programmingNote:
      "Train quality over marathon holds — once you can hold a solid position for around 45–60 seconds, add difficulty (weight, longer lever, reaching) rather than just chasing minutes.",
    relatedTools: [],
    faq: [
      {
        q: "How long should I hold a plank?",
        a: "Long holds have diminishing returns. Once you can hold a strong, straight position for around a minute, it's more useful to make it harder — add weight, extend the lever, or add reaching movements — than to keep extending the time.",
      },
      {
        q: "Why do I feel it in my lower back?",
        a: "That usually means the hips are sagging and the back is taking over. Tuck the pelvis, squeeze the glutes and abs, and shorten the hold until you can keep a flat, braced line.",
      },
    ],
  },
  {
    slug: "hanging-leg-raise",
    name: "Hanging leg raise",
    pattern: "core",
    short: "A hanging movement that trains the lower abs through hip flexion.",
    whatItIs:
      "An exercise where you hang from a bar and raise your legs, training the abdominals as they flex the trunk and control the legs. Bending the knees makes it easier; keeping the legs straight makes it harder.",
    primaryMuscles: ["Core (rectus abdominis)"],
    secondaryMuscles: ["Hip flexors", "Forearms"],
    steps: [
      "Hang from a bar with an overhand grip, shoulders active and body still.",
      "Brace the core and, without swinging, raise your knees (easier) or straight legs (harder) upward.",
      "Curl the pelvis slightly at the top to fully engage the abs rather than only the hip flexors.",
      "Lower under control to a dead hang without letting the body swing.",
    ],
    formFaults: [
      {
        fault: "Swinging the body to fling the legs up.",
        fix: "Slow down, brace, and control both directions; regress to bent knees if you can't do it without swinging.",
      },
      {
        fault: "Only raising the legs with the hip flexors and no pelvic curl.",
        fix: "Add a slight posterior tilt of the pelvis at the top so the abs, not just the hip flexors, do the work.",
      },
    ],
    substitutions: ["plank", "cable-crunch"],
    programmingNote:
      "Regress with bent knees or lying leg raises; progress toward straight legs and eventually toes-to-bar. Train 8–15 controlled reps rather than swinging for numbers.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "I feel it more in my hip flexors than my abs.",
        a: "The hip flexors always assist, but adding a small pelvic curl (tucking the pelvis) at the top brings the abs in more. Bending the knees and slowing down also shifts the emphasis toward the abs.",
      },
      {
        q: "My grip gives out before my abs.",
        a: "That's common. Straps can help you keep training the abs, and your grip will also improve over time from the hanging itself.",
      },
    ],
  },
  {
    slug: "cable-crunch",
    name: "Cable crunch",
    aka: ["Kneeling cable crunch"],
    pattern: "core",
    short: "A loadable crunch that lets you progressively overload the abs.",
    whatItIs:
      "A kneeling exercise where you crunch your torso down against a cable's resistance, flexing the spine. Because you can add weight, it lets you train the abs with progressive overload like any other muscle.",
    primaryMuscles: ["Core (rectus abdominis)"],
    secondaryMuscles: ["Obliques"],
    steps: [
      "Kneel below a high pulley with a rope, holding the ends by your head.",
      "Hinge slightly at the hips to set your starting position with the abs under tension.",
      "Crunch down by rounding your spine and bringing your ribs toward your pelvis — lead with the abs, not the arms.",
      "Return under control to a stretch without letting the weight pull you upright by the lower back.",
    ],
    formFaults: [
      {
        fault: "Turning it into a hip hinge or a lat pulldown with straight abs.",
        fix: "Keep the hips fairly fixed and round the spine — the movement is the ribs curling toward the pelvis.",
      },
      {
        fault: "Yanking with the arms.",
        fix: "Anchor the hands by your head and move from the abs, not by pulling the rope down with the arms.",
      },
    ],
    substitutions: ["hanging-leg-raise", "plank"],
    programmingNote:
      "One of the few ab exercises you can genuinely load, so it suits progressive overload. Train 10–20 reps with a full crunch and stretch; add weight over time as with any lift.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Should I train abs with weight?",
        a: "The abs are a muscle and respond to progressive overload like any other. Loadable movements like the cable crunch let you add resistance over time, which is more effective for building them than endless bodyweight crunches.",
      },
      {
        q: "Will ab training give me a six-pack?",
        a: "It builds the muscle, but whether it's visible depends on body-fat level. You can't spot-reduce fat, so a visible six-pack comes from overall fat loss combined with developing the abs.",
      },
    ],
  },
  {
    slug: "ab-wheel-rollout",
    name: "Ab wheel rollout",
    aka: ["Ab rollout"],
    pattern: "core",
    short: "A demanding anti-extension exercise using a rolling wheel.",
    whatItIs:
      "An exercise where you roll a small wheel forward, extending your body, then pull it back — while the core fights to stop the lower back from over-extending. It's one of the hardest and most effective anti-extension core exercises.",
    primaryMuscles: ["Core (rectus abdominis, deep core)"],
    secondaryMuscles: ["Lats", "Shoulders"],
    steps: [
      "Kneel holding the wheel under your shoulders, core braced and pelvis tucked.",
      "Roll the wheel forward as far as you can control while keeping the lower back from sagging.",
      "Stop before your hips drop or your back arches, then reverse.",
      "Pull the wheel back to the start by contracting the abs, staying braced throughout.",
    ],
    formFaults: [
      {
        fault: "Letting the lower back arch and hips sag as you roll out.",
        fix: "Only roll out as far as you can keep the pelvis tucked and back flat; shorten the range until you're stronger.",
      },
      {
        fault: "Pulling back with the hips/arms instead of the abs.",
        fix: "Initiate the return by contracting the abs, keeping the arms and hips along for the ride.",
      },
    ],
    substitutions: ["plank", "hanging-leg-raise"],
    programmingNote:
      "Start from the knees with a short range and progress the distance as you get stronger; standing rollouts are an advanced goal. Train 5–12 controlled reps — quality over range.",
    relatedTools: [],
    faq: [
      {
        q: "Why do I feel ab rollouts in my lower back?",
        a: "It usually means you're rolling out further than your core can control, so the lower back arches to compensate. Shorten the range, keep the pelvis tucked, and only extend as far as you can stay braced.",
      },
      {
        q: "How do I progress the ab wheel?",
        a: "Start on your knees with a small rollout, then gradually increase the distance you roll as your core strengthens. The eventual advanced progression is rolling out from your feet rather than your knees.",
      },
    ],
  },
  {
    slug: "pallof-press",
    name: "Pallof press",
    aka: ["Anti-rotation press"],
    pattern: "core",
    short: "An anti-rotation exercise that trains the core to resist twisting.",
    whatItIs:
      "An exercise where you press a cable or band straight out from your chest while it tries to rotate you, and your core resists. It trains anti-rotation — a key, often-neglected core function for a stable, protected trunk.",
    primaryMuscles: ["Core (obliques, deep core)"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    steps: [
      "Set a cable or band at chest height and stand side-on, holding the handle at your sternum with both hands.",
      "Step out to create tension and brace your core, feet about shoulder-width.",
      "Press the handle straight out in front of you, resisting the pull that tries to twist you toward the machine.",
      "Hold briefly, then return to your chest under control. Complete the reps, then face the other way.",
    ],
    formFaults: [
      {
        fault: "Letting the torso rotate toward the machine as you press.",
        fix: "Brace hard and keep the shoulders and hips square; reduce the resistance so you can resist the twist.",
      },
      {
        fault: "Using the arms and shoulders instead of bracing the core.",
        fix: "Think of the arms as a rigid link and let the core do the anti-rotation work.",
      },
    ],
    substitutions: ["plank", "ab-wheel-rollout"],
    programmingNote:
      "A joint-friendly, highly transferable core exercise that trains stability rather than crunching. Train both sides for controlled reps or short holds; progress by adding resistance or stepping further from the anchor.",
    relatedTools: [],
    faq: [
      {
        q: "What's the point of anti-rotation training?",
        a: "A major job of the core is resisting unwanted movement to protect and stabilise the spine, including resisting rotation. The Pallof press trains exactly that, which carries over to lifting, sport and everyday bracing better than crunches alone.",
      },
      {
        q: "Cable or resistance band?",
        a: "Both work well. A cable gives smooth, consistent resistance and easy load adjustment; a band is portable and cheap. Use whichever you have access to.",
      },
    ],
  },
  {
    slug: "back-extension",
    name: "Back extension",
    aka: ["Hyperextension"],
    pattern: "core",
    short: "A posterior-chain movement for the lower-back muscles, glutes and hamstrings.",
    whatItIs:
      "An exercise performed on a bench or roman chair where you hinge at the hips and extend back up, training the spinal erectors along with the glutes and hamstrings. It strengthens the often-neglected posterior side of the trunk.",
    primaryMuscles: ["Spinal erectors"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    steps: [
      "Set up on the bench with your hips supported at the pad and feet anchored.",
      "Cross your arms or hold a light weight at your chest, body straight.",
      "Hinge down at the hips under control, keeping the spine neutral.",
      "Extend back up until your body is in a straight line — squeezing the glutes — without over-arching past straight.",
    ],
    formFaults: [
      {
        fault: "Over-extending and cranking the back past a straight line at the top.",
        fix: "Stop when the body is straight; there's no benefit to hyper-arching the spine under load.",
      },
      {
        fault: "Rounding the spine to reach lower.",
        fix: "Keep a neutral spine and hinge from the hips; reduce the range if the back rounds.",
      },
    ],
    substitutions: ["plank", "romanian-deadlift"],
    programmingNote:
      "Strengthens the spinal erectors, glutes and hamstrings and supports bigger hinge lifts. Usually 10–15 reps; add light load at the chest before chasing heavy weight, and keep the top position neutral.",
    relatedTools: ["training-volume-calculator"],
    faq: [
      {
        q: "Are back extensions safe for the lower back?",
        a: "Done with a neutral spine and stopping at a straight-body position (not cranking into hyperextension), they're a productive way to strengthen the lower back and posterior chain. Avoid yanking into an over-arched top position under load.",
      },
      {
        q: "Do they work the glutes or the lower back?",
        a: "Both, and you can bias one: rounding the upper back slightly and thinking 'hips' emphasises the glutes and hamstrings, while staying rigid emphasises the spinal erectors. Foot and torso position shift the balance.",
      },
    ],
  },
];

export const exercisesBySlug: ReadonlyMap<string, ExerciseEntry> = new Map(
  exercises.map((e) => [e.slug, e]),
);

export const patternsBySlug: ReadonlyMap<string, ExercisePattern> = new Map(
  exercisePatterns.map((p) => [p.slug, p]),
);

export function getExercise(slug: string): ExerciseEntry | undefined {
  return exercisesBySlug.get(slug);
}

export function getPattern(slug: string): ExercisePattern | undefined {
  return patternsBySlug.get(slug);
}

export function exercisesForPattern(pattern: MovementPattern): ExerciseEntry[] {
  return exercises
    .filter((e) => e.pattern === pattern)
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

/** Every static path in the section, for generateStaticParams + sitemap. */
export function allExercisePaths(): { pattern: MovementPattern; exercise?: string }[] {
  return exercisePatterns.flatMap((p) => [
    { pattern: p.slug },
    ...exercisesForPattern(p.slug).map((e) => ({ pattern: p.slug, exercise: e.slug })),
  ]);
}

/** Resolve substitution slugs to their entries (skips any that don't exist). */
export function resolveSubstitutions(slugs: string[]): ExerciseEntry[] {
  return slugs.flatMap((slug) => {
    const e = exercisesBySlug.get(slug);
    return e ? [e] : [];
  });
}
