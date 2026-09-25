import type { Metadata } from "next";
import DaysBetweenDatesCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Days Between Dates Calculator | MYKSA CONNECT",
  description: "Free days between dates calculator for Saudi expatriates. Calculate elapsed or inclusive calendar days between two dates.",
  alternates: { canonical: "/tools/days-between-dates/" },
};
export default function Page(){ return <DaysBetweenDatesCalculator/>; }
