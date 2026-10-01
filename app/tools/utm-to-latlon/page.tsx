import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "UTM to Latitude Longitude Converter | Free GIS Tool",
  description: "Convert UTM easting, northing and zone coordinates to latitude and longitude online. Free GIS coordinate converter from MYKSA CONNECT.",
  alternates: { canonical: "/tools/utm-to-latlon/" },
};

export default function Page() {
  return <><GisToolPage slug="utm-to-latlon" /><GisRelatedLinks current="utm-to-latlon" /></>;
}
