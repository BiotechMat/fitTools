import Link from "next/link";
import type { ToolConfig } from "@/registry/types";
import { relatedTools } from "@/registry/tools";

/** Related-tool links from the registry (SPEC §8) — only live tools render. */
export function RelatedTools({ tool }: { tool: ToolConfig }) {
  const related = relatedTools(tool);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-bold">
        Related tools
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {related.map((relatedTool) => (
          <li
            key={relatedTool.slug}
            className="rounded-lg border border-border p-4"
          >
            <Link
              href={`/${relatedTool.slug}`}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {relatedTool.title}
            </Link>
            <p className="mt-1 text-sm text-muted">
              {relatedTool.metaDescription}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
