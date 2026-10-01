import type { Metadata } from "next";
import GisToolPage from "../_components/GisToolPage";
import GisRelatedLinks from "../_components/GisRelatedLinks";
export const metadata: Metadata = { title: "CSV to KML Converter | MYKSA CONNECT", description: "Convert CSV latitude and longitude coordinates to KML online.", alternates: { canonical: "/tools/csv-to-kml/" } };
export default function Page() { return <><GisToolPage slug="csv-to-kml" /><GisRelatedLinks current="csv-to-kml" /></>; }
