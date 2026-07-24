/**
 * Supplement catalogue — the full 200-supplement reference list (source:
 * CONTENT-supplements-200.md), grouped by category for the /supplements hub.
 *
 * Every distinct supplement on the list now has its own evidence-rated page in
 * the registry (`supplements.ts` + `supplementsExtra.ts`), so every catalogue
 * line links through via `slug`. Near-identical forms of one supplement (the
 * several whey, magnesium, creatine and omega-3 forms, etc.) intentionally
 * point at a single canonical page. The one-line `note` is the neutral
 * identity from the source list; the linked page carries the full evidence
 * rating, body and citation.
 *
 * This list is descriptive, not a recommendation: evidence strength across it
 * ranges from very strong to weak or preliminary, and regulatory status varies
 * by country. Kept as structured data so the hub renders and cross-links it
 * automatically and the unit tests hold every `slug` to a real page.
 */

export interface CatalogueSupplement {
  /** Display name, exactly as listed in the source reference. */
  name: string;
  /** One-line note on what it is typically taken for. */
  note: string;
  /** Slug of the supplement's evidence-rated page (validated). */
  slug: string;
}

export interface SupplementCatalogueGroup {
  category: string;
  items: CatalogueSupplement[];
}

export const SUPPLEMENT_CATALOGUE_LAST_REVIEWED = "2026-07-23";

