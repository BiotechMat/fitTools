import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import {
  parseCardParams,
  powerhouseZonePhrase,
  type HeroCard,
  type ShareResultPayload,
} from "@/lib/arcade-share";
import { EDGE_CAUSE, OBSTACLE_KINDS, medalFor, type Medal } from "@/lib/lifeline";
import { MISS_CAUSES, formatKg, platesPhrase } from "@/lib/maxout";
import { TIER_META, type ClosenessTier } from "@/lib/daily/types";
import { reactionPercentile, reactionTier } from "@/lib/lab/reaction";
import { recallTier } from "@/lib/lab/recall";
import { MAX_POINTS, TRACK, pointsRatio, trackTier } from "@/lib/lab/track";
import {
  CardFooter,
  CardSheet,
  OG_COLORS,
  OG_SIZE,
  PixelSprite,
  ogClip,
  ogFonts,
} from "@/lib/og-image";
import {
  BALLPARK_TARGET,
  LAB_BOLT,
  LAB_GRID,
  LIFELINE_HEART,
  MAXOUT_LIFTER,
  FIVEADAY_APPLE,
  MINI_HEART_EMPTY,
  MINI_HEART_FULL,
  POWERHOUSE_MITO,
} from "@/lib/pixel-art";
import { SITE_URL } from "@/lib/site";

/**
 * Dynamic arcade/daily score card (STATUS.md Phase 2 — the share loop beyond
 * tools), styled as the Lifeline death card (LifelineGame.saveCard): paper
 * sheet, ink frame, pixel emblem, ember kicker, Anton score, mono gag line.
 * A "beat me" link unfurls as this card instead of the generic site image.
 * Sibling of `/api/share-card`; params are numbers, fixed ids and tier
 * letters only — never free text — so a crafted URL can't put arbitrary
 * words in the frame.
 */

export const dynamic = "force-dynamic";

const HOST = new URL(SITE_URL).host.toUpperCase();

const GAME_META: Record<
  HeroCard,
  {
    name: string;
    strap: string;
    path: string;
    sprite: string[];
    cell: number;
    /** Sheet header; the arcade default unless a surface overrides it. */
    title?: string;
  }
> = {
  lifeline: {
    name: "LIFELINE",
    strap: "ONE BUTTON · YOUR SCORE IS THE AGE YOU REACH",
    path: "/LIFELINE",
    sprite: LIFELINE_HEART,
    cell: 9,
  },
  "max-out": {
    name: "MAX OUT",
    strap: "STOP THE NEEDLE IN THE GREEN · LOCK THE REP · LOAD THE BAR",
    path: "/MAX-OUT",
    sprite: MAXOUT_LIFTER,
    cell: 7,
  },
  "five-a-day": {
    name: "FIVE A DAY",
    strap: "SLICE THE PRODUCE, NEVER THE JUNK · STACK THE PLANT VARIETY",
    path: "/FIVE-A-DAY",
    sprite: FIVEADAY_APPLE,
    cell: 8,
  },
  powerhouse: {
    name: "POWERHOUSE",
    strap: "YOU ARE THE MITOCHONDRION · MAKE ATP · CLIMB TO REDLINE",
    path: "/POWERHOUSE",
    sprite: POWERHOUSE_MITO,
    cell: 8,
  },
  daily: {
    name: "THE DAILIES",
    strap: "BALLPARK & MYTH OR FACT? · ONE CITED STAT GAME A DAY",
    path: "/DAILY",
    sprite: BALLPARK_TARGET,
    cell: 9,
  },
  "lab-reaction": {
    name: "REACTION",
    strap: "WAIT FOR THE FLASH · FIVE TAPS · FIND YOUR TIER",
    path: "/PERFORMANCE-LAB/REACTION",
    sprite: LAB_BOLT,
    cell: 8,
    title: "PERFORMANCE LAB",
  },
  "lab-recall": {
    name: "RECALL",
    strap: "WATCH THE GRID · TAP IT BACK · CLIMB THE ANIMAL LADDER",
    path: "/PERFORMANCE-LAB/RECALL",
    sprite: LAB_GRID,
    cell: 7,
    title: "PERFORMANCE LAB",
  },
  "lab-track": {
    name: "TRACK",
    strap: `${TRACK.targets} TARGETS · EVERY TAP SCORES BY RING · BULLSEYE ${TRACK.rings[0].points}`,
    path: "/PERFORMANCE-LAB/TRACK",
    sprite: BALLPARK_TARGET,
    cell: 8,
    title: "PERFORMANCE LAB",
  },
};

/* Mirrors LifelineGame's MEDAL_STYLE labels (thresholds live in medalFor). */
const MEDAL_LINES: Record<Exclude<Medal, "none">, string> = {
  bronze: "BRONZE · 40+",
  silver: "SILVER · 60+",
  gold: "GOLD · 80+",
  centenarian: "CENTENARIAN · 100",
};

