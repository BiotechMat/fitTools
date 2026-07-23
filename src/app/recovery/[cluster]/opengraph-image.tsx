import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getCluster, recoveryClusters } from "@/registry/recovery-content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools recovery guide";

export function generateStaticParams(): { cluster: string }[] {
  return recoveryClusters.map((cluster) => ({ cluster: cluster.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster } = await params;
  const entry = getCluster(cluster);
  if (!entry) notFound();
  return ogCard(entry.title, entry.pillarValueLine, {
    kicker: "Recovery · evidence-tiered guide",
  });
}
