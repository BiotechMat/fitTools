import { OG_SIZE, ogCard } from "@/lib/og-image";
import { standardTools } from "@/registry/tools";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools — every calculator, by category";

export default function Image() {
  return ogCard(
    "Every calculator, one place",
    `${standardTools().length} free tools across nutrition, workout and recovery — each built on published, peer-reviewed formulas with the sources cited.`,
    { kicker: "The calculators" },
  );
}
