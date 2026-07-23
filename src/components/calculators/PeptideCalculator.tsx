"use client";

import { useId, useMemo, useState } from "react";
import {
  concentrationMgPerMl,
  drawVolumeMl,
  syringeUnits,
} from "@/lib/formulas/reconstitution";
import {
  PEPTIDE_DEFAULTS,
  PEPTIDE_LIMITS,
} from "@/registry/configs/peptide-reconstitution.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function PeptideCalculator() {
  const id = useId();
  const [vialText, setVialText] = useState(String(PEPTIDE_DEFAULTS.vialMg));
  const [diluentText, setDiluentText] = useState(String(PEPTIDE_DEFAULTS.diluentMl));
  const [doseText, setDoseText] = useState(String(PEPTIDE_DEFAULTS.doseMcg));

  const result = useMemo(() => {
    const vialMg = Number(vialText);
    const diluentMl = Number(diluentText);
    const doseMcg = Number(doseText);
    const valid =
      inRange(vialMg, PEPTIDE_LIMITS.vialMg) &&
      inRange(diluentMl, PEPTIDE_LIMITS.diluentMl) &&
      inRange(doseMcg, PEPTIDE_LIMITS.doseMcg);
    if (!valid) return null;
    const concentration = concentrationMgPerMl(vialMg, diluentMl);
    const ml = drawVolumeMl(doseMcg / 1000, concentration);
    if (ml > diluentMl) return { overdraw: true as const };
    return { overdraw: false as const, concentration, ml, units: syringeUnits(ml) };
  }, [vialText, diluentText, doseText]);

  return (
    <CalculatorShell>
      <form aria-label="Reconstitution inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-vial`} className={labelClass}>Vial contents (mg)</label>
            <input id={`${id}-vial`} type="number" inputMode="decimal" min={0.1} max={100} step="0.1" className={inputClass} value={vialText} onChange={(e) => setVialText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-diluent`} className={labelClass}>Diluent added (ml)</label>
            <input id={`${id}-diluent`} type="number" inputMode="decimal" min={0.1} max={10} step="0.1" className={inputClass} value={diluentText} onChange={(e) => setDiluentText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-dose`} className={labelClass}>Your prescribed dose (mcg)</label>
            <input id={`${id}-dose`} type="number" inputMode="decimal" min={1} max={20000} step="1" className={inputClass} value={doseText} onChange={(e) => setDoseText(e.target.value)} />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result && !result.overdraw ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your reconstitution arithmetic
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="peptide-units">
              {formatNumber(result.units, 1)}{" "}
              <span className="text-lg font-medium text-muted">U-100 units</span>
            </p>
            <p className="mt-1 text-lg">
              Draw volume:{" "}
              <span className="font-semibold" data-testid="peptide-ml">
                {formatNumber(result.ml, 3)} ml
              </span>{" "}
              · concentration:{" "}
              <span className="font-semibold" data-testid="peptide-concentration">
                {formatNumber(result.concentration, 2)} mg/ml
              </span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Arithmetic on the values you entered, nothing here is a dose
              recommendation. Verify every figure against your
              prescriber&rsquo;s instructions before drawing anything.
            </p>
          </div>
        ) : result?.overdraw ? (
          <p className="text-sm" role="alert">
            That dose needs more volume than the vial contains. Check the
            dose units (mcg vs mg) and your entries.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Enter the vial contents, diluent volume and your prescribed dose.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
