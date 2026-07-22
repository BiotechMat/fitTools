/**
 * Medical disclaimer rendered on every tool page (SPEC §2, §11). Never
 * soften or remove this component to simplify a page.
 */
export function DisclaimerBanner() {
  return (
    <aside
      role="note"
      aria-label="Medical disclaimer"
      data-testid="disclaimer-banner"
      className="rounded-lg border border-warning-border bg-warning-bg p-4 text-sm"
    >
      <h2 className="font-semibold">Medical disclaimer</h2>
      <p className="mt-1">
        This tool provides estimates for general information and education
        only. It is not medical advice, diagnosis or treatment, and it is not
        a substitute for the judgement of a qualified health professional.
        Consult your GP or another qualified clinician before making changes
        to your diet, exercise or health regimen.
      </p>
    </aside>
  );
}
