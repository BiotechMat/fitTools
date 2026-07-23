import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getReferenceTablePage, referenceTablePages } from "@/registry/reference-tables";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools reference table";

export function generateStaticParams(): { table: string }[] {
  return referenceTablePages.map((page) => ({ table: page.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const page = getReferenceTablePage(table);
  if (!page) notFound();
  return ogCard(page.title, page.short, {
    kicker: "Reference tables · from cited formulas",
  });
}
