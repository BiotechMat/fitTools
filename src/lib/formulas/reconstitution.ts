/**
 * Peptide reconstitution arithmetic (SPEC §7, Tier 4 /labs/). Operates on
 * user-supplied values ONLY: no compound presets, no dosing suggestions —
 * the tool does arithmetic on numbers the user already has from their
 * prescriber. All values SI (mg, ml).
 */

export function concentrationMgPerMl(vialMg: number, diluentMl: number): number {
  if (diluentMl <= 0) throw new RangeError("Diluent volume must be positive");
  return vialMg / diluentMl;
}

export function drawVolumeMl(doseMg: number, concentration: number): number {
  if (concentration <= 0) throw new RangeError("Concentration must be positive");
  return doseMg / concentration;
}

/** U-100 insulin syringe: 100 units = 1 ml. */
export function syringeUnits(volumeMl: number): number {
  return volumeMl * 100;
}
