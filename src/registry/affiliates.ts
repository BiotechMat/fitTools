/**
 * Product recommendations — the single affiliate registry behind every
 * "Our recommendation" card (SPEC §10; CONTENT.md §4.2/§6; MONETISATION.md §2
 * — affiliates stay a supporting layer, never structural).
 *
 * One flat map: surface key → product picks. Surface key shapes:
 *   tool:<slug>                     tool:creatine-calculator
 *   supplement:<slug>               supplement:creatine-monohydrate
 *   recovery:<cluster>              recovery:sauna-therapy
 *   recovery:<cluster>/<article>    recovery:sauna-therapy/best-home-saunas
 *   glowup:<cluster>/<article>      glowup:skin/sunscreen
 *
 * ACTIVATION: every seeded pick renders its card now, as editorial content
 * (name + why). The "View at <merchant>" button appears only once `url` is a
 * real https affiliate link — paste the link (and the merchant name) into an
 * entry and the placement is monetised; nothing else to wire. When the first
 * link goes live, also update the "no live offers" line on
 * /legal/affiliate-disclosure.
 *
 * Cards with a live link carry the disclosure line and rel="sponsored
 * nofollow" (RecommendationCard), and clicks emit
 * affiliate_click { slug: <surface key>, offer: <offerId> }.
 *
 * Editorial rules (tested in tests/unit/affiliates.test.ts — do not soften):
 * - A pick must agree with the page's own evidence assessment. Pages whose
 *   headline verdict is "marketing-claim" (ZMA, pre-workout) get no picks:
 *   we don't sell what our own copy says doesn't work. Ashwagandha is also
 *   skipped — its safety box explicitly says the page is not a
 *   recommendation to take it. Breathwork is free by nature; nothing to sell.
 * - `why` states the honest reason in the page's own voice. No invented
 *   specs, prices or brand superiority claims.
 */

export interface ProductPick {
  /** Stable identifier used in affiliate_click analytics events. */
  offerId: string;
  /** Product name — the card headline. Product-type level until a specific
   *  partner product is agreed. */
  name: string;
  /** One honest line on why this is the pick, consistent with the page copy. */
  why: string;
  /** Affiliate URL. "" = editorial-only card; button appears once pasted. */
  url: string;
  /** Where the link goes, shown on the button (e.g. "Amazon UK"). */
  merchant?: string;
  /** Optional short price context (e.g. "from £25"). Only real figures. */
  priceNote?: string;
}

/* ---------------------------------------------------------------------- */
/* Shared picks (one product recommended from several pages).             */
/* ---------------------------------------------------------------------- */

