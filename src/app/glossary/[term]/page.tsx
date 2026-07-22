import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  GLOSSARY_LAST_REVIEWED,
  getGlossaryEntry,
  glossaryEntries,
  resolveRelatedTerms,
} from "@/registry/glossary";
import { getTool } from "@/registry/tools";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

interface TermParams {
  params: Promise<{ term: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { term: string }[] {
  return glossaryEntries.map((e) => ({ term: e.slug }));
}

export async function generateMetadata({ params }: TermParams): Promise<Metadata> {
  const { term } = await params;
  const entry = getGlossaryEntry(term);
  if (!entry) return {};
  const title = `${entry.term} — Definition`;
  return {
    title,
    description: entry.short,
    alternates: { canonical: `/glossary/${entry.slug}` },
    openGraph: { title, description: entry.short, type: "article", url: `/glossary/${entry.slug}` },
  };
}

/** Resolve a tool slug to its href + title, skipping any that no longer exist. */
function toolLink(slug: string): { href: string; title: string } | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return { href: tool.tier === 4 ? `/labs/${tool.slug}` : `/${tool.slug}`, title: tool.title };
}

export default async function GlossaryTermPage({ params }: TermParams) {
  const { term } = await params;
  const entry = getGlossaryEntry(term);
  if (!entry) notFound();

  const relatedTerms = resolveRelatedTerms(entry.relatedTerms);
  const relatedTools = entry.relatedTools.flatMap((slug) => {
    const link = toolLink(slug);
    return link ? [link] : [];
  });

  const jsonLd = [
    articleJsonLd({
      title: `${entry.term}: definition and how it's used`,
      description: entry.short,
      path: `/glossary/${entry.slug}`,
      lastReviewed: GLOSSARY_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Glossary", path: "/glossary" },
      { name: entry.term, path: `/glossary/${entry.slug}` },
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
          <Link href="/glossary" className="hover:text-foreground">Glossary</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
          {entry.term}
          {entry.aka && entry.aka.length > 0 ? (
            <span className="ml-2 align-middle text-lg font-normal text-muted">
              {entry.aka.join(" · ")}
            </span>
          ) : null}
        </h1>
        <p className="mt-2 max-w-prose text-muted">{entry.short}</p>
      </div>

      <div className="prose">
        {entry.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {entry.sources && entry.sources.length > 0 ? (
          <>
            <h2>Sources</h2>
            <ul>
              {entry.sources.map((s) => (
                <li key={s.url}><a href={s.url} rel="noopener noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools">
          <h2 id="related-tools" className="font-display text-xl uppercase">Put it to use</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedTools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="text-primary underline underline-offset-2">{t.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedTerms.length > 0 ? (
        <section aria-labelledby="related-terms">
          <h2 id="related-terms" className="font-display text-xl uppercase">Related terms</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedTerms.map((r) => (
              <li key={r.slug}>
                <Link href={`/glossary/${r.slug}`} className="text-primary underline underline-offset-2">
                  {r.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AuthorBox lastReviewed={GLOSSARY_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
