import { type ExerciseEntry, exercises } from "@/registry/exercises";

/**
 * Muscle-map normalisation (MICROTOOLS.md §4): every free-text muscle name
 * in the exercise registry maps to one canonical body region. The unit test
 * asserts the mapping is exhaustive over the registry, so a new exercise
 * with an unmapped muscle fails CI instead of silently missing the map.
 */

export type RegionId =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "adductors"
  | "hip-flexors"
  | "upper-back"
  | "lats"
  | "lower-back"
  | "glutes"
  | "hamstrings"
  | "calves";

export interface Region {
  id: RegionId;
  label: string;
  view: "front" | "back";
}

export const REGIONS: Region[] = [
  { id: "chest", label: "Chest", view: "front" },
  { id: "shoulders", label: "Shoulders", view: "front" },
  { id: "biceps", label: "Biceps", view: "front" },
  { id: "forearms", label: "Forearms", view: "front" },
  { id: "abs", label: "Abs", view: "front" },
  { id: "obliques", label: "Obliques", view: "front" },
  { id: "hip-flexors", label: "Hip flexors", view: "front" },
  { id: "quads", label: "Quads", view: "front" },
  { id: "adductors", label: "Adductors", view: "front" },
  { id: "upper-back", label: "Upper back & traps", view: "back" },
  { id: "lats", label: "Lats", view: "back" },
  { id: "lower-back", label: "Lower back", view: "back" },
  { id: "triceps", label: "Triceps", view: "back" },
  { id: "glutes", label: "Glutes", view: "back" },
  { id: "hamstrings", label: "Hamstrings", view: "back" },
  { id: "calves", label: "Calves", view: "back" },
];

const MUSCLE_TO_REGION: Record<string, RegionId> = {
  Adductors: "adductors",
  Biceps: "biceps",
  Brachialis: "biceps",
  Calves: "calves",
  "Calves (gastrocnemius)": "calves",
  Soleus: "calves",
  "Chest (pectorals)": "chest",
  "Chest (lower pectorals)": "chest",
  "Upper chest": "chest",
  "Upper chest (clavicular pectorals)": "chest",
  Core: "abs",
  "Core (rectus abdominis)": "abs",
  "Core (rectus abdominis, deep core)": "abs",
  Obliques: "obliques",
  "Core (obliques, deep core)": "obliques",
  Forearms: "forearms",
  "Front deltoids": "shoulders",
  "Side deltoids": "shoulders",
  "Rear deltoids": "shoulders",
  "Rotator cuff": "shoulders",
  Shoulders: "shoulders",
  "Shoulders (deltoids)": "shoulders",
  Glutes: "glutes",
  Hamstrings: "hamstrings",
  "Hip flexors": "hip-flexors",
  Lats: "lats",
  "Mid-back": "upper-back",
  "Mid-back (rhomboids, traps)": "upper-back",
  "Upper back": "upper-back",
  Traps: "upper-back",
  "Traps (upper)": "upper-back",
  Quadriceps: "quads",
  "Spinal erectors": "lower-back",
  Triceps: "triceps",
};

export function regionForMuscle(muscle: string): RegionId | null {
  return MUSCLE_TO_REGION[muscle] ?? null;
}

/** Muscle strings present in the registry with no region — must be empty. */
export function unmappedRegistryMuscles(): string[] {
  const missing = new Set<string>();
  for (const exercise of exercises) {
    for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
      if (regionForMuscle(muscle) === null) missing.add(muscle);
    }
  }
  return [...missing].sort();
}

export interface RegionExercises {
  primary: ExerciseEntry[];
  secondary: ExerciseEntry[];
}

export function exercisesForRegion(region: RegionId): RegionExercises {
  const primary: ExerciseEntry[] = [];
  const secondary: ExerciseEntry[] = [];
  for (const exercise of exercises) {
    if (exercise.primaryMuscles.some((m) => regionForMuscle(m) === region)) {
      primary.push(exercise);
    } else if (
      exercise.secondaryMuscles.some((m) => regionForMuscle(m) === region)
    ) {
      secondary.push(exercise);
    }
  }
  return { primary, secondary };
}
