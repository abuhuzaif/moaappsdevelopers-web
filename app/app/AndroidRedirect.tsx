"use client";

import { useEffect } from "react";

/** On Android phones, open Google Play straight away (link previews and
 *  other devices still see the landing page). */
export default function AndroidRedirect({ url }: { url: string }) {
  useEffect(() => {
    if (/android/i.test(navigator.userAgent)) {
      const t = setTimeout(() => window.location.replace(url), 400);
      return () => clearTimeout(t);
    }
  }, [url]);
  return null;
}
