"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DEDICATED_TOOL_SLUGS = new Set([
  "acre-hectare-square-meter-converter",
  "age-calculator",
  "annual-leave-calculator",
  "bmi-calculator",
  "cad",
  "compress-pdf",
  "converters",
  "csv-to-kml",
  "days-between-dates",
  "dwg-to-dxf",
  "dwg-to-pdf",
  "dwg-to-svg",
  "dxf-to-kml",
  "dxf-to-svg",
  "end-of-service-calculator",
  "feet-inches-centimeter-converter",
  "final-settlement-calculator",
  "fuel-cost-calculator",
  "gaz-square-meter-converter",
  "geojson-to-kml",
  "gosi-calculator",
  "hijri-gregorian-converter",
  "iqama-expiry-calculator",
  "kml-to-csv",
  "kml-to-dxf",
  "kml-to-shp",
  "latlon-to-utm",
  "loan-emi-calculator",
  "marla-converter",
  "merge-pdf",
  "overtime-calculator",
  "pdf-ocr",
  "pdf-to-jpg",
  "pdf-to-word",
  "percentage-calculator",
  "rent-split-calculator",
  "salary-calculator",
  "sar-currency-converter",
  "saudi-vat-calculator",
  "shp-to-geojson",
  "shp-to-kml",
  "sign-pdf",
  "split-pdf",
  "square-feet-square-meter-converter",
  "travel-currency-calculator",
  "utm-to-latlon",
  "vat-calculator",
  "working-hours-calculator",
  "zakat-calculator",
]);

/**
 * Tools made for life in Saudi Arabia keep the "Saudi Expat Tools" banner.
 * Every other tool (PDF, CAD, GIS, images, unit converters, BMI, age, EMI…) is used
 * worldwide: no Saudi banner and a neutral "Free Online Tools" breadcrumb, so visitors
 * (and Google) see a tool for everyone.
 */
const SAUDI_TOOL_SLUGS = new Set([
  "iqama-expiry-calculator",
  "hijri-gregorian-converter",
  "salary-calculator",
  "sar-currency-converter",
  "rent-split-calculator",
  "end-of-service-calculator",
  "gosi-calculator",
  "overtime-calculator",
  "annual-leave-calculator",
  "final-settlement-calculator",
  "saudi-vat-calculator",
  "vat-calculator",
  "fuel-cost-calculator",
  "zakat-calculator",
]);

// Worldwide tools get the world skyline banner ("Tools for Everyone"); Saudi tools keep the Saudi one.
const WORLD_BANNER = "/images/myksa-tools-banner-world.webp";
const WORLD_ALT = "MYKSA CONNECT free online tools for everyone — PDF, image, CAD and GIS converters and calculators";

function ToolsTopBanner() {
  const pathname = usePathname();
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);

  useEffect(() => {
    if (!pathname?.startsWith("/tools")) return;

    // Some dedicated Everyday Saudi Tools render their banner inside the
    // calculator component. Only add the shared banner when the page does
    // not already contain one, preventing duplicate banners.
    const slugNow = pathname.replace(/^\/tools\/?/, "").split("/")[0] || "";
    const saudi = SAUDI_TOOL_SLUGS.has(slugNow);

    if (!saudi && slugNow) {
      // Worldwide tool: swap a Saudi banner that a tool component renders itself for the
      // world banner, and rename the "Saudi Expat Tools" breadcrumb link.
      const inline = document.querySelectorAll<HTMLImageElement>('img[src="/images/myksa-tools-banner.png"]');
      inline.forEach((img) => {
        img.src = WORLD_BANNER;
        img.alt = WORLD_ALT;
      });
      document.querySelectorAll<HTMLAnchorElement>('a[href="/tools"], a[href="/tools/"]').forEach((a) => {
        if (a.textContent?.trim() === "Saudi Expat Tools") a.textContent = "Free Online Tools";
      });
      setShowFallbackBanner(inline.length === 0 && !document.querySelector(`img[src="${WORLD_BANNER}"]`));
    } else {
      const hasInlineBanner = Boolean(
        document.querySelector('img[src="/images/myksa-tools-banner.png"]')
      );
      setShowFallbackBanner(!hasInlineBanner);
    }

    // Keep the public tool name simple: Currency Converter.
    document.querySelectorAll("body *").forEach((element) => {
      if (element.childElementCount === 0 && element.textContent?.trim() === "SAR Currency Converter") {
        element.textContent = "Currency Converter";
      }
    });
  }, [pathname]);

  if (!pathname?.startsWith("/tools")) return null;

  const parts = pathname.replace(/^\/tools\/?/, "").split("/").filter(Boolean);
  const slug = parts[0] || "";
  if (!slug) return null;

  // Dedicated tool pages normally render their own banner. If a page is
  // missing it, show one here as a safe fallback. This keeps every tool page
  // branded while avoiding the duplicate-banner problem.
  const saudi = SAUDI_TOOL_SLUGS.has(slug);
  if (DEDICATED_TOOL_SLUGS.has(slug) && !showFallbackBanner) return null;
  if (!saudi && !showFallbackBanner) return null;

  return (
    <div
      style={{
        width: "calc(100% - 40px)",
        maxWidth: 900,
        margin: "24px auto 0",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #dfe7e3",
        boxShadow: "0 10px 30px rgba(6,23,42,.08)",
      }}
    >
      <img
        src={saudi ? "/images/myksa-tools-banner.png" : WORLD_BANNER}
        alt={saudi ? "MYKSA CONNECT Saudi Expat Tools" : WORLD_ALT}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}

