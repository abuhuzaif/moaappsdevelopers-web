import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";

// Own title & description - without these the page showed the home page title in Google.
export const metadata: Metadata = {
  title: "DXF to KML Converter - CAD Drawing to Google Earth",
  description: "Convert AutoCAD DXF drawings to KML and view them in Google Earth or Google Maps. Free online DXF to KML converter for surveyors and engineers.",
  alternates: { canonical: "https://www.myksaconnect.com/tools/dxf-to-kml" },
  openGraph: {
    title: "DXF to KML Converter - CAD Drawing to Google Earth",
    description: "Convert AutoCAD DXF drawings to KML and view them in Google Earth or Google Maps. Free online DXF to KML converter for surveyors and engineers.",
    url: "https://www.myksaconnect.com/tools/dxf-to-kml",
    type: "website",
    siteName: "MYKSA Connect",
  },
};

export default function Page() {
  return <GisToolPage slug="dxf-to-kml" />;
}