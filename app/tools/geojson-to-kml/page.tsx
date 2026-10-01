import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "GeoJSON to KML Converter Online | Free GIS Tool",
  description: "Convert GeoJSON Point, LineString and Polygon features to KML online for Google Earth and mapping workflows. Free GIS tool from MYKSA CONNECT.",
  alternates: { canonical: "/tools/geojson-to-kml/" },
};

export default function Page() {
  return <><GisToolPage slug="geojson-to-kml" /><GisRelatedLinks current="geojson-to-kml" /></>;
}
