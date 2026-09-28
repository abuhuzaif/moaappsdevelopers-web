const TOOL_ITEMS = [
  ["Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["Saudi Salary Calculator", "/tools/salary-calculator/"],
  ["SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["Travel Currency Calculator", "/tools/travel-currency-calculator/"],
  ["Working Hours Calculator", "/tools/working-hours-calculator/"],
  ["Days Between Dates Calculator", "/tools/days-between-dates/"],
  ["Saudi End of Service Calculator", "/tools/end-of-service-calculator/"],
  ["GOSI Calculator", "/tools/gosi-calculator/"],
  ["Overtime Calculator", "/tools/overtime-calculator/"],
  ["Annual Leave Calculator", "/tools/annual-leave-calculator/"],
  ["Final Settlement Calculator", "/tools/final-settlement-calculator/"],
  ["VAT Calculator", "/tools/vat-calculator/"],
  ["Fuel Cost Calculator", "/tools/fuel-cost-calculator/"],
  ["SHP to KML Converter", "/tools/shp-to-kml/"],
  ["KML to SHP Converter", "/tools/kml-to-shp/"],
  ["SHP to GeoJSON Converter", "/tools/shp-to-geojson/"],
  ["GeoJSON to KML Converter", "/tools/geojson-to-kml/"],
  ["CSV to KML Converter", "/tools/csv-to-kml/"],
  ["KML to CSV Converter", "/tools/kml-to-csv/"],
  ["DXF to KML Converter", "/tools/dxf-to-kml/"],
  ["KML to DXF Converter", "/tools/kml-to-dxf/"],
  ["Latitude Longitude to UTM Converter", "/tools/latlon-to-utm/"],
  ["UTM to Latitude Longitude Converter", "/tools/utm-to-latlon/"],
] as const;

export default function ToolsStructuredData() {
  const base = "https://www.myksaconnect.com";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            position: 1,
            name: "MYKSA CONNECT",
            item: base + "/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Saudi Expat Tools",
            item: base + "/tools/",
          },
        ],
      },
      {
        "@type": "ItemList",
        "name": "Saudi Expat Tools",
        "description":
          "Free Saudi expat, professional, business and GIS engineering calculators and converters.",
        url: base + "/tools/",
        numberOfItems: TOOL_ITEMS.length,
        itemListElement: TOOL_ITEMS.map(([name, path], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          url: base + path,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
