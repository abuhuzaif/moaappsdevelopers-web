import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";

// Own title & description - without these the page showed the home page title in Google.
export const metadata: Metadata = {
  title: "SHP to KML Converter - Shapefile to KML Online",
  description: "Convert ESRI Shapefiles (SHP / ZIP) to KML for Google Earth and Google Maps. Free online SHP to KML converter - no software to install.",
  alternates: { canonical: "https://www.myksaconnect.com/tools/shp-to-kml" },
  openGraph: {
    title: "SHP to KML Converter - Shapefile to KML Online",
    description: "Convert ESRI Shapefiles (SHP / ZIP) to KML for Google Earth and Google Maps. Free online SHP to KML converter - no software to install.",
    url: "https://www.myksaconnect.com/tools/shp-to-kml",
    type: "website",
    siteName: "MYKSA Connect",
  },
};

export default function Page() {
  return <GisToolPage slug="shp-to-kml" />;
}