import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  getGlowUpArticle,
  getGlowUpCluster,
  glowUpClusters,
  resolveGlowUpRelated,
  resolveGlowUpTools,
} from "@/registry/glowup-content";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import { SafetyCallout } from "@/components/SafetyCallout";
import { BodyImageResources } from "@/components/BodyImageResources";
import { VerdictStamp } from "@/components/VerdictStamp";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface ArticleParams {
  params: Promise<{ cluster: string; article: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { cluster: string; article: string }[] {
  return glowUpClusters.flatMap((c) =>
    c.satellites.map((a) => ({ cluster: c.slug, article: a.slug })),
  );
}

export async function generateMetadata({ params }: ArticleParams): Promise<Metadata> {
  const { cluster, article } = await params;
  const a = getGlowUpArticle(cluster, article);
  if (!a) return {};
  return {
    title: a.title,
    description: a.metaDescription,
    alternates: { canonical: `/glow-up/${cluster}/${article}` },
    openGraph: { title: a.title, description: a.metaDescription, type: "article", url: `/glow-up/${cluster}/${article}` },
  };
}

export default async function GlowUpArticlePage({ params }: ArticleParams) {
  const { cluster, article } = await params;
  const c = getGlowUpCluster(cluster);
  const a = getGlowUpArticle(cluster, article);
  if (!c || !a) notFound();

  const { default: Content } = await import(`@/content/glow-up/${cluster}/${article}.mdx`);
  const related = resolveGlowUpRelated(c, a.related);
  const tools = resolveGlowUpTools(a.relatedTools);
  const seeAlso = a.seeAlso ?? [];
  const jsonLd = [
    articleJsonLd({
      title: a.title,
      description: a.metaDescription,
      path: `/glow-up/${cluster}/${article}`,
      lastReviewed: a.lastReviewed,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    ...(a.faq.length > 0 ? [faqPageJsonLd({ faq: a.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Glow-up", path: "/glow-up" },
      { name: c.title, path: `/glow-up/${c.slug}` },
      { name: a.title, path: `/glow-up/${cluster}/${article}` },
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
          <Link href="/glow-up" className="hover:text-foreground">Glow-up</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/glow-up/${c.slug}`} className="hover:text-foreground">{c.title}</Link>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl uppercase sm:text-4xl">{a.title}</h1>
          {a.kind === "debunk" ? <VerdictStamp tier="not-supported" /> : null}
        </div>
        <p className="mt-2 max-w-prose text-muted">{a.valueLine}</p>
      </div>

      <SafetyCallout title={c.safety.title}>
        <ul className="list-disc space-y-1 pl-5">
          {c.safety.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </SafetyCallout>

      <div className="prose">
        <Content />
        <h2>Sources</h2>
        <ul>
          {a.sources.map((s) => (
            <li key={s.url}><a href={s.url} rel="noopener noreferrer">{s.label}</a></li>
          ))}
        </ul>
      </div>

      {a.faq.length > 0 ? <FAQ entries={a.faq} /> : null}

      {tools.length > 0 || seeAlso.length > 0 ? (
        <section aria-labelledby="glowup-crosslinks" data-testid="glowup-crosslinks">
          <h2 id="glowup-crosslinks" className="font-display text-xl uppercase">Put it into practice</h2>
          <ul className="mt-2 flex flex-wrap gap-4 text-sm">
            {[...tools, ...seeAlso].map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="text-primary underline underline-offset-2">{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related-articles">
          <h2 id="related-articles" className="font-display text-2xl uppercase">Related</h2>
          <ul className="mt-3 flex flex-wrap gap-4 text-sm">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="text-primary underline underline-offset-2">{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {a.kind === "debunk" ? <BodyImageResources /> : null}
      <AuthorBox lastReviewed={a.lastReviewed} />
      <DisclaimerBanner />
    </article>
  );
}
