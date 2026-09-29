import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "BMI Calculator | Body Mass Index | MYKSA CONNECT", description: "Free BMI calculator using weight and height in metric units.", alternates: { canonical: "/tools/bmi-calculator/" } };
export default function Page(){ return <EssentialCalculator kind="bmi" title="BMI Calculator" description="Calculate Body Mass Index from your weight and height."/>; }