// ── "Get the app" card, shown once a tool has done its job (a file was downloaded) ──
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect&referrer=utm_source%3Dmyksaconnect%26utm_medium%3Dtool_done%26utm_campaign%3Dapp_promo";
const HIDE_KEY = "mk_app_promo_hidden_until";

function AppPromo() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    if (!pathname?.startsWith("/tools/")) return;
    const ua = navigator.userAgent;
    if (/KSAConnectApp/i.test(ua)) return;          // already inside our app
    if (/iPhone|iPad|iPod/i.test(ua)) return;       // Android app only (no iOS app yet)
    try {
      if (Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now()) return;
    } catch {}

    let timer: ReturnType<typeof setTimeout> | undefined;
    const done = () => {
      if (timer) return;
      timer = setTimeout(() => setShow(true), 1200);  // let the download start first
    };
    // Tools download their result with <a download>…</a>.click(), so a click on a download link = tool used.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[download]");
      if (a) done();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  if (!show) return null;

  const close = (days: number) => {
    setShow(false);
    try { localStorage.setItem(HIDE_KEY, String(Date.now() + days * 86400000)); } catch {}
  };
  const track = (name: string) => {
    try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", name, { tool: pathname }); } catch {}
  };

  return (
    <div
      role="dialog"
      aria-label="Get the MYKSA Connect app"
      style={{
        position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)", zIndex: 1000,
        width: "min(460px, calc(100% - 24px))", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 16, background: "linear-gradient(135deg,#0c1730,#005744)",
        color: "#fff", border: "1px solid rgba(246,185,31,.6)", boxShadow: "0 14px 34px rgba(0,0,0,.28)",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <span aria-hidden style={{ fontSize: 26 }}>✅</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4 }}>
        <strong style={{ display: "block", fontSize: 14 }}>Done! Get the MYKSA Connect app</strong>
        Free tools, ads &amp; restaurant menus — always on your phone.
      </span>
      <a
        href={PLAY_URL}
        target="_blank"
        rel="noopener"
        onClick={() => { track("app_promo_click"); close(30); }}
        style={{
          flex: "0 0 auto", padding: "9px 12px", borderRadius: 10, background: "#f6b91f", color: "#0c1730",
          fontWeight: 900, fontSize: 12.5, textDecoration: "none", whiteSpace: "nowrap",
        }}
      >
        ▶ Google Play
      </a>
      <button
        type="button"
        aria-label="Close"
        onClick={() => { track("app_promo_close"); close(7); }}
        style={{ flex: "0 0 auto", background: "none", border: 0, color: "#fff", opacity: 0.75, fontSize: 18, cursor: "pointer", padding: 4 }}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToolsBanner() {
  return (
    <>
      <ToolsTopBanner />
      <AppPromo />
    </>
  );
}
