import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi VAT Calculator | MYKSA CONNECT",
  description: "Calculate 15% Saudi VAT, add VAT or extract VAT from a total.",
  alternates: { canonical: "/tools/vat-calculator/" },
  openGraph: {
    title: "Saudi VAT Calculator | MYKSA CONNECT",
    description: "Calculate 15% Saudi VAT, add VAT or extract VAT from a total.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="vat" />;
}
