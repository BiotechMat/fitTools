import type { Metadata } from "next";
import Link from "next/link";
import { hubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";
import { breadcrumbJsonLd } from "@/lib/schema-org";

const meta = hubMeta.nutrition;

export const metadata: Metadata = {
  title: `${meta.title} calculators`,
  description: meta.description,
  alternates: { canonical: meta.path },
};

export default function NutritionHubPage() {
  const tools = toolsForHub("nutrition");
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
    </div>
  );
}
