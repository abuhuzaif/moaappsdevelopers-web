import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Age Calculator | Exact Age in Years Months Days | MYKSA CONNECT", description: "Calculate exact age in years, months and days between a date of birth and a selected date.", alternates: { canonical: "/tools/age-calculator/" } };
export default function Page(){ return <EssentialCalculator kind="age" title="Age Calculator" description="Calculate your exact age in years, months and days."/>; }
