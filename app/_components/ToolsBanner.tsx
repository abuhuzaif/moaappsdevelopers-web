"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RatingBadge, RatingPrompt, hasRated, cardStyle, btnStyle, closeStyle } from "./ToolRating";

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

// ── After a tool is used: ask for a rating first, then (if happy) show the app card ──
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect&referrer=utm_source%3Dmyksaconnect%26utm_medium%3Dtool_done%26utm_campaign%3Dapp_promo";
const HIDE_KEY = "mk_app_promo_hidden_until";

function track(name: string, params: Record<string, unknown>) {
  try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", name, params); } catch {}
}

function appPromoAllowed() {
  const ua = navigator.userAgent;
  if (/KSAConnectApp/i.test(ua)) return false;      // already inside our app
  if (/iPhone|iPad|iPod/i.test(ua)) return false;   // Android app only (no iOS app yet)
  try { if (Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now()) return false; } catch {}
  return true;
}

function ToolExtras() {
  const pathname = usePathname();
  const slug = pathname?.startsWith("/tools/") ? pathname.replace(/^\/tools\//, "").split("/")[0] : "";
  const [phase, setPhase] = useState<null | "rate" | "app" | "thanks">(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setPhase(null);
    if (!slug) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const done = () => {
      if (timer) return;
      timer = setTimeout(() => {
        if (!hasRated(slug)) setPhase("rate");
        else if (appPromoAllowed()) setPhase("app");
      }, 1200); // let the download start first
    };
    // Tools download their result with <a download>…</a>.click(), so a click on a download link = tool used.
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("a[download]")) done();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timer) clearTimeout(timer);
    };
  }, [slug]);

  if (!slug || slug === "converters" || slug === "cad") return null;

  const closeApp = (days: number) => {
    setPhase(null);
    try { localStorage.setItem(HIDE_KEY, String(Date.now() + days * 86400000)); } catch {}
  };

  return (
    <>
      <RatingBadge slug={slug} refreshKey={refresh} onRate={() => setPhase("rate")} />

      {phase === "rate" && (
        <RatingPrompt
          slug={slug}
          onClose={() => setPhase(null)}
          onDone={(stars) => {
            setRefresh((n) => n + 1);
            setPhase(stars >= 4 && appPromoAllowed() ? "app" : "thanks");
            if (stars < 4) setTimeout(() => setPhase(null), 2500);
          }}
        />
      )}

      {phase === "thanks" && (
        <div role="status" style={cardStyle}>
          <span aria-hidden style={{ fontSize: 24 }}>🙏</span>
          <strong style={{ flex: 1, fontSize: 14 }}>Thank you! Your feedback helps us improve.</strong>
        </div>
      )}

      {phase === "app" && (
        <div role="dialog" aria-label="Get the MYKSA Connect app" style={cardStyle}>
          <span aria-hidden style={{ fontSize: 26 }}>📱</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4 }}>
            <strong style={{ display: "block", fontSize: 14 }}>Thanks! Get the MYKSA Connect app</strong>
            Free tools, ads &amp; restaurant menus — always on your phone.
          </span>
          <a href={PLAY_URL} target="_blank" rel="noopener" onClick={() => { track("app_promo_click", { tool: slug }); closeApp(30); }} style={btnStyle}>
            ▶ Google Play
          </a>
          <button type="button" aria-label="Close" onClick={() => { track("app_promo_close", { tool: slug }); closeApp(7); }} style={closeStyle}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default function ToolsBanner() {
  return (
    <>
      <ToolsTopBanner />
      <ToolExtras />
    </>
  );
}
