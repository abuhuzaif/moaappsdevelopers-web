import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Gaz to Square Meter Converter | MYKSA CONNECT", description: "Free Gaz (Gaj) to square meter converter. Convert property and plot measurements between Gaz and m².", alternates: { canonical: "/tools/gaz-square-meter-converter/" } };
export default function Page(){ return <EssentialCalculator kind="gaz" title="Gaz ↔ Square Meter Converter" description="Convert Gaz (Gaj) and square meters for property, plot and land measurements."/>; }
