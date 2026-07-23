import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { PIXEL_PALETTE } from "@/lib/pixel-art";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The Lifeline death-card palette (LifelineGame.saveCard) — the house style
 * for every OG/share card: paper sheet, ink frame, ember kicker, blaze score.
 */
export const OG_COLORS = {
  ink: "#1c130d",
  paper: "#fbf4ec",
  blaze: "#ff531a",
  ember: "#c63d08",
  forest: "#1f5c3d",
  taupe: "#6e5b4d",
  sand: "#e7d8c6",
} as const;

/**
 * Anton (the score) + Space Mono Bold (everything else) — the same families
 * the site self-hosts via next/font, vendored as TTFs for satori (OFL licences
 * alongside). Loaded once per process.
 */
interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

let fontsPromise: Promise<OgFont[]> | null = null;

export function ogFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    readFile(path.join(process.cwd(), "src/lib/og-fonts/Anton-Regular.ttf")),
    readFile(path.join(process.cwd(), "src/lib/og-fonts/SpaceMono-Bold.ttf")),
  ]).then(([anton, mono]) => [
    { name: "Anton", data: anton, weight: 400, style: "normal" },
    { name: "Space Mono", data: mono, weight: 700, style: "normal" },
  ]);
  return fontsPromise;
}

/** Bound free-length registry copy so a card never overflows its frame. */
export function ogClip(text: string, max = 140): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** A pixel sprite in the games' map format, rendered as SVG rects. */
export function PixelSprite({ rows, cell }: { rows: string[]; cell: number }) {
  const rects: ReactNode[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const colour = PIXEL_PALETTE[ch];
      if (!colour) return;
      rects.push(
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={colour} />,
      );
    });
  });
  return (
    <svg
      width={rows[0].length * cell}
      height={rows.length * cell}
      viewBox={`0 0 ${rows[0].length * cell} ${rows.length * cell}`}
    >
      {rects}
    </svg>
  );
}

/**
 * The card sheet: paper, 12px ink frame inset like the death card, centred
 * column. Every card surface (pages, tool results, arcade scores) sits here.
 */
export function CardSheet({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: OG_COLORS.paper,
        padding: 20,
        fontFamily: "'Space Mono'",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          border: `12px solid ${OG_COLORS.ink}`,
          padding: "26px 56px 22px",
          color: OG_COLORS.ink,
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The death card's brand baseline. */
export function CardFooter({ text }: { text?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 22,
        letterSpacing: 4,
        color: OG_COLORS.taupe,
        textTransform: "uppercase",
      }}
    >
      {text ?? "FITTOOLS · EVERY FORMULA CITED"}
    </div>
  );
}

export interface OgCardOptions {
  /** Ember eyebrow above the title, e.g. "SUPPLEMENT DATABASE". */
  kicker?: string;
}

/**
 * Per-page OG card (SPEC §3, §9) in the death-card house style: mono kicker,
 * Anton title, mono standfirst, brand baseline. Shared by the site default
 * image and every section/content/tool image.
 */
export async function ogCard(
  title: string,
  subtitle: string,
  options: OgCardOptions = {},
): Promise<ImageResponse> {
  const heading = ogClip(title, 64);
  const titleSize = heading.length > 26 ? 88 : 120;
  return new ImageResponse(
    (
      <CardSheet>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 8,
            fontWeight: 700,
          }}
        >
          FITTOOLS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {options.kicker ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                letterSpacing: 6,
                color: OG_COLORS.ember,
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              {ogClip(options.kicker, 52)}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontFamily: "Anton",
              fontSize: titleSize,
              lineHeight: 1.02,
              textTransform: "uppercase",
              color: OG_COLORS.blaze,
              maxWidth: 1000,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 26,
              lineHeight: 1.45,
              marginTop: 22,
              maxWidth: 940,
            }}
          >
            {ogClip(subtitle, 150)}
          </div>
        </div>
        <CardFooter />
      </CardSheet>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
