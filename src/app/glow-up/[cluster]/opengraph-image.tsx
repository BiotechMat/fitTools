import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getGlowUpCluster, glowUpClusters } from "@/registry/glowup-content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools glow-up guide";

export function generateStaticParams(): { cluster: string }[] {
  return glowUpClusters.map((cluster) => ({ cluster: cluster.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster } = await params;
  const entry = getGlowUpCluster(cluster);
  if (!entry) notFound();
  return ogCard(entry.title, entry.pillarValueLine, {
    kicker: "The glow-up · peer-reviewed",
  });
}
