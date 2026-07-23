import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { hubMeta } from "@/registry/hubs";
import { getTool, standardTools } from "@/registry/tools";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools calculator";

export function generateStaticParams(): { slug: string }[] {
  return standardTools().map((tool) => ({ slug: tool.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  // Short name shouted, the tool's own value line underneath — so each
  // calculator unfurls as itself, not as an interchangeable brand card.
  return ogCard(
    tool.title.split(":")[0].trim(),
    tool.valueLine ?? tool.metaDescription,
    {
      kicker: `${hubMeta[tool.hub].title} calculator · free · sources cited`,
    },
  );
}
