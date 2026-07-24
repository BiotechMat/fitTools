/**
 * Auth constants shared between server and client chunks (ACCOUNTS.md §7.7).
 * Dependency-free — safe to import anywhere without pulling server code
 * into a client bundle.
 */

export const AGE_BANDS = ["13-15", "16-17", "18-plus"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export function isAgeBand(v: unknown): v is AgeBand {
  return typeof v === "string" && (AGE_BANDS as readonly string[]).includes(v);
}

/** Health-flavoured namespaces need a 16+ band (ACCOUNTS §7.7). */
export function bandAllowsHealthStorage(band: unknown): boolean {
  return band === "16-17" || band === "18-plus";
}

/** Blood-result storage is 18+ (ACCOUNTS §9.5 — settled at A4). */
export function bandAllowsBloodworkStorage(band: unknown): boolean {
  return band === "18-plus";
}

/** The consent kinds a namespace can require (ACCOUNTS §7.2, §6.2). */
export type ConsentKind = "health-storage" | "bloodwork-storage";

export function bandAllowsConsent(kind: ConsentKind, band: unknown): boolean {
  return kind === "bloodwork-storage"
    ? bandAllowsBloodworkStorage(band)
    : bandAllowsHealthStorage(band);
}
