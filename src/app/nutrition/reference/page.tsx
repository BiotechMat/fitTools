import type { Metadata } from "next";
import Link from "next/link";
import { foodReferencePages } from "@/registry/food-reference";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Nutrition & Food Reference — Protein, Calories and Portions",
  description:
    "Bookmarkable food-reference tables: protein content of common foods, high-protein sources by diet, a calorie reference and typical portion sizes — linked to the macro and TDEE calculators.",
  alternates: { canonical: "/nutrition/reference" },
};

export default function NutritionReferenceHubPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Nutrition", path: "/nutrition" },
    { name: "Food reference", path: "/nutrition/reference" },
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/nutrition" className="hover:text-foreground">Nutrition</Link>
        <span aria-hidden="true"> / </span>
        <span>Food reference</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Nutrition &amp; food reference</h1>
      <p className="mt-2 max-w-prose text-muted">
        Quick, bookmarkable tables for everyday nutrition — protein, calories and
        portions. When you need your personal numbers, each page links to the
        calculator that works them out.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {foodReferencePages.map((p) => (
          <li key={p.slug} className="rounded-lg border border-border p-4">
            <Link
              href={`/nutrition/reference/${p.slug}`}
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
