import type { MetadataRoute } from "next";
import { AUTHOR, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { allTools, toolsForHub } from "@/registry/tools";

const STATIC_PATHS = [
  AUTHOR.path,
  "/labs",
  "/legal/privacy-policy",
  "/legal/cookie-policy",
  "/legal/terms",
  "/legal/affiliate-disclosure",
  "/legal/medical-disclaimer",
];

/** Sitemap generated from the registry (SPEC §9). */
export default function sitemap(): MetadataRoute.Sitemap {
  const hubs = Object.values(hubMeta)
    .filter((meta) => toolsForHub(meta.hub).length > 0)
    .map((meta) => ({
      url: `${SITE_URL}${meta.path}`,
      changeFrequency: "monthly" as const,
    }));

  const tools = allTools.map((tool) => ({
    url: `${SITE_URL}/${tool.tier === 4 ? `labs/${tool.slug}` : tool.slug}`,
    lastModified: tool.lastReviewed,
    changeFrequency: "monthly" as const,
  }));

  const staticPages = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "yearly" as const,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly" as const },
    ...hubs,
    ...tools,
    ...staticPages,
  ];
}
