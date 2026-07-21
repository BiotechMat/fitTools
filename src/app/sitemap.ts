import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { allTools, toolsForHub } from "@/registry/tools";

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

  return [
    { url: SITE_URL, changeFrequency: "weekly" as const },
    ...hubs,
    ...tools,
  ];
}
