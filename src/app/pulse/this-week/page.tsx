import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { EvidenceTier } from "@/components/EvidenceTier";
import { freshChunksByRecency } from "@/registry/pulse";
import { PULSE_CATEGORY_LABELS } from "@/lib/pulse/types";
import type { GroundingChunk, PulseStudy } from "@/lib/pulse/types";

/**
 * "This Week in the Science" (PULSE.md §15.7 F3) — the durable, crawlable Pulse
 * surface. Unlike the endless feed (whose generated phrasings are ephemeral,
 * §8), this page renders the STABLE vetted `claim` of each fresh chunk, so it is
 * a real per-item artefact search engines can index, and doubles as the E5
 * newsletter unit. Server-rendered, static per build.
 */

export const metadata: Metadata = {
  title: "This Week in the Science — Recent Fitness & Longevity Research | Pulse",
  description:
    "The latest fitness, nutrition, recovery and longevity studies, each with a plain-English reality check on what the evidence actually shows — and a link to the source.",
  alternates: { canonical: "/pulse/this-week" },
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function studyLabel(study?: PulseStudy): string | null {
  if (!study) return null;
  const parts: string[] = [];
  if (study.design) parts.push(study.design);
  if (typeof study.n === "number") parts.push(`n=${study.n}`);
  if (study.population) parts.push(study.population);
  if (study.journal) parts.push(study.journal);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function collectionJsonLd(fresh: GroundingChunk[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "This Week in the Science",
    url: `${SITE_URL}/pulse/this-week`,
    description: metadata.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: fresh.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: c.claim,
          citation: c.source.label,
          url: c.source.url,
          ...(c.study?.doi ? { sameAs: `https://doi.org/${c.study.doi}` } : {}),
        },
      })),
    },
  };
}

export default function PulseThisWeekPage() {
  const fresh = freshChunksByRecency();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Pulse", path: "/pulse" },
    { name: "This week", path: "/pulse/this-week" },
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {fresh.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd(fresh)) }}
        />
      ) : null}

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href="/pulse" className="hover:text-foreground">
          Pulse
        </Link>
        <span aria-hidden="true"> / </span>
        <span>This week</span>
      </nav>

      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">This week in the science</h1>
      <p className="mt-2 max-w-prose text-muted">
        The newest research we&rsquo;ve added to Pulse — each with a plain-English
        reality check on what the study actually shows, and a link to the source.
        We lead with the finding <em>and</em> its limits, so a single new trial is
        never dressed up as settled science.
      </p>

      {fresh.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-surface p-6 text-center text-muted">
          No new discoveries just yet — check back soon, or browse the{" "}
          <Link href="/pulse" className="text-primary underline underline-offset-2">
            full Pulse feed
          </Link>
          .
        </p>
      ) : (
        <ol className="mt-8 flex flex-col gap-5">
          {fresh.map((c) => (
            <li key={c.id}>
              <article className="flex flex-col gap-3 rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    {PULSE_CATEGORY_LABELS[c.category]}
                  </span>
                  <EvidenceTier tier={c.tier} basis={c.basis} />
                  {c.addedAt ? (
                    <span className="ml-auto font-mono text-xs text-muted">Added {formatDate(c.addedAt)}</span>
                  ) : null}
                </div>

                <p className="text-lg font-medium">{c.claim}</p>

                {c.caveat ? (
                  <p className="flex gap-2 rounded-md border border-border bg-surface-deep px-3 py-2 text-sm text-muted">
                    <span aria-hidden="true">⚠</span>
                    <span>
                      <span className="font-semibold text-foreground">What it shows: </span>
                      {c.caveat}
                      {studyLabel(c.study) ? (
                        <span className="mt-0.5 block font-mono text-xs text-muted">{studyLabel(c.study)}</span>
                      ) : null}
                    </span>
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  {c.relatedTool ? (
                    <Link href={c.relatedTool} className="text-primary underline underline-offset-2">
                      Try the calculator →
                    </Link>
                  ) : null}
                  {c.relatedContent ? (
                    <Link href={c.relatedContent} className="text-primary underline underline-offset-2">
                      Read more →
                    </Link>
                  ) : null}
                  <a
                    href={c.source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="ml-auto max-w-[70%] truncate text-right font-mono text-xs text-muted underline underline-offset-2 hover:text-foreground"
                    title={c.source.label}
                  >
                    {c.source.label}
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 text-sm text-muted">
        Want the bottomless version?{" "}
        <Link href="/pulse" className="text-primary underline underline-offset-2">
          Open the full Pulse feed →
        </Link>
      </p>
    </div>
  );
}
