/**
 * Profile → calculator prefill (PROFILE.md §5; Mat, 2026-07-24: metrics
 * given at sign-up auto-populate every relevant calculator). Reads the
 * dashboard vitals (canonical SI — DASHBOARD §3.1) and derives age from the
 * stored date of birth. Calculators apply it once on mount, only over
 * fields the user hasn't touched, and show a "prefilled from your profile"
 * chip for transparency (§5: a default, never a lock — every field stays
 * editable and nothing writes back silently).
 */

import { deriveAge, parseDashboard, readRawDashboard } from "@/lib/dashboard-store";
import type { Sex } from "@/lib/dashboard-store";

export interface ProfilePrefill {
  sex?: Sex;
  ageYears?: number;
  heightCm?: number;
  weightKg?: number;
  restingHr?: number;
}

/** Snapshot the profile's calculator-relevant fields. Empty object = none. */
export function readProfilePrefill(): ProfilePrefill {
  if (typeof window === "undefined") return {};
  const vitals = parseDashboard(readRawDashboard()).profile;
  const prefill: ProfilePrefill = {};
  if (vitals.sex !== undefined) prefill.sex = vitals.sex;
  if (vitals.birthDate !== undefined) {
    const age = deriveAge(vitals.birthDate);
    if (age !== null && age >= 13 && age <= 100) prefill.ageYears = age;
  }
  if (vitals.heightCm !== undefined) prefill.heightCm = vitals.heightCm;
  if (vitals.weightKg !== undefined) prefill.weightKg = vitals.weightKg;
  if (vitals.restingHr !== undefined) prefill.restingHr = vitals.restingHr;
  return prefill;
}

export function hasProfilePrefill(prefill: ProfilePrefill): boolean {
  return Object.keys(prefill).length > 0;
}
