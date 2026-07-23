import type { Metadata } from "next";
import Link from "next/link";
import { glossaryAlphabetical } from "@/registry/glossary";
import { CardSearch } from "@/components/CardSearch";
import {
  glossaryCatalogue,
  glossaryCatalogueCount,
} from "@/registry/glossaryCatalogue";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Fitness & Longevity Glossary: Plain-English Definitions",
  description:
    "A plain-English glossary of the training, nutrition and longevity terms used across the site (hypertrophy, TDEE, VO₂max, ApoB, HRV and more) each linked to the tools that use them.",
  alternates: { canonical: "/glossary" },
};

/** Turn a category name into a stable id for aria-labelledby / anchors. */
function categoryId(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function GlossaryHubPage() {
  const entries = glossaryAlphabetical();
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/glossary" },
  ]);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Glossary</span>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Fitness &amp; longevity glossary</h1>
        <p className="mt-2 max-w-prose text-muted">
          Plain-English definitions of the training, nutrition and longevity terms
          used across the site. The in-depth entries below explain what each means,
          why it matters, and link to the calculators that put it to work; the full
          A&ndash;Z reference covers {glossaryCatalogueCount} terms in all.
        </p>
      </div>

      <section aria-labelledby="in-depth">
        <h2 id="in-depth" className="font-display text-2xl uppercase">In depth</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Full explainers, each cross-linked to the relevant tools and related terms.
        </p>
        <CardSearch label="Search the glossary" className="mt-4">
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {entries.map((e) => (
              <li
                key={e.slug}
                data-search-item={e.aka && e.aka.length > 0 ? `${e.term} ${e.aka.join(" ")}` : e.term}
                className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
              >
                <Link
                  href={`/glossary/${e.slug}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {e.term}
                  {e.aka && e.aka.length > 0 ? (
                    <span className="font-normal text-muted"> ({e.aka.join(", ")})</span>
                  ) : null}
                </Link>
                <p className="mt-1 text-sm text-muted">{e.short}</p>
              </li>
            ))}
          </ul>
        </CardSearch>
      </section>

      <section aria-labelledby="full-reference" className="space-y-8">
        <div>
          <h2 id="full-reference" className="font-display text-2xl uppercase">The full glossary</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            Every term across training, nutrition, physiology, biochemistry,
            hormones and health markers, grouped by theme. Terms with a full
            explainer link through to it.
          </p>
        </div>

        {glossaryCatalogue.map((group) => (
          <section key={group.category} aria-labelledby={`cat-${categoryId(group.category)}`}>
            <h3
              id={`cat-${categoryId(group.category)}`}
              className="font-display text-lg uppercase text-muted"
            >
              {group.category}
            </h3>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={`${group.category}-${item.term}`}>
                  <dt className="font-semibold">
                    {item.slug ? (
                      <Link
                        href={`/glossary/${item.slug}`}
                        className="text-primary underline underline-offset-2"
                      >
                        {item.term}
                      </Link>
                    ) : (
                      item.term
                    )}
                  </dt>
                  <dd className="text-sm text-muted">{item.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </section>
    </div>
  );
}
