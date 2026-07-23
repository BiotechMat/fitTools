import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import {
  GRADE_LABELS,
  allPeptides,
  evidenceGrade,
  getPeptide,
} from "@/registry/peptides";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools peptide reference";

export function generateStaticParams(): { slug: string }[] {
  return allPeptides.map((page) => ({ slug: page.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPeptide(slug);
  if (!page) notFound();
  return ogCard(page.name, page.valueLine, {
    kicker: `Peptide reference · ${GRADE_LABELS[evidenceGrade(page.headlineTier, page.headlineBasis)]}`,
  });
}
