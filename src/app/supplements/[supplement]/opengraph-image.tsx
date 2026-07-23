import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getSupplement, supplements } from "@/registry/supplements";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools supplement guide";

export function generateStaticParams(): { supplement: string }[] {
  return supplements.map((entry) => ({ supplement: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ supplement: string }>;
}) {
  const { supplement } = await params;
  const entry = getSupplement(supplement);
  if (!entry) notFound();
  return ogCard(entry.name, entry.short, {
    kicker: "Supplement database · evidence-tiered",
  });
}
