import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "KML to CSV Converter Online | Free GIS Tool",
  description: "Convert KML coordinates and basic attributes to CSV online. Free browser-friendly GIS conversion tool from MYKSA CONNECT.",
  alternates: { canonical: "/tools/kml-to-csv/" },
};

export default function Page() {
  return <><GisToolPage slug="kml-to-csv" /><GisRelatedLinks current="kml-to-csv" /></>;
}
