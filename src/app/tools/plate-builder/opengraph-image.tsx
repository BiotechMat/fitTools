import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools plate builder: stack foods, watch protein add up";

export default function Image() {
  return ogCard(
    "The plate builder",
    "Build a meal from real reference foods and watch protein and calories total live against your targets. Typical portions, honest numbers.",
    { kicker: "Micro-tool" },
  );
}
