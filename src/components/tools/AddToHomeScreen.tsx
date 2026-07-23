"use client";

import { useEffect, useState } from "react";

/**
 * "Add to home screen" affordance for the micro-tools. iOS has no install
 * API, so there the link reveals the two-tap route (Share → Add to Home
 * Screen) — the manifest (no start_url) makes the saved page open
 * app-like at exactly this tool. Chromium browsers get the real install
 * prompt via beforeinstallprompt. Hidden when already installed or when
 * neither path applies, so desktop pages stay clean.
 */

// beforeinstallprompt isn't in the TS DOM lib yet — minimal local shape.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function AddToHomeScreen({ toolName }: { toolName: string }) {
  const [ios, setIos] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true); // iOS-only field, absent from the DOM lib
    if (standalone) return;
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if ("prompt" in e && typeof (e as InstallPromptEvent).prompt === "function") {
        // Narrowed by the runtime check above.
        setInstallEvent(e as InstallPromptEvent);
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!ios && !installEvent) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          if (installEvent) {
            void installEvent.prompt();
          } else {
            setShowSteps((s) => !s);
          }
        }}
        className="riso-press [--riso:2px] inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-surface px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
      >
        <span aria-hidden="true">＋</span> Add {toolName} to your home screen
      </button>
      {showSteps ? (
        <div className="mt-2 max-w-sm rounded-xl border-2 border-foreground bg-good-soft p-3 text-sm">
          <p className="font-semibold">Two taps in Safari:</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>
              Tap the <strong>Share</strong> button (the square with the arrow).
            </li>
            <li>
              Choose <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </li>
          </ol>
          <p className="mt-1.5 text-xs text-muted">
            The {toolName.toLowerCase()} then opens full-screen from its own
            icon, like an app — no browser chrome, no App Store.
          </p>
        </div>
      ) : null}
    </div>
  );
}
