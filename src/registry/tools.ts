import type { Hub, ToolConfig } from "@/registry/types";
import { tdeeConfig } from "@/registry/configs/tdee";

/**
 * Single source of truth (SPEC §5). Every tool config is imported here once;
 * routing, sitemap, hub listings, related links and JSON-LD all derive from
 * this list.
 */
export const allTools: ToolConfig[] = [tdeeConfig];

export const toolsBySlug: ReadonlyMap<string, ToolConfig> = new Map(
  allTools.map((tool) => [tool.slug, tool]),
);

export function getTool(slug: string): ToolConfig | undefined {
  return toolsBySlug.get(slug);
}

/** Tools rendered under /(tools)/[slug] — everything except tier 4 (/labs/). */
export function standardTools(): ToolConfig[] {
  return allTools.filter((tool) => tool.tier !== 4);
}

/** Tier 4 tools rendered under /labs/[slug] with ads disabled. */
export function labsTools(): ToolConfig[] {
  return allTools.filter((tool) => tool.tier === 4);
}

export function toolsForHub(hub: Hub): ToolConfig[] {
  return allTools.filter((tool) => tool.hub === hub);
}

/** Related tools that actually exist in the registry — never a dead link. */
export function relatedTools(tool: ToolConfig): ToolConfig[] {
  return tool.related.flatMap((slug) => {
    const found = getTool(slug);
    return found ? [found] : [];
  });
}
