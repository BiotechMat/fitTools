/**
 * Transactional auth email (ACCOUNTS.md §5.3 — Resend, via fetch: no SDK
 * dependency, same posture as the Pulse generator). Server-only.
 *
 * Degradation: with no RESEND_API_KEY the magic-link email cannot send — in
 * production that surfaces as an error (login genuinely unavailable, better
 * loud than silent); outside production the link is logged to the server
 * console so the flow is testable end-to-end with zero provisioning.
 */

import { SITE_NAME } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
/** Verified sender — becomes real at A0 domain authentication (SPF/DKIM). */
const FROM = process.env.AUTH_EMAIL_FROM ?? "FitTools <sign-in@tools.fit>";

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured — magic-link email cannot send");
    }
    console.info(`[auth] magic link for ${email}: ${url}`);
    return;
  }
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: `Sign in to ${SITE_NAME}`,
      text: [
        `Sign in to ${SITE_NAME}`,
        "",
        "Use this link to sign in. It works once and expires in 15 minutes.",
        "",
        url,
        "",
        "If you didn't request this, you can safely ignore this email —",
        "no account is created and nothing changes without the link.",
      ].join("\n"),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 200)}`);
  }
}
