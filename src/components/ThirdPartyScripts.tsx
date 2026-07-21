"use client";

import Script from "next/script";
import { CONSENT_INFRA_ENABLED, useAdConsent } from "@/lib/consent";

/**
 * Env-flagged third-party loaders (SPEC §10). With all flags unset this
 * component renders nothing and the site makes zero third-party requests.
 * The consent bootstrap sets Consent Mode v2 defaults to DENIED before any
 * tag exists; GA4 and the ad script load only AFTER an explicit grant
 * (basic consent mode — strictest reading of SPEC §2). The CMP script,
 * when configured, loads unconditionally: it IS the consent tool.
 */
export function ThirdPartyScripts() {
  const consented = useAdConsent();
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const cmpUrl = process.env.NEXT_PUBLIC_CMP_SCRIPT_URL;
  const adsUrl = process.env.NEXT_PUBLIC_ADS_SCRIPT_URL;

  if (!CONSENT_INFRA_ENABLED && !cmpUrl) return null;

  return (
    <>
      {CONSENT_INFRA_ENABLED ? (
        // afterInteractive: rendered from a client component, and safe —
        // GA4 mounts only post-grant, always after this shim exists.
        <Script id="consent-default" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});`}
        </Script>
      ) : null}
      {cmpUrl ? <Script src={cmpUrl} strategy="afterInteractive" /> : null}
      {consented && ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`gtag('js',new Date());gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('config','${ga4Id}');`}
          </Script>
        </>
      ) : null}
      {consented && adsUrl ? <Script src={adsUrl} strategy="lazyOnload" /> : null}
    </>
  );
}
