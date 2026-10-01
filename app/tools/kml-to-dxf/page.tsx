import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "KML to DXF Converter Online | Free GIS & CAD Tool",
  description: "Convert KML Point, LineString and Polygon geometry to DXF online for CAD workflows. Free GIS and engineering tool from MYKSA CONNECT.",
  alternates: { canonical: "/tools/kml-to-dxf/" },
};

export default function Page() {
  return <><GisToolPage slug="kml-to-dxf" /><GisRelatedLinks current="kml-to-dxf" /></>;
}
