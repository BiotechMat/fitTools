import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import {
  FOOD_REFERENCE_LAST_REVIEWED,
  type DietType,
  type Food,
  type FoodReferencePage,
  foodReferencePages,
  foods,
  foodsByProtein,
  foodsForDiet,
  getFoodReferencePage,
} from "@/registry/food-reference";
import { getTool, toolPath } from "@/registry/tools";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FAQ } from "@/components/FAQ";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";

interface PageParams {
  params: Promise<{ page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { page: string }[] {
  return foodReferencePages.map((p) => ({ page: p.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { page } = await params;
  const p = getFoodReferencePage(page);
  if (!p) return {};
  return {
    title: p.title,
    description: p.short,
    alternates: { canonical: `/nutrition/reference/${p.slug}` },
    openGraph: { title: p.title, description: p.short, type: "article", url: `/nutrition/reference/${p.slug}` },
  };
}

const FOOD_CATEGORIES = [
  "Meat & fish",
  "Dairy & eggs",
  "Legumes & pulses",
  "Grains",
  "Nuts & seeds",
  "Vegetables & fruit",
] as const;

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

function ProteinView() {
  const rows = foodsByProtein().map((f) => [f.name, f.category, f.proteinPer100g, f.kcalPer100g]);
  return <Table headers={["Food", "Category", "Protein (g)", "Calories (kcal)"]} rows={rows} />;
}

function CalorieView() {
  return (
    <div className="space-y-6">
      {FOOD_CATEGORIES.map((cat) => {
        const list = foods
          .filter((f) => f.category === cat)
          .sort((a, b) => a.kcalPer100g - b.kcalPer100g);
        if (list.length === 0) return null;
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <h3 id={`cat-${cat}`} className="mb-2 font-semibold">{cat}</h3>
            <Table
              headers={["Food", "Calories (kcal)", "Protein (g)"]}
              rows={list.map((f) => [f.name, f.kcalPer100g, f.proteinPer100g])}
            />
          </section>
        );
      })}
    </div>
  );
}

function PortionView() {
  const rows = foods.map((f) => [
    f.name,
    `${f.portion.label} (${f.portion.grams} g)`,
    round((f.proteinPer100g * f.portion.grams) / 100),
    round((f.kcalPer100g * f.portion.grams) / 100),
  ]);
  return <Table headers={["Food", "Typical portion", "Protein (g)", "Calories (kcal)"]} rows={rows} />;
}

function HighProteinView() {
  const groups: { diet: DietType; label: string }[] = [
    { diet: "vegan", label: "Best vegan sources" },
    { diet: "vegetarian", label: "Best vegetarian sources (adds dairy & eggs)" },
    { diet: "omnivore", label: "Best omnivore sources (adds meat & fish)" },
  ];
  const topFor = (diet: DietType): Food[] =>
    [...foodsForDiet(diet)].sort((a, b) => b.proteinPer100g - a.proteinPer100g).slice(0, 10);
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.diet} aria-labelledby={`diet-${g.diet}`}>
          <h3 id={`diet-${g.diet}`} className="mb-2 font-semibold">{g.label}</h3>
          <Table
            headers={["Food", "Protein (g)", "Calories (kcal)"]}
            rows={topFor(g.diet).map((f) => [f.name, f.proteinPer100g, f.kcalPer100g])}
          />
        </section>
      ))}
    </div>
  );
}

function renderView(p: FoodReferencePage) {
  switch (p.view) {
    case "protein":
      return <ProteinView />;
    case "calorie":
      return <CalorieView />;
    case "portion":
      return <PortionView />;
    case "high-protein":
      return <HighProteinView />;
  }
}

function toolLink(slug: string): { href: string; title: string } | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return { href: toolPath(tool), title: tool.title };
}

export default async function FoodReferencePage({ params }: PageParams) {
  const { page } = await params;
  const p = getFoodReferencePage(page);
  if (!p) notFound();

  const relatedTools = p.relatedTools.flatMap((slug) => {
    const link = toolLink(slug);
    return link ? [link] : [];
  });

  const jsonLd = [
    articleJsonLd({
      title: p.title,
      description: p.short,
      path: `/nutrition/reference/${p.slug}`,
      lastReviewed: FOOD_REFERENCE_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    ...(p.faq.length > 0 ? [faqPageJsonLd({ faq: p.faq })] : []),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Nutrition", path: "/nutrition" },
      { name: "Food reference", path: "/nutrition/reference" },
      { name: p.title, path: `/nutrition/reference/${p.slug}` },
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
          <Link href="/nutrition" className="hover:text-foreground">Nutrition</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/nutrition/reference" className="hover:text-foreground">Food reference</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{p.title}</h1>
        <p className="mt-2 max-w-prose text-muted">{p.intro}</p>
      </div>

      {renderView(p)}

      <p className="text-xs text-muted">
        Values are approximate per-100 g reference figures from public
        food-composition data (USDA FoodData Central), rounded and for general
        guidance only, real foods vary by cut, brand and preparation.
      </p>

      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools">
          <h2 id="related-tools" className="font-display text-xl uppercase">Work out your numbers</h2>
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

      <AuthorBox lastReviewed={FOOD_REFERENCE_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
