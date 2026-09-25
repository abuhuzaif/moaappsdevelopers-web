import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi Annual Leave Calculator | MYKSA CONNECT",
  description: "Estimate annual leave accrued and remaining under Saudi minimum leave rules.",
  alternates: { canonical: "/tools/annual-leave-calculator/" },
  openGraph: {
    title: "Saudi Annual Leave Calculator | MYKSA CONNECT",
    description: "Estimate annual leave accrued and remaining under Saudi minimum leave rules.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="leave" />;
}
