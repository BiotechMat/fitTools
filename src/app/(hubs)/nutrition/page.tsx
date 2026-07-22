import type { Metadata } from "next";
import Link from "next/link";
import { hubMeta } from "@/registry/hubs";
import { HubPage } from "@/components/HubPage";
import { foodReferencePages } from "@/registry/food-reference";

const meta = hubMeta.nutrition;

export const metadata: Metadata = {
  title: `${meta.title} calculators`,
  description: meta.description,
  alternates: { canonical: meta.path },
};

export default function NutritionHubPage() {
  return (
    <div className="space-y-12">
      <HubPage hub="nutrition" />
      <section aria-labelledby="food-reference">
        <h2 id="food-reference" className="font-display text-xl uppercase">
          Food reference
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Quick, bookmarkable tables — protein content, calories and portion
          sizes for common foods — to pair with the calculators above.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {foodReferencePages.map((p) => (
            <li
              key={p.slug}
              className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
            >
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
      </section>
    </div>
  );
}
