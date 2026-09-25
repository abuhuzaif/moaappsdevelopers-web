import type { Metadata } from "next";
import RentSplitCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Rent Split Calculator Saudi Arabia | MYKSA CONNECT",
  description: "Free Saudi rent split calculator. Divide monthly rent, utilities and shared costs fairly between roommates.",
  alternates: { canonical: "/tools/rent-split-calculator/" },
};

export default function RentSplitPage() {
  return <RentSplitCalculator />;
}
