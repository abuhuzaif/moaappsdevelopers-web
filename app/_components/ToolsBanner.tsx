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

export default function ToolsBanner() {
  const pathname = usePathname();
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);

  useEffect(() => {
    if (!pathname?.startsWith("/tools")) return;

    // Some dedicated Everyday Saudi Tools render their banner inside the
    // calculator component. Only add the shared banner when the page does
    // not already contain one, preventing duplicate banners.
    const hasInlineBanner = Boolean(
      document.querySelector('img[src="/images/myksa-tools-banner.png"]')
    );
    setShowFallbackBanner(!hasInlineBanner);

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
  if (DEDICATED_TOOL_SLUGS.has(slug) && !showFallbackBanner) return null;

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
        src="/images/myksa-tools-banner.png"
        alt="MYKSA CONNECT Saudi Expat Tools"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}
