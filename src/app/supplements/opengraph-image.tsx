import { OG_SIZE, ogCard } from "@/lib/og-image";
import { supplements } from "@/registry/supplements";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools supplement database: what the evidence actually says";

export default function Image() {
  return ogCard(
    "The supplement database",
    `${supplements.length} supplements rated honestly: what each is, what's claimed, and what the human research actually shows — with citations.`,
    { kicker: "Evidence-tiered" },
  );
}
