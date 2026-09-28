import type { Metadata } from "next";
import WorkingHoursCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Working Hours Calculator | MYKSA CONNECT",
  description: "Free working hours calculator for Saudi expatriates. Calculate net shift hours after unpaid breaks, including overnight shifts.",
  alternates: { canonical: "/tools/working-hours-calculator/" },
};
export default function Page(){ return <WorkingHoursCalculator/>; }
