import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { hubMeta, type HubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools calculator category";

// Same slug model as the page: category slug = topic section path segment.
function categoryBySlug(slug: string): HubMeta | undefined {
  return Object.values(hubMeta).find(
    (meta) => meta.path === `/${slug}` && toolsForHub(meta.hub).length > 0,
  );
}

export function generateStaticParams(): { category: string }[] {
  return Object.values(hubMeta)
    .filter((meta) => toolsForHub(meta.hub).length > 0)
    .map((meta) => ({ category: meta.path.slice(1) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = categoryBySlug(category);
  if (!meta) notFound();
  return ogCard(
    `${meta.title} calculators`,
    meta.description,
    { kicker: `${toolsForHub(meta.hub).length} free tools · sources cited` },
  );
}