const CREATINE_PICK: ProductPick = {
  offerId: "creatine-monohydrate-plain",
  name: "Plain creatine monohydrate powder",
  why: "The form nearly all the research used — the pricier variants have not been shown to beat it.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const WHEY_PICK: ProductPick = {
  offerId: "whey-protein-plain",
  name: "A plain whey protein powder",
  why: "Any reputable whey does the job — the benefit is hitting your daily protein target, not the brand.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const CAFFEINE_TABLETS_PICK: ProductPick = {
  offerId: "caffeine-tablets-fixed-dose",
  name: "Fixed-dose caffeine tablets",
  why: "A precise, cheap dose that is easy to time — and far safer than concentrated caffeine powders.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const ELECTROLYTES_PICK: ProductPick = {
  offerId: "electrolyte-mix-endurance",
  name: "An electrolyte drink mix",
  why: "Earns its keep during long, hot or very sweaty sessions — it is not needed as an everyday drink.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const SLEEP_DARKNESS_PICK: ProductPick = {
  offerId: "sleep-blackout-mask",
  name: "Blackout blinds or a contoured sleep mask",
  why: "Darkness is one of the best-supported bedroom changes — and the cheapest one to make.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const COLD_PLUNGE_PICK: ProductPick = {
  offerId: "cold-plunge-insulated-chiller",
  name: "An insulated cold plunge tub with a chiller",
  why: "Holds a steady target temperature and filters the water — the two criteria that matter for regular use. For occasional use, a tub and bags of ice does the same job.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

const SAUNA_PICK: ProductPick = {
  offerId: "sauna-traditional-home",
  name: "A traditional (Finnish-style) home sauna",
  why: "The hot, traditional type is what the strong cardiovascular evidence comes from — choose infrared for comfort and running cost, not for those findings.",
  url: "", // TODO(mat): paste affiliate URL + merchant to activate
};

/* ---------------------------------------------------------------------- */
/* Surface → picks                                                        */
/* ---------------------------------------------------------------------- */

export const recommendationsBySurface: Readonly<Record<string, ProductPick[]>> = {
  /* Supplements (neutral evidence pages — card sits after the FAQ, clearly
   * separated from the evidence). zma + pre-workout deliberately absent
   * (marketing-claim tier); ashwagandha deliberately absent (its safety box
   * disclaims recommendation). */
  "supplement:creatine-monohydrate": [CREATINE_PICK],
  "supplement:whey-protein": [WHEY_PICK],
  "supplement:caffeine": [CAFFEINE_TABLETS_PICK],
  "supplement:beta-alanine": [
    {
      offerId: "beta-alanine-plain",
      name: "Plain beta-alanine powder",
      why: "A single ingredient lets you split doses to avoid the tingle — and skip the underdosed blends.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "supplement:citrulline-malate": [
    {
      offerId: "citrulline-malate-plain",
      name: "Plain citrulline malate powder",
      why: "If you try it, buy it plain and match the doses studies used — many pre-workouts underdose it.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "supplement:vitamin-d": [
    {
      offerId: "vitamin-d3-daily",
      name: "Vitamin D3 (cholecalciferol)",
      why: "D3 raises blood levels more effectively than D2 — a basic sensible-dose product is all you need.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "supplement:omega-3": [
    {
      offerId: "omega-3-epa-dha",
      name: "A fish oil with stated EPA + DHA content",
      why: "Judge products by the EPA + DHA per serving on the label, not the total fish-oil weight.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "supplement:magnesium": [
    {
      offerId: "magnesium-glycinate-citrate",
      name: "Magnesium glycinate or citrate",
      why: "Well-absorbed forms — unlike the oxide in many cheap products, which is most likely to upset your stomach.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "supplement:electrolytes": [ELECTROLYTES_PICK],
  "supplement:collagen": [
    {
      offerId: "collagen-peptides-vitc",
      name: "Hydrolysed collagen peptides (with vitamin C)",
      why: "The form and pairing the tendon and joint studies used — not a muscle-building protein.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],

  /* Recovery clusters (pillar pages) and their buying-intent articles.
   * breathwork deliberately absent — slow breathing is free. */
  "recovery:cold-water-immersion": [COLD_PLUNGE_PICK],
  "recovery:cold-water-immersion/best-cold-plunge-tubs": [COLD_PLUNGE_PICK],
  "recovery:sauna-therapy": [SAUNA_PICK],
  "recovery:sauna-therapy/best-home-saunas": [SAUNA_PICK],
  "recovery:compression-therapy": [
    {
      offerId: "compression-boots",
      name: "Pneumatic compression boots",
      why: "A feel-good convenience for heavy training weeks — buy them for comfort, not as a proven performance booster.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "recovery:massage-guns": [
    {
      offerId: "massage-gun-midrange",
      name: "A mid-range percussive massage gun",
      why: "Short-term looseness and soreness relief is the real benefit — premium models add attachments, not evidence.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "recovery:red-light-therapy": [
    {
      offerId: "red-light-panel-published-output",
      name: "A red/near-infrared panel with published output",
      why: "Dose is what matters — pick a panel that publishes wavelengths and measured irradiance, not marketing watts.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],
  "recovery:sleep-environment": [SLEEP_DARKNESS_PICK],
  "recovery:foam-rolling": [
    {
      offerId: "foam-roller-medium-density",
      name: "A plain medium-density foam roller",
      why: "A basic roller does everything the evidence supports — textures and vibration add price, not proof.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],

  /* Glow-up (skin) — sellable surfaces in the signed-off skin cluster. */
  "glowup:skin/sunscreen": [
    {
      offerId: "sunscreen-broad-spectrum",
      name: "A broad-spectrum SPF 30+ sunscreen you enjoy wearing",
      why: "The best sunscreen is the one you will actually use daily — texture and finish matter as much as the number.",
      url: "", // TODO(mat): paste affiliate URL + merchant to activate
    },
  ],

  /* Tools — only where a product genuinely maps to what the tool does. */
  "tool:creatine-calculator": [CREATINE_PICK],
  "tool:macro-calculator": [WHEY_PICK],
  "tool:caffeine-calculator": [CAFFEINE_TABLETS_PICK],
  "tool:water-intake-calculator": [ELECTROLYTES_PICK],
  "tool:sleep-calculator": [SLEEP_DARKNESS_PICK],
};

/* ---------------------------------------------------------------------- */
/* Lookup helpers                                                         */
/* ---------------------------------------------------------------------- */

/** A pick is live (gets its buy button + disclosure) once its affiliate URL
 *  has been pasted; until then the card shows the pick as editorial only. */
export function isLivePick(pick: ProductPick): boolean {
  return pick.url.startsWith("https://");
}

/** Picks for a surface key — what RecommendationCard renders. */
export function recommendationsFor(surface: string): ProductPick[] {
  return recommendationsBySurface[surface] ?? [];
}
