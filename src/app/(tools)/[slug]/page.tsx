import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTool, standardTools } from "@/registry/tools";
import { hubMeta } from "@/registry/hubs";
import { calculators } from "@/components/calculators";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateBlock } from "@/components/AffiliateBlock";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EmailCapture } from "@/components/EmailCapture";
import { EmbedCode } from "@/components/EmbedCode";
import { FAQ } from "@/components/FAQ";
import { RelatedTools } from "@/components/RelatedTools";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webApplicationJsonLd,
} from "@/lib/schema-org";

interface ToolPageParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return standardTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageParams): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.metaDescription,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      type: "website",
      url: `/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageParams) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || tool.tier === 4) notFound();

  const Calculator = calculators[tool.slug];
  if (!Calculator) notFound();

  const hub = hubMeta[tool.hub];
  const { default: Editorial } = await import(
    `@/content/tools/${tool.slug}.mdx`
  );

  const crumbs = [
    { name: "Home", path: "/" },
    { name: hub.title, path: hub.path },
    { name: tool.title, path: `/${tool.slug}` },
  ];

  const jsonLdBlocks = [
    webApplicationJsonLd(tool),
    faqPageJsonLd(tool),
    breadcrumbJsonLd(crumbs),
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
          <ol className="flex flex-wrap gap-1">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li>
              <Link href={hub.path} className="hover:text-foreground">
                {hub.title}
              </Link>
            </li>
          </ol>
        </nav>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{tool.title}</h1>
        <p className="mt-1 max-w-prose text-muted">
          {tool.valueLine ?? tool.metaDescription}
        </p>
      </div>

      <Calculator />

      {tool.monetization.ads ? <AdSlot slotId={`${tool.slug}-below-results`} /> : null}

      <div className="prose">
        <Editorial />
        <h2>Sources</h2>
        <ul>
          {tool.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <FAQ entries={tool.faq} />

      {tool.monetization.affiliates ? <AffiliateBlock slug={tool.slug} /> : null}

      <EmailCapture />

      <EmbedCode slug={tool.slug} />

      <AuthorBox lastReviewed={tool.lastReviewed} />

      <RelatedTools tool={tool} />

      <DisclaimerBanner />
    </article>
  );
}
