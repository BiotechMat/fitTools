import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getGlossaryEntry, glossaryEntries } from "@/registry/glossary";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools glossary definition";

export function generateStaticParams(): { term: string }[] {
  return glossaryEntries.map((entry) => ({ term: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const entry = getGlossaryEntry(term);
  if (!entry) notFound();
  return ogCard(entry.term, entry.short, {
    kicker: "The glossary · plain English",
  });
}
