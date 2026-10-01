"use client";

import { usePathname } from "next/navigation";

const GIS_TOOL_SLUGS = new Set([
  "shp-to-kml",
  "kml-to-shp",
  "shp-to-geojson",
  "geojson-to-kml",
  "csv-to-kml",
  "kml-to-csv",
  "dxf-to-kml",
  "kml-to-dxf",
  "latlon-to-utm",
  "utm-to-latlon",
]);

export default function ToolsBanner() {
  const pathname = usePathname();

  if (!pathname?.startsWith("/tools")) return null;

  // GIS/Engineering tool pages already render this banner inside their page layout.
  // Keep one copy there instead of showing a duplicate from the root layout.
  const parts = pathname.replace(/^\/tools\/?/, "").split("/").filter(Boolean);
  const slug = parts[0] || "";
  if (GIS_TOOL_SLUGS.has(slug)) return null;

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
