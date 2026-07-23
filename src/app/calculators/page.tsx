import type { Metadata } from "next";
import Link from "next/link";
import { hubMeta } from "@/registry/hubs";
import { tier4Tools, toolsForHub } from "@/registry/tools";
import { ToolCardGrid } from "@/components/HubPage";
import { breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Calculators — every tool, by category",
  description:
    "Every FitTools calculator in one place, grouped by category — nutrition, workout and recovery — each built on published, peer-reviewed formulas with the sources cited.",
  alternates: { canonical: "/calculators" },
};

/**
 * The all-calculators index (2026-07-23 restructure): one page per the
 * "Calculators" nav menu, grouped by category with stable anchor ids the
 * nav submenu deep-links to. Topic sections (/nutrition, /workout,
 * /recovery) carry the same tools alongside their wider content.
 */
export default function CalculatorsIndexPage() {
  const groups = Object.values(hubMeta)
    .map((meta) => ({ meta, tools: toolsForHub(meta.hub) }))
    .filter(({ tools }) => tools.length > 0);
  const peptideTools = tier4Tools();
  const toolCount =
    groups.reduce((sum, { tools }) => sum + tools.length, 0) + peptideTools.length;
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators" },
  ]);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <h1 className="font-display text-3xl uppercase sm:text-4xl">Calculators</h1>
        <p className="mt-1 max-w-prose text-muted">
          All {toolCount} calculators, grouped by category. Every one is built
          on a published, peer-reviewed formula, with the sources cited on the
          page.
        </p>
      </div>

      {groups.map(({ meta, tools }) => (
        <section
          key={meta.hub}
          id={meta.path.slice(1)}
          aria-labelledby={`calculators-${meta.hub}`}
          className="scroll-mt-6"
        >
          <h2 id={`calculators-${meta.hub}`} className="font-display text-2xl uppercase">
            <Link href={meta.path} className="hover:text-primary">
              {meta.title}
            </Link>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{meta.description}</p>
          <ToolCardGrid tools={tools} />
        </section>
      ))}

      <section id="peptides" aria-labelledby="calculators-peptides" className="scroll-mt-6">
        <h2 id="calculators-peptides" className="font-display text-2xl uppercase">
          <Link href="/learn/peptides" className="hover:text-primary">
            Peptides
          </Link>
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Part of the evidence-tiered peptides reference — arithmetic only on
          values you supply, with an enhanced disclaimer and no advertising.
        </p>
        <ToolCardGrid tools={peptideTools} />
      </section>
    </div>
  );
}
