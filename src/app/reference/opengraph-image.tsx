import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools reference tables and charts";

export default function Image() {
  return ogCard(
    "Reference tables & charts",
    "Heart-rate zones by age, daily protein targets by bodyweight and a barbell plate-loading chart — generated from the same cited formulas as the calculators.",
    { kicker: "The reference shelf" },
  );
}
