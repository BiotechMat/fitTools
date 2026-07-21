import type { Sex } from "@/lib/formulas/energy";
import { cmToInches } from "@/lib/units";

/**
 * Ideal ("historical estimating") body-weight formulas (SPEC §7): Devine,
 * Robinson, Miller, Hamwi — each a base weight plus kg per inch over 5 ft.
 * Coefficients per Pai MP, Paloucek FP. The origin of the "ideal" body
 * weight equations. Ann Pharmacother 2000;34:1066–1069
 * (https://pubmed.ncbi.nlm.nih.gov/10981254/). The page frames these
 * explicitly as historical estimating formulas, not health targets.
 */

export interface IdealWeightInput {
  sex: Sex;
  heightCm: number;
}

export interface IdealWeights {
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
}

const COEFFICIENTS: Record<Sex, Record<keyof IdealWeights, [base: number, perInch: number]>> = {
  male: {
    devine: [50, 2.3],
    robinson: [52, 1.9],
    miller: [56.2, 1.41],
    hamwi: [48, 2.7],
  },
  female: {
    devine: [45.5, 2.3],
    robinson: [49, 1.7],
    miller: [53.1, 1.36],
    hamwi: [45.5, 2.2],
  },
};

export function idealWeights({ sex, heightCm }: IdealWeightInput): IdealWeights {
  const inchesOverFiveFeet = cmToInches(heightCm) - 60;
  if (inchesOverFiveFeet < 0) {
    throw new RangeError("Ideal-weight formulas are undefined below 5 ft (152.4 cm)");
  }
  const coefficients = COEFFICIENTS[sex];
  const compute = ([base, perInch]: [number, number]) =>
    base + perInch * inchesOverFiveFeet;
  return {
    devine: compute(coefficients.devine),
    robinson: compute(coefficients.robinson),
    miller: compute(coefficients.miller),
    hamwi: compute(coefficients.hamwi),
  };
}

export function idealWeightRange(input: IdealWeightInput): {
  minKg: number;
  maxKg: number;
} {
  const weights = Object.values(idealWeights(input));
  return { minKg: Math.min(...weights), maxKg: Math.max(...weights) };
}
