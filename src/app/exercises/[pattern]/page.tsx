import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  exercisePatterns,
  exercisesForPattern,
  getPattern,
  type MovementPattern,
} from "@/registry/exercises";
import { breadcrumbJsonLd } from "@/lib/schema-org";

interface PatternParams {
  params: Promise<{ pattern: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { pattern: string }[] {
  return exercisePatterns.map((p) => ({ pattern: p.slug }));
}

export async function generateMetadata({ params }: PatternParams): Promise<Metadata> {
  const { pattern } = await params;
  const p = getPattern(pattern as MovementPattern);
  if (!p) return {};
  return {
    title: `${p.title} — Exercise Guides`,
    description: p.description,
    alternates: { canonical: `/exercises/${p.slug}` },
  };
}

export default async function PatternHubPage({ params }: PatternParams) {
  const { pattern } = await params;
  const p = getPattern(pattern as MovementPattern);
  if (!p) notFound();
  const list = exercisesForPattern(p.slug);

  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Exercises", path: "/exercises" },
    { name: p.title, path: `/exercises/${p.slug}` },
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/exercises" className="hover:text-foreground">Exercises</Link>
      </nav>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{p.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{p.description}</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {list.map((e) => (
          <li key={e.slug} className="rounded-lg border border-border p-4">
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

      <nav aria-label="Other movement patterns" className="mt-10">
        <h2 className="text-lg font-bold">Other patterns</h2>
        <ul className="mt-2 flex flex-wrap gap-4 text-sm">
          {exercisePatterns
            .filter((other) => other.slug !== p.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link href={`/exercises/${other.slug}`} className="text-primary underline underline-offset-2">
                  {other.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}
