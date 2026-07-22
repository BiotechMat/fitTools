/**
 * Self-contained formula copies for the React-free embed pages (SPEC §9,
 * §16 M4). Each function must reference ONLY its parameters and JS
 * built-ins — they are serialised with Function.prototype.toString into
 * inline <script> tags, so imports or closures would break at runtime.
 * Unit tests lock every function to its canonical src/lib/formulas
 * counterpart; change these only in step with the originals.
 */

export function embedMifflin(
  sex: "male" | "female",
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

export function embedBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function embedBmiCategory(value: number): string {
  if (value < 18.5) return "underweight";
  if (value < 25) return "healthy weight";
  if (value < 30) return "overweight";
  if (value < 35) return "obesity class I";
  if (value < 40) return "obesity class II";
  return "obesity class III";
}

export function embedEpley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}
