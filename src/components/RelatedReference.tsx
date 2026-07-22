import Link from "next/link";
import { referencesForTool } from "@/lib/reference-links";

/**
 * "Learn more" reference links on a tool page (CONTENT-reference.md §8) —
 * the reciprocal of the reference pages' calculator links. Renders nothing
 * when a tool has no related reference content.
 */
export function RelatedReference({ slug }: { slug: string }) {
  const groups = referencesForTool(slug);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="related-reference" data-testid="related-reference">
      <h2 id="related-reference" className="text-lg font-bold">
        Learn more
      </h2>
      <div className="mt-2 space-y-2">
        {groups.map((g) => (
          <div key={g.section} className="text-sm">
            <span className="font-medium text-muted">{g.section}: </span>
            <ul className="inline">
              {g.items.map((item, i) => (
                <li key={item.href} className="inline">
                  <Link href={item.href} className="text-primary underline underline-offset-2">
                    {item.title}
                  </Link>
                  {i < g.items.length - 1 ? <span aria-hidden="true">, </span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