function lifelineGag(cause: ShareResultPayload & { game: "lifeline" }): string | null {
  if (!cause.cause) return null;
  if (cause.cause === "gravity") return EDGE_CAUSE;
  return OBSTACLE_KINDS.find((kind) => kind.id === cause.cause)?.cause ?? null;
}

/* ------------------------------------------------------------ card pieces */

function Title({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", fontSize: 38, letterSpacing: 8 }}>{text}</div>
  );
}

function Kicker({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 30,
        letterSpacing: 5,
        color: OG_COLORS.ember,
        marginTop: 18,
      }}
    >
      {text}
    </div>
  );
}

function Score({ value, unit, size = 190 }: { value: string; unit?: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          fontFamily: "Anton",
          fontSize: size,
          lineHeight: 0.98,
          color: OG_COLORS.blaze,
        }}
      >
        {value}
      </div>
      {unit ? (
        <div
          style={{
            display: "flex",
            fontSize: 40,
            letterSpacing: 2,
            color: OG_COLORS.taupe,
            marginLeft: 18,
            marginBottom: 16,
          }}
        >
          {unit}
        </div>
      ) : null}
    </div>
  );
}

/** The death card's cause line: ink caps, clipped like saveCard's slice(56). */
function Gag({ text, colour = OG_COLORS.ink }: { text: string; colour?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 27,
        letterSpacing: 2,
        color: colour,
        marginTop: 16,
        maxWidth: 1020,
        justifyContent: "center",
      }}
    >
      {ogClip(text.toUpperCase(), 64)}
    </div>
  );
}

/** Ballpark 7-day form row as bordered pixel squares. */
const TIER_FILL: Record<ClosenessTier, string> = {
  bullseye: OG_COLORS.blaze,
  hot: OG_COLORS.ember,
  warm: "#e8c33c",
  cold: "#5b7c99", // slate — the one off-palette tone, for ❄️
};

function TierRow({ tiers }: { tiers: readonly ClosenessTier[] }) {
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
      {tiers.map((tier, i) => (
        <div
          key={i}
          style={{
            width: 38,
            height: 38,
            background: TIER_FILL[tier],
            border: `5px solid ${OG_COLORS.ink}`,
            display: "flex",
          }}
        />
      ))}
    </div>
  );
}

/** Reaction's per-tap row (g/y/r letters) as bordered speed squares. */
const ROW_FILL: Record<string, string> = {
  g: "#8fbf3f", // matcha — quick
  y: "#e8c33c", // amber — mid
  r: OG_COLORS.ember, // slow
};

function SpeedRow({ row }: { row: string }) {
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
      {[...row].map((letter, i) => (
        <div
          key={i}
          style={{
            width: 38,
            height: 38,
            background: ROW_FILL[letter] ?? OG_COLORS.taupe,
            border: `5px solid ${OG_COLORS.ink}`,
            display: "flex",
          }}
        />
      ))}
    </div>
  );
}

