import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Saudi VAT Calculator 15% | MYKSA CONNECT", description: "Saudi VAT calculator for adding 15% VAT or extracting VAT from a VAT-inclusive amount.", alternates: { canonical: "/tools/saudi-vat-calculator/" } };
export default function Page(){ return <EssentialCalculator kind="vat" title="Saudi VAT Calculator — 15%" description="Calculate Saudi VAT on net amounts or extract VAT from VAT-inclusive prices."/>; }
