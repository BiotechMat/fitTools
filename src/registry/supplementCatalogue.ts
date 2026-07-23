/**
 * Supplement catalogue — the full 200-supplement reference list (source:
 * CONTENT-supplements-200.md), grouped by category for the /supplements hub.
 *
 * This is the *breadth* layer that sits alongside the in-depth, evidence-tiered
 * supplement pages in `supplements.ts` (the *depth* layer). Each catalogue entry
 * carries a neutral one-line note on what the supplement is typically taken for;
 * where a full evidence review page exists, its `slug` links across to it so the
 * hub interlinks the two layers (CONTENT-reference.md §4, §8). Several catalogue
 * entries (e.g. the various whey, creatine, magnesium and omega-3 forms) point
 * at the same review page on purpose.
 *
 * This list is descriptive, not a recommendation: evidence strength across it
 * ranges from very strong to weak or preliminary, and regulatory status varies
 * by country. Kept as structured data so the hub renders and cross-links it
 * automatically and the unit tests hold every `slug` to a real review page.
 */

export interface CatalogueSupplement {
  /** Display name, exactly as listed in the source reference. */
  name: string;
  /** One-line note on what it is typically taken for. */
  note: string;
  /** Slug of the in-depth evidence review, when one exists (validated). */
  slug?: string;
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
      { name: "Casein protein", note: "Slow-digesting dairy protein, often taken before sleep." },
      { name: "Micellar casein", note: "Minimally processed slow-release casein." },
      { name: "Milk protein (blend)", note: "Combined whey/casein blend." },
      { name: "Soy protein isolate", note: "Complete plant protein." },
      { name: "Pea protein", note: "Popular vegan protein, high in leucine." },
      { name: "Rice protein", note: "Vegan protein, often blended with pea." },
      { name: "Hemp protein", note: "Plant protein with fibre and omega fats." },
      { name: "Egg white protein", note: "Dairy-free complete animal protein." },
      { name: "Collagen peptides", note: "Connective-tissue protein for skin, joints, hair, nails.", slug: "collagen" },
      { name: "BCAAs", note: "Leucine, isoleucine, valine; marketed for muscle preservation.", slug: "bcaa" },
      { name: "EAAs", note: "Full spectrum of essential amino acids." },
      { name: "L-Leucine", note: "Key trigger amino acid for muscle protein synthesis." },
      { name: "L-Isoleucine", note: "Branched-chain amino acid." },
      { name: "L-Valine", note: "Branched-chain amino acid." },
      { name: "L-Glutamine", note: "Conditionally essential amino acid, gut and recovery claims.", slug: "glutamine" },
      { name: "L-Citrulline", note: "Nitric-oxide precursor for pumps and blood flow.", slug: "citrulline-malate" },
      { name: "Citrulline malate", note: "Citrulline bonded to malate, common pre-workout.", slug: "citrulline-malate" },
      { name: "L-Arginine", note: "Nitric-oxide precursor (poorer absorption than citrulline)." },
      { name: "Beta-alanine", note: "Buffers muscle acidity; causes tingling.", slug: "beta-alanine" },
      { name: "Taurine", note: "Amino acid for endurance, hydration and heart claims.", slug: "taurine" },
      { name: "L-Carnitine", note: "Fatty-acid transport, marketed for fat metabolism.", slug: "l-carnitine" },
      { name: "Acetyl-L-carnitine (ALCAR)", note: "Brain-penetrant carnitine form.", slug: "l-carnitine" },
      { name: "L-Carnitine L-tartrate", note: "Recovery-oriented carnitine form.", slug: "l-carnitine" },
      { name: "Glycine", note: "Amino acid for sleep, collagen and glutathione synthesis.", slug: "glycine" },
      { name: "L-Tyrosine", note: "Dopamine/noradrenaline precursor for stress and focus." },
      { name: "L-Tryptophan", note: "Serotonin precursor for mood and sleep." },
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
      { name: "Betaine (TMG)", note: "Trimethylglycine for power output and methylation." },
      { name: "Alpha-GPC", note: "Choline source, marketed for power and focus." },
      { name: "Electrolyte powder", note: "Sodium, potassium, magnesium for hydration.", slug: "electrolytes" },
      { name: "PeakO2 (mushroom blend)", note: "Adaptogenic blend marketed for endurance." },
      { name: "Exogenous ketones (BHB)", note: "Ketone bodies for fuel and focus claims." },
      { name: "Cordyceps", note: "Mushroom marketed for oxygen use and endurance." },
      { name: "Pre-workout (blend)", note: "Mixed stimulant/pump formula.", slug: "pre-workout" },
      { name: "Deer antler velvet (IGF)", note: "Growth-factor marketing; weak evidence." },
      { name: "Peak ATP (adenosine triphosphate)", note: "Marketed for strength and blood flow." },
      { name: "Guarana", note: "Natural caffeine source.", slug: "caffeine" },
    ],
  },
  {
    category: "Vitamins",
    items: [
      { name: "Vitamin A (retinol)", note: "Vision, skin and immune function." },
      { name: "Beta-carotene", note: "Provitamin-A antioxidant." },
      { name: "Vitamin B1 (thiamine)", note: "Energy metabolism." },
      { name: "Vitamin B2 (riboflavin)", note: "Energy metabolism, migraine claims." },
      { name: "Vitamin B3 (niacin)", note: "NAD precursor, lipid claims." },
      { name: "Vitamin B5 (pantothenic acid)", note: "Coenzyme-A synthesis." },
      { name: "Vitamin B6 (pyridoxine)", note: "Amino-acid metabolism, PMS claims." },
      { name: "Vitamin B7 (biotin)", note: "Hair, skin and nail marketing." },
      { name: "Vitamin B9 (folate / folic acid)", note: "DNA synthesis, pregnancy essential." },
      { name: "Vitamin B12 (methylcobalamin)", note: "Nerve and red-cell health; vegan staple." },
      { name: "Vitamin C (ascorbic acid)", note: "Antioxidant, collagen, immune support.", slug: "vitamin-c" },
      { name: "Vitamin D3 (cholecalciferol)", note: "Bone, immune and muscle function.", slug: "vitamin-d" },
      { name: "Vitamin E (tocopherol)", note: "Fat-soluble antioxidant." },
      { name: "Vitamin K1 (phylloquinone)", note: "Blood clotting." },
      { name: "Vitamin K2 (MK-7)", note: "Calcium routing to bone, arterial-health claims." },
      { name: "Multivitamin", note: "Broad micronutrient insurance." },
      { name: "B-complex", note: "Combined B vitamins." },
      { name: "Choline (bitartrate)", note: "Liver and brain nutrient." },
      { name: "Inositol", note: "Insulin-signalling and mood/PCOS claims." },
      { name: "Folinic acid", note: "Bioavailable folate form." },
      { name: "Methylfolate (5-MTHF)", note: "Active folate for MTHFR variants." },
      { name: "Adenosylcobalamin", note: "Mitochondrial B12 form." },
      { name: "Vitamin D2 (ergocalciferol)", note: "Plant-derived vitamin D.", slug: "vitamin-d" },
      { name: "Tocotrienols", note: "Vitamin E subfamily with distinct antioxidant claims." },
      { name: "Nicotinamide", note: "Non-flushing niacin form, skin-health claims." },
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
      { name: "Calcium carbonate", note: "Bone mineral, antacid." },
      { name: "Calcium citrate", note: "Better-absorbed calcium form." },
      { name: "Potassium", note: "Electrolyte for blood pressure and muscle.", slug: "electrolytes" },
      { name: "Selenium", note: "Antioxidant and thyroid mineral." },
      { name: "Copper", note: "Enzyme cofactor, balanced against zinc." },
      { name: "Iodine (kelp)", note: "Thyroid-hormone synthesis." },
      { name: "Chromium (picolinate)", note: "Marketed for blood-sugar control." },
      { name: "Manganese", note: "Enzyme cofactor." },
      { name: "Molybdenum", note: "Trace enzyme cofactor." },
      { name: "Boron", note: "Bone and hormone-support claims." },
      { name: "Sodium (salt tablets)", note: "Endurance electrolyte replacement.", slug: "electrolytes" },
      { name: "Phosphorus", note: "Bone and energy mineral." },
      { name: "Silica / silicon", note: "Connective-tissue and hair claims." },
      { name: "Vanadium", note: "Blood-sugar marketing; weak evidence." },
      { name: "Lithium orotate", note: "Low-dose mood-support marketing." },
      { name: "ZMA", note: "Zinc, magnesium and B6 combo for sleep/recovery.", slug: "zma" },
      { name: "Trace mineral drops", note: "Broad-spectrum ionic minerals." },
    ],
  },
  {
    category: "Fatty acids & lipids",
    items: [
      { name: "Fish oil (EPA/DHA)", note: "Omega-3s for heart, brain and inflammation.", slug: "omega-3" },
      { name: "Krill oil", note: "Phospholipid-bound omega-3 with astaxanthin.", slug: "omega-3" },
      { name: "Algae oil (vegan omega-3)", note: "Plant DHA/EPA source.", slug: "omega-3" },
      { name: "Cod liver oil", note: "Omega-3s plus vitamins A and D.", slug: "omega-3" },
      { name: "Flaxseed oil", note: "Plant ALA omega-3." },
      { name: "Evening primrose oil", note: "GLA omega-6, skin and PMS claims." },
      { name: "Borage oil", note: "High-GLA omega-6 source." },
      { name: "CLA (conjugated linoleic acid)", note: "Marketed for body composition." },
      { name: "MCT oil", note: "Medium-chain fats for energy and ketogenic diets." },
      { name: "Omega-7 (palmitoleic acid)", note: "Metabolic and skin claims." },
      { name: "Phosphatidylcholine", note: "Cell-membrane and liver phospholipid." },
      { name: "Lecithin (sunflower/soy)", note: "Emulsifier and choline source." },
      { name: "Black seed oil (nigella)", note: "Thymoquinone, broad wellness claims." },
    ],
  },
  {
    category: "Joint, bone & connective tissue",
    items: [
      { name: "Glucosamine sulfate", note: "Cartilage-building block for joint comfort.", slug: "glucosamine-chondroitin" },
      { name: "Chondroitin sulfate", note: "Often paired with glucosamine.", slug: "glucosamine-chondroitin" },
      { name: "MSM (methylsulfonylmethane)", note: "Sulfur compound for joints and skin." },
      { name: "Hyaluronic acid", note: "Joint lubrication and skin hydration." },
      { name: "UC-II (undenatured type II collagen)", note: "Low-dose joint collagen.", slug: "collagen" },
      { name: "Gelatin", note: "Collagen source for connective tissue.", slug: "collagen" },
      { name: "Boswellia serrata", note: "Anti-inflammatory resin for joints." },
      { name: "Curcumin / turmeric", note: "Anti-inflammatory polyphenol.", slug: "curcumin" },
      { name: "Strontium", note: "Bone-density marketing." },
      { name: "Cissus quadrangularis", note: "Bone and joint recovery claims." },
      { name: "Eggshell membrane", note: "Collagen and connective-tissue source." },
      { name: "Rosehip extract", note: "Joint-comfort polyphenols." },
    ],
  },
  {
    category: "Gut & digestive health",
    items: [
      { name: "Probiotics (multi-strain)", note: "Live bacteria for gut flora.", slug: "probiotics" },
      { name: "Lactobacillus (various)", note: "Common probiotic genus.", slug: "probiotics" },
      { name: "Bifidobacterium (various)", note: "Common probiotic genus.", slug: "probiotics" },
      { name: "Saccharomyces boulardii", note: "Probiotic yeast for diarrhoea.", slug: "probiotics" },
      { name: "Inulin (prebiotic)", note: "Soluble fibre feeding gut bacteria." },
      { name: "FOS (fructooligosaccharides)", note: "Prebiotic fibre." },
      { name: "Psyllium husk", note: "Soluble fibre for regularity and cholesterol." },
      { name: "Digestive enzymes", note: "Protease/amylase/lipase blends." },
      { name: "Betaine HCl", note: "Stomach-acid support for digestion." },
      { name: "Ox bile / bile salts", note: "Fat-digestion support." },
      { name: "Slippery elm", note: "Soothing mucilage for gut lining." },
      { name: "Marshmallow root", note: "Demulcent for digestive comfort." },
      { name: "Aloe vera (inner leaf)", note: "Soothing gut and skin claims." },
      { name: "Ginger", note: "Anti-nausea and digestive aid." },
      { name: "Peppermint oil (enteric)", note: "IBS-symptom relief." },
    ],
  },
  {
    category: "Sleep, stress & mood",
    items: [
      { name: "Melatonin", note: "Sleep-timing hormone.", slug: "melatonin" },
      { name: "L-Theanine", note: "Calming amino acid from tea, pairs with caffeine.", slug: "l-theanine" },
      { name: "GABA", note: "Inhibitory neurotransmitter, relaxation marketing." },
      { name: "5-HTP", note: "Serotonin precursor for mood and sleep." },
      { name: "Valerian root", note: "Traditional sleep herb." },
      { name: "Lemon balm", note: "Calming herb." },
      { name: "Passionflower", note: "Anxiety and sleep herb." },
      { name: "Chamomile", note: "Mild calming herb." },
      { name: "Magnolia bark", note: "Stress and sleep claims (honokiol)." },
      { name: "Apigenin", note: "Chamomile-derived calming flavonoid." },
      { name: "Phosphatidylserine", note: "Cortisol-blunting and memory claims." },
      { name: "Kava", note: "Anxiolytic herb (liver caution)." },
      { name: "CBD (cannabidiol)", note: "Non-intoxicating hemp compound, calm/pain claims." },
      { name: "Saffron extract", note: "Mood-support spice." },
      { name: "Ashwagandha", note: "Adaptogen for stress and sleep.", slug: "ashwagandha" },
    ],
  },
  {
    category: "Nootropics & cognition",
    items: [
      { name: "Bacopa monnieri", note: "Traditional memory adaptogen." },
      { name: "Lion's mane", note: "Mushroom marketed for nerve-growth factor." },
      { name: "Ginkgo biloba", note: "Circulation and memory herb." },
      { name: "Panax ginseng", note: "Energy and cognition adaptogen." },
      { name: "Citicoline (CDP-choline)", note: "Choline donor for focus." },
      { name: "Huperzine A", note: "Acetylcholinesterase inhibitor for memory." },
      { name: "Rhodiola rosea", note: "Anti-fatigue adaptogen.", slug: "rhodiola-rosea" },
      { name: "Noopept", note: "Synthetic nootropic peptide." },
      { name: "Vinpocetine", note: "Cerebral blood-flow nootropic." },
      { name: "Piracetam", note: "Original racetam nootropic (regulated in many regions)." },
    ],
  },
  {
    category: "Adaptogens & traditional herbs",
    items: [
      { name: "Holy basil (tulsi)", note: "Stress and blood-sugar adaptogen." },
      { name: "Schisandra", note: "Liver and endurance adaptogen." },
      { name: "Eleuthero (Siberian ginseng)", note: "Stamina adaptogen." },
      { name: "Maca", note: "Energy and libido root." },
      { name: "Tribulus terrestris", note: "Libido and (unproven) testosterone herb.", slug: "tribulus-terrestris" },
      { name: "Fenugreek", note: "Blood-sugar and testosterone-support herb." },
      { name: "Milk thistle (silymarin)", note: "Liver-protective herb." },
      { name: "Dandelion root", note: "Liver and diuretic herb." },
      { name: "Stinging nettle", note: "Prostate and allergy claims." },
      { name: "Astragalus", note: "Immune and longevity herb." },
      { name: "Reishi mushroom", note: "Immune and calm adaptogen." },
      { name: "Chaga mushroom", note: "Antioxidant mushroom." },
      { name: "Turkey tail mushroom", note: "Immune-support mushroom." },
      { name: "Shilajit", note: "Mineral pitch, energy and testosterone claims." },
      { name: "Gynostemma (jiaogulan)", note: "Antioxidant adaptogen." },
      { name: "Tongkat ali (longjack)", note: "Testosterone and libido herb." },
      { name: "Cinnamon extract", note: "Blood-sugar-support spice." },
      { name: "Berberine", note: "Plant alkaloid for blood sugar and lipids." },
    ],
  },
  {
    category: "Longevity & metabolic",
    items: [
      { name: "NMN (nicotinamide mononucleotide)", note: "NAD+ precursor, longevity marketing." },
      { name: "NR (nicotinamide riboside)", note: "NAD+ precursor." },
      { name: "Resveratrol", note: "Polyphenol, sirtuin-activation claims." },
      { name: "Pterostilbene", note: "More-bioavailable resveratrol analogue." },
      { name: "Spermidine", note: "Autophagy-inducing polyamine." },
      { name: "CoQ10 (ubiquinone)", note: "Mitochondrial antioxidant, statin pairing." },
      { name: "Ubiquinol", note: "Reduced, better-absorbed CoQ10." },
      { name: "PQQ", note: "Mitochondrial-biogenesis antioxidant." },
      { name: "Alpha-lipoic acid", note: "Antioxidant and blood-sugar claims." },
      { name: "Ca-AKG (calcium alpha-ketoglutarate)", note: "Longevity-metabolism marketing." },
      { name: "Urolithin A", note: "Mitophagy compound from pomegranate." },
      { name: "Ergothioneine", note: "“Longevity vitamin” antioxidant amino acid." },
    ],
  },
  {
    category: "Antioxidants, immune & general wellness",
    items: [
      { name: "NAC (N-acetylcysteine)", note: "Glutathione precursor, lung and liver claims." },
      { name: "Glutathione (liposomal)", note: "Master antioxidant." },
      { name: "Quercetin", note: "Anti-inflammatory flavonoid." },
      { name: "Fisetin", note: "Senolytic flavonoid." },
      { name: "Sulforaphane (broccoli)", note: "Nrf2-activating antioxidant." },
      { name: "Astaxanthin", note: "Potent carotenoid antioxidant." },
      { name: "Green tea extract (EGCG)", note: "Metabolism and antioxidant polyphenol.", slug: "green-tea-extract" },
      { name: "Elderberry", note: "Immune-support berry." },
      { name: "Spirulina", note: "Nutrient-dense blue-green algae." },
      { name: "Colostrum", note: "Immune and gut proteins from early milk." },
    ],
  },
];

/** Flat list of every catalogue supplement, in source order. */
export const supplementCatalogueItems: CatalogueSupplement[] =
  supplementCatalogue.flatMap((g) => g.items);

/** Total number of supplements in the catalogue (for the hub's intro copy). */
export const supplementCatalogueCount = supplementCatalogueItems.length;
