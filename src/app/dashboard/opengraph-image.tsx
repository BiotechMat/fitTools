import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools dashboard — your numbers in one private place";

export default function Image() {
  return ogCard(
    "Your numbers",
    "Saved calculations, health scores and blood-test biomarkers in one private place — tracked over time, stored on your device.",
    { kicker: "The dashboard" },
  );
}
