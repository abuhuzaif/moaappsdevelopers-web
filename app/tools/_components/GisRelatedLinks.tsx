import Link from "next/link";

const GROUPS: Record<string, Array<[string, string]>> = {
  "kml-to-shp": [["KML → CSV", "/tools/kml-to-csv/"], ["KML → DXF", "/tools/kml-to-dxf/"], ["GeoJSON → KML", "/tools/geojson-to-kml/"], ["SHP → KML", "/tools/shp-to-kml/"], ["SHP → GeoJSON", "/tools/shp-to-geojson/"]],
  "kml-to-csv": [["KML → SHP", "/tools/kml-to-shp/"], ["KML → DXF", "/tools/kml-to-dxf/"], ["GeoJSON → KML", "/tools/geojson-to-kml/"], ["CSV → KML", "/tools/csv-to-kml/"]],
  "kml-to-dxf": [["KML → SHP", "/tools/kml-to-shp/"], ["KML → CSV", "/tools/kml-to-csv/"], ["DXF → KML", "/tools/dxf-to-kml/"], ["GeoJSON → KML", "/tools/geojson-to-kml/"]],
  "geojson-to-kml": [["KML → SHP", "/tools/kml-to-shp/"], ["KML → CSV", "/tools/kml-to-csv/"], ["KML → DXF", "/tools/kml-to-dxf/"], ["CSV → KML", "/tools/csv-to-kml/"]],
  "csv-to-kml": [["KML → CSV", "/tools/kml-to-csv/"], ["KML → SHP", "/tools/kml-to-shp/"], ["GeoJSON → KML", "/tools/geojson-to-kml/"], ["Lat/Lon → UTM", "/tools/latlon-to-utm/"]],
  "latlon-to-utm": [["UTM → Lat/Lon", "/tools/utm-to-latlon/"], ["CSV → KML", "/tools/csv-to-kml/"], ["KML → CSV", "/tools/kml-to-csv/"], ["KML → SHP", "/tools/kml-to-shp/"]],
  "utm-to-latlon": [["Lat/Lon → UTM", "/tools/latlon-to-utm/"], ["CSV → KML", "/tools/csv-to-kml/"], ["KML → CSV", "/tools/kml-to-csv/"], ["KML → SHP", "/tools/kml-to-shp/"]],
};

export default function GisRelatedLinks({ current }: { current: string }) {
  const links = GROUPS[current] ?? [];
  return (
    <nav aria-label="Related GIS tools" style={{ marginTop: 34, padding: 22, borderRadius: 18, background: "#f3f8f5", border: "1px solid #d6e7df" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 21, color: "#06172a" }}>Related GIS & conversion tools</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {links.map(([label, href]) => <Link key={href} href={href} style={{ padding: "9px 13px", borderRadius: 999, background: "#fff", border: "1px solid #cfe0d9", color: "#005744", fontWeight: 800, textDecoration: "none", fontSize: 14 }}>{label}</Link>)}
      </div>
      <Link href="/tools/converters/" style={{ display: "inline-block", marginTop: 14, color: "#174a78", fontWeight: 800, textDecoration: "none" }}>Browse all converters →</Link>
    </nav>
  );
}
