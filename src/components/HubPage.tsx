import Link from "next/link";
import type { ReactNode } from "react";
import type { Hub, ToolConfig } from "@/registry/types";
import { hubMeta } from "@/registry/hubs";
import { toolPath, toolsForHub } from "@/registry/tools";
import { breadcrumbJsonLd } from "@/lib/schema-org";

/** Shared calculator card grid — used by the section pages and /calculators. */
export function ToolCardGrid({ tools }: { tools: ToolConfig[] }) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {tools.map((tool) => (
        <li
          key={tool.slug}
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
 * section leads with its calculators, then renders whatever further content
 * the section carries (food reference, exercise library, recovery guides)
 * as children, and interlinks laterally at the end.
 */
export function HubPage({ hub, children }: { hub: Hub; children?: ReactNode }) {
  const meta = hubMeta[hub];
  const tools = toolsForHub(hub);
  const otherHubs = Object.values(hubMeta).filter(
    (other) => other.hub !== hub && toolsForHub(other.hub).length > 0,
  );
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
        <section aria-labelledby={`${hub}-calculators`} className="mt-8">
          <h2 id={`${hub}-calculators`} className="font-display text-xl uppercase">
            Calculators
          </h2>
          <ToolCardGrid tools={tools} />
        </section>
      </div>
      {children}
      <nav aria-label="More calculators">
        <h2 className="font-display text-xl uppercase">More calculators</h2>
        <ul className="mt-2 flex flex-wrap gap-4 text-sm">
          {otherHubs.map((other) => (
            <li key={other.hub}>
              <Link
                href={other.path}
                className="text-primary underline underline-offset-2"
              >
                {other.title} calculators
              </Link>
            </li>
          ))}
          <li>
            <Link href="/calculators" className="text-primary underline underline-offset-2">
              All calculators
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
