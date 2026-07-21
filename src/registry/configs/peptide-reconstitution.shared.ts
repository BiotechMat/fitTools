export const PEPTIDE_SLUG = "peptide-reconstitution";

export const PEPTIDE_LIMITS = {
  vialMg: { min: 0.1, max: 100 },
  diluentMl: { min: 0.1, max: 10 },
  doseMcg: { min: 1, max: 20000 },
} as const;

export const PEPTIDE_DEFAULTS = {
  vialMg: 5,
  diluentMl: 2,
  doseMcg: 250,
} as const;

/** localStorage flag for the enhanced-disclaimer acknowledgement (SPEC §7). */
export const LABS_ACK_KEY = "fittools:labs-ack";
