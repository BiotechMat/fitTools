import { OG_SIZE, ogCard } from "@/lib/og-image";
import { hubMeta } from "@/registry/hubs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools — Workout calculators and exercise library";

export default function Image() {
  const meta = hubMeta.strength;
  return ogCard(meta.title, meta.description, {
    kicker: "Calculators & exercise library",
  });
}
