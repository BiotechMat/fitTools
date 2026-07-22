import Link from "next/link";
import { AUTHOR } from "@/lib/site";

/**
 * Author + review box (SPEC §8, §11). Credentials must be stated accurately
 * — no inflated claims.
 */
export function AuthorBox({ lastReviewed }: { lastReviewed: string }) {
  const reviewedDate = new Date(`${lastReviewed}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  );
  return (
    <section
      aria-label="Author and review information"
      className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)] text-sm"
    >
      <p>
        <span className="font-semibold">
          Written and reviewed by{" "}
          <Link href={AUTHOR.path} className="text-primary underline underline-offset-2">
            {AUTHOR.name}
          </Link>
        </span>{" "}
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
