import Link from "next/link";
import type { ToolConfig } from "@/registry/types";
import { relatedTools, toolPath } from "@/registry/tools";

/** Related-tool links from the registry (SPEC §8) — only live tools render. */
export function RelatedTools({ tool }: { tool: ToolConfig }) {
  const related = relatedTools(tool);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="font-display text-2xl uppercase">
        Related tools
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {related.map((relatedTool) => (
          <li
            key={relatedTool.slug}
            className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
          >
            <Link
              href={toolPath(relatedTool)}
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
