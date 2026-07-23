import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import {
  lifelineCauseLabel,
  parseCardParams,
  powerhouseZonePhrase,
  type ArcadeCardPayload,
  type HeroCard,
  type ShareResultPayload,
} from "@/lib/arcade-share";
import { MISS_CAUSES, formatKg, platesPhrase } from "@/lib/maxout";
import { TIER_META } from "@/lib/daily/types";
import { OG_COLORS, OG_SIZE } from "@/lib/og-image";
import { SITE_URL } from "@/lib/site";

/**
 * Dynamic arcade/daily score card (STATUS.md Phase 2 — the share loop beyond
 * tools). Renders the branded 1200×630 OG image for a shared game result, so a
 * "beat me" link unfurls as the score instead of the generic site card. Sibling
 * of `/api/share-card` (which stays tool-registry-bound); params here are
 * numbers, fixed ids and tier letters only — never free text — so a crafted
 * URL can't put arbitrary words in the brand frame.
 */

export const dynamic = "force-dynamic";

const { ink, paper, blaze, forest, sand } = OG_COLORS;
const HOST = new URL(SITE_URL).host;

const GAME_META: Record<
  HeroCard,
  { name: string; kicker: string; strap: string; path: string }
> = {
  lifeline: {
    name: "LIFELINE",
    kicker: "THE ARCADE",
    strap: "The heartbeat arcade game. One button — your score is the age you reach.",
    path: "/lifeline",
  },
  "max-out": {
    name: "MAX OUT",
    kicker: "THE ARCADE",
    strap: "Stop the needle in the green, lock the rep, load the bar.",
    path: "/max-out",
  },
  "snake-oil": {
    name: "SNAKE OIL",
    kicker: "THE ARCADE",
    strap: "Slice the myths, spare the truths — every bust cites a real source.",
    path: "/snake-oil",
  },
  powerhouse: {
    name: "POWERHOUSE",
    kicker: "THE ARCADE",
    strap: "You are the mitochondrion. Make ATP, dodge the junk, climb the zones.",
    path: "/powerhouse",
  },
  daily: {
    name: "THE DAILIES",
    kicker: "DAILY GAMES",
    strap: "Ballpark and Myth or Fact? — one cited stat game a day, streaks kept.",
    path: "/daily",
  },
};

function heroOf(result: ShareResultPayload): HeroCard {
  if (result.game === "ballpark" || result.game === "myth") return "daily";
  return result.game;
}

/* ------------------------------------------------------------ card pieces */

function BrandRow({ kicker }: { kicker: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: blaze,
            borderRadius: 8,
            marginRight: 18,
            transform: "rotate(-6deg)",
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 700 }}>
          FITTOOLS
        </div>
      </div>
      <div
        style={{
          fontSize: 24,
          letterSpacing: 5,
          fontWeight: 700,
          color: sand,
          opacity: 0.85,
        }}
      >
        {kicker}
      </div>
    </div>
  );
}

function Pill({ text, background = forest }: { text: string; background?: string }) {
  return (
    <div
      style={{
        display: "flex",
        background,
        color: paper,
        fontSize: 32,
        fontWeight: 700,
        padding: "10px 26px",
        borderRadius: 999,
      }}
    >
      {text}
    </div>
  );
}

/** Cartoon ECG: a couple of beats, then the flatline — the Lifeline motif. */
function EcgStrip() {
  return (
    <svg width="1056" height="72" viewBox="0 0 1056 72">
      <polyline
        points="0,36 150,36 170,36 186,8 202,62 218,36 380,36 400,36 416,8 432,62 448,36 560,36 1056,36"
        fill="none"
        stroke={blaze}
        strokeWidth="5"
      />
    </svg>
  );
}

/** Five ascending zone bars, filled to the zone reached — Powerhouse motif. */
function ZoneBars({ zone }: { zone: number }) {
  const bars = [0, 1, 2, 3, 4];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
      {bars.map((i) => (
        <div
          key={i}
          style={{
            width: 44,
            height: 18 + i * 10,
            borderRadius: 6,
            background: i <= Math.min(zone, 4) ? blaze : "#3A2B20",
          }}
        />
      ))}
    </div>
  );
}

/** Ballpark form row as coloured dots (no emoji — deterministic rendering). */
const TIER_DOTS: Record<string, string> = {
  bullseye: blaze,
  hot: "#FF8C42",
  warm: sand,
  cold: "#5B7C99",
};

function TierRow({ tiers }: { tiers: readonly string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {tiers.map((tier, i) => (
        <div
          key={i}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: TIER_DOTS[tier] ?? sand,
            border: tier === "bullseye" ? `6px solid ${paper}` : "none",
            display: "flex",
          }}
        />
      ))}
    </div>
  );
}

