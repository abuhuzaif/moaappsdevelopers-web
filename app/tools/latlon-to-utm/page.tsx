import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";

export const metadata: Metadata = {
  title: "Latitude Longitude to UTM Converter | Free GIS Tool",
  description: "Convert latitude and longitude coordinates to UTM zone, easting and northing online. Free GIS coordinate converter from MYKSA CONNECT.",
  alternates: { canonical: "/tools/latlon-to-utm/" },
};

export default function Page() {
  return <><GisToolPage slug="latlon-to-utm" /><GisRelatedLinks current="latlon-to-utm" /></>;
}
