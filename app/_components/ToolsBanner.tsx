"use client";

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

  if (!pathname?.startsWith("/tools")) return null;

  // /tools has its own directory hero. Dedicated tool pages also render
  // their own banner inside their page component. The shared banner is only
  // needed for the generic dynamic converter pages under /tools/[slug].
  const parts = pathname.replace(/^\/tools\/?/, "").split("/").filter(Boolean);
  const slug = parts[0] || "";
  if (!slug) return null;
  if (DEDICATED_TOOL_SLUGS.has(slug)) return null;

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
