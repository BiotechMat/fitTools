import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** DESIGN.md v2 palette, satori-side. Shared by every OG/share card route. */
export const OG_COLORS = {
  ink: "#1C130D",
  paper: "#FBF4EC",
  blaze: "#FF531A",
  forest: "#1F5C3D",
  sand: "#E7D8C6",
} as const;

/** Bound free-length registry copy so a card never overflows its frame. */
export function ogClip(text: string, max = 140): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export interface OgCardOptions {
  /** Small-caps eyebrow above the title, e.g. "SUPPLEMENT DATABASE". */
  kicker?: string;
}

/**
 * Branded OG card rendered at build time via next/og (SPEC §3, §9).
 * Shared by the site default image and every per-page image: brand row,
 * optional section kicker, shouted title, plain-English subtitle.
 */
export function ogCard(
  title: string,
  subtitle: string,
  options: OgCardOptions = {},
): ImageResponse {
  const heading = ogClip(title, 90);
  // Long registry titles drop a size step instead of clipping mid-word.
  const titleSize = heading.length > 44 ? 52 : 64;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: OG_COLORS.ink,
          color: OG_COLORS.paper,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>
          <span style={{ textTransform: "uppercase" }}>{SITE_NAME}</span>
          <span
            style={{
              marginLeft: 16,
              width: 28,
              height: 28,
              marginTop: 12,
              borderRadius: 8,
              background: OG_COLORS.blaze,
              transform: "rotate(-6deg)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {options.kicker ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: OG_COLORS.sand,
                opacity: 0.85,
              }}
            >
              {ogClip(options.kicker, 48)}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: OG_COLORS.blaze,
            }}
          >
            {heading}
          </div>
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: OG_COLORS.sand }}>
            {ogClip(subtitle, 160)}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
