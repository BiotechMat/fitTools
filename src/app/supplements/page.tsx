import type { Metadata } from "next";
import Link from "next/link";
import { supplementsByTier } from "@/registry/supplements";
import { TIER_LABELS } from "@/registry/peptides";
import { EvidenceTier } from "@/components/EvidenceTier";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Supplement Database — What the Evidence Actually Says",
  description:
    "An honest, evidence-tiered supplement reference: what each one is, what's claimed, and what the human research actually shows — sorted by strength of evidence, with citations.",
  alternates: { canonical: "/supplements" },
};

export default function SupplementsHubPage() {
  const grouped = supplementsByTier();
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Supplements", path: "/supplements" },
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
          <span>Supplements</span>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Supplement database</h1>
        <p className="mt-2 max-w-prose text-muted">
          The supplement aisle runs on overclaiming. These pages do the opposite:
          each one separates what&rsquo;s <em>claimed</em> from what the human
          evidence actually <em>shows</em>, labelled by strength and cited.
          They&rsquo;re grouped below by how good that evidence really is.
        </p>
      </div>

      {grouped.map(([tier, list]) => (
        <section key={tier} aria-labelledby={`tier-${tier}`}>
          <div className="flex items-center gap-2">
            <h2 id={`tier-${tier}`} className="font-display text-2xl uppercase">{TIER_LABELS[tier]}</h2>
            <EvidenceTier tier={tier} />
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.map((s) => (
              <li key={s.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/supplements/${s.slug}`}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    {s.name}
                  </Link>
                  <EvidenceTier tier={s.headlineTier} basis={s.headlineBasis} />
                </div>
                <p className="mt-1 text-sm text-muted">{s.short}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <DisclaimerBanner />
    </div>
  );
}
