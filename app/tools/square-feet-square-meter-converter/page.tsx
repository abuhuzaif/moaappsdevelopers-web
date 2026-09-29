import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Square Feet to Square Meter Converter | MYKSA CONNECT", description: "Convert square feet to square meters and square meters to square feet for property and area measurements.", alternates: { canonical: "/tools/square-feet-square-meter-converter/" } };
export default function Page(){ return <EssentialCalculator kind="sqm" title="Square Feet ↔ Square Meter Converter" description="Quickly convert property and land area between square feet and square meters."/>; }
