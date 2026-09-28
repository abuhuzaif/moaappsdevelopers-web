import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi Overtime Calculator | MYKSA CONNECT",
  description: "Estimate Saudi overtime compensation from basic salary and overtime hours.",
  alternates: { canonical: "/tools/overtime-calculator/" },
  openGraph: {
    title: "Saudi Overtime Calculator | MYKSA CONNECT",
    description: "Estimate Saudi overtime compensation from basic salary and overtime hours.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="overtime" />;
}
