import type { Metadata } from "next";
import Link from "next/link";
import { glossaryAlphabetical } from "@/registry/glossary";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Fitness & Longevity Glossary — Plain-English Definitions",
  description:
    "A plain-English glossary of the training, nutrition and longevity terms used across the site — hypertrophy, TDEE, VO₂max, ApoB, HRV and more — each linked to the tools that use them.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryHubPage() {
  const entries = glossaryAlphabetical();
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/glossary" },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Glossary</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Fitness &amp; longevity glossary</h1>
      <p className="mt-2 max-w-prose text-muted">
        Plain-English definitions of the training, nutrition and longevity terms
        used across the site. Each entry explains what it means, why it matters,
        and links to the calculators that put it to work.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {entries.map((e) => (
          <li key={e.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
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
    </div>
  );
}
