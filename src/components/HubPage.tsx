import Link from "next/link";
import type { Hub } from "@/registry/types";
import { hubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";
import { breadcrumbJsonLd } from "@/lib/schema-org";

/** Shared hub landing page body (SPEC §4) — lists child tools and interlinks laterally. */
export function HubPage({ hub }: { hub: Hub }) {
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-2xl font-bold sm:text-3xl">{meta.title} calculators</h1>
      <p className="mt-1 max-w-prose text-muted">{meta.description}</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.slug} className="rounded-lg border border-border p-4">
            <Link
              href={`/${tool.slug}`}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {tool.title}
            </Link>
            <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
          </li>
        ))}
      </ul>
      {otherHubs.length > 0 ? (
        <nav aria-label="Other calculator hubs" className="mt-10">
          <h2 className="text-lg font-bold">More calculators</h2>
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
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
