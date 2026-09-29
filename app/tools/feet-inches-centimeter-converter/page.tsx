import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Feet & Inches to Centimeter Converter | MYKSA CONNECT", description: "Convert feet and inches to centimeters and centimeters back to feet and inches.", alternates: { canonical: "/tools/feet-inches-centimeter-converter/" } };
export default function Page(){ return <EssentialCalculator kind="length" title="Feet & Inches ↔ Centimeter Converter" description="Convert everyday height and length measurements between feet/inches and centimeters."/>; }
