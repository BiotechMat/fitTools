import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools open composite index methodology";

export default function Image() {
  return ogCard(
    "Open index methodology",
    "How the composite indices are built: sub-score normalisation, weighting and evidence tiers, missing-data handling, versioning and the changelog.",
    { kicker: "Show the working" },
  );
}
