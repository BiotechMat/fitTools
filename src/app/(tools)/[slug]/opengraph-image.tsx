import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
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
  return ogCard(tool.title, "Free calculator · sources cited · no sign-up");
}