export const supplementCatalogue: SupplementCatalogueGroup[] = [
  {
    category: "Protein & amino acids",
    items: [
      { name: "Whey protein (concentrate)", note: "Fast-digesting dairy protein for muscle protein synthesis.", slug: "whey-protein" },
      { name: "Whey protein isolate", note: "Higher-purity whey, lower in lactose and fat.", slug: "whey-protein" },
      { name: "Whey protein hydrolysate", note: "Pre-digested whey for faster absorption.", slug: "whey-protein" },
      { name: "Casein protein", note: "Slow-digesting dairy protein, often taken before sleep.", slug: "casein" },
      { name: "Micellar casein", note: "Minimally processed slow-release casein.", slug: "casein" },
      { name: "Milk protein (blend)", note: "Combined whey/casein blend.", slug: "milk-protein" },
      { name: "Soy protein isolate", note: "Complete plant protein.", slug: "soy-protein" },
      { name: "Pea protein", note: "Popular vegan protein, high in leucine.", slug: "pea-protein" },
      { name: "Rice protein", note: "Vegan protein, often blended with pea.", slug: "rice-protein" },
      { name: "Hemp protein", note: "Plant protein with fibre and omega fats.", slug: "hemp-protein" },
      { name: "Egg white protein", note: "Dairy-free complete animal protein.", slug: "egg-white-protein" },
      { name: "Collagen peptides", note: "Connective-tissue protein for skin, joints, hair, nails.", slug: "collagen" },
      { name: "BCAAs", note: "Leucine, isoleucine, valine; marketed for muscle preservation.", slug: "bcaa" },
      { name: "EAAs", note: "Full spectrum of essential amino acids.", slug: "eaa" },
      { name: "L-Leucine", note: "Key trigger amino acid for muscle protein synthesis.", slug: "leucine" },
      { name: "L-Isoleucine", note: "Branched-chain amino acid.", slug: "bcaa" },
      { name: "L-Valine", note: "Branched-chain amino acid.", slug: "bcaa" },
      { name: "L-Glutamine", note: "Conditionally essential amino acid, gut and recovery claims.", slug: "glutamine" },
      { name: "L-Citrulline", note: "Nitric-oxide precursor for pumps and blood flow.", slug: "citrulline-malate" },
      { name: "Citrulline malate", note: "Citrulline bonded to malate, common pre-workout.", slug: "citrulline-malate" },
      { name: "L-Arginine", note: "Nitric-oxide precursor (poorer absorption than citrulline).", slug: "arginine" },
      { name: "Beta-alanine", note: "Buffers muscle acidity; causes tingling.", slug: "beta-alanine" },
      { name: "Taurine", note: "Amino acid for endurance, hydration and heart claims.", slug: "taurine" },
      { name: "L-Carnitine", note: "Fatty-acid transport, marketed for fat metabolism.", slug: "l-carnitine" },
      { name: "Acetyl-L-carnitine (ALCAR)", note: "Brain-penetrant carnitine form.", slug: "l-carnitine" },
      { name: "L-Carnitine L-tartrate", note: "Recovery-oriented carnitine form.", slug: "l-carnitine" },
      { name: "Glycine", note: "Amino acid for sleep, collagen and glutathione synthesis.", slug: "glycine" },
      { name: "L-Tyrosine", note: "Dopamine/noradrenaline precursor for stress and focus.", slug: "tyrosine" },
      { name: "L-Tryptophan", note: "Serotonin precursor for mood and sleep.", slug: "tryptophan" },
      { name: "HMB (β-hydroxy β-methylbutyrate)", note: "Leucine metabolite, muscle-preservation claims.", slug: "hmb" },
    ],
  },
  {
    category: "Performance & ergogenic aids",
    items: [
      { name: "Creatine monohydrate", note: "Best-evidenced strength/power supplement.", slug: "creatine-monohydrate" },
      { name: "Creatine HCl", note: "More soluble creatine form.", slug: "creatine-monohydrate" },
      { name: "Caffeine (anhydrous)", note: "Central-nervous-system stimulant, ergogenic aid.", slug: "caffeine" },
      { name: "Sodium bicarbonate", note: "Buffering agent for high-intensity efforts.", slug: "sodium-bicarbonate" },
      { name: "Beetroot / dietary nitrate", note: "Boosts nitric oxide and endurance economy.", slug: "beetroot-juice" },
      { name: "Betaine (TMG)", note: "Trimethylglycine for power output and methylation.", slug: "betaine" },
      { name: "Alpha-GPC", note: "Choline source, marketed for power and focus.", slug: "alpha-gpc" },
      { name: "Electrolyte powder", note: "Sodium, potassium, magnesium for hydration.", slug: "electrolytes" },
      { name: "PeakO2 (mushroom blend)", note: "Adaptogenic blend marketed for endurance.", slug: "peako2" },
      { name: "Exogenous ketones (BHB)", note: "Ketone bodies for fuel and focus claims.", slug: "exogenous-ketones" },
      { name: "Cordyceps", note: "Mushroom marketed for oxygen use and endurance.", slug: "cordyceps" },
      { name: "Pre-workout (blend)", note: "Mixed stimulant/pump formula.", slug: "pre-workout" },
      { name: "Deer antler velvet (IGF)", note: "Growth-factor marketing; weak evidence.", slug: "deer-antler-velvet" },
      { name: "Peak ATP (adenosine triphosphate)", note: "Marketed for strength and blood flow.", slug: "peak-atp" },
      { name: "Guarana", note: "Natural caffeine source.", slug: "guarana" },
    ],
  },
  {
    category: "Vitamins",
    items: [
      { name: "Vitamin A (retinol)", note: "Vision, skin and immune function.", slug: "vitamin-a" },
      { name: "Beta-carotene", note: "Provitamin-A antioxidant.", slug: "beta-carotene" },
      { name: "Vitamin B1 (thiamine)", note: "Energy metabolism.", slug: "vitamin-b1" },
      { name: "Vitamin B2 (riboflavin)", note: "Energy metabolism, migraine claims.", slug: "vitamin-b2" },
      { name: "Vitamin B3 (niacin)", note: "NAD precursor, lipid claims.", slug: "vitamin-b3" },
      { name: "Vitamin B5 (pantothenic acid)", note: "Coenzyme-A synthesis.", slug: "vitamin-b5" },
      { name: "Vitamin B6 (pyridoxine)", note: "Amino-acid metabolism, PMS claims.", slug: "vitamin-b6" },
      { name: "Vitamin B7 (biotin)", note: "Hair, skin and nail marketing.", slug: "biotin" },
      { name: "Vitamin B9 (folate / folic acid)", note: "DNA synthesis, pregnancy essential.", slug: "folate" },
      { name: "Vitamin B12 (methylcobalamin)", note: "Nerve and red-cell health; vegan staple.", slug: "vitamin-b12" },
      { name: "Vitamin C (ascorbic acid)", note: "Antioxidant, collagen, immune support.", slug: "vitamin-c" },
      { name: "Vitamin D3 (cholecalciferol)", note: "Bone, immune and muscle function.", slug: "vitamin-d" },
      { name: "Vitamin E (tocopherol)", note: "Fat-soluble antioxidant.", slug: "vitamin-e" },
      { name: "Vitamin K1 (phylloquinone)", note: "Blood clotting.", slug: "vitamin-k" },
      { name: "Vitamin K2 (MK-7)", note: "Calcium routing to bone, arterial-health claims.", slug: "vitamin-k" },
      { name: "Multivitamin", note: "Broad micronutrient insurance.", slug: "multivitamin" },
      { name: "B-complex", note: "Combined B vitamins.", slug: "b-complex" },
      { name: "Choline (bitartrate)", note: "Liver and brain nutrient.", slug: "choline" },
      { name: "Inositol", note: "Insulin-signalling and mood/PCOS claims.", slug: "inositol" },
      { name: "Folinic acid", note: "Bioavailable folate form.", slug: "folate" },
      { name: "Methylfolate (5-MTHF)", note: "Active folate for MTHFR variants.", slug: "folate" },
      { name: "Adenosylcobalamin", note: "Mitochondrial B12 form.", slug: "vitamin-b12" },
      { name: "Vitamin D2 (ergocalciferol)", note: "Plant-derived vitamin D.", slug: "vitamin-d" },
      { name: "Tocotrienols", note: "Vitamin E subfamily with distinct antioxidant claims.", slug: "vitamin-e" },
      { name: "Nicotinamide", note: "Non-flushing niacin form, skin-health claims.", slug: "vitamin-b3" },
    ],
  },
  {
    category: "Minerals",
    items: [
      { name: "Magnesium glycinate", note: "Well-absorbed, calming magnesium form.", slug: "magnesium" },
      { name: "Magnesium citrate", note: "Common form, mild laxative effect.", slug: "magnesium" },
      { name: "Magnesium oxide", note: "Cheap, poorly absorbed, laxative.", slug: "magnesium" },
      { name: "Magnesium L-threonate", note: "Brain-penetrant form, cognition claims.", slug: "magnesium" },
      { name: "Magnesium malate", note: "Energy and muscle-pain claims.", slug: "magnesium" },
      { name: "Zinc (picolinate/citrate)", note: "Immune, testosterone and skin function.", slug: "zinc" },
      { name: "Iron (ferrous sulfate)", note: "Corrects iron-deficiency anaemia.", slug: "iron" },
      { name: "Iron bisglycinate", note: "Gentler-on-stomach iron.", slug: "iron" },
      { name: "Calcium carbonate", note: "Bone mineral, antacid.", slug: "calcium" },
      { name: "Calcium citrate", note: "Better-absorbed calcium form.", slug: "calcium" },
      { name: "Potassium", note: "Electrolyte for blood pressure and muscle.", slug: "potassium" },
      { name: "Selenium", note: "Antioxidant and thyroid mineral.", slug: "selenium" },
      { name: "Copper", note: "Enzyme cofactor, balanced against zinc.", slug: "copper" },
      { name: "Iodine (kelp)", note: "Thyroid-hormone synthesis.", slug: "iodine" },
      { name: "Chromium (picolinate)", note: "Marketed for blood-sugar control.", slug: "chromium" },
      { name: "Manganese", note: "Enzyme cofactor.", slug: "manganese" },
      { name: "Molybdenum", note: "Trace enzyme cofactor.", slug: "molybdenum" },
      { name: "Boron", note: "Bone and hormone-support claims.", slug: "boron" },
      { name: "Sodium (salt tablets)", note: "Endurance electrolyte replacement.", slug: "electrolytes" },
      { name: "Phosphorus", note: "Bone and energy mineral.", slug: "phosphorus" },
      { name: "Silica / silicon", note: "Connective-tissue and hair claims.", slug: "silica" },
      { name: "Vanadium", note: "Blood-sugar marketing; weak evidence.", slug: "vanadium" },
      { name: "Lithium orotate", note: "Low-dose mood-support marketing.", slug: "lithium-orotate" },
      { name: "ZMA", note: "Zinc, magnesium and B6 combo for sleep/recovery.", slug: "zma" },
      { name: "Trace mineral drops", note: "Broad-spectrum ionic minerals.", slug: "trace-minerals" },
    ],
  },
  {
    category: "Fatty acids & lipids",
    items: [
      { name: "Fish oil (EPA/DHA)", note: "Omega-3s for heart, brain and inflammation.", slug: "omega-3" },
      { name: "Krill oil", note: "Phospholipid-bound omega-3 with astaxanthin.", slug: "omega-3" },
      { name: "Algae oil (vegan omega-3)", note: "Plant DHA/EPA source.", slug: "omega-3" },
      { name: "Cod liver oil", note: "Omega-3s plus vitamins A and D.", slug: "omega-3" },
      { name: "Flaxseed oil", note: "Plant ALA omega-3.", slug: "flaxseed-oil" },
      { name: "Evening primrose oil", note: "GLA omega-6, skin and PMS claims.", slug: "gla-oils" },
      { name: "Borage oil", note: "High-GLA omega-6 source.", slug: "gla-oils" },
      { name: "CLA (conjugated linoleic acid)", note: "Marketed for body composition.", slug: "cla" },
      { name: "MCT oil", note: "Medium-chain fats for energy and ketogenic diets.", slug: "mct-oil" },
      { name: "Omega-7 (palmitoleic acid)", note: "Metabolic and skin claims.", slug: "omega-7" },
      { name: "Phosphatidylcholine", note: "Cell-membrane and liver phospholipid.", slug: "phosphatidylcholine" },
      { name: "Lecithin (sunflower/soy)", note: "Emulsifier and choline source.", slug: "phosphatidylcholine" },
      { name: "Black seed oil (nigella)", note: "Thymoquinone, broad wellness claims.", slug: "black-seed-oil" },
    ],
  },
  {
    category: "Joint, bone & connective tissue",
    items: [
      { name: "Glucosamine sulfate", note: "Cartilage-building block for joint comfort.", slug: "glucosamine-chondroitin" },
      { name: "Chondroitin sulfate", note: "Often paired with glucosamine.", slug: "glucosamine-chondroitin" },
      { name: "MSM (methylsulfonylmethane)", note: "Sulfur compound for joints and skin.", slug: "msm" },
      { name: "Hyaluronic acid", note: "Joint lubrication and skin hydration.", slug: "hyaluronic-acid" },
      { name: "UC-II (undenatured type II collagen)", note: "Low-dose joint collagen.", slug: "uc-ii" },
      { name: "Gelatin", note: "Collagen source for connective tissue.", slug: "collagen" },
      { name: "Boswellia serrata", note: "Anti-inflammatory resin for joints.", slug: "boswellia" },
      { name: "Curcumin / turmeric", note: "Anti-inflammatory polyphenol.", slug: "curcumin" },
      { name: "Strontium", note: "Bone-density marketing.", slug: "strontium" },
      { name: "Cissus quadrangularis", note: "Bone and joint recovery claims.", slug: "cissus" },
      { name: "Eggshell membrane", note: "Collagen and connective-tissue source.", slug: "eggshell-membrane" },
      { name: "Rosehip extract", note: "Joint-comfort polyphenols.", slug: "rosehip" },
    ],
  },
  {
    category: "Gut & digestive health",
    items: [
      { name: "Probiotics (multi-strain)", note: "Live bacteria for gut flora.", slug: "probiotics" },
      { name: "Lactobacillus (various)", note: "Common probiotic genus.", slug: "probiotics" },
      { name: "Bifidobacterium (various)", note: "Common probiotic genus.", slug: "probiotics" },
      { name: "Saccharomyces boulardii", note: "Probiotic yeast for diarrhoea.", slug: "probiotics" },
      { name: "Inulin (prebiotic)", note: "Soluble fibre feeding gut bacteria.", slug: "prebiotic-fibre" },
      { name: "FOS (fructooligosaccharides)", note: "Prebiotic fibre.", slug: "prebiotic-fibre" },
      { name: "Psyllium husk", note: "Soluble fibre for regularity and cholesterol.", slug: "psyllium" },
      { name: "Digestive enzymes", note: "Protease/amylase/lipase blends.", slug: "digestive-enzymes" },
      { name: "Betaine HCl", note: "Stomach-acid support for digestion.", slug: "betaine-hcl" },
      { name: "Ox bile / bile salts", note: "Fat-digestion support.", slug: "ox-bile" },
      { name: "Slippery elm", note: "Soothing mucilage for gut lining.", slug: "slippery-elm" },
      { name: "Marshmallow root", note: "Demulcent for digestive comfort.", slug: "marshmallow-root" },
      { name: "Aloe vera (inner leaf)", note: "Soothing gut and skin claims.", slug: "aloe-vera" },
      { name: "Ginger", note: "Anti-nausea and digestive aid.", slug: "ginger" },
      { name: "Peppermint oil (enteric)", note: "IBS-symptom relief.", slug: "peppermint-oil" },
    ],
  },
  {
    category: "Sleep, stress & mood",
    items: [
      { name: "Melatonin", note: "Sleep-timing hormone.", slug: "melatonin" },
      { name: "L-Theanine", note: "Calming amino acid from tea, pairs with caffeine.", slug: "l-theanine" },
      { name: "GABA", note: "Inhibitory neurotransmitter, relaxation marketing.", slug: "gaba" },
      { name: "5-HTP", note: "Serotonin precursor for mood and sleep.", slug: "5-htp" },
      { name: "Valerian root", note: "Traditional sleep herb.", slug: "valerian" },
      { name: "Lemon balm", note: "Calming herb.", slug: "lemon-balm" },
      { name: "Passionflower", note: "Anxiety and sleep herb.", slug: "passionflower" },
      { name: "Chamomile", note: "Mild calming herb.", slug: "chamomile" },
      { name: "Magnolia bark", note: "Stress and sleep claims (honokiol).", slug: "magnolia-bark" },
      { name: "Apigenin", note: "Chamomile-derived calming flavonoid.", slug: "apigenin" },
      { name: "Phosphatidylserine", note: "Cortisol-blunting and memory claims.", slug: "phosphatidylserine" },
      { name: "Kava", note: "Anxiolytic herb (liver caution).", slug: "kava" },
      { name: "CBD (cannabidiol)", note: "Non-intoxicating hemp compound, calm/pain claims.", slug: "cbd" },
      { name: "Saffron extract", note: "Mood-support spice.", slug: "saffron" },
      { name: "Ashwagandha", note: "Adaptogen for stress and sleep.", slug: "ashwagandha" },
    ],
  },
  {
    category: "Nootropics & cognition",
    items: [
      { name: "Bacopa monnieri", note: "Traditional memory adaptogen.", slug: "bacopa" },
      { name: "Lion's mane", note: "Mushroom marketed for nerve-growth factor.", slug: "lions-mane" },
      { name: "Ginkgo biloba", note: "Circulation and memory herb.", slug: "ginkgo" },
      { name: "Panax ginseng", note: "Energy and cognition adaptogen.", slug: "panax-ginseng" },
      { name: "Citicoline (CDP-choline)", note: "Choline donor for focus.", slug: "citicoline" },
      { name: "Huperzine A", note: "Acetylcholinesterase inhibitor for memory.", slug: "huperzine-a" },
      { name: "Rhodiola rosea", note: "Anti-fatigue adaptogen.", slug: "rhodiola-rosea" },
      { name: "Noopept", note: "Synthetic nootropic peptide.", slug: "noopept" },
      { name: "Vinpocetine", note: "Cerebral blood-flow nootropic.", slug: "vinpocetine" },
      { name: "Piracetam", note: "Original racetam nootropic (regulated in many regions).", slug: "piracetam" },
    ],
  },
  {
    category: "Adaptogens & traditional herbs",
    items: [
      { name: "Holy basil (tulsi)", note: "Stress and blood-sugar adaptogen.", slug: "holy-basil" },
      { name: "Schisandra", note: "Liver and endurance adaptogen.", slug: "schisandra" },
      { name: "Eleuthero (Siberian ginseng)", note: "Stamina adaptogen.", slug: "eleuthero" },
      { name: "Maca", note: "Energy and libido root.", slug: "maca" },
      { name: "Tribulus terrestris", note: "Libido and (unproven) testosterone herb.", slug: "tribulus-terrestris" },
      { name: "Fenugreek", note: "Blood-sugar and testosterone-support herb.", slug: "fenugreek" },
      { name: "Milk thistle (silymarin)", note: "Liver-protective herb.", slug: "milk-thistle" },
      { name: "Dandelion root", note: "Liver and diuretic herb.", slug: "dandelion" },
      { name: "Stinging nettle", note: "Prostate and allergy claims.", slug: "stinging-nettle" },
      { name: "Astragalus", note: "Immune and longevity herb.", slug: "astragalus" },
      { name: "Reishi mushroom", note: "Immune and calm adaptogen.", slug: "reishi" },
      { name: "Chaga mushroom", note: "Antioxidant mushroom.", slug: "chaga" },
      { name: "Turkey tail mushroom", note: "Immune-support mushroom.", slug: "turkey-tail" },
      { name: "Shilajit", note: "Mineral pitch, energy and testosterone claims.", slug: "shilajit" },
      { name: "Gynostemma (jiaogulan)", note: "Antioxidant adaptogen.", slug: "gynostemma" },
      { name: "Tongkat ali (longjack)", note: "Testosterone and libido herb.", slug: "tongkat-ali" },
      { name: "Cinnamon extract", note: "Blood-sugar-support spice.", slug: "cinnamon" },
      { name: "Berberine", note: "Plant alkaloid for blood sugar and lipids.", slug: "berberine" },
    ],
  },
  {
    category: "Longevity & metabolic",
    items: [
      { name: "NMN (nicotinamide mononucleotide)", note: "NAD+ precursor, longevity marketing.", slug: "nad-precursors" },
      { name: "NR (nicotinamide riboside)", note: "NAD+ precursor.", slug: "nad-precursors" },
      { name: "Resveratrol", note: "Polyphenol, sirtuin-activation claims.", slug: "resveratrol" },
      { name: "Pterostilbene", note: "More-bioavailable resveratrol analogue.", slug: "resveratrol" },
      { name: "Spermidine", note: "Autophagy-inducing polyamine.", slug: "spermidine" },
      { name: "CoQ10 (ubiquinone)", note: "Mitochondrial antioxidant, statin pairing.", slug: "coq10" },
      { name: "Ubiquinol", note: "Reduced, better-absorbed CoQ10.", slug: "coq10" },
      { name: "PQQ", note: "Mitochondrial-biogenesis antioxidant.", slug: "pqq" },
      { name: "Alpha-lipoic acid", note: "Antioxidant and blood-sugar claims.", slug: "alpha-lipoic-acid" },
      { name: "Ca-AKG (calcium alpha-ketoglutarate)", note: "Longevity-metabolism marketing.", slug: "ca-akg" },
      { name: "Urolithin A", note: "Mitophagy compound from pomegranate.", slug: "urolithin-a" },
      { name: "Ergothioneine", note: "“Longevity vitamin” antioxidant amino acid.", slug: "ergothioneine" },
    ],
  },
  {
    category: "Antioxidants, immune & general wellness",
    items: [
      { name: "NAC (N-acetylcysteine)", note: "Glutathione precursor, lung and liver claims.", slug: "nac" },
      { name: "Glutathione (liposomal)", note: "Master antioxidant.", slug: "glutathione" },
      { name: "Quercetin", note: "Anti-inflammatory flavonoid.", slug: "quercetin" },
      { name: "Fisetin", note: "Senolytic flavonoid.", slug: "fisetin" },
      { name: "Sulforaphane (broccoli)", note: "Nrf2-activating antioxidant.", slug: "sulforaphane" },
      { name: "Astaxanthin", note: "Potent carotenoid antioxidant.", slug: "astaxanthin" },
      { name: "Green tea extract (EGCG)", note: "Metabolism and antioxidant polyphenol.", slug: "green-tea-extract" },
      { name: "Elderberry", note: "Immune-support berry.", slug: "elderberry" },
      { name: "Spirulina", note: "Nutrient-dense blue-green algae.", slug: "spirulina" },
      { name: "Colostrum", note: "Immune and gut proteins from early milk.", slug: "colostrum" },
    ],
  },
];

/** Flat list of every catalogue supplement, in source order. */
export const supplementCatalogueItems: CatalogueSupplement[] =
  supplementCatalogue.flatMap((g) => g.items);

/** Total number of supplements in the catalogue (for the hub's intro copy). */
export const supplementCatalogueCount = supplementCatalogueItems.length;
