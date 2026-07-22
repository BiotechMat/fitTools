/**
 * Consent state (SPEC §2, §10). Until the Google-certified CMP lands in M3,
 * consent is always denied — matching the Consent Mode v2 default for
 * UK/EEA. AdSlot and analytics gate on this, so nothing third-party can fire
 * before M3 wires up the real CMP signal.
 */
export function hasAdConsent(): boolean {
  return false;
}
