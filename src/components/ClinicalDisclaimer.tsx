/**
 * Clinical-input disclaimer (METHODOLOGY.md §1.5, §3.1). Rendered above
 * the calculator on tools that take blood-panel or blood-pressure values.
 * Stronger than the standard footer disclaimer: it states plainly that the
 * result is an estimate, not a substitute for medical assessment, and to
 * discuss it with a clinician. Never softened or removed.
 */
export function ClinicalDisclaimer() {
  return (
    <aside
      role="note"
      aria-label="Clinical disclaimer"
      data-testid="clinical-disclaimer"
      className="rounded-xl border-2 border-warning-border bg-warning-bg p-4 text-sm"
    >
      <h2 className="font-semibold">This uses clinical inputs — read first</h2>
      <p className="mt-1">
        This tool estimates a research-based score from blood-test values you
        enter. It is <strong>not a diagnosis, not a medical test, and not a
        substitute for assessment by a qualified clinician</strong>. The
        result is a population-level association, not a prediction about you,
        and it should never be used to start, stop or change any treatment.
        Discuss your blood results and what they mean with your GP or another
        qualified health professional.
      </p>
    </aside>
  );
}
