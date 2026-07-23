import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools nutrition and food reference tables";

export default function Image() {
  return ogCard(
    "Nutrition & food reference",
    "Bookmarkable tables: protein content of common foods, high-protein sources by diet, a calorie reference and typical portion sizes.",
    { kicker: "Food reference" },
  );
}
