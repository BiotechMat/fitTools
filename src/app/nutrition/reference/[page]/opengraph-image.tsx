import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { foodReferencePages, getFoodReferencePage } from "@/registry/food-reference";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools food reference table";

export function generateStaticParams(): { page: string }[] {
  return foodReferencePages.map((entry) => ({ page: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const entry = getFoodReferencePage(page);
  if (!entry) notFound();
  return ogCard(entry.title, entry.short, { kicker: "Food reference" });
}
