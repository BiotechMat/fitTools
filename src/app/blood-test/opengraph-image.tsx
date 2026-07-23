import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools at-home blood test: know your numbers";

export default function Image() {
  return ogCard(
    "At-home blood test",
    "Measure the biomarkers behind your metabolic, heart and longevity health. Results flow straight into your dashboard and calculators.",
    { kicker: "Know your numbers" },
  );
}
