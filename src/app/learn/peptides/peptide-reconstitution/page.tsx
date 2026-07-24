import type { Metadata } from "next";
import Link from "next/link";
import { toolPath } from "@/registry/tools";
import { peptideConfig } from "@/registry/configs/peptide-reconstitution";
import { calculators } from "@/components/calculators";
import { AuthorBox } from "@/components/AuthorBox";
import { FAQ } from "@/components/FAQ";
import { breadcrumbJsonLd, faqPageJsonLd, webApplicationJsonLd } from "@/lib/schema-org";

/**
 * The peptide reconstitution calculator, relocated from the retired /labs
 * route into the peptides learn section (2026-07-23). Tier-4 rules travel
 * with it: enhanced disclaimer always visible, arithmetic only, no ads.
 */

const tool = peptideConfig;
const path = toolPath(tool);

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: path },
};

export default async function PeptideReconstitutionPage() {
  const Calculator = calculators[tool.slug];

  const { default: Editorial } = await import(`@/content/tools/${tool.slug}.mdx`);
  const jsonLdBlocks = [
    webApplicationJsonLd(tool),
    faqPageJsonLd(tool),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Peptides", path: "/learn/peptides" },
      { name: tool.title, path },
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
          <Link href="/learn/peptides" className="hover:text-foreground">Peptides</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{tool.title}</h1>
        <p className="mt-1 max-w-prose text-muted">{tool.valueLine ?? tool.metaDescription}</p>
      </div>

      {/* Enhanced disclaimer — always visible, above the tool (SPEC §2). */}
      <aside
        role="note"
        aria-label="Enhanced disclaimer"
        data-testid="enhanced-disclaimer"
        className="rounded-lg border border-warning-border bg-warning-bg p-4 text-sm"
      >
        <h2 className="font-semibold">Enhanced disclaimer</h2>
        <p className="mt-1">
          This tool performs arithmetic only, on values you supply, it
          offers no compound information, no dosing recommendations and no
          medical advice. Preparation and use of any injectable substance
          belongs under the direction of a licensed prescriber and
          pharmacist. Nothing here endorses the use of unregulated
          substances.
        </p>
      </aside>

      <Calculator />

      <div className="prose">
        <Editorial />
        <h2>Sources</h2>
        <ul>
          {tool.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">{source.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <FAQ entries={tool.faq} />
      <AuthorBox lastReviewed={tool.lastReviewed} />
    </article>
  );
}
