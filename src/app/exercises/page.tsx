import type { Metadata } from "next";
import Link from "next/link";
import { exercisePatterns, exercisesForPattern } from "@/registry/exercises";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Exercise Library — How to Perform the Big Lifts",
  description:
    "A reference library of the main barbell and bodyweight exercises: how to perform each, the muscles worked, common form faults and fixes, variations, and where they fit in your programming.",
  alternates: { canonical: "/exercises" },
};

export default function ExercisesHubPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Exercises", path: "/exercises" },
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
          <span>Exercises</span>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Exercise library</h1>
        <p className="mt-2 max-w-prose text-muted">
          Clear, no-nonsense guides to the lifts that matter — how to do each
          one, the muscles it works, the form faults to avoid, and how to fit it
          into a programme. Grouped by movement pattern.
        </p>
      </div>

      {exercisePatterns.map((p) => (
        <section key={p.slug} aria-labelledby={`pattern-${p.slug}`}>
          <h2 id={`pattern-${p.slug}`} className="font-display text-2xl uppercase">
            <Link href={`/exercises/${p.slug}`} className="text-primary underline underline-offset-2">
              {p.title}
            </Link>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{p.description}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {exercisesForPattern(p.slug).map((e) => (
              <li key={e.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
                <Link
                  href={`/exercises/${p.slug}/${e.slug}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {e.name}
                </Link>
                <p className="mt-1 text-sm text-muted">{e.short}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
