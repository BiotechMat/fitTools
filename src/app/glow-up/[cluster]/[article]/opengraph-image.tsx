import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { allGlowUpPaths, getGlowUpArticle } from "@/registry/glowup-content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools glow-up article";

export function generateStaticParams(): { cluster: string; article: string }[] {
  return allGlowUpPaths().flatMap((path) =>
    path.article ? [{ cluster: path.cluster, article: path.article }] : [],
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ cluster: string; article: string }>;
}) {
  const { cluster, article } = await params;
  const entry = getGlowUpArticle(cluster, article);
  if (!entry) notFound();
  return ogCard(entry.title, entry.valueLine, {
    kicker: "The glow-up · peer-reviewed",
  });
}
