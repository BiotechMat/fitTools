import { OG_SIZE, ogCard } from "@/lib/og-image";
import { allPeptides } from "@/registry/peptides";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Peptides in fitness: what the evidence says";

export default function Image() {
  return ogCard(
    "Peptides in fitness",
    `${allPeptides.length} compounds, tiered by evidence: what each is, what's claimed, what the research shows, and the legality and safety reality. No dosing.`,
    { kicker: "Education, not promotion" },
  );
}
