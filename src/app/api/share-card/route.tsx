import { ImageResponse } from "next/og";
import { getTool } from "@/registry/tools";
import { parseShareCardParams } from "@/lib/share-card";

/**
 * Dynamic achievement/share card (ROADMAP.md E1; DESIGN.md §6). Renders a
 * branded 1200×630 OG image from validated share params. Tied to a real tool
 * (registry-resolved name), so a card can only present a genuine FitTools
 * metric. Wins-only surface — the caller decides what value to show.
 */

export const dynamic = "force-dynamic";

const INK = "#1C130D";
const PAPER = "#FBF4EC";
const BLAZE = "#FF531A";
const FOREST = "#1F5C3D";

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const params = parseShareCardParams(Object.fromEntries(searchParams));
  const tool = params ? getTool(params.tool) : undefined;
  if (!params || !tool) {
    return new Response("Invalid share card", { status: 400 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: PAPER,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand eyebrow */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: BLAZE,
              borderRadius: "8px",
              marginRight: "18px",
            }}
          />
          <div style={{ fontSize: "30px", letterSpacing: "6px", fontWeight: 700 }}>
            FITTOOLS
          </div>
        </div>

        {/* The result */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "44px", opacity: 0.9 }}>{tool.title.split(":")[0].trim()}</div>
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: "8px" }}>
            <div style={{ fontSize: "230px", fontWeight: 800, color: BLAZE, lineHeight: 1 }}>
              {params.value}
            </div>
            {params.unit ? (
              <div style={{ fontSize: "64px", opacity: 0.6, marginLeft: "24px", marginBottom: "34px" }}>
                {params.unit}
              </div>
            ) : null}
          </div>
          {params.label ? (
            <div style={{ display: "flex", marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  background: FOREST,
                  color: PAPER,
                  fontSize: "36px",
                  fontWeight: 700,
                  padding: "12px 28px",
                  borderRadius: "999px",
                }}
              >
                {params.label}
              </div>
            </div>
          ) : null}
        </div>

        {/* Watermark */}
        <div style={{ display: "flex", fontSize: "28px", letterSpacing: "2px", opacity: 0.7 }}>
          Evidence-based fitness &amp; longevity tools · every formula cited
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
