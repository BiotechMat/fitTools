import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { allRecoveryContentPaths, getArticle } from "@/registry/recovery-content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools recovery article";

export function generateStaticParams(): { cluster: string; article: string }[] {
  return allRecoveryContentPaths().flatMap((path) =>
    path.article ? [{ cluster: path.cluster, article: path.article }] : [],
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ cluster: string; article: string }>;
}) {
  const { cluster, article } = await params;
  const entry = getArticle(cluster, article);
  if (!entry) notFound();
  return ogCard(entry.title, entry.valueLine, {
    kicker: "Recovery · evidence-tiered guide",
  });
}
