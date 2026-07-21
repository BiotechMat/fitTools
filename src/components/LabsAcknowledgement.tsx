"use client";

import { type ReactNode, useState, useSyncExternalStore } from "react";
import { LABS_ACK_KEY } from "@/registry/configs/peptide-reconstitution.shared";

/**
 * Enhanced-disclaimer acknowledgement gate for /labs/ tools (SPEC §7):
 * the calculator stays hidden until the visitor actively acknowledges the
 * disclaimer once; the flag persists in localStorage.
 */

const CHANGE_EVENT = "fittools:labs-ack-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function LabsAcknowledgement({ children }: { children: ReactNode }) {
  const acknowledged = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(LABS_ACK_KEY) === "true",
    () => false,
  );
  const [checked, setChecked] = useState(false);

  if (acknowledged) return <>{children}</>;

  return (
    <section
      aria-label="Acknowledgement required"
      data-testid="labs-ack-gate"
      className="rounded-xl border border-warning-border bg-warning-bg p-6"
    >
      <h2 className="text-lg font-bold">Before you use this tool</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>
          This tool performs arithmetic only, on values you supply. It
          contains no compound information and makes no dosing suggestions.
        </li>
        <li>
          It is not medical advice and must not substitute for the
          instructions of your prescriber or pharmacist.
        </li>
        <li>
          Unregulated substances carry real risks. If a licensed clinician
          has not prescribed what you are preparing, speak to one first.
        </li>
      </ul>
      <label className="mt-4 flex items-start gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={checked}
          data-testid="labs-ack-checkbox"
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-[var(--primary)]"
        />
        I have read and understood the above.
      </label>
      <button
        type="button"
        disabled={!checked}
        data-testid="labs-ack-continue"
        onClick={() => {
          window.localStorage.setItem(LABS_ACK_KEY, "true");
          window.dispatchEvent(new Event(CHANGE_EVENT));
        }}
        className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:opacity-50"
      >
        Continue to the calculator
      </button>
    </section>
  );
}
