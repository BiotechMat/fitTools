/**
 * Body-image support signpost (CONTENT-looksmaxxing §1.3, §2.3, §6.3). A calm,
 * care-register panel — not a disclaimer, not gamified — that sits in the
 * glow-up section so an anxious reader is always one click from real help.
 * De-escalation over engagement: this is deliberately here to send someone
 * away safely, not to keep them scrolling.
 */
export function BodyImageResources() {
  return (
    <aside
      data-testid="body-image-resources"
      aria-labelledby="body-image-resources-title"
      className="rounded-2xl border-2 border-good bg-good-soft p-4 text-sm text-foreground"
    >
      <h2 id="body-image-resources-title" className="font-display text-lg uppercase text-good">
        Worried about how you look?
      </h2>
      <p className="mt-2 max-w-prose">
        If thoughts about your appearance, weight or eating are taking up a lot
        of headspace, that&rsquo;s worth talking to someone about, it&rsquo;s
        common, and support helps. You don&rsquo;t need to be &ldquo;bad
        enough&rdquo; to reach out.
      </p>
      <ul className="mt-3 space-y-1">
        <li>
          <span className="font-semibold">Beat</span> (UK eating-disorder
          charity),{" "}
          <a
            href="https://www.beateatingdisorders.org.uk/get-information-and-support/"
            rel="noopener noreferrer"
            className="text-good underline underline-offset-2"
          >
            information &amp; helplines
          </a>
        </li>
        <li>
          <span className="font-semibold">NEDA</span> (US National Eating
          Disorders Association),{" "}
          <a
            href="https://www.nationaleatingdisorders.org/get-help/"
            rel="noopener noreferrer"
            className="text-good underline underline-offset-2"
          >
            get help &amp; screening
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted">
        If you&rsquo;re in immediate distress, contact your local emergency
        services or a crisis line.
      </p>
    </aside>
  );
}
