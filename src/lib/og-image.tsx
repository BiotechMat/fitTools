import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Branded OG card rendered at build time via next/og (SPEC §3, §9).
 * Shared by the site default image and the per-tool images.
 */
export function ogCard(title: string, subtitle: string): ImageResponse {
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
          background: "#1c130d",
          color: "#fbf4ec",
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
              background: "#ff531a",
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
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: "#ff531a",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#e7d8c6" }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
