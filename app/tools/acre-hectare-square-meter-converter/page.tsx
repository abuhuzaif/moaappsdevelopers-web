import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Acre Hectare Square Meter Converter | MYKSA CONNECT", description: "Convert acres, hectares and square meters for land and property measurements.", alternates: { canonical: "/tools/acre-hectare-square-meter-converter/" } };
export default function Page(){ return <EssentialCalculator kind="acre" title="Acre ↔ Hectare ↔ Square Meter" description="Convert land area between acres, hectares and square meters."/>; }