/** Myth or Fact score as the games' little life hearts. */
function HeartsRow({ correct, total }: { correct: number; total: number }) {
  const cells = Array.from({ length: total }, (_, i) => i < correct);
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
      {cells.map((won, i) => (
        <PixelSprite key={i} rows={won ? MINI_HEART_FULL : MINI_HEART_EMPTY} cell={7} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- card specs */

/* Satori mislays flex children delivered via fragments, so each card is a
   spec of three real elements (title / middle / footer) that CardSheet
   receives as direct children. */
interface CardSpec {
  title: string;
  middle: ReactNode;
  footer: string;
}

const MIDDLE_COL = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
} as const;

function heroSpec(game: HeroCard): CardSpec {
  const meta = GAME_META[game];
  return {
    title: meta.title ?? "FITTOOLS ARCADE",
    middle: (
      <div style={MIDDLE_COL}>
        <PixelSprite rows={meta.sprite} cell={meta.cell} />
        <div
          style={{
            display: "flex",
            fontFamily: "Anton",
            fontSize: 130,
            lineHeight: 1,
            color: OG_COLORS.blaze,
            marginTop: 14,
          }}
        >
          {meta.name}
        </div>
        <Gag text={meta.strap} />
      </div>
    ),
    footer: `EVERY FORMULA CITED · ${HOST}${meta.path}`,
  };
}

function resultSpec(result: ShareResultPayload): CardSpec {
  switch (result.game) {
    case "lifeline": {
      const medal = medalFor(result.beat);
      const gag = lifelineGag(result);
      return {
        title: "LIFELINE",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={LIFELINE_HEART} cell={6} />
            <Kicker text="FLATLINED AT" />
            <Score value={String(result.beat)} size={200} />
            {gag ? <Gag text={gag} /> : null}
            {medal !== "none" ? (
              <Gag text={MEDAL_LINES[medal]} colour={OG_COLORS.forest} />
            ) : null}
          </div>
        ),
        footer:
          result.seed !== undefined
            ? `SAME COURSE · ONE BUTTON · BEAT ME AT ${HOST}/LIFELINE`
            : `FITTOOLS · ${HOST}/LIFELINE`,
      };
    }
    case "max-out": {
      const gag =
        result.cause !== undefined && result.cause < MISS_CAUSES.length
          ? `${platesPhrase(result.kg)} · CAUSE: ${MISS_CAUSES[result.cause]}`
          : platesPhrase(result.kg);
      return {
        title: "MAX OUT",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={MAXOUT_LIFTER} cell={5} />
            <Kicker text="FORM FAILED AT" />
            <Score value={formatKg(result.kg)} unit="KG" size={180} />
            <Gag text={gag} />
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/MAX-OUT`,
      };
    }
    case "five-a-day":
      return {
        title: "FIVE A DAY",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={FIVEADAY_APPLE} cell={6} />
            <Kicker text="PORTIONS SLICED" />
            <Score
              value={String(result.portions)}
              unit={`· ${result.plants} PLANT${result.plants === 1 ? "" : "S"}`}
              size={180}
            />
            <Gag text="SLICE THE PRODUCE. NEVER THE JUNK." />
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/FIVE-A-DAY`,
      };
    case "powerhouse":
      return {
        title: "POWERHOUSE",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={POWERHOUSE_MITO} cell={6} />
            <Kicker text={`BONKED IN ${powerhouseZonePhrase(result.zone)}`} />
            <Score value={result.atp.toLocaleString("en-GB")} unit="ATP" size={170} />
            <Gag text="THE POWERHOUSE OF THE CELL. I WAS NOT." />
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/POWERHOUSE`,
      };
    case "ballpark": {
      const todays =
        result.tiers.length > 0
          ? TIER_META[result.tiers[result.tiers.length - 1]].label.toUpperCase()
          : "PLAYED";
      return {
        title: "BALLPARK",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={BALLPARK_TARGET} cell={7} />
            <Kicker text={`DAILY #${result.puzzle}`} />
            <Score value={todays} size={130} />
            {result.tiers.length > 1 ? <TierRow tiers={result.tiers} /> : null}
          </div>
        ),
        footer: `PLAY TODAY'S AT ${HOST}/DAILY`,
      };
    }
    case "myth":
      return {
        title: "MYTH OR FACT?",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={MINI_HEART_FULL} cell={10} />
            <Kicker text={`WEEKLY #${result.puzzle}`} />
            <Score value={`${result.correct}/${result.total}`} size={170} />
            <HeartsRow correct={result.correct} total={result.total} />
          </div>
        ),
        footer: `PLAY IT AT ${HOST}/DAILY`,
      };
    case "lab-reaction": {
      const tier = reactionTier(result.avg);
      return {
        title: "PERFORMANCE LAB · REACTION",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={LAB_BOLT} cell={6} />
            <Kicker text="AVERAGE OF FIVE TAPS" />
            <Score value={String(result.avg)} unit="MS" size={180} />
            <Gag
              text={`${tier.name} · FASTER THAN ${reactionPercentile(result.avg)}% OF PEOPLE`}
              colour={OG_COLORS.forest}
            />
            {result.row ? <SpeedRow row={result.row} /> : <Gag text={tier.blurb} />}
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/PERFORMANCE-LAB/REACTION`,
      };
    }
    case "lab-recall": {
      const tier = recallTier(result.span);
      return {
        title: "PERFORMANCE LAB · RECALL",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={LAB_GRID} cell={5} />
            <Kicker text="SEQUENCE SPAN" />
            <Score value={String(result.span)} size={170} />
            <Gag text={tier.name} colour={OG_COLORS.forest} />
            <Gag text={tier.blurb} />
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/PERFORMANCE-LAB/RECALL`,
      };
    }
    case "lab-track": {
      const tier = trackTier(result.ms, pointsRatio(result.pts));
      return {
        title: "PERFORMANCE LAB · TRACK",
        middle: (
          <div style={MIDDLE_COL}>
            <PixelSprite rows={BALLPARK_TARGET} cell={6} />
            <Kicker text={`${TRACK.targets} TARGETS · ${result.ms} MS EACH`} />
            <Score
              value={String(result.pts)}
              unit={`/ ${MAX_POINTS}`}
              size={170}
            />
            <Gag text={tier.name} colour={OG_COLORS.forest} />
            <Gag text={tier.blurb} />
          </div>
        ),
        footer: `BEAT IT AT ${HOST}/PERFORMANCE-LAB/TRACK`,
      };
    }
  }
}

/* ------------------------------------------------------------------ route */

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const payload = parseCardParams(Object.fromEntries(searchParams));
  if (!payload) return new Response("Invalid arcade card", { status: 400 });
  const spec =
    payload.kind === "hero" ? heroSpec(payload.game) : resultSpec(payload.result);

  return new ImageResponse(
    (
      <CardSheet>
        <Title text={spec.title} />
        {spec.middle}
        <CardFooter text={spec.footer} />
      </CardSheet>
    ),
    {
      ...OG_SIZE,
      fonts: await ogFonts(),
      // Pure function of its query params — let scrapers and the CDN cache it.
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
