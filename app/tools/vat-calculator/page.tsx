
import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title:
    "Saudi VAT Calculator (15%) – Add or Remove VAT | MYKSA CONNECT",
  description:
    "Free Saudi VAT calculator using the 15% standard rate. Add VAT to a price or remove VAT from a total to calculate the net amount and VAT breakdown.",
  alternates: {
    canonical: "/tools/vat-calculator",
  },
  openGraph: {
    title: "Saudi VAT Calculator (15%) | MYKSA CONNECT",
    description:
      "Calculate Saudi Arabia's 15% VAT instantly. Add VAT or extract VAT from a total with our free online calculator.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="vat" />;
}
