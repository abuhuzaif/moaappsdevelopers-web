import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi End of Service Calculator | MYKSA CONNECT",
  description: "Estimate Saudi end-of-service benefits from wage, service period and reason for leaving.",
  alternates: { canonical: "/tools/end-of-service-calculator/" },
  openGraph: {
    title: "Saudi End of Service Calculator | MYKSA CONNECT",
    description: "Estimate Saudi end-of-service benefits from wage, service period and reason for leaving.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="eosb" />;
}
