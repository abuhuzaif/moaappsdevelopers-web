import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Percentage Calculator | MYKSA CONNECT", description: "Free percentage calculator for percentages, amounts, increases and decreases.", alternates: { canonical: "/tools/percentage-calculator/" } };
export default function Page(){ return <EssentialCalculator kind="percentage" title="Percentage Calculator" description="Calculate percentages, percentage of an amount, and percentage increases or decreases."/>; }
