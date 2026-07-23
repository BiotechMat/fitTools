import { OG_SIZE, ogCard } from "@/lib/og-image";
import { hubMeta } from "@/registry/hubs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools — Recovery calculators and guides";

export default function Image() {
  const meta = hubMeta.recovery;
  return ogCard(meta.title, meta.description, {
    kicker: "Calculators & guides",
  });
}
