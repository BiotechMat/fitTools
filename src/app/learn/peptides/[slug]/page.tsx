import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  CATEGORY_LABELS,
  TIER_LABELS,
  allPeptides,
  getPeptide,
  relatedPeptides,
} from "@/registry/peptides";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EvidenceTier } from "@/components/EvidenceTier";
import { FAQ } from "@/components/FAQ";
import { PeptideSafetyCallout } from "@/components/SafetyCallout";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/schema-org";

interface PeptidePageParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return allPeptides.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PeptidePageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = getPeptide(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `/learn/peptides/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      type: "article",
      url: `/learn/peptides/${page.slug}`,
    },
  };
}

export default async function PeptidePageRoute({ params }: PeptidePageParams) {
  const { slug } = await params;
  const page = getPeptide(slug);
  if (!page) notFound();

  const { default: Content } = await import(
    `@/content/learn/peptides/${page.slug}.mdx`
  );
  const related = relatedPeptides(page);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Peptides", path: "/learn/peptides" },
    { name: page.name, path: `/learn/peptides/${page.slug}` },
  ];
  const jsonLdBlocks = [
    articleJsonLd({
      title: page.title,
      description: page.metaDescription,
      path: `/learn/peptides/${page.slug}`,
      lastReviewed: page.lastReviewed,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    faqPageJsonLd({ faq: page.faq }),
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
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/learn/peptides" className="hover:text-foreground">Peptides</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{page.name}</h1>
        {page.aka && page.aka.length > 0 ? (
          <p className="mt-1 text-sm text-muted">Also known as: {page.aka.join(", ")}</p>
        ) : null}
        <p className="mt-2 max-w-prose text-muted">{page.valueLine}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
            {CATEGORY_LABELS[page.category]}
          </span>
          <span className="text-muted">Evidence for fitness claims:</span>
          <EvidenceTier tier={page.headlineTier} basis={page.headlineBasis} />
        </div>
        {page.approvedUse ? (
          <p className="mt-2 max-w-prose text-sm">
            <span className="font-semibold">Regulatory status: </span>
            {page.approvedUse}
          </p>
        ) : null}
      </div>

      {/* Safety/legality box near the top — mandatory, never omitted. */}
      <PeptideSafetyCallout />

      <div className="prose">
        <Content />
        <h2>Sources</h2>
        <ul>
          {page.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">{source.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <FAQ entries={page.faq} />

      {related.length > 0 ? (
        <section aria-labelledby="related-peptides">
          <h2 id="related-peptides" className="font-display text-2xl uppercase">Related compounds</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
                <Link
                  href={`/learn/peptides/${r.slug}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {r.name}
                </Link>{" "}
                <span className="text-xs text-muted">— {TIER_LABELS[r.headlineTier]}</span>
                <p className="mt-1 text-sm text-muted">{r.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AuthorBox lastReviewed={page.lastReviewed} />
      <DisclaimerBanner />
    </article>
  );
}
