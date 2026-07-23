import { ImageResponse } from "next/og";
import { getTool } from "@/registry/tools";
import { parseShareCardParams } from "@/lib/share-card";
import { CardFooter, CardSheet, OG_COLORS, OG_SIZE, ogClip, ogFonts } from "@/lib/og-image";
import { SITE_URL } from "@/lib/site";

/**
 * Dynamic achievement/share card (ROADMAP.md E1; DESIGN.md §6), in the
 * death-card house style (paper sheet, ink frame, ember kicker, Anton score).
 * Tied to a real tool (registry-resolved name), so a card can only present a
 * genuine FitTools metric. Wins-only surface — the caller decides the value.
 */

export const dynamic = "force-dynamic";

const HOST = new URL(SITE_URL).host.toUpperCase();

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const params = parseShareCardParams(Object.fromEntries(searchParams));
  const tool = params ? getTool(params.tool) : undefined;
  if (!params || !tool) {
    return new Response("Invalid share card", { status: 400 });
  }
  const name = tool.title.split(":")[0].trim();

  return new ImageResponse(
    (
      <CardSheet>
        <div style={{ display: "flex", fontSize: 38, letterSpacing: 8 }}>FITTOOLS</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              letterSpacing: 5,
              color: OG_COLORS.ember,
              textTransform: "uppercase",
            }}
          >
            {ogClip(name, 40)}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Anton",
                fontSize: 220,
                lineHeight: 0.98,
                color: OG_COLORS.blaze,
              }}
            >
              {params.value}
            </div>
            {params.unit ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 44,
                  letterSpacing: 2,
                  color: OG_COLORS.taupe,
                  marginLeft: 18,
                  marginBottom: 18,
                }}
              >
                {params.unit}
              </div>
            ) : null}
          </div>
          {params.label ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                letterSpacing: 2,
                color: OG_COLORS.forest,
                textTransform: "uppercase",
                marginTop: 16,
              }}
            >
              {params.label}
            </div>
          ) : null}
        </div>
        <CardFooter text={`EVERY FORMULA CITED · CALCULATE YOURS AT ${HOST}`} />
      </CardSheet>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
