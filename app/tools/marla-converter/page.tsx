import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Marla to Square Feet & Square Meter Converter | MYKSA CONNECT", description: "Convert Marla to square feet and square meters using selectable Marla standards.", alternates: { canonical: "/tools/marla-converter/" } };
export default function Page(){ return <EssentialCalculator kind="marla" title="Marla ↔ Square Feet / Square Meter" description="Convert Marla for property and land measurements, with selectable regional standards."/>; }
