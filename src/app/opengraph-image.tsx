import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools: evidence-based fitness calculators";

export default function Image() {
  return ogCard(
    "Evidence-based fitness calculators",
    "Every formula cited to its published source",
  );
}
