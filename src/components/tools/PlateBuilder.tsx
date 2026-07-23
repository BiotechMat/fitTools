"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type DietType, type Food, foods } from "@/registry/food-reference";
import { type PlateItem, itemGrams, plateTotals } from "@/lib/tools/plate";
import { RollingNumber } from "@/components/effects/RollingNumber";

/**
 * Plate builder (MICROTOOLS.md §5): stack registry foods onto a plate and
 * watch kcal + protein totals roll against your targets. Registry-driven —
 * kcal and protein only, because that's what the reference records.
 */

const DIET_FILTERS: { id: DietType | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

const DIET_RANK: Record<DietType, number> = {
  vegan: 0,
  vegetarian: 1,
  omnivore: 2,
};

export function PlateBuilder() {
  const [diet, setDiet] = useState<DietType | "all">("all");
  const [items, setItems] = useState<PlateItem[]>([]);
  const [kcalTarget, setKcalTarget] = useState(650);
  const [proteinTarget, setProteinTarget] = useState(40);

  const visibleFoods = useMemo(() => {
    if (diet === "all") return foods;
    return foods.filter((f) => DIET_RANK[f.suitableFor] <= DIET_RANK[diet]);
  }, [diet]);

  const categories = useMemo(() => {
    const grouped = new Map<string, Food[]>();
    for (const food of visibleFoods) {
      const list = grouped.get(food.category) ?? [];
      list.push(food);
      grouped.set(food.category, list);
    }
    return [...grouped.entries()];
  }, [visibleFoods]);

  const totals = plateTotals(items);

  const add = (food: Food) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.food.name === food.name);
      if (existing) {
        return prev.map((item) =>
          item.food.name === food.name
            ? { ...item, portions: item.portions + 1 }
            : item,
        );
      }
      return [...prev, { food, portions: 1 }];
    });
  };

  const adjust = (name: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.food.name === name
            ? { ...item, portions: Math.max(0, item.portions + delta) }
            : item,
        )
        .filter((item) => item.portions > 0),
    );
  };

  const bar = (value: number, target: number) =>
    `${Math.min(100, Math.round((value / Math.max(1, target)) * 100))}%`;

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6 lg:grid lg:grid-cols-2 lg:gap-6">
      <div>
        <div className="flex flex-wrap gap-1.5">
          {DIET_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={diet === filter.id}
              onClick={() => setDiet(filter.id)}
              className={`rounded-full border-2 border-foreground px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                diet === filter.id ? "bg-good text-background" : "bg-background"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="mt-3 max-h-[26rem] space-y-4 overflow-y-auto pr-1">
          {categories.map(([category, list]) => (
            <div key={category}>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                {category}
              </p>
              <ul className="mt-1 space-y-1">
                {list.map((food) => (
                  <li key={food.name}>
                    <button
                      type="button"
                      onClick={() => add(food)}
                      className="flex w-full items-baseline justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-left text-sm hover:border-foreground"
                    >
                      <span className="font-medium">{food.name}</span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                        + {food.portion.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 lg:mt-0">
        <h2 className="font-display text-2xl uppercase">Your plate</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Tap foods on the left to start stacking. Portions are the typical
            servings from the food reference. Nudge them up or down per item.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {items.map((item) => (
              <li
                key={item.food.name}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.food.name}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {itemGrams(item)} g
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Less ${item.food.name}`}
                    onClick={() => adjust(item.food.name, -0.5)}
                    className="h-6 w-6 rounded-full border-2 border-foreground bg-surface font-bold leading-none"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono text-xs">
                    ×{item.portions}
                  </span>
                  <button
                    type="button"
                    aria-label={`More ${item.food.name}`}
                    onClick={() => adjust(item.food.name, 0.5)}
                    className="h-6 w-6 rounded-full border-2 border-foreground bg-surface font-bold leading-none"
                  >
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="scorecard mt-4 rounded-xl bg-foreground p-4 text-background">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background/70">
                Protein
              </p>
              <p className="font-display text-4xl uppercase tabular-nums text-primary-strong">
                <RollingNumber value={String(totals.proteinG)} />{" "}
                <span className="font-mono text-sm font-normal normal-case text-background/70">
                  g
                </span>
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background/70">
                Energy
              </p>
              <p className="font-display text-4xl uppercase tabular-nums text-primary-strong">
                <RollingNumber value={String(totals.kcal)} />{" "}
                <span className="font-mono text-sm font-normal normal-case text-background/70">
                  kcal
                </span>
              </p>
            </div>
            <p className="pb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-background/70">
              {totals.totalGrams} g on the plate
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-background/70">
                <span>Protein target</span>
                <span>
                  {totals.proteinG} / {proteinTarget} g
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-background/20">
                <div
                  className="h-full bg-fresh"
                  style={{ width: bar(totals.proteinG, proteinTarget) }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-background/70">
                <span>Meal energy target</span>
                <span>
                  {totals.kcal} / {kcalTarget} kcal
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-background/20">
                <div
                  className="h-full bg-primary-strong"
                  style={{ width: bar(totals.kcal, kcalTarget) }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">
            Protein target (g)
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={proteinTarget}
              onChange={(e) =>
                setProteinTarget(Math.max(1, Math.round(Number(e.target.value) || 0)))
              }
              className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm font-semibold">
            Energy target (kcal)
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={kcalTarget}
              onChange={(e) =>
                setKcalTarget(Math.max(1, Math.round(Number(e.target.value) || 0)))
              }
              className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Set meal targets by hand, or work them out from your day with the{" "}
          <Link
            href="/macro-calculator"
            className="text-primary underline underline-offset-2 hover:text-foreground"
          >
            macro calculator
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
