import type { MetadataRoute } from "next";
import { AUTHOR, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { allTools, toolsForHub } from "@/registry/tools";
import { allPeptides } from "@/registry/peptides";
import { recoveryClusters } from "@/registry/recovery-content";
import { GLOSSARY_LAST_REVIEWED, glossaryEntries } from "@/registry/glossary";

const STATIC_PATHS = [
  AUTHOR.path,
  "/labs",
  "/learn/peptides",
  "/learn/index-methodology",
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

  const peptides = allPeptides.map((p) => ({
    url: `${SITE_URL}/learn/peptides/${p.slug}`,
    lastModified: p.lastReviewed,
    changeFrequency: "monthly" as const,
  }));

  const recoveryContent = recoveryClusters.flatMap((c) => [
    {
      url: `${SITE_URL}/recovery/${c.slug}`,
      lastModified: c.lastReviewed,
      changeFrequency: "monthly" as const,
    },
    ...c.satellites.map((a) => ({
      url: `${SITE_URL}/recovery/${c.slug}/${a.slug}`,
      lastModified: a.lastReviewed,
      changeFrequency: "monthly" as const,
    })),
  ]);

  const glossary = [
    { url: `${SITE_URL}/glossary`, changeFrequency: "monthly" as const },
    ...glossaryEntries.map((e) => ({
      url: `${SITE_URL}/glossary/${e.slug}`,
      lastModified: GLOSSARY_LAST_REVIEWED,
      changeFrequency: "monthly" as const,
    })),
  ];

  return [
    { url: SITE_URL, changeFrequency: "weekly" as const },
    ...hubs,
    ...tools,
    ...staticPages,
    ...peptides,
    ...recoveryContent,
    ...glossary,
  ];
}
