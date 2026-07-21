import type { FaqEntry } from "@/registry/types";

/**
 * FAQ section rendered from the tool config (SPEC §8). The same entries
 * feed the FAQPage JSON-LD, so on-page copy and structured data always
 * match. Plain headings + paragraphs for featured-snippet extraction.
 */
export function FAQ({ entries }: { entries: FaqEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-5">
        {entries.map((entry) => (
          <div key={entry.q}>
            <dt className="font-semibold">{entry.q}</dt>
            <dd className="mt-1 max-w-prose text-muted">{entry.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
