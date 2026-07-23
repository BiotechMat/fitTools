import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  EXERCISES_LAST_REVIEWED,
  allExercisePaths,
  getExercise,
  getPattern,
  resolveSubstitutions,
  type MovementPattern,
} from "@/registry/exercises";
import { getTool, toolPath } from "@/registry/tools";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
} from "@/lib/schema-org";

interface ExerciseParams {
  params: Promise<{ pattern: string; exercise: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { pattern: string; exercise: string }[] {
  return allExercisePaths().flatMap((p) =>
    p.exercise ? [{ pattern: p.pattern, exercise: p.exercise }] : [],
  );
}

export async function generateMetadata({ params }: ExerciseParams): Promise<Metadata> {
  const { pattern, exercise } = await params;
  const e = getExercise(exercise);
  if (!e || e.pattern !== pattern) return {};
  return {
    title: `How to ${e.name} — Form, Muscles and Mistakes`,
    description: e.short,
    alternates: { canonical: `/exercises/${e.pattern}/${e.slug}` },
    openGraph: {
      title: `How to ${e.name}`,
      description: e.short,
      type: "article",
      url: `/exercises/${e.pattern}/${e.slug}`,
    },
  };
}

function toolLink(slug: string): { href: string; title: string } | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return { href: toolPath(tool), title: tool.title };
}

export default async function ExercisePage({ params }: ExerciseParams) {
  const { pattern, exercise } = await params;
  const e = getExercise(exercise);
  const p = getPattern(pattern as MovementPattern);
  if (!e || !p || e.pattern !== pattern) notFound();

  const substitutions = resolveSubstitutions(e.substitutions);
  const relatedTools = e.relatedTools.flatMap((slug) => {
    const link = toolLink(slug);
    return link ? [link] : [];
  });

  const jsonLd = [
    articleJsonLd({
      title: `How to ${e.name}: form, muscles and mistakes`,
      description: e.short,
      path: `/exercises/${e.pattern}/${e.slug}`,
      lastReviewed: EXERCISES_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    howToJsonLd({
      name: `How to perform the ${e.name}`,
      description: e.whatItIs,
      steps: e.steps,
    }),
    ...(e.faq.length > 0 ? [faqPageJsonLd({ faq: e.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exercises", path: "/exercises" },
      { name: p.title, path: `/exercises/${p.slug}` },
      { name: e.name, path: `/exercises/${e.pattern}/${e.slug}` },
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
          <Link href="/exercises" className="hover:text-foreground">Exercises</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/exercises/${p.slug}`} className="hover:text-foreground">{p.title}</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{e.name}</h1>
        {e.aka && e.aka.length > 0 ? (
          <p className="mt-1 text-sm text-muted">Also known as: {e.aka.join(", ")}</p>
        ) : null}
        <p className="mt-2 max-w-prose text-muted">{e.short}</p>
      </div>

      <div className="prose">
        <h2>What it is</h2>
        <p>{e.whatItIs}</p>

        <h2>Muscles worked</h2>
        <p>
          <strong>Primary:</strong> {e.primaryMuscles.join(", ")}.{" "}
          <strong>Secondary:</strong> {e.secondaryMuscles.join(", ")}.
        </p>

        <h2>How to perform it</h2>
        <ol>
          {e.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        <h2>Common form faults</h2>
        <ul>
          {e.formFaults.map((f, i) => (
            <li key={i}>
              <strong>{f.fault}</strong> {f.fix}
            </li>
          ))}
        </ul>

        <h2>Programming</h2>
        <p>{e.programmingNote}</p>
      </div>

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools">
          <h2 id="related-tools" className="font-display text-xl uppercase">Plan your training</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedTools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="text-primary underline underline-offset-2">{t.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {substitutions.length > 0 ? (
        <section aria-labelledby="substitutions">
          <h2 id="substitutions" className="font-display text-xl uppercase">Variations &amp; substitutions</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {substitutions.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/exercises/${sub.pattern}/${sub.slug}`}
                  className="text-primary underline underline-offset-2"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {e.faq.length > 0 ? <FAQ entries={e.faq} /> : null}

      <AuthorBox lastReviewed={EXERCISES_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
