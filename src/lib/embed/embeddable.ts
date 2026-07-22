/** Tools with a React-free embed build (SPEC §9). Extend alongside src/app/embed/[slug]/route.ts. */

export const EMBED_SLUGS = [
  "tdee-calculator",
  "bmi-calculator",
  "one-rep-max-calculator",
] as const;

export type EmbedSlug = (typeof EMBED_SLUGS)[number];

export function isEmbeddable(slug: string): slug is EmbedSlug {
  return (EMBED_SLUGS as readonly string[]).includes(slug);
}
