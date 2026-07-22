import { describe, expect, it } from "vitest";
import {
  exercises,
  exercisePatterns,
  exercisesBySlug,
  allExercisePaths,
  resolveSubstitutions,
} from "@/registry/exercises";
import { getTool } from "@/registry/tools";
import { howToJsonLd } from "@/lib/schema-org";

/**
 * Exercise library invariants (CONTENT-reference.md §3, §8, §9). Every exercise
 * must have complete HowTo/muscle/fault data, sit in a real pattern, and have
 * resolvable substitution and tool cross-links.
 */

describe("exercise registry invariants", () => {
  it("has unique slugs", () => {
    const slugs = exercises.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every exercise sits in a declared movement pattern", () => {
    const patternSlugs = new Set(exercisePatterns.map((p) => p.slug));
    for (const e of exercises) {
      expect(patternSlugs.has(e.pattern)).toBe(true);
    }
  });

  it("every exercise has steps, muscles and at least one form fault", () => {
    for (const e of exercises) {
      expect(e.steps.length).toBeGreaterThanOrEqual(3);
      expect(e.primaryMuscles.length).toBeGreaterThan(0);
      expect(e.secondaryMuscles.length).toBeGreaterThan(0);
      expect(e.formFaults.length).toBeGreaterThan(0);
      for (const f of e.formFaults) {
        expect(f.fault.length).toBeGreaterThan(0);
        expect(f.fix.length).toBeGreaterThan(0);
      }
      expect(e.programmingNote.length).toBeGreaterThan(0);
    }
  });

  it("every substitution slug resolves and is not self-referential", () => {
    for (const e of exercises) {
      expect(resolveSubstitutions(e.substitutions)).toHaveLength(e.substitutions.length);
      expect(e.substitutions).not.toContain(e.slug);
    }
  });

  it("every related-tool slug resolves to a registered tool", () => {
    for (const e of exercises) {
      for (const slug of e.relatedTools) {
        expect(getTool(slug), `${e.slug} → unknown tool ${slug}`).toBeDefined();
      }
    }
  });

  it("allExercisePaths covers every pattern hub and exercise", () => {
    const paths = allExercisePaths();
    const hubs = paths.filter((p) => !p.exercise);
    const detail = paths.filter((p) => p.exercise);
    expect(hubs).toHaveLength(exercisePatterns.length);
    expect(detail).toHaveLength(exercises.length);
  });

  it("resolves every exercise by slug", () => {
    for (const e of exercises) {
      expect(exercisesBySlug.get(e.slug)).toBe(e);
    }
  });
});

describe("howToJsonLd", () => {
  it("emits ordered HowToStep entries from an exercise's steps", () => {
    const squat = exercisesBySlug.get("back-squat");
    expect(squat).toBeDefined();
    const schema = howToJsonLd({
      name: `How to perform the ${squat!.name}`,
      description: squat!.whatItIs,
      steps: squat!.steps,
    });
    expect(schema["@type"]).toBe("HowTo");
    expect(schema.step).toHaveLength(squat!.steps.length);
    expect(schema.step[0]).toMatchObject({ "@type": "HowToStep", position: 1 });
    expect(schema.step.at(-1)?.position).toBe(squat!.steps.length);
  });
});
