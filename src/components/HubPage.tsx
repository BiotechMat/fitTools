import Link from "next/link";
import type { ReactNode } from "react";
import type { Hub, ToolConfig } from "@/registry/types";
import { hubMeta } from "@/registry/hubs";
import { toolPath, toolsForHub } from "@/registry/tools";
import { breadcrumbJsonLd } from "@/lib/schema-org";

/** Shared calculator card grid — used by /calculators and its category pages. */
export function ToolCardGrid({ tools }: { tools: ToolConfig[] }) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {tools.map((tool) => (
        <li
          key={tool.slug}
          data-search-item={tool.title}
          className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
        >
          <Link
            href={toolPath(tool)}
            className="font-semibold text-primary underline underline-offset-2"
          >
            {tool.title}
          </Link>
          <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Shared topic-section shell (SPEC §4; restructured 2026-07-23). Each
 * section opens with a single card into its calculator category page
 * (/calculators/<category> — the calculators themselves live there), then
 * renders the section's own content (food reference, exercise library,
 * recovery guides) as children.
 */
export function HubPage({ hub, children }: { hub: Hub; children?: ReactNode }) {
  const meta = hubMeta[hub];
  const categoryPath = `/calculators${meta.path}`;
  const toolCount = toolsForHub(hub).length;
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: meta.title, path: meta.path },
  ]);

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">{meta.title}</h1>
        <p className="mt-1 max-w-prose text-muted">{meta.description}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          <li className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
            <Link
              href={categoryPath}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {meta.title} calculators
            </Link>
            <p className="mt-1 text-sm text-muted">
              All {toolCount} {meta.title.toLowerCase()} calculators, every
              formula cited to its published source.
            </p>
          </li>
        </ul>
      </div>
      {children}
    </div>
  );
}
