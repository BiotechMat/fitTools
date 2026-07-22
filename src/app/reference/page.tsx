import type { Metadata } from "next";
import Link from "next/link";
import { referenceTablePages } from "@/registry/reference-tables";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Reference Tables & Charts — Heart Rate, Protein, Plate Loading",
  description:
    "Bookmarkable reference charts generated from the same formulas as our calculators: heart-rate zones by age, daily protein targets by bodyweight, and a barbell plate-loading chart.",
  alternates: { canonical: "/reference" },
};

export default function ReferenceHubPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Reference tables", path: "/reference" },
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Reference tables</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Reference tables &amp; charts</h1>
      <p className="mt-2 max-w-prose text-muted">
        Static charts to look up and bookmark — each generated from the same
        formula as its calculator, so the numbers always match. When you want
        your personal figure, follow the link to the interactive tool.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {referenceTablePages.map((p) => (
          <li key={p.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
            <Link
              href={`/reference/${p.slug}`}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-muted">{p.short}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
