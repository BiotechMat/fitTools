"use client";

import { useState } from "react";
import { isEmbeddable } from "@/lib/embed/embeddable";
import { SITE_URL } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

/**
 * "Embed this calculator" copy-code block (SPEC §9). Rendered only for
 * tools with a React-free embed build; copying emits embed_copied.
 */
export function EmbedCode({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  if (!isEmbeddable(slug)) return null;

  const snippet = `<iframe src="${SITE_URL}/embed/${slug}" width="440" height="420" style="border:0;max-width:100%" title="Calculator by FitTools" loading="lazy"></iframe>`;

  return (
    <section aria-label="Embed this calculator" className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Embed this calculator</h2>
      <p className="mt-1 text-xs text-muted">
        Free to embed with the attribution link intact.
      </p>
      <pre className="mt-2 overflow-x-auto rounded border border-border bg-background p-2 text-xs">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        data-testid="copy-embed"
        className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
        onClick={async () => {
          await navigator.clipboard.writeText(snippet);
          setCopied(true);
          trackEvent({ name: "embed_copied", params: { tool: slug } });
        }}
      >
        {copied ? "Copied ✓" : "Copy code"}
      </button>
    </section>
  );
}
