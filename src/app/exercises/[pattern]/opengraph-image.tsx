import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { exercisePatterns, getPattern } from "@/registry/exercises";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools exercise library: movement pattern";

export function generateStaticParams(): { pattern: string }[] {
  return exercisePatterns.map((pattern) => ({ pattern: pattern.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern } = await params;
  const entry = getPattern(pattern);
  if (!entry) notFound();
  return ogCard(entry.title, entry.description, {
    kicker: "The exercise library",
  });
}
