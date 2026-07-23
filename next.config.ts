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
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
