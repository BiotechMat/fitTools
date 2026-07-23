import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  CATEGORY_LABELS,
  peptidesByCategory,
} from "@/registry/peptides";
import { toolPath } from "@/registry/tools";
import { peptideConfig } from "@/registry/configs/peptide-reconstitution";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EvidenceTier } from "@/components/EvidenceTier";
import { PeptideSafetyCallout } from "@/components/SafetyCallout";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Peptides in Fitness — What They Are, and What the Evidence Says",
  description:
    "A non-promotional, evidence-tiered reference on the peptides discussed in fitness: what each compound is, what's claimed, what the research actually shows, and the legality and safety reality. No dosing or protocols.",
  alternates: { canonical: "/learn/peptides" },
};

const LAST_REVIEWED = "2026-07-22";

export default function PeptidesPillarPage() {
  const grouped = peptidesByCategory();
  const jsonLdBlocks = [
    articleJsonLd({
      title: "Peptides in fitness: what they are, and what the evidence actually says",
      description: metadata.description as string,
      path: "/learn/peptides",
      lastReviewed: LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Peptides", path: "/learn/peptides" },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Peptides</span>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
          Peptides in fitness: what they are, and what the evidence actually says
        </h1>
        <p className="mt-2 max-w-prose text-muted">
          A plain, non-promotional reference. We explain what each compound
          <em> is</em>, separate what&rsquo;s <em>claimed</em> from what&rsquo;s
          actually <em>shown</em>, and are honest about how thin the human data
          usually is.
        </p>
      </div>

      <PeptideSafetyCallout />

      <div className="prose">
        <h2>What are peptides?</h2>
        <p>
          Peptides are short chains of amino acids — the same building blocks as
          proteins, just fewer of them. Your body makes and uses thousands of
          them as signalling molecules. The compounds people ask about in
          fitness are synthetic versions designed to mimic or trigger some of
          that signalling: to nudge growth-hormone release, to influence tissue
          repair, or to act on appetite or pigmentation pathways.
        </p>
        <p>
          A few terms get used loosely. A <strong>peptide hormone</strong> is a
          signalling peptide like insulin or growth hormone. A{" "}
          <strong>secretagogue</strong> is something that makes your body release
          more of its own hormone. And some compounds sold alongside peptides —
          MK-677 is the common example — are not peptides at all, a distinction
          we flag on the individual pages.
        </p>

        <h2>The &ldquo;research chemical&rdquo; and legality problem</h2>
        <p>
          This is the part the marketing skips. Most of these compounds are{" "}
          <strong>not approved medicines</strong> for the uses people want them
          for. They are typically sold as &ldquo;research chemicals&rdquo; —
          made outside pharmaceutical quality control, where the purity, the
          actual dose in the vial, and the absence of contamination{" "}
          <em>cannot be assumed</em>. Several are prohibited in sport under the
          WADA code. Buying and injecting an unlicensed substance of unknown
          composition is a genuinely different proposition from taking an
          approved medicine.
        </p>

        <h2>Claimed vs shown — how we grade the evidence</h2>
        <p>
          We grade the evidence behind a compound&rsquo;s fitness claims like
          medals — the stronger the evidence, the higher the medal — and flag
          whether it comes from humans, animals, or the lab bench. Claims that
          are merely oversold earn no medal at all:
        </p>
        <ul>
          <li>
            <EvidenceTier tier="well-supported" basis="human" /> — strong,
            replicated human trials (usually because the compound went through
            drug development).
          </li>
          <li>
            <EvidenceTier tier="preliminary" basis="human" /> — real but limited
            human evidence; promising is not the same as proven.
          </li>
          <li>
            <EvidenceTier tier="preliminary" basis="animal" /> — early or
            animal-only evidence: a lead worth noting, not a result to rely on.
          </li>
          <li>
            <EvidenceTier tier="marketing-claim" /> — heavily promoted, but the
            human evidence is weak, absent, or actively didn&rsquo;t pan out.
            No medal.
          </li>
        </ul>
        <p>
          A useful thing happens when you line them up: the compounds with the
          strongest evidence (tesamorelin, the GLP-1 medicines, bremelanotide)
          are precisely the ones that were developed and approved as{" "}
          <em>medicines for specific conditions</em> — not as fitness aids. They
          show what real evidence looks like, and how far most &ldquo;research
          peptides&rdquo; fall short of it.
        </p>

        <h2>What this section will not do</h2>
        <p>
          We do not give doses, protocols, routes, cycles, stacks, or sourcing
          information for any of these compounds — deliberately. This is a
          reference for understanding what they are and what the evidence says,
          not a how-to. If you are considering any of them, that is a
          conversation for a qualified clinician who knows your history.
        </p>
      </div>

      <section aria-labelledby="peptide-tools">
        <h2 id="peptide-tools" className="font-display text-2xl uppercase">
          Calculator
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
            <Link
              href={toolPath(peptideConfig)}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {peptideConfig.title}
            </Link>
            <p className="mt-1 text-sm text-muted">
              Arithmetic only, on values you supply — concentration, draw
              volume and U-100 syringe units. Enhanced disclaimer; no dosing
              guidance, ever.
            </p>
          </li>
        </ul>
      </section>

      {grouped.map(([category, pages]) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="font-display text-2xl uppercase">
            {CATEGORY_LABELS[category]}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <li key={p.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/learn/peptides/${p.slug}`}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    {p.name}
                  </Link>
                  <EvidenceTier tier={p.headlineTier} basis={p.headlineBasis} />
                </div>
                <p className="mt-1 text-sm text-muted">{p.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <AuthorBox lastReviewed={LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
