import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og-image";
import { allExercisePaths, getExercise } from "@/registry/exercises";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools exercise guide";

export function generateStaticParams(): { pattern: string; exercise: string }[] {
  return allExercisePaths().flatMap((path) =>
    path.exercise ? [{ pattern: path.pattern, exercise: path.exercise }] : [],
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ pattern: string; exercise: string }>;
}) {
  const { pattern, exercise } = await params;
  const entry = getExercise(exercise);
  if (!entry || entry.pattern !== pattern) notFound();
  return ogCard(entry.name, entry.short, {
    kicker: "The exercise library · form & faults",
  });
}
