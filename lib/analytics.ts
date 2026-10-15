"use client";

/** Send a GA4 event only on the MYKSA CONNECT website. */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  parameters: Record<string, string | number | boolean | undefined> = {}
) {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_SITE_MODE !== "ksaconnect") return;
  if (typeof window.gtag !== "function") return;

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined)
  );
  window.gtag("event", eventName, safeParameters);
}
