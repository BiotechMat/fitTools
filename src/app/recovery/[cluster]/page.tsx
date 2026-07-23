import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import { getCluster, recoveryClusters } from "@/registry/recovery-content";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import { RecommendationRail } from "@/components/RecommendationRail";
import { SafetyCallout } from "@/components/SafetyCallout";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface ClusterParams {
  params: Promise<{ cluster: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { cluster: string }[] {
  return recoveryClusters.map((c) => ({ cluster: c.slug }));
}

export async function generateMetadata({ params }: ClusterParams): Promise<Metadata> {
  const { cluster } = await params;
  const c = getCluster(cluster);
  if (!c) return {};
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: { canonical: `/recovery/${c.slug}` },
    openGraph: { title: c.title, description: c.metaDescription, type: "article", url: `/recovery/${c.slug}` },
  };
}

export default async function RecoveryClusterPage({ params }: ClusterParams) {
  const { cluster } = await params;
  const c = getCluster(cluster);
  if (!c) notFound();

  const { default: Content } = await import(`@/content/recovery/${c.slug}.mdx`);
  const jsonLd = [
    articleJsonLd({
      title: c.title,
      description: c.metaDescription,
      path: `/recovery/${c.slug}`,
      lastReviewed: c.lastReviewed,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    faqPageJsonLd({ faq: c.faq }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Recovery", path: "/recovery" },
      { name: c.title, path: `/recovery/${c.slug}` },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLd.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
      <RecommendationRail surface={`recovery:${c.slug}`}>
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/recovery" className="hover:text-foreground">Recovery</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{c.title}</h1>
        <p className="mt-2 max-w-prose text-muted">{c.pillarValueLine}</p>
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
          {c.sources.map((s) => (
            <li key={s.url}><a href={s.url} rel="noopener noreferrer">{s.label}</a></li>
          ))}
        </ul>
      </div>

      {c.satellites.length > 0 ? (
        <section aria-labelledby="cluster-articles">
          <h2 id="cluster-articles" className="font-display text-2xl uppercase">In this guide</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {c.satellites.map((a) => (
              <li key={a.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
                <Link href={`/recovery/${c.slug}/${a.slug}`} className="font-semibold text-primary underline underline-offset-2">
                  {a.title}
                </Link>
                {a.kind === "commercial" ? (
                  <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">Buying guide</span>
                ) : null}
                <p className="mt-1 text-sm text-muted">{a.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <FAQ entries={c.faq} />
      </RecommendationRail>
      <AuthorBox lastReviewed={c.lastReviewed} />
      <DisclaimerBanner />
    </article>
  );
}
