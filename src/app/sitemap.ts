import type { MetadataRoute } from "next";
import { AUTHOR, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { allTools, toolsForHub } from "@/registry/tools";
import { allPeptides } from "@/registry/peptides";
import { recoveryClusters } from "@/registry/recovery-content";
import { GLOSSARY_LAST_REVIEWED, glossaryEntries } from "@/registry/glossary";
import { SUPPLEMENTS_LAST_REVIEWED, supplements } from "@/registry/supplements";
import { FOOD_REFERENCE_LAST_REVIEWED, foodReferencePages } from "@/registry/food-reference";
import { EXERCISES_LAST_REVIEWED, allExercisePaths } from "@/registry/exercises";
import { REFERENCE_TABLES_LAST_REVIEWED, referenceTablePages } from "@/registry/reference-tables";

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

  const supplementPages = [
    { url: `${SITE_URL}/supplements`, changeFrequency: "monthly" as const },
    ...supplements.map((s) => ({
      url: `${SITE_URL}/supplements/${s.slug}`,
      lastModified: SUPPLEMENTS_LAST_REVIEWED,
      changeFrequency: "monthly" as const,
    })),
  ];

  const exercisePages = [
    { url: `${SITE_URL}/exercises`, changeFrequency: "monthly" as const },
    ...allExercisePaths().map((path) => ({
      url: `${SITE_URL}/exercises/${path.pattern}${path.exercise ? `/${path.exercise}` : ""}`,
      lastModified: EXERCISES_LAST_REVIEWED,
      changeFrequency: "monthly" as const,
    })),
  ];

  const foodReference = [
    { url: `${SITE_URL}/nutrition/reference`, changeFrequency: "monthly" as const },
    ...foodReferencePages.map((p) => ({
      url: `${SITE_URL}/nutrition/reference/${p.slug}`,
      lastModified: FOOD_REFERENCE_LAST_REVIEWED,
      changeFrequency: "monthly" as const,
    })),
  ];

  const referenceTables = [
    { url: `${SITE_URL}/reference`, changeFrequency: "monthly" as const },
    ...referenceTablePages.map((p) => ({
      url: `${SITE_URL}/reference/${p.slug}`,
      lastModified: REFERENCE_TABLES_LAST_REVIEWED,
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
    ...supplementPages,
    ...exercisePages,
    ...foodReference,
    ...referenceTables,
  ];
}
