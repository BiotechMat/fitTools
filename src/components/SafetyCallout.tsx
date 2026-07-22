import type { ReactNode } from "react";

/**
 * Safety / legality callout (CONTENT.md §5, CONTENT-peptides.md §4).
 * A visually distinct, mandatory box on every physiological-intervention or
 * peptide page. Reusable so it can't be forgotten. `title` and `children`
 * let each cluster state its specific risks; the peptide variant is provided
 * below.
 */
export function SafetyCallout({
  title = "Safety & legality",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      aria-label={title}
      data-testid="safety-callout"
      className="rounded-lg border-2 border-warning-border bg-warning-bg p-4 text-sm"
    >
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-1 space-y-2">{children}</div>
    </aside>
  );
}

/** Cold water immersion safety box (CONTENT.md §5). */
export function ColdWaterSafetyCallout() {
  return (
    <SafetyCallout title="Safety — cold water immersion">
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Cold immersion is a strong stressor on the heart and circulation.
          The <strong>cold-shock response</strong> (gasping, spiking heart
          rate and blood pressure) is the main acute danger, especially in
          very cold water.
        </li>
        <li>
          Be cautious or avoid it with <strong>heart conditions,
          uncontrolled high blood pressure, or during pregnancy</strong>, and{" "}
          <strong>never immerse alone or after alcohol</strong>.
        </li>
        <li>Enter gradually, keep sessions short, and get out at any warning sign.</li>
        <li>Consult a doctor before starting if you have any medical condition or are pregnant.</li>
      </ul>
    </SafetyCallout>
  );
}

/** Sauna safety box (CONTENT.md §5). */
export function SaunaSafetyCallout() {
  return (
    <SafetyCallout title="Safety — sauna use">
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The main risks are <strong>overheating, dehydration and
          fainting</strong>. Hydrate before and after, and don&rsquo;t stay
          in longer than feels comfortable.
        </li>
        <li>
          Be cautious or avoid it with <strong>certain cardiovascular
          conditions, unstable angina, recent heart attack, or during
          pregnancy</strong>, and <strong>never combine sauna with
          alcohol</strong>.
        </li>
        <li>Cool down gradually and stand up slowly to avoid dizziness.</li>
        <li>Consult a doctor before starting if you have any medical condition or are pregnant.</li>
      </ul>
    </SafetyCallout>
  );
}

/** The standard peptides safety/legality box (CONTENT-peptides.md §4). */
export function PeptideSafetyCallout() {
  return (
    <SafetyCallout title="Safety & legality — read this">
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Most compounds discussed here are <strong>not approved medicines</strong>{" "}
          for fitness, physique or anti-ageing use.
        </li>
        <li>
          When sold as “research chemicals” they are made{" "}
          <strong>outside pharmaceutical quality control</strong> — purity,
          dose accuracy and contamination cannot be assumed.
        </li>
        <li>
          For most, there is <strong>limited or no long-term human safety
          data</strong>.
        </li>
        <li>
          Several are <strong>prohibited in sport</strong> under the WADA code.
        </li>
        <li>
          This page is educational and is <strong>not medical advice</strong>.
          Speak to a qualified clinician before considering anything that
          affects your health.
        </li>
      </ul>
    </SafetyCallout>
  );
}
