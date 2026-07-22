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

export type MovementPattern = "legs" | "push" | "pull";

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
