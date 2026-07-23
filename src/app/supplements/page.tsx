import type { Metadata } from "next";
import Link from "next/link";
import { supplementsByGrade } from "@/registry/supplements";
import {
  supplementCatalogue,
  supplementCatalogueCount,
} from "@/registry/supplementCatalogue";
import { GRADE_LABELS } from "@/registry/peptides";
import { CardSearch } from "@/components/CardSearch";
import { EvidenceTier } from "@/components/EvidenceTier";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Supplement Database: What the Evidence Actually Says",
  description:
    "An honest, evidence-tiered supplement reference: what each one is, what's claimed, and what the human research actually shows, sorted by strength of evidence, with citations.",
  alternates: { canonical: "/supplements" },
};

/** Turn a category name into a stable id for aria-labelledby / anchors. */
function categoryId(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SupplementsHubPage() {
  const grouped = supplementsByGrade();
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Supplements", path: "/supplements" },
  ]);

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Supplements</span>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Supplement database</h1>
        <p className="mt-2 max-w-prose text-muted">
          The supplement aisle runs on overclaiming. These pages do the opposite:
          each in-depth review separates what&rsquo;s <em>claimed</em> from what
          the human evidence actually <em>shows</em>, labelled by strength and
          cited &mdash; grouped first by how good that evidence really is. Below
          them, a neutral A&ndash;Z reference covers {supplementCatalogueCount}{" "}
          supplements in all.
        </p>
      </div>

      <CardSearch label="Search supplements" className="space-y-8">
        {grouped.map(([grade, list]) => (
          <section key={grade} aria-labelledby={`grade-${grade}`} data-search-group>
            <div className="flex items-center gap-2">
              <h2 id={`grade-${grade}`} className="font-display text-2xl uppercase">{GRADE_LABELS[grade]}</h2>
              <EvidenceTier tier={list[0].headlineTier} basis={list[0].headlineBasis} />
            </div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <li
                  key={s.slug}
                  data-search-item={s.name}
                  className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/supplements/${s.slug}`}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      {s.name}
                    </Link>
                    <EvidenceTier tier={s.headlineTier} basis={s.headlineBasis} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{s.short}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardSearch>

      <section aria-labelledby="full-reference" className="space-y-8">
        <div>
          <h2 id="full-reference" className="font-display text-2xl uppercase">The full list</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            A neutral reference to {supplementCatalogueCount} widely used
            supplements, grouped by category, with a one-line note on what each is
            typically taken for. This is descriptive, not an endorsement or dosing
            guide &mdash; evidence strength varies enormously, and several entries
            are popular without strong support. Always check interactions and
            regulatory status before use. Entries with a full evidence review link
            through to it.
          </p>
        </div>

        {supplementCatalogue.map((group) => (
          <section key={group.category} aria-labelledby={`cat-${categoryId(group.category)}`}>
            <h3
              id={`cat-${categoryId(group.category)}`}
              className="font-display text-lg uppercase text-muted"
            >
              {group.category}
            </h3>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={`${group.category}-${item.name}`}>
                  <dt className="font-semibold">
                    {item.slug ? (
                      <Link
                        href={`/supplements/${item.slug}`}
                        className="text-primary underline underline-offset-2"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </dt>
                  <dd className="text-sm text-muted">{item.note}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </section>

      <DisclaimerBanner />
    </div>
  );
}
