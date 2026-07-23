import type { MetadataRoute } from "next";

/**
 * Site-wide fallback web app manifest (MICROTOOLS.md follow-on). The original
 * omit-start_url approach assumed iOS would launch the page the user saved;
 * field-tested on an iPhone it does NOT — WebKit falls back to the site root,
 * so every save landed on the homepage (Mat, 2026-07-23). Pages with an
 * add-to-home-screen button (games, dailies, micro-tools) therefore link
 * their own manifest from /api/page-manifest with an explicit start_url,
 * name and icon; this root manifest only covers everything else.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitTools",
    short_name: "FitTools",
    description:
      "Evidence-based fitness calculators and micro-tools, every formula cited.",
    display: "standalone",
    background_color: "#fbf4ec",
    theme_color: "#fbf4ec",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