function HeartsRow({ correct, total }: { correct: number; total: number }) {
  const cells = Array.from({ length: total }, (_, i) => i < correct);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {cells.map((won, i) => (
        <div
          key={i}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: won ? forest : "#3A2B20",
            transform: "rotate(45deg)",
            display: "flex",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- card bodies */

interface CardBody {
  kicker: string;
  /** Small caps line above the number, e.g. "FLATLINED AT". */
  label: string;
  value: string;
  unit?: string;
  pills: string[];
  motif?: ReactNode;
  footer: string;
}

function bodyFor(payload: ArcadeCardPayload): CardBody {
  if (payload.kind === "hero") {
    const meta = GAME_META[payload.game];
    return {
      kicker: meta.kicker,
      label: "",
      value: meta.name,
      pills: [],
      motif: payload.game === "lifeline" ? <EcgStrip /> : undefined,
      footer: `${meta.strap} Free at ${HOST}${meta.path}`,
    };
  }
  const result = payload.result;
  const meta = GAME_META[heroOf(result)];
  switch (result.game) {
    case "lifeline":
      return {
        kicker: `${meta.kicker} · LIFELINE`,
        label: "FLATLINED AT",
        value: String(result.beat),
        pills: result.cause ? [`CAUSE: ${lifelineCauseLabel(result.cause)}`] : [],
        motif: <EcgStrip />,
        footer:
          result.seed !== undefined
            ? `Same course · one button · beat them at ${HOST}/lifeline`
            : `One button · your score is the age you reach · ${HOST}/lifeline`,
      };
    case "max-out":
      return {
        kicker: `${meta.kicker} · MAX OUT`,
        label: "FORM FAILED AT",
        value: formatKg(result.kg),
        unit: "kg",
        pills: [
          platesPhrase(result.kg).toUpperCase(),
          ...(result.cause !== undefined && result.cause < MISS_CAUSES.length
            ? [`CAUSE: ${MISS_CAUSES[result.cause].toUpperCase()}`]
            : []),
        ],
        footer: `Stop the needle, load the bar — beat it at ${HOST}/max-out`,
      };
    case "snake-oil":
      return {
        kicker: `${meta.kicker} · SNAKE OIL`,
        label: "MYTHS BUSTED",
        value: String(result.busted),
        unit: `· ${result.points.toLocaleString("en-GB")} pts`,
        pills: ["SLICE THE MYTHS. SPARE THE TRUTH."],
        footer: `Every bust cites a real source — play at ${HOST}/snake-oil`,
      };
    case "powerhouse":
      return {
        kicker: `${meta.kicker} · POWERHOUSE`,
        label: "BONKED WITH",
        value: result.atp.toLocaleString("en-GB"),
        unit: "ATP",
        pills: [powerhouseZonePhrase(result.zone)],
        motif: <ZoneBars zone={result.zone} />,
        footer: `The powerhouse of the cell needs a pilot — ${HOST}/powerhouse`,
      };
    case "ballpark":
      return {
        kicker: "DAILY GAMES · BALLPARK",
        label: `BALLPARK #${result.puzzle}`,
        value:
          result.tiers.length > 0
            ? TIER_META[result.tiers[result.tiers.length - 1]].label.toUpperCase()
            : "PLAYED",
        pills: [],
        motif: result.tiers.length > 0 ? <TierRow tiers={result.tiers} /> : undefined,
        footer: `One cited guess-the-stat a day — play today's at ${HOST}/daily`,
      };
    case "myth":
      return {
        kicker: "DAILY GAMES · MYTH OR FACT?",
        label: `MYTH OR FACT? #${result.puzzle}`,
        value: `${result.correct}/${result.total}`,
        pills: [],
        motif: <HeartsRow correct={result.correct} total={result.total} />,
        footer: `The weekly myth-buster, every verdict cited — ${HOST}/daily`,
      };
  }
}

/* ------------------------------------------------------------------ route */

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const payload = parseCardParams(Object.fromEntries(searchParams));
  if (!payload) return new Response("Invalid arcade card", { status: 400 });
  const body = bodyFor(payload);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ink,
          color: paper,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <BrandRow kicker={body.kicker} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {body.label ? (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                letterSpacing: 4,
                fontWeight: 700,
                color: sand,
              }}
            >
              {body.label}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                fontSize: payload.kind === "hero" ? 150 : 180,
                fontWeight: 800,
                color: blaze,
                lineHeight: 1,
              }}
            >
              {body.value}
            </div>
            {body.unit ? (
              <div
                style={{
                  fontSize: 56,
                  opacity: 0.65,
                  marginLeft: 24,
                  marginBottom: 22,
                }}
              >
                {body.unit}
              </div>
            ) : null}
          </div>
          {body.pills.length > 0 ? (
            <div style={{ display: "flex", gap: 18, marginTop: 26 }}>
              {body.pills.map((text, i) => (
                <Pill key={i} text={text} background={i === 0 ? forest : "#3A2B20"} />
              ))}
            </div>
          ) : null}
          {body.motif ? (
            <div style={{ display: "flex", marginTop: 24 }}>{body.motif}</div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 27,
            letterSpacing: 1,
            opacity: 0.75,
          }}
        >
          {body.footer}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      // Pure function of its query params — let scrapers and the CDN cache it.
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
