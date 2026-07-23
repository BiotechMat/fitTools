"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  REGIONS,
  type RegionId,
  exercisesForRegion,
} from "@/lib/tools/muscles";

/**
 * Clickable muscle map (MICROTOOLS.md §4). Stylised riso figures (front +
 * back) with tappable regions; the accessible controls are the real
 * region-chip buttons beneath — the SVG is a pointer-friendly duplicate
 * (aria-hidden), so keyboard and screen-reader users lose nothing.
 */

interface Shape {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
}

const FRONT_SHAPES: Partial<Record<RegionId, Shape[]>> = {
  shoulders: [
    { x: 38, y: 54, w: 26, h: 20, rx: 9 },
    { x: 136, y: 54, w: 26, h: 20, rx: 9 },
  ],
  chest: [{ x: 66, y: 60, w: 68, h: 30, rx: 8 }],
  biceps: [
    { x: 38, y: 78, w: 20, h: 36, rx: 8 },
    { x: 142, y: 78, w: 20, h: 36, rx: 8 },
  ],
  forearms: [
    { x: 34, y: 118, w: 18, h: 42, rx: 8 },
    { x: 148, y: 118, w: 18, h: 42, rx: 8 },
  ],
  abs: [{ x: 84, y: 94, w: 32, h: 62, rx: 8 }],
  obliques: [
    { x: 66, y: 96, w: 15, h: 52, rx: 6 },
    { x: 119, y: 96, w: 15, h: 52, rx: 6 },
  ],
  "hip-flexors": [
    { x: 70, y: 164, w: 24, h: 20, rx: 7 },
    { x: 106, y: 164, w: 24, h: 20, rx: 7 },
  ],
  quads: [
    { x: 66, y: 190, w: 30, h: 76, rx: 10 },
    { x: 104, y: 190, w: 30, h: 76, rx: 10 },
  ],
  adductors: [{ x: 95, y: 190, w: 10, h: 54, rx: 4 }],
};

const BACK_SHAPES: Partial<Record<RegionId, Shape[]>> = {
  "upper-back": [{ x: 66, y: 56, w: 68, h: 28, rx: 8 }],
  lats: [
    { x: 64, y: 88, w: 20, h: 50, rx: 8 },
    { x: 116, y: 88, w: 20, h: 50, rx: 8 },
  ],
  "lower-back": [{ x: 86, y: 122, w: 28, h: 34, rx: 8 }],
  triceps: [
    { x: 38, y: 76, w: 20, h: 40, rx: 8 },
    { x: 142, y: 76, w: 20, h: 40, rx: 8 },
  ],
  glutes: [
    { x: 69, y: 158, w: 29, h: 30, rx: 12 },
    { x: 102, y: 158, w: 29, h: 30, rx: 12 },
  ],
  hamstrings: [
    { x: 66, y: 190, w: 30, h: 72, rx: 10 },
    { x: 104, y: 190, w: 30, h: 72, rx: 10 },
  ],
  calves: [
    { x: 70, y: 268, w: 24, h: 58, rx: 10 },
    { x: 106, y: 268, w: 24, h: 58, rx: 10 },
  ],
};

function Figure({
  shapes,
  selected,
  onSelect,
  title,
}: {
  shapes: Partial<Record<RegionId, Shape[]>>;
  selected: RegionId | null;
  onSelect: (region: RegionId) => void;
  title: string;
}) {
  return (
    <div className="text-center">
      <svg
        viewBox="0 0 200 350"
        className="mx-auto h-auto w-full max-w-[220px]"
        aria-hidden="true"
      >
        <circle cx={100} cy={28} r={17} fill="var(--surface-deep)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={91} y={44} width={18} height={10} fill="var(--surface-deep)" stroke="var(--foreground)" strokeWidth={2} rx={4} />
        <rect x={60} y={52} width={80} height={114} rx={16} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={64} y={162} width={72} height={26} rx={10} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={34} y={54} width={26} height={108} rx={12} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={140} y={54} width={26} height={108} rx={12} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={64} y={186} width={34} height={144} rx={13} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        <rect x={102} y={186} width={34} height={144} rx={13} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={2} />
        {(Object.entries(shapes) as [RegionId, Shape[]][]).map(([region, rects]) =>
          rects.map((s, i) => (
            <rect
              key={`${region}-${i}`}
              className="muscle-region"
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={s.rx ?? 6}
              fill={
                selected === region ? "var(--primary-strong)" : "var(--primary-soft)"
              }
              stroke="var(--foreground)"
              strokeWidth={1.5}
              onClick={() => onSelect(region)}
            />
          )),
        )}
      </svg>
      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>
    </div>
  );
}

export function MuscleMap() {
  const [selected, setSelected] = useState<RegionId>("chest");
  const { primary, secondary } = useMemo(
    () => exercisesForRegion(selected),
    [selected],
  );
  const selectedRegion = REGIONS.find((r) => r.id === selected);

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Figure
          shapes={FRONT_SHAPES}
          selected={selected}
          onSelect={setSelected}
          title="Front"
        />
        <Figure
          shapes={BACK_SHAPES}
          selected={selected}
          onSelect={setSelected}
          title="Back"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Muscle regions">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            aria-pressed={selected === region.id}
            onClick={() => setSelected(region.id)}
            className={`rounded-full border-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
              selected === region.id
                ? "border-foreground bg-foreground text-background"
                : "border-foreground bg-background"
            }`}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border-2 border-foreground bg-background p-4">
        <h2 className="font-display text-2xl uppercase">
          {selectedRegion?.label}
        </h2>
        {primary.length > 0 ? (
          <>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              Trains it directly
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {primary.map((exercise) => (
                <li key={exercise.slug}>
                  <Link
                    href={`/exercises/${exercise.pattern}/${exercise.slug}`}
                    className="riso-press [--riso:2px] inline-block rounded-full border-2 border-foreground bg-primary-soft px-3 py-1 text-sm font-semibold"
                  >
                    {exercise.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {secondary.length > 0 ? (
          <>
            <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              Works it along the way
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {secondary.map((exercise) => (
                <li key={exercise.slug}>
                  <Link
                    href={`/exercises/${exercise.pattern}/${exercise.slug}`}
                    className="riso-press [--riso:2px] inline-block rounded-full border-2 border-border bg-surface px-3 py-1 text-sm"
                  >
                    {exercise.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
