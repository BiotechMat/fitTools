import type { ZodType } from "zod";

/** Hub landing pages (SPEC §4). */
export type Hub = "nutrition" | "strength" | "recovery";

/** Tool tiers; tier 4 lives under /labs/ with ads disabled (SPEC §2). */
export type Tier = 1 | 2 | 3 | 4;

export interface FaqEntry {
  q: string;
  a: string;
}

export interface Source {
  label: string;
  url: string;
}

export interface Monetization {
  ads: boolean;
  affiliates: boolean;
}

/**
 * Single source of truth for a tool (SPEC §5). The registry drives routing,
 * sitemap, hub listings, related-tool links and JSON-LD. Adding a tool must
 * require zero changes outside its three files plus one registry import.
 */
export interface ToolConfig {
  slug: string;
  title: string;
  /** One-sentence value line rendered under the H1 (SPEC §8); falls back to metaDescription. */
  valueLine?: string;
  metaDescription: string;
  hub: Hub;
  tier: Tier;
  inputsSchema: ZodType;
  defaults: Record<string, string | number | boolean>;
  faq: FaqEntry[];
  related: string[];
  monetization: Monetization;
  /** ISO date (YYYY-MM-DD) of the last editorial/formula review. */
  lastReviewed: string;
  sources: Source[];
}
