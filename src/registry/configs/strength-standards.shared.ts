export const STANDARDS_SLUG = "strength-standards";

export const STANDARDS_LIMITS = {
  bodyweightKg: { min: 40, max: 200 },
  oneRepMaxKg: { min: 1, max: 500 },
} as const;

export const STANDARDS_DEFAULTS = {
  sex: "male",
  bodyweightKg: 91,
  lift: "backSquat",
  oneRepMaxKg: 150,
} as const;
