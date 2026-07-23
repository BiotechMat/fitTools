import { OG_SIZE, ogCard } from "@/lib/og-image";
import { AUTHOR } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Mathew Beale: FitTools author";

export default function Image() {
  return ogCard(
    AUTHOR.name,
    `${AUTHOR.credentials}. Writes and reviews every FitTools calculator against its published primary sources.`,
    { kicker: "The author" },
  );
}
