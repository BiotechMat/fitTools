/**
 * Glossary catalogue — the full 200-term reference list (source:
 * CONTENT-glossary-200.md), grouped by theme for the /glossary hub.
 *
 * This is the *breadth* layer that sits alongside the in-depth glossary entries
 * in `glossary.ts` (the *depth* layer). Each catalogue term carries a one-line
 * plain-English definition; where a term also has a full explainer page, its
 * `slug` links across to that entry so the hub interlinks the two layers
 * (CONTENT-reference.md §6, §8). Keeping the catalogue as structured data (not
 * MDX) lets the hub render, group and cross-link it automatically, and lets the
 * unit tests hold every `slug` to a real glossary entry.
 */

export interface CatalogueTerm {
  /** Display term, exactly as listed in the source reference. */
  term: string;
  /** One-line plain-English definition. */
  def: string;
  /** Slug of the in-depth glossary entry, when one exists (validated). */
  slug?: string;
}

export interface CatalogueGroup {
  category: string;
  items: CatalogueTerm[];
}

export const GLOSSARY_CATALOGUE_LAST_REVIEWED = "2026-07-23";

export const glossaryCatalogue: CatalogueGroup[] = [
  {
    category: "Training & strength",
    items: [
      { term: "1RM (one-rep max)", def: "The most weight you can lift for a single repetition of an exercise.", slug: "one-rep-max" },
      { term: "Hypertrophy", def: "Growth in muscle size from training and adequate protein.", slug: "hypertrophy" },
      { term: "Progressive overload", def: "Gradually increasing demand (load, reps, volume) to keep adapting.", slug: "progressive-overload" },
      { term: "Training volume", def: "Total work done, usually sets × reps × load, or weekly hard sets.", slug: "volume" },
      { term: "Training intensity", def: "How heavy a load is, typically expressed as a percentage of 1RM." },
      { term: "Tempo", def: "The speed of each rep phase, often written as four digits (e.g. 3-1-1-0)." },
      { term: "Time under tension", def: "Total duration a muscle is loaded during a set.", slug: "time-under-tension" },
      { term: "Repetition (rep)", def: "One complete movement of an exercise." },
      { term: "Set", def: "A group of consecutive reps performed without rest." },
      { term: "Superset", def: "Two exercises performed back-to-back with no rest between.", slug: "superset" },
      { term: "Drop set", def: "Continuing a set at a lighter load after reaching failure." },
      { term: "Rest-pause", def: "Brief pauses within a set to squeeze out extra reps." },
      { term: "RPE (rate of perceived exertion)", def: "A subjective 1–10 scale of how hard an effort felt.", slug: "rpe" },
      { term: "RIR (reps in reserve)", def: "How many more reps you could have done before failure.", slug: "rir" },
      { term: "Periodization", def: "Structured variation of training variables over time.", slug: "periodisation" },
      { term: "Deload", def: "A planned lighter week to aid recovery and manage fatigue.", slug: "deload" },
      { term: "Concentric", def: "The lifting (muscle-shortening) phase of a rep.", slug: "concentric" },
      { term: "Eccentric", def: "The lowering (muscle-lengthening) phase of a rep.", slug: "eccentric" },
      { term: "Isometric", def: "A contraction with no change in muscle length (a hold).", slug: "isometric" },
      { term: "Compound exercise", def: "A movement working multiple joints and muscle groups (e.g. squat).", slug: "compound-exercise" },
      { term: "Isolation exercise", def: "A single-joint movement targeting one muscle (e.g. bicep curl).", slug: "isolation-exercise" },
      { term: "Range of motion", def: "The full distance a joint moves during an exercise.", slug: "range-of-motion" },
      { term: "Muscular endurance", def: "The ability to sustain repeated contractions over time." },
      { term: "Strength", def: "The maximum force a muscle or group can produce." },
      { term: "Power", def: "Force produced quickly; work divided by time." },
      { term: "Rate of force development", def: "How fast force is generated, key to explosiveness." },
      { term: "Mechanical tension", def: "Force on the muscle, the primary driver of hypertrophy.", slug: "mechanical-tension" },
      { term: "Metabolic stress", def: "The “burn” from metabolite build-up during training." },
      { term: "Muscle damage", def: "Micro-tears from training that prompt repair and adaptation." },
      { term: "Mind-muscle connection", def: "Consciously focusing on the target muscle during a lift." },
    ],
  },
  {
    category: "Cardio & endurance",
    items: [
      { term: "VO2 max", def: "The maximum rate of oxygen your body can use; a key aerobic-fitness marker.", slug: "vo2max" },
      { term: "Lactate threshold", def: "The intensity at which lactate accumulates faster than it clears.", slug: "lactate-threshold" },
      { term: "Anaerobic threshold", def: "The point where energy production shifts strongly to anaerobic pathways." },
      { term: "Aerobic capacity", def: "The body's ability to produce energy using oxygen." },
      { term: "Zone 2 training", def: "Easy, conversational-pace cardio that builds aerobic base and mitochondria.", slug: "zone-2" },
      { term: "Heart rate reserve", def: "The gap between resting and maximum heart rate, used to set zones." },
      { term: "Maximum heart rate", def: "The highest heart rate you can reach, estimated by age formulas.", slug: "max-heart-rate" },
      { term: "Resting heart rate", def: "Heart rate at complete rest; lower generally reflects better fitness.", slug: "resting-heart-rate" },
      { term: "Heart rate variability (HRV)", def: "Beat-to-beat variation, used as a recovery and stress marker.", slug: "hrv" },
      { term: "Steady-state cardio", def: "Continuous exercise at a constant moderate intensity." },
      { term: "HIIT", def: "High-intensity interval training: hard bursts with recovery periods.", slug: "hiit" },
      { term: "LISS", def: "Low-intensity steady-state cardio." },
      { term: "Fartlek", def: "“Speed play”; unstructured mixing of fast and slow running." },
      { term: "Tempo run", def: "Sustained effort near lactate threshold to raise it." },
      { term: "Interval training", def: "Alternating work and rest bouts at set intensities." },
      { term: "Running economy", def: "How much energy you use to run at a given pace." },
      { term: "Cadence", def: "Steps (or pedal strokes) per minute." },
      { term: "EPOC (afterburn)", def: "Excess post-exercise oxygen consumption; calories burned recovering.", slug: "epoc" },
      { term: "Cardiac output", def: "Blood pumped by the heart per minute (rate × stroke volume)." },
      { term: "Stroke volume", def: "Blood ejected by the heart per beat." },
    ],
  },
  {
    category: "Nutrition & diet",
    items: [
      { term: "Calorie", def: "A unit of food energy (kilocalorie in everyday use)." },
      { term: "Macronutrient", def: "Energy-providing nutrients: protein, carbohydrate and fat.", slug: "macronutrient" },
      { term: "Micronutrient", def: "Vitamins and minerals needed in small amounts.", slug: "micronutrient" },
      { term: "Protein", def: "Macronutrient of amino acids for tissue repair and enzymes." },
      { term: "Carbohydrate", def: "Macronutrient and primary fuel, stored as glycogen." },
      { term: "Dietary fat", def: "Energy-dense macronutrient essential for hormones and absorption." },
      { term: "Fiber", def: "Indigestible carbohydrate supporting gut health and satiety." },
      { term: "TDEE (total daily energy expenditure)", def: "All calories burned in a day.", slug: "tdee" },
      { term: "BMR (basal metabolic rate)", def: "Energy used at complete rest for basic functions.", slug: "bmr" },
      { term: "RMR (resting metabolic rate)", def: "Energy at rest; slightly higher than BMR." },
      { term: "NEAT", def: "Non-exercise activity thermogenesis: calories from daily movement.", slug: "neat" },
      { term: "TEF (thermic effect of food)", def: "Calories burned digesting and processing food." },
      { term: "Caloric deficit", def: "Eating fewer calories than you burn, driving fat loss." },
      { term: "Caloric surplus", def: "Eating more than you burn, enabling weight/muscle gain." },
      { term: "Maintenance calories", def: "The intake that keeps weight stable." },
      { term: "Energy balance", def: "The relationship between calories in and calories out.", slug: "energy-balance" },
      { term: "Glycemic index", def: "How quickly a food raises blood glucose relative to a reference.", slug: "glycaemic-index" },
      { term: "Glycemic load", def: "Glycemic index adjusted for actual carbohydrate portion." },
      { term: "Net carbs", def: "Total carbs minus fiber (and sometimes sugar alcohols)." },
      { term: "Complete protein", def: "A protein containing all nine essential amino acids." },
      { term: "Essential amino acid", def: "An amino acid the body cannot make and must eat.", slug: "essential-amino-acids" },
      { term: "Leucine threshold", def: "The leucine dose thought to maximally trigger muscle synthesis.", slug: "leucine" },
      { term: "Nutrient timing", def: "Strategically timing intake around training." },
      { term: "Carb cycling", def: "Alternating higher- and lower-carbohydrate days." },
      { term: "Refeed", def: "A planned higher-calorie (usually carb) day during a diet." },
      { term: "Reverse dieting", def: "Gradually raising calories after a diet to limit fat regain." },
      { term: "Intermittent fasting", def: "Cycling between eating and fasting windows." },
      { term: "Ketosis", def: "A metabolic state burning fat-derived ketones for fuel." },
      { term: "Ketogenic diet", def: "A very-low-carb, high-fat diet that induces ketosis." },
      { term: "Glycogen", def: "Stored carbohydrate in muscle and liver.", slug: "glycogen" },
      { term: "Gluconeogenesis", def: "Making glucose from non-carbohydrate sources." },
      { term: "Satiety", def: "The feeling of fullness that ends eating." },
      { term: "Bioavailability", def: "The proportion of a nutrient actually absorbed and used." },
      { term: "Nutrient density", def: "Nutrients provided per calorie of food." },
      { term: "Protein leverage", def: "The drive to keep eating until protein needs are met." },
    ],
  },
  {
    category: "Body composition",
    items: [
      { term: "Body composition", def: "The proportions of fat, muscle, bone and water in the body." },
      { term: "Body fat percentage", def: "The share of total body mass that is fat.", slug: "body-fat-percentage" },
      { term: "Lean body mass", def: "Total mass minus fat mass.", slug: "lean-body-mass" },
      { term: "Fat-free mass", def: "Everything in the body except fat.", slug: "lean-body-mass" },
      { term: "FFMI (fat-free mass index)", def: "A muscularity metric adjusting lean mass for height." },
      { term: "BMI (body mass index)", def: "Weight over height squared; a rough population screen." },
      { term: "Visceral fat", def: "Fat around internal organs, linked to metabolic risk.", slug: "visceral-fat" },
      { term: "Subcutaneous fat", def: "Fat stored under the skin." },
      { term: "Waist-to-hip ratio", def: "Waist divided by hip circumference; a fat-distribution marker." },
      { term: "Waist-to-height ratio", def: "Waist divided by height; a simple central-fat risk marker." },
      { term: "Body recomposition", def: "Losing fat and gaining muscle simultaneously.", slug: "body-recomposition" },
      { term: "Bulking", def: "Eating in a surplus to prioritise muscle gain." },
      { term: "Cutting", def: "Eating in a deficit to lose fat while keeping muscle." },
      { term: "Muscle protein synthesis", def: "The building of new muscle protein.", slug: "protein-synthesis" },
      { term: "Muscle protein breakdown", def: "The breakdown of muscle protein, balanced against synthesis." },
      { term: "Net protein balance", def: "Synthesis minus breakdown; positive means muscle gain." },
      { term: "Catabolism", def: "Metabolic breakdown of tissue for energy." },
      { term: "Anabolism", def: "Metabolic building of tissue." },
      { term: "Sarcopenia", def: "Age-related loss of muscle mass and strength.", slug: "sarcopenia" },
      { term: "Hyperplasia", def: "An increase in the number of muscle cells (vs enlarging existing ones)." },
    ],
  },
  {
    category: "Physiology & anatomy",
    items: [
      { term: "Skeletal muscle", def: "Voluntary muscle attached to bone that moves the body." },
      { term: "Smooth muscle", def: "Involuntary muscle in organs and blood vessels." },
      { term: "Cardiac muscle", def: "The involuntary muscle of the heart." },
      { term: "Type I muscle fiber", def: "Slow-twitch, fatigue-resistant, endurance-oriented." },
      { term: "Type II muscle fiber", def: "Fast-twitch, powerful, quicker to fatigue." },
      { term: "Motor unit", def: "A motor neuron and all the muscle fibers it controls." },
      { term: "Neuromuscular junction", def: "The synapse where nerve meets muscle." },
      { term: "Sarcomere", def: "The contractile unit of muscle." },
      { term: "Actin", def: "The thin filament in muscle contraction." },
      { term: "Myosin", def: "The thick filament that pulls on actin to contract muscle." },
      { term: "Mitochondria", def: "Cellular “powerhouses” that produce ATP." },
      { term: "Capillary density", def: "The number of small blood vessels supplying a tissue." },
      { term: "Tendon", def: "Connective tissue attaching muscle to bone." },
      { term: "Ligament", def: "Connective tissue attaching bone to bone." },
      { term: "Fascia", def: "Connective tissue that wraps and separates muscles and organs." },
      { term: "Cartilage", def: "Flexible connective tissue cushioning joints." },
      { term: "Synovial fluid", def: "Lubricating fluid inside joints." },
      { term: "Bone density", def: "The mineral content of bone; a fracture-risk marker." },
      { term: "Osteoblast", def: "A cell that builds new bone." },
      { term: "Osteoclast", def: "A cell that breaks down bone." },
      { term: "Central nervous system", def: "The brain and spinal cord." },
      { term: "Autonomic nervous system", def: "Controls involuntary functions like heart rate." },
      { term: "Sympathetic nervous system", def: "The “fight-or-flight” branch." },
      { term: "Parasympathetic nervous system", def: "The “rest-and-digest” branch." },
      { term: "Proprioception", def: "The body's sense of its own position and movement." },
      { term: "Homeostasis", def: "The maintenance of stable internal conditions." },
      { term: "Blood pressure", def: "The force of blood against artery walls." },
      { term: "Systolic / diastolic", def: "Pressure during heartbeats / between heartbeats." },
      { term: "Hemoglobin", def: "The oxygen-carrying protein in red blood cells." },
      { term: "Hematocrit", def: "The proportion of blood volume made up of red cells." },
    ],
  },
  {
    category: "Biochemistry & cellular",
    items: [
      { term: "ATP (adenosine triphosphate)", def: "The body's immediate energy currency." },
      { term: "Creatine phosphate", def: "A rapid backup for regenerating ATP during short efforts." },
      { term: "Glycolysis", def: "Breaking glucose down for energy, with or without oxygen." },
      { term: "Krebs cycle", def: "The aerobic energy cycle in mitochondria (citric-acid cycle)." },
      { term: "Oxidative phosphorylation", def: "The main oxygen-using ATP-production process." },
      { term: "Aerobic metabolism", def: "Energy production using oxygen." },
      { term: "Anaerobic metabolism", def: "Energy production without oxygen." },
      { term: "Lactate", def: "A by-product of anaerobic glucose breakdown, also a fuel." },
      { term: "Enzyme", def: "A protein that speeds up biochemical reactions." },
      { term: "Hormone", def: "A chemical messenger released into the blood." },
      { term: "Neurotransmitter", def: "A chemical messenger between nerve cells." },
      { term: "Free radical", def: "A reactive molecule that can damage cells." },
      { term: "Oxidative stress", def: "Imbalance between free radicals and antioxidants." },
      { term: "Antioxidant", def: "A compound that neutralises free radicals." },
      { term: "Inflammation", def: "The immune response to injury or stress; acute or chronic." },
      { term: "Cytokine", def: "A signalling protein of the immune system." },
      { term: "Autophagy", def: "The cell's recycling of damaged components.", slug: "autophagy" },
      { term: "Apoptosis", def: "Programmed, orderly cell death." },
      { term: "Protein synthesis", def: "The cellular building of proteins from amino acids.", slug: "protein-synthesis" },
      { term: "mTOR", def: "A signalling pathway that drives growth and protein synthesis.", slug: "mtor" },
      { term: "AMPK", def: "An energy-sensing pathway activated by exercise and fasting." },
      { term: "Insulin signaling", def: "How insulin tells cells to take up glucose." },
      { term: "GLUT4", def: "The muscle glucose transporter recruited by insulin and exercise." },
      { term: "NAD+", def: "A coenzyme central to energy metabolism and repair." },
      { term: "Telomere", def: "Protective DNA caps on chromosomes that shorten with age." },
    ],
  },
  {
    category: "Hormones & endocrine",
    items: [
      { term: "Testosterone", def: "Anabolic sex hormone influencing muscle, bone, mood and libido.", slug: "testosterone" },
      { term: "Estrogen", def: "Sex hormone important for reproduction, bone and cardiovascular health." },
      { term: "Cortisol", def: "The primary stress hormone, following a daily rhythm.", slug: "cortisol" },
      { term: "Insulin", def: "Hormone that lowers blood glucose and drives storage." },
      { term: "Glucagon", def: "Hormone that raises blood glucose between meals." },
      { term: "Growth hormone", def: "Hormone supporting growth, repair and fat metabolism." },
      { term: "IGF-1", def: "A growth factor mediating many effects of growth hormone." },
      { term: "Thyroid hormone (T3/T4)", def: "Hormones that set metabolic rate." },
      { term: "TSH", def: "Thyroid-stimulating hormone; the first-line thyroid test.", slug: "tsh" },
      { term: "Leptin", def: "The satiety hormone signalling energy stores to the brain." },
      { term: "Ghrelin", def: "The “hunger hormone” that stimulates appetite." },
      { term: "Adrenaline (epinephrine)", def: "Fight-or-flight hormone raising heart rate and fuel." },
      { term: "Noradrenaline (norepinephrine)", def: "Stress hormone and neurotransmitter for arousal." },
      { term: "Melatonin", def: "Hormone that signals darkness and regulates sleep timing." },
      { term: "DHEA", def: "An adrenal hormone precursor to sex hormones." },
      { term: "Adiponectin", def: "A fat-cell hormone improving insulin sensitivity." },
      { term: "Insulin sensitivity", def: "How responsive cells are to insulin (higher is better).", slug: "insulin-sensitivity" },
      { term: "Insulin resistance", def: "Reduced response to insulin, a metabolic-risk state." },
      { term: "Anabolic hormone", def: "A hormone promoting tissue building (e.g. testosterone, insulin)." },
      { term: "Catabolic hormone", def: "A hormone promoting tissue breakdown (e.g. cortisol)." },
    ],
  },
  {
    category: "Cardiometabolic & health markers",
    items: [
      { term: "LDL cholesterol", def: "“Bad” cholesterol associated with arterial plaque.", slug: "ldl-cholesterol" },
      { term: "HDL cholesterol", def: "“Good” cholesterol that helps clear cholesterol.", slug: "hdl-cholesterol" },
      { term: "Triglycerides", def: "The main circulating blood fat.", slug: "triglycerides" },
      { term: "ApoB", def: "A protein counting atherogenic particles; a precise cardiovascular-risk marker.", slug: "apob" },
      { term: "Lp(a)", def: "A largely genetic lipoprotein raising heart-attack and stroke risk.", slug: "lp-a" },
      { term: "HbA1c", def: "Average blood glucose over ~3 months; the standard glucose-control marker.", slug: "hba1c" },
      { term: "Fasting glucose", def: "Blood sugar after an overnight fast.", slug: "fasting-glucose" },
      { term: "hs-CRP", def: "High-sensitivity C-reactive protein, a chronic-inflammation marker.", slug: "hs-crp" },
      { term: "Lipid panel", def: "A blood test of cholesterol and triglyceride levels." },
      { term: "Metabolic syndrome", def: "A cluster of risk factors (waist, blood pressure, glucose, lipids).", slug: "metabolic-syndrome" },
      { term: "Atherosclerosis", def: "The build-up of plaque narrowing and hardening arteries." },
      { term: "eGFR", def: "Estimated glomerular filtration rate; a kidney-function marker.", slug: "creatinine" },
      { term: "Homocysteine", def: "An amino acid linked to cardiovascular risk when elevated.", slug: "homocysteine" },
      { term: "Biological age", def: "An estimate of physiological age from biomarkers, vs calendar age.", slug: "biological-age" },
      { term: "Metabolic flexibility", def: "The ability to switch efficiently between fat and carb fuel." },
    ],
  },
  {
    category: "Recovery, sleep & wellness",
    items: [
      { term: "Sleep cycle", def: "A ~90-minute progression through sleep stages, repeated nightly." },
      { term: "REM sleep", def: "Rapid-eye-movement sleep, important for memory and mood." },
      { term: "Slow-wave sleep", def: "Deep sleep central to physical recovery and hormone release." },
      { term: "Circadian rhythm", def: "The body's ~24-hour internal clock governing sleep and metabolism." },
      { term: "Overtraining syndrome", def: "Performance decline from training that outpaces recovery." },
    ],
  },
];

/** Flat list of every catalogue term, in source order. */
export const glossaryCatalogueTerms: CatalogueTerm[] = glossaryCatalogue.flatMap(
  (g) => g.items,
);

/** Total number of terms in the catalogue (for the hub's intro copy). */
export const glossaryCatalogueCount = glossaryCatalogueTerms.length;
