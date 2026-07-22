import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  getArticle,
  getCluster,
  recoveryClusters,
  resolveRelated,
} from "@/registry/recovery-content";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import { SafetyCallout } from "@/components/SafetyCallout";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface ArticleParams {
  params: Promise<{ cluster: string; article: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { cluster: string; article: string }[] {
  return recoveryClusters.flatMap((c) =>
    c.satellites.map((a) => ({ cluster: c.slug, article: a.slug })),
  );
}

export async function generateMetadata({ params }: ArticleParams): Promise<Metadata> {
  const { cluster, article } = await params;
  const a = getArticle(cluster, article);
  if (!a) return {};
  return {
    title: a.title,
    description: a.metaDescription,
    alternates: { canonical: `/recovery/${cluster}/${article}` },
    openGraph: { title: a.title, description: a.metaDescription, type: "article", url: `/recovery/${cluster}/${article}` },
  };
}

export default async function RecoveryArticlePage({ params }: ArticleParams) {
  const { cluster, article } = await params;
  const c = getCluster(cluster);
  const a = getArticle(cluster, article);
  if (!c || !a) notFound();

  const { default: Content } = await import(`@/content/recovery/${cluster}/${article}.mdx`);
  const related = resolveRelated(c, a.related);
  const jsonLd = [
    articleJsonLd({
      title: a.title,
      description: a.metaDescription,
      path: `/recovery/${cluster}/${article}`,
      lastReviewed: a.lastReviewed,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    ...(a.faq.length > 0 ? [faqPageJsonLd({ faq: a.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Recovery", path: "/recovery" },
      { name: c.title, path: `/recovery/${c.slug}` },
      { name: a.title, path: `/recovery/${cluster}/${article}` },
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
          <Link href="/recovery" className="hover:text-foreground">Recovery</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/recovery/${c.slug}`} className="hover:text-foreground">{c.title}</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{a.title}</h1>
        <p className="mt-2 max-w-prose text-muted">{a.valueLine}</p>
      </div>

      {a.kind === "commercial" ? (
        <p
          data-testid="affiliate-disclosure"
          className="rounded-lg border border-border bg-surface p-3 text-xs text-muted"
        >
          Disclosure: this is a buying guide. Where we link to products we may
          earn a commission at no extra cost to you. It never changes our
          evidence assessments — the neutral evidence lives on the{" "}
          <Link href={`/recovery/${c.slug}`} className="text-primary underline underline-offset-2">
            main guide
          </Link>.
        </p>
      ) : null}

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

      <AuthorBox lastReviewed={a.lastReviewed} />
      <DisclaimerBanner />
    </article>
  );
}
