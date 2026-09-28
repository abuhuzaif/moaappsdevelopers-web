import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi Final Settlement Calculator | MYKSA CONNECT",
  description: "Estimate salary due, unused leave, end-of-service benefits, overtime and final settlement.",
  alternates: { canonical: "/tools/final-settlement-calculator/" },
  openGraph: {
    title: "Saudi Final Settlement Calculator | MYKSA CONNECT",
    description: "Estimate salary due, unused leave, end-of-service benefits, overtime and final settlement.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="settlement" />;
}
