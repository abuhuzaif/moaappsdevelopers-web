import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";

// Own title & description - without these the page showed the home page title in Google.
export const metadata: Metadata = {
  title: "SHP to GeoJSON Converter - Shapefile to GeoJSON",
  description: "Convert ESRI Shapefiles (SHP / ZIP) to GeoJSON for web maps like Leaflet, Mapbox and QGIS. Free online SHP to GeoJSON converter, no software needed.",
  alternates: { canonical: "https://www.myksaconnect.com/tools/shp-to-geojson" },
  openGraph: {
    title: "SHP to GeoJSON Converter - Shapefile to GeoJSON",
    description: "Convert ESRI Shapefiles (SHP / ZIP) to GeoJSON for web maps like Leaflet, Mapbox and QGIS. Free online SHP to GeoJSON converter, no software needed.",
    url: "https://www.myksaconnect.com/tools/shp-to-geojson",
    type: "website",
    siteName: "MYKSA Connect",
  },
};

export default function Page() {
  return <GisToolPage slug="shp-to-geojson" />;
}