import type { MetadataRoute } from "next";

/**
 * Web app manifest (MICROTOOLS.md follow-on): lets the micro-tools be saved
 * to a phone's home screen and open app-like (standalone, paper theme).
 * `start_url` is deliberately omitted — iOS then launches the page the user
 * actually saved (the timer, the breath coach…), which is the point of a
 * per-tool "add to home screen". Trade-off, documented: without start_url,
 * Chrome's install prompt may not fire on some versions; iPhone behaviour
 * is the one Mat asked for.
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
