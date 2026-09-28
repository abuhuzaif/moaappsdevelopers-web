import type { Metadata } from "next";
import TravelCurrencyCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Travel Currency Calculator | MYKSA CONNECT",
  description: "Free travel currency calculator for Saudi expatriates. Select source and destination countries and convert travel amounts using automatically updated reference exchange rates.",
  alternates: { canonical: "/tools/travel-currency-calculator/" },
};

export default function Page(){ return <TravelCurrencyCalculator/>; }
