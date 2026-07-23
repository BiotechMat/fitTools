"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type EvidenceGrade, GRADE_LABELS } from "@/registry/peptides";
import { type SupplementEntry, supplementsByGrade } from "@/registry/supplements";
import { EvidenceTier } from "@/components/EvidenceTier";

/**
 * Supplement evidence explorer (MICROTOOLS.md §6): the whole supplement
 * registry laid out on the medal ladder — a board, deliberately not a scatter,
 * because the registry records evidence grade, not effect sizes, and we don't
 * invent numbers. Pure presentation over `supplementsByGrade()`.
 */

const GRADE_BLURBS: Record<EvidenceGrade, string> = {
  gold: "Strong, replicated human evidence behind the headline claim.",
  silver: "Real but limited human evidence — promising, not settled.",
  bronze: "Early or animal-only evidence; a lead, not a result.",
  unproven: "Sold hard, shown little — human evidence weak or absent.",
  "not-supported": "The evidence actively points the other way.",
};

export function SupplementExplorer() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const grades = useMemo(() => supplementsByGrade(), []);

  const matches = (entry: SupplementEntry) => {
    if (query.trim() === "") return true;
    const q = query.trim().toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      (entry.aka ?? []).some((alias) => alias.toLowerCase().includes(q)) ||
      entry.short.toLowerCase().includes(q)
    );
  };

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6">
      <label className="block text-sm font-semibold">
        Search the shelf
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="creatine, ashwagandha, fat burner…"
          className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base"
        />
      </label>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {grades.map(([grade, entries]) => {
          const visible = entries.filter(matches);
          return (
            <section key={grade} aria-label={GRADE_LABELS[grade]}>
              <div className="rounded-t-xl border-2 border-foreground bg-background p-3">
                <h2 className="font-display text-xl uppercase">
                  {GRADE_LABELS[grade]}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {GRADE_BLURBS[grade]}
                </p>
              </div>
              <ul className="space-y-2 rounded-b-xl border-2 border-t-0 border-border p-2">
                {visible.length === 0 ? (
                  <li className="p-2 text-sm text-muted">
                    Nothing here matches &ldquo;{query}&rdquo;.
                  </li>
                ) : (
                  visible.map((entry) => {
                    const isOpen = open === entry.slug;
                    return (
                      <li key={entry.slug}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : entry.slug)}
                          className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold ${
                            isOpen
                              ? "border-foreground bg-primary-soft"
                              : "border-border bg-background hover:border-foreground"
                          }`}
                        >
                          {entry.name}
                          {entry.safety ? (
                            <span
                              className="ml-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary"
                              title="Has a safety callout"
                            >
                              · safety note
                            </span>
                          ) : null}
                        </button>
                        {isOpen ? (
                          <div className="mt-1 rounded-lg border-2 border-foreground bg-surface p-3">
                            <EvidenceTier
                              tier={entry.headlineTier}
                              basis={entry.headlineBasis}
                            />
                            <p className="mt-2 text-sm">{entry.short}</p>
                            {entry.safety ? (
                              <p className="mt-2 text-xs font-semibold text-primary">
                                ⚠ {entry.safety.title}
                              </p>
                            ) : null}
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                              {entry.sources.length} cited{" "}
                              {entry.sources.length === 1 ? "source" : "sources"}
                            </p>
                            <Link
                              href={`/supplements/${entry.slug}`}
                              className="riso-press [--riso:2px] mt-2 inline-block rounded-full border-2 border-foreground bg-good px-4 py-1.5 text-sm font-bold text-background"
                            >
                              Full review →
                            </Link>
                          </div>
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
