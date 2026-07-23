import { NextResponse } from "next/server";

/**
 * Per-page web-app manifests for the add-to-home-screen surfaces (games,
 * dailies, micro-tools). The root manifest deliberately omitted `start_url`
 * expecting iOS to save the current page; field-tested on an iPhone, WebKit
 * instead falls back to the site root — every save landed on the homepage
 * with the generic name (Mat, 2026-07-23). So each saveable page now links
 * its own manifest here with an EXPLICIT `start_url`, name and icon.
 *
 * Allowlisted ids only — same forgery posture as the share cards: a crafted
 * URL can never mint a manifest for an arbitrary path or name.
 */

interface PageEntry {
  path: string;
  name: string;
  /** iOS home-screen labels truncate around 12 characters. */
  shortName: string;
  /** 180×180 icon route; games carry their own pixel-sprite icons. */
  icon: string;
}

const PAGES: Record<string, PageEntry> = {
  lifeline: {
    path: "/lifeline",
    name: "Lifeline",
    shortName: "Lifeline",
    icon: "/lifeline/apple-icon",
  },
  powerhouse: {
    path: "/powerhouse",
    name: "Powerhouse",
    shortName: "Powerhouse",
    icon: "/powerhouse/apple-icon",
  },
  "max-out": {
    path: "/max-out",
    name: "Max Out",
    shortName: "Max Out",
    icon: "/max-out/apple-icon",
  },
  "five-a-day": {
    path: "/five-a-day",
    name: "Five a Day",
    shortName: "Five a Day",
    icon: "/five-a-day/apple-icon",
  },
  daily: {
    path: "/daily",
    name: "FitTools Daily",
    shortName: "Daily",
    icon: "/apple-icon",
  },
  timer: {
    path: "/tools/timer",
    name: "Gym Timers",
    shortName: "Gym Timers",
    icon: "/apple-icon",
  },
  breath: {
    path: "/tools/breath",
    name: "Breath Coach",
    shortName: "Breath",
    icon: "/apple-icon",
  },
  "muscle-map": {
    path: "/tools/muscle-map",
    name: "Muscle Map",
    shortName: "Muscle Map",
    icon: "/apple-icon",
  },
  "plate-builder": {
    path: "/tools/plate-builder",
    name: "Plate Builder",
    shortName: "Plates",
    icon: "/apple-icon",
  },
  "supplement-explorer": {
    path: "/tools/supplement-explorer",
    name: "Supplement Evidence Explorer",
    shortName: "Supplements",
    icon: "/apple-icon",
  },
};

export function GET(request: Request): NextResponse {
  const page = new URL(request.url).searchParams.get("page");
  const entry = page ? PAGES[page] : undefined;
  if (!entry) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(
    {
      name: entry.name,
      short_name: entry.shortName,
      // Explicit identity + entry point: the whole reason this route exists.
      id: entry.path,
      start_url: entry.path,
      // Site-wide scope so in-app links (calculators, the arcade) stay
      // inside the standalone window instead of bouncing out to Safari.
      scope: "/",
      display: "standalone",
      background_color: "#fbf4ec",
      theme_color: "#fbf4ec",
      icons: [
        { src: entry.icon, sizes: "180x180", type: "image/png" },
        { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
