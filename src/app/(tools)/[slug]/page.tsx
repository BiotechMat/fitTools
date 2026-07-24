import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTool, standardTools } from "@/registry/tools";
import { hubMeta } from "@/registry/hubs";
import { calculators } from "@/components/calculators";
import { AdSlot } from "@/components/AdSlot";
import { RecommendationRail } from "@/components/RecommendationRail";
import { AuthorBox } from "@/components/AuthorBox";
import { ClinicalDisclaimer } from "@/components/ClinicalDisclaimer";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EmailCapture } from "@/components/EmailCapture";
import { EmbedCode } from "@/components/EmbedCode";
import { SaveItemButton } from "@/components/account/SaveItemButton";
import { FAQ } from "@/components/FAQ";
import { RelatedTools } from "@/components/RelatedTools";
import { RelatedReference } from "@/components/RelatedReference";
import { SourcesReceipt } from "@/components/SourcesReceipt";
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
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
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
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl uppercase sm:text-4xl">{tool.title}</h1>
          <SaveItemButton collection="favourites" id={tool.slug} />
        </div>
        <p className="mt-1 max-w-prose text-muted">
          {tool.valueLine ?? tool.metaDescription}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
          <li className="rounded-full border border-foreground bg-primary-soft px-2.5 py-0.5">
            {hub.title}
          </li>
          <li className="rounded-full border border-foreground bg-good-soft px-2.5 py-0.5">
            {tool.sources.length} cited {tool.sources.length === 1 ? "source" : "sources"}
          </li>
          <li className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-muted">
            Runs in your browser
          </li>
        </ul>
      </div>

      {tool.disclaimerLevel === "clinical-input" ? <ClinicalDisclaimer /> : null}

      <Calculator />

      {tool.monetization.ads ? <AdSlot slotId={`${tool.slug}-below-results`} /> : null}

      {/* The calculator stays full-width; on desktop the recommendation
          card (SPEC §10 affiliate placement) rails beside the editorial. */}
      <RecommendationRail
        surface={tool.monetization.affiliates ? `tool:${tool.slug}` : null}
      >
        <div className="prose">
          <Editorial />
          <h2>Sources</h2>
          <SourcesReceipt sources={tool.sources} />
        </div>

        <FAQ entries={tool.faq} />
      </RecommendationRail>

      <EmailCapture />

      <EmbedCode slug={tool.slug} />

      <AuthorBox lastReviewed={tool.lastReviewed} />

      <RelatedTools tool={tool} />

      <RelatedReference slug={tool.slug} />

      <DisclaimerBanner />
    </article>
  );
}
