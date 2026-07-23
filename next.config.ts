import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // A stray lockfile exists in the home directory; pin tracing to the repo.
  outputFileTracingRoot: process.cwd(),
  // 2026-07-23 restructure: /labs retired (its one tool now lives in the
  // peptides section) and the strength hub became the /workout section.
  // Permanent redirects keep old links and search results resolving.
  async redirects() {
    return [
      { source: "/labs", destination: "/learn/peptides", permanent: true },
      { source: "/labs/:slug", destination: "/learn/peptides/:slug", permanent: true },
      { source: "/strength", destination: "/workout", permanent: true },
      // 2026-07-23: the arcade slicer pivoted from Snake Oil (myth slogans —
      // unreadable at toss speed) to Five a Day (produce vs junk, FIVEADAY.md).
      { source: "/snake-oil", destination: "/five-a-day", permanent: true },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
