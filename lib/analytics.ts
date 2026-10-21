/**
 * Google Analytics 4 events (GA is loaded in app/layout.tsx).
 * Safe to call anywhere on the client: does nothing if GA isn't loaded.
 *
 * Mark these as "Key events" in GA4 → Admin → Events:
 *   post_ad_success, contact_whatsapp, contact_call, app_download_click
 */
type Params = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;

  let source: string | undefined;
  try {
    source = sessionStorage.getItem("mk_src") ?? undefined; // e.g. "facebook" (set when arriving from social)
  } catch {}

  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries({ ...params, arrived_from: params.arrived_from ?? source })) {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  }
  try {
    gtag("event", event, clean);
  } catch {}
}
