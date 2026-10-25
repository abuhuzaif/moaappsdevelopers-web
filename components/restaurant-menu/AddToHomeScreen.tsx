"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * Small bar on restaurant menus: "Add <name> menu to your home screen".
 * Android (Chrome): one tap installs it like an app.
 * iPhone (Safari): shows the 2-step Share → "Add to Home Screen" tip.
 * Comes back on every new visit (e.g. every QR scan) until the menu is added
 * to the home screen. "×" only hides it for the current visit.
 * Never shown when the menu is opened from the home-screen icon.
 */
export default function AddToHomeScreen({ name, logoUrl, slug }: { name: string; logoUrl?: string; slug: string }) {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const dismissKey = `a2hs-dismissed-${slug}`; // this visit only (sessionStorage)
  const installedKey = `a2hs-installed-${slug}`; // set when Chrome confirms the install

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    try {
      if (localStorage.getItem(installedKey)) return; // already on the home screen
      if (sessionStorage.getItem(dismissKey)) return; // closed during this visit
    } catch {}

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    const isAndroid = /android/i.test(ua);
    if (!isIos && !isAndroid) return; // phones only

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      try { localStorage.setItem(installedKey, String(Date.now())); } catch {}
      setShow(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Came from the table QR → ask sooner; otherwise after they've looked at the menu.
    const fromQr = new URLSearchParams(window.location.search).get("utm_source") === "qr";
    const timer = setTimeout(() => { setIos(isIos); setShow(true); }, fromQr ? 3000 : 6000);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, [dismissKey, installedKey]);

  if (!show) return null;

  const close = () => {
    setShow(false);
    try { sessionStorage.setItem(dismissKey, "1"); } catch {}
  };

  const add = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice.catch(() => ({ outcome: "dismissed" }));
      if (choice.outcome === "accepted") {
        try { localStorage.setItem(installedKey, String(Date.now())); } catch {}
      }
      setDeferred(null);
      setShow(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Add menu to home screen"
      style={{
        position: "fixed", left: 12, right: 12, bottom: "calc(12px + env(safe-area-inset-bottom, 0px))", zIndex: 60,
        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16,
        background: "#0c1730", color: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,.35)", border: "1px solid #d4a017",
        maxWidth: 520, margin: "0 auto",
      }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" width={44} height={44} style={{ borderRadius: 10, background: "#fff", objectFit: "contain", flex: "none" }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f6b91f", flex: "none" }} />
      )}
      <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.35 }}>
        <strong style={{ display: "block", fontSize: 14.5 }}>Add {name} to your home screen</strong>
        {deferred ? (
          <span style={{ opacity: 0.85 }}>Open the menu next time with one tap — no QR needed.</span>
        ) : ios ? (
          <span style={{ opacity: 0.85 }}>Tap <b>Share</b> <span aria-hidden="true">⬆️</span> then <b>“Add to Home Screen”</b>.</span>
        ) : (
          <span style={{ opacity: 0.85 }}>Tap the browser menu <b>⋮</b> then <b>“Add to Home screen”</b>.</span>
        )}
      </div>
      {deferred && (
        <button
          type="button"
          onClick={add}
          style={{ border: 0, borderRadius: 10, padding: "9px 14px", background: "#f6b91f", color: "#0c1730", fontWeight: 900, cursor: "pointer", flex: "none" }}
        >
          Add
        </button>
      )}
      <button
        type="button"
        onClick={close}
        aria-label="Not now"
        style={{ border: 0, background: "transparent", color: "#fff", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: 4, flex: "none" }}
      >
        ×
      </button>
    </div>
  );
}
