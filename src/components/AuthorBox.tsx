import { AUTHOR } from "@/lib/site";

/**
 * Author + review box (SPEC §8, §11). Credentials must be stated accurately
 * — no inflated claims. The link to the author page arrives with M1; until
 * then the name renders as plain text so no link is dead.
 */
export function AuthorBox({ lastReviewed }: { lastReviewed: string }) {
  const reviewedDate = new Date(`${lastReviewed}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  );
  return (
    <section
      aria-label="Author and review information"
      className="rounded-lg border border-border bg-surface p-4 text-sm"
    >
      <p>
        <span className="font-semibold">Written and reviewed by {AUTHOR.name}</span>{" "}
        — {AUTHOR.credentials}.
      </p>
      <p className="mt-1 text-muted">
        Last reviewed:{" "}
        <time dateTime={lastReviewed} data-testid="last-reviewed">
          {reviewedDate}
        </time>
      </p>
    </section>
  );
}
