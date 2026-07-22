import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTool, labsTools } from "@/registry/tools";
import { calculators } from "@/components/calculators";
import { AuthorBox } from "@/components/AuthorBox";
import { FAQ } from "@/components/FAQ";
import { breadcrumbJsonLd, faqPageJsonLd, webApplicationJsonLd } from "@/lib/schema-org";

interface LabsPageParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return labsTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: LabsPageParams): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.metaDescription,
    alternates: { canonical: `/labs/${tool.slug}` },
  };
}

export default async function LabsToolPage({ params }: LabsPageParams) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || tool.tier !== 4) notFound();
  const Calculator = calculators[tool.slug];
  if (!Calculator) notFound();

  const { default: Editorial } = await import(`@/content/tools/${tool.slug}.mdx`);
  const jsonLdBlocks = [
    webApplicationJsonLd(tool),
    faqPageJsonLd(tool),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Labs", path: "/labs" },
      { name: tool.title, path: `/labs/${tool.slug}` },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/labs" className="hover:text-foreground">Labs</Link>
        </nav>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{tool.title}</h1>
        <p className="mt-1 max-w-prose text-muted">{tool.valueLine ?? tool.metaDescription}</p>
      </div>

      {/* Enhanced disclaimer — always visible, above the tool (SPEC §2). */}
      <aside
        role="note"
        aria-label="Enhanced disclaimer"
        data-testid="labs-disclaimer"
        className="rounded-lg border border-warning-border bg-warning-bg p-4 text-sm"
      >
        <h2 className="font-semibold">Labs tool — enhanced disclaimer</h2>
        <p className="mt-1">
          This tool performs arithmetic only, on values you supply — it
          offers no compound information, no dosing recommendations and no
          medical advice. Preparation and use of any injectable substance
          belongs under the direction of a licensed prescriber and
          pharmacist. Nothing here endorses the use of unregulated
          substances.
        </p>
      </aside>

      <Calculator />

      <div className="prose">
        <Editorial />
        <h2>Sources</h2>
        <ul>
          {tool.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">{source.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <FAQ entries={tool.faq} />
      <AuthorBox lastReviewed={tool.lastReviewed} />
    </article>
  );
}
