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
          background: "linear-gradient(135deg, #115e59 0%, #0f766e 60%, #14b8a6 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
          {SITE_NAME}
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
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
