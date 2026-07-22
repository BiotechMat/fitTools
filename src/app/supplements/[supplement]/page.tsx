import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  SUPPLEMENTS_LAST_REVIEWED,
  getSupplement,
  resolveRelatedSupplements,
  supplements,
} from "@/registry/supplements";
import { getTool } from "@/registry/tools";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EvidenceTier } from "@/components/EvidenceTier";
import { FAQ } from "@/components/FAQ";
import { SafetyCallout } from "@/components/SafetyCallout";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface SupplementParams {
  params: Promise<{ supplement: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { supplement: string }[] {
  return supplements.map((s) => ({ supplement: s.slug }));
}

export async function generateMetadata({ params }: SupplementParams): Promise<Metadata> {
  const { supplement } = await params;
  const s = getSupplement(supplement);
  if (!s) return {};
  return {
    title: `${s.name} — Benefits, Evidence and Safety`,
    description: s.metaDescription,
    alternates: { canonical: `/supplements/${s.slug}` },
    openGraph: {
      title: `${s.name} — what the evidence says`,
      description: s.metaDescription,
      type: "article",
      url: `/supplements/${s.slug}`,
    },
  };
}

function toolLink(slug: string): { href: string; title: string } | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return { href: tool.tier === 4 ? `/labs/${tool.slug}` : `/${tool.slug}`, title: tool.title };
}

export default async function SupplementPage({ params }: SupplementParams) {
  const { supplement } = await params;
  const s = getSupplement(supplement);
  if (!s) notFound();

  const { default: Content } = await import(`@/content/supplements/${s.slug}.mdx`);
  const relatedSupplements = resolveRelatedSupplements(s.relatedSupplements);
  const relatedTools = s.relatedTools.flatMap((slug) => {
    const link = toolLink(slug);
    return link ? [link] : [];
  });

  const jsonLd = [
    articleJsonLd({
      title: `${s.name}: benefits, evidence and safety`,
      description: s.metaDescription,
      path: `/supplements/${s.slug}`,
      lastReviewed: SUPPLEMENTS_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    ...(s.faq.length > 0 ? [faqPageJsonLd({ faq: s.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Supplements", path: "/supplements" },
      { name: s.name, path: `/supplements/${s.slug}` },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLd.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/supplements" className="hover:text-foreground">Supplements</Link>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{s.name}</h1>
          <EvidenceTier tier={s.headlineTier} basis={s.headlineBasis} />
        </div>
        {s.aka && s.aka.length > 0 ? (
          <p className="mt-1 text-sm text-muted">Also known as: {s.aka.join(", ")}</p>
        ) : null}
        <p className="mt-2 max-w-prose text-muted">{s.short}</p>
      </div>

      {s.safety ? (
        <SafetyCallout title={s.safety.title}>
          <ul className="list-disc space-y-1 pl-5">
            {s.safety.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </SafetyCallout>
      ) : null}

      <div className="prose">
        <Content />
        <h2>Sources</h2>
        <ul>
          {s.sources.map((src) => (
            <li key={src.url}><a href={src.url} rel="noopener noreferrer">{src.label}</a></li>
          ))}
        </ul>
      </div>

      {s.faq.length > 0 ? <FAQ entries={s.faq} /> : null}

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools">
          <h2 id="related-tools" className="text-lg font-bold">Related calculators</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedTools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="text-primary underline underline-offset-2">{t.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedSupplements.length > 0 ? (
        <section aria-labelledby="related-supplements">
          <h2 id="related-supplements" className="text-lg font-bold">Related supplements</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedSupplements.map((r) => (
              <li key={r.slug}>
                <Link href={`/supplements/${r.slug}`} className="text-primary underline underline-offset-2">
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AuthorBox lastReviewed={SUPPLEMENTS_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
