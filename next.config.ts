import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // A stray lockfile exists in the home directory; pin tracing to the repo.
  outputFileTracingRoot: process.cwd(),
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
