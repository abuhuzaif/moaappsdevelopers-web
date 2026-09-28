import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi Fuel Cost Calculator | MYKSA CONNECT",
  description: "Estimate Saudi trip, weekly and monthly fuel costs.",
  alternates: { canonical: "/tools/fuel-cost-calculator/" },
  openGraph: {
    title: "Saudi Fuel Cost Calculator | MYKSA CONNECT",
    description: "Estimate Saudi trip, weekly and monthly fuel costs.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="fuel" />;
}
