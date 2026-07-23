import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { getTool } from "@/registry/tools";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Peptide reconstitution calculator";

export default function Image() {
  const tool = getTool("peptide-reconstitution");
  if (!tool) notFound();
  return ogCard(
    tool.title.split("—")[0].trim(),
    tool.valueLine ?? tool.metaDescription,
    { kicker: "Calculator · arithmetic only, no guidance" },
  );
}
