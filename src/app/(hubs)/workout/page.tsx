import type { Metadata } from "next";
import Link from "next/link";
import { hubMeta } from "@/registry/hubs";
import { HubPage } from "@/components/HubPage";
import { exercisePatterns } from "@/registry/exercises";

const meta = hubMeta.strength;

export const metadata: Metadata = {
  title: `${meta.title} — calculators & exercise library`,
  description: meta.description,
  alternates: { canonical: meta.path },
};

export default function WorkoutHubPage() {
  return (
    <HubPage hub="strength">
      <section aria-labelledby="exercise-library">
        <h2 id="exercise-library" className="font-display text-xl uppercase">
          Exercise library
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          How to perform the lifts the calculators plan for — muscles worked,
          form faults and fixes, substitutions and programming notes, grouped
          by movement pattern.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {exercisePatterns.map((p) => (
            <li
              key={p.slug}
              className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
            >
              <Link
                href={`/exercises/${p.slug}`}
                className="font-semibold text-primary underline underline-offset-2"
              >
                {p.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{p.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link
            href="/exercises"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Browse the full exercise library →
          </Link>
        </p>
      </section>
    </HubPage>
  );
}
