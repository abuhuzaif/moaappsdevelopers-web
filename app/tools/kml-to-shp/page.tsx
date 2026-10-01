import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "KML to SHP Converter Online | Free GIS Tool",
  description: "Convert KML Point, LineString and Polygon data to an ESRI Shapefile ZIP online. Free GIS conversion tool from MYKSA CONNECT.",
  alternates: { canonical: "/tools/kml-to-shp/" },
};

export default function Page() {
  return <><GisToolPage slug="kml-to-shp" /><GisRelatedLinks current="kml-to-shp" /></>;
}
