import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  REFERENCE_TABLES_LAST_REVIEWED,
  type ReferenceTablePage,
  getReferenceTablePage,
  referenceTablePages,
} from "@/registry/reference-tables";
import { getTool, toolPath } from "@/registry/tools";
import { hrMaxTanaka, hrZones } from "@/lib/formulas/heart-rate";
import { planPlateLoad, type PlateStock } from "@/lib/formulas/plates";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface TableParams {
  params: Promise<{ table: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { table: string }[] {
  return referenceTablePages.map((p) => ({ table: p.slug }));
}

export async function generateMetadata({ params }: TableParams): Promise<Metadata> {
  const { table } = await params;
  const p = getReferenceTablePage(table);
  if (!p) return {};
  return {
    title: p.title,
    description: p.short,
    alternates: { canonical: `/reference/${p.slug}` },
    openGraph: { title: p.title, description: p.short, type: "article", url: `/reference/${p.slug}` },
  };
}

const round = (n: number): number => Math.round(n);

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h, i) => (
              <th key={h} scope="col" className={`py-2 pr-4 font-semibold ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-border/60">
              {row.map((cell, c) => (
                <td key={c} className={`py-2 pr-4 ${c > 0 ? "text-right tabular-nums" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Heart-rate zones (bpm) by age, from the same Tanaka + zone formula as the tool. */
function HrZonesTable() {
  const ages = Array.from({ length: 11 }, (_, i) => 20 + i * 5); // 20…70
  const rows = ages.map((age) => {
    const hrMax = hrMaxTanaka(age);
    const zones = hrZones(hrMax);
    return [
      age,
      round(hrMax),
      ...zones.map((z) => `${round(z.lowerBpm)} to ${round(z.upperBpm)}`),
    ];
  });
  return (
    <Table
      headers={["Age", "Max HR", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"]}
      rows={rows}
    />
  );
}

/** Daily protein grams at 1.6 / 1.8 / 2.2 g·kg⁻¹ by bodyweight. */
function ProteinTargetsTable() {
  const weights = Array.from({ length: 15 }, (_, i) => 50 + i * 5); // 50…120 kg
  const rows = weights.map((kg) => [kg, round(kg * 1.6), round(kg * 1.8), round(kg * 2.2)]);
  return (
    <Table
      headers={["Bodyweight (kg)", "1.6 g/kg", "1.8 g/kg", "2.2 g/kg"]}
      rows={rows}
    />
  );
}

const PLATE_INVENTORY: PlateStock[] = [
  { plateKg: 25, perSide: 6 },
  { plateKg: 20, perSide: 4 },
  { plateKg: 15, perSide: 4 },
  { plateKg: 10, perSide: 4 },
  { plateKg: 5, perSide: 4 },
  { plateKg: 2.5, perSide: 2 },
  { plateKg: 1.25, perSide: 2 },
];

/** Plates per side of a 20 kg bar for common totals, from the plate formula. */
function PlateLoadingTable() {
  const totals = Array.from({ length: 12 }, (_, i) => 40 + i * 10); // 40…150 kg
  const rows = totals.map((total) => {
    const plan = planPlateLoad(total, 20, PLATE_INVENTORY);
    return [`${total} kg`, `${round((total - 20) / 2)} kg`, plan.perSide.join(" + ")];
  });
  return <Table headers={["Total (with bar)", "Per side", "Plates per side"]} rows={rows} />;
}

function renderView(p: ReferenceTablePage) {
  switch (p.view) {
    case "hr-zones":
      return <HrZonesTable />;
    case "protein-targets":
      return <ProteinTargetsTable />;
    case "plate-loading":
      return <PlateLoadingTable />;
  }
}

function toolLink(slug: string): { href: string; title: string } | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return { href: toolPath(tool), title: tool.title };
}

export default async function ReferenceTablePageView({ params }: TableParams) {
  const { table } = await params;
  const p = getReferenceTablePage(table);
  if (!p) notFound();

  const relatedTools = p.relatedTools.flatMap((slug) => {
    const link = toolLink(slug);
    return link ? [link] : [];
  });

  const jsonLd = [
    articleJsonLd({
      title: p.title,
      description: p.short,
      path: `/reference/${p.slug}`,
      lastReviewed: REFERENCE_TABLES_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    ...(p.faq.length > 0 ? [faqPageJsonLd({ faq: p.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Reference tables", path: "/reference" },
      { name: p.title, path: `/reference/${p.slug}` },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLd.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/reference" className="hover:text-foreground">Reference tables</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{p.title}</h1>
        <p className="mt-2 max-w-prose text-muted">{p.intro}</p>
      </div>

      {renderView(p)}

      <div className="prose">
        <h2>How to read it</h2>
        <p>{p.howToRead}</p>
        {p.sources.length > 0 ? (
          <>
            <h2>Sources</h2>
            <ul>
              {p.sources.map((s) => (
                <li key={s.url}><a href={s.url} rel="noopener noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools">
          <h2 id="related-tools" className="font-display text-xl uppercase">Calculate your own</h2>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm">
            {relatedTools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="text-primary underline underline-offset-2">{t.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.faq.length > 0 ? <FAQ entries={p.faq} /> : null}

      <AuthorBox lastReviewed={REFERENCE_TABLES_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
