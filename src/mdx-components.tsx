import type { MDXComponents } from "mdx/types";
import { EvidenceTier } from "@/components/EvidenceTier";

/** Components available in every MDX file without an explicit import. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { EvidenceTier, ...components };
}
