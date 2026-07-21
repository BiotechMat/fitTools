import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description:
    "FitTools calculators provide estimates for general information and education only — they are not medical advice.",
  alternates: { canonical: "/legal/medical-disclaimer" },
};

export default function MedicalDisclaimerPage() {
  return (
    <article className="prose">
      <h1 className="text-2xl font-bold sm:text-3xl">Medical disclaimer</h1>
      <p className="mt-1 text-sm text-muted">Last updated: 21 July 2026</p>
      <p>
        FitTools provides calculators and editorial content for general
        information and education only. Nothing on this site is medical
        advice, diagnosis or treatment, and nothing here creates a
        clinician–patient relationship.
      </p>
      <h2>Estimates, not measurements</h2>
      <p>
        Every result on this site is an estimate produced by a published
        formula. Formulas describe population averages; individual results
        routinely differ. We show error bands and limitations wherever the
        underlying research provides them, and we encourage you to read
        them.
      </p>
      <h2>Speak to a professional</h2>
      <p>
        Consult your GP or another qualified health professional before
        changing your diet, exercise, sleep or supplement regimen —
        especially if you are pregnant, under 18, have a medical condition,
        take medication, or have a history of disordered eating. Never
        disregard professional medical advice, or delay seeking it, because
        of something you read on this site.
      </p>
      <h2>Emergencies</h2>
      <p>
        If you think you have a medical emergency, call 999 (UK), 911 (US)
        or your local emergency number immediately. For urgent but
        non-emergency health concerns in the UK, contact NHS 111.
      </p>
    </article>
  );
}
