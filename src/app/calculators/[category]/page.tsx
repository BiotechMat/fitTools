import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { HubMeta } from "@/registry/hubs";
import { hubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";
import { ToolCardGrid } from "@/components/HubPage";
import { breadcrumbJsonLd } from "@/lib/schema-org";

/**
 * Calculator category pages (/calculators/nutrition|workout|recovery) —
 * the full tool listing for one category, linked from the single card on
 * each topic section page and from the /calculators index.
 */

interface CategoryParams {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

function liveCategories(): HubMeta[] {
  return Object.values(hubMeta).filter(
    (meta) => toolsForHub(meta.hub).length > 0,
  );
}

// Category slug = the topic section's path segment (nutrition, workout, recovery).
function categoryBySlug(slug: string): HubMeta | undefined {
  return liveCategories().find((meta) => meta.path === `/${slug}`);
}

export function generateStaticParams(): { category: string }[] {
  return liveCategories().map((meta) => ({ category: meta.path.slice(1) }));
}

export async function generateMetadata({ params }: CategoryParams): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryBySlug(category);
  if (!meta) return {};
  return {
    title: `${meta.title} calculators`,
    description: meta.description,
    alternates: { canonical: `/calculators/${category}` },
  };
}

export default async function CalculatorCategoryPage({ params }: CategoryParams) {
  const { category } = await params;
  const meta = categoryBySlug(category);
  if (!meta) notFound();
  const tools = toolsForHub(meta.hub);
  const others = liveCategories().filter((other) => other.hub !== meta.hub);
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators" },
    { name: meta.title, path: `/calculators/${category}` },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/calculators" className="hover:text-foreground">Calculators</Link>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        {meta.title} calculators
      </h1>
      <p className="mt-1 max-w-prose text-muted">
        Every {meta.title.toLowerCase()} calculator, each built on a
        published, peer-reviewed formula, with the sources cited on the page.
      </p>
      <ToolCardGrid tools={tools} />
      <nav aria-label="More calculators" className="mt-10">
        <h2 className="font-display text-xl uppercase">More calculators</h2>
        <ul className="mt-2 flex flex-wrap gap-4 text-sm">
          {others.map((other) => (
            <li key={other.hub}>
              <Link
                href={`/calculators${other.path}`}
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
