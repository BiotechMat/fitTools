import { ColdWaterSafetyCallout, SaunaSafetyCallout } from "@/components/SafetyCallout";

/** Picks the right safety box for a recovery cluster (CONTENT.md §5). */
export function RecoverySafety({ variant }: { variant: "cold" | "sauna" }) {
  return variant === "cold" ? <ColdWaterSafetyCallout /> : <SaunaSafetyCallout />;
}
