/**
 * BMI (SPEC §7): kg/m² with WHO categories. The tool page must carry a
 * prominent athlete-limitation note.
 */

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BmiCategory =
  | "underweight"
  | "healthy weight"
  | "overweight"
  | "obesity class I"
  | "obesity class II"
  | "obesity class III";

/** WHO adult classification. */
export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return "underweight";
  if (value < 25) return "healthy weight";
  if (value < 30) return "overweight";
  if (value < 35) return "obesity class I";
  if (value < 40) return "obesity class II";
  return "obesity class III";
}
