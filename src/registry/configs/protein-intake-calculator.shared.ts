export const PROTEIN_SLUG = "protein-intake-calculator";

export const PROTEIN_LIMITS = {
  weightKg: { min: 30, max: 300 },
} as const;

export const PROTEIN_DEFAULTS = {
  weightKg: 80,
  goal: "build",
} as const;

export const PROTEIN_GOAL_LABELS = {
  general: "General training",
  build: "Build muscle",
  cut: "Lose fat (keep muscle)",
  older: "65+ / older adult",
} as const;
