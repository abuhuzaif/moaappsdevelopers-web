import type { Metadata } from "next";
import ProfessionalTool from "./calculator";

export const metadata: Metadata = {
  title: "Saudi GOSI Calculator | MYKSA CONNECT",
  description: "Estimate Saudi GOSI employee and employer contributions.",
  alternates: { canonical: "/tools/gosi-calculator/" },
  openGraph: {
    title: "Saudi GOSI Calculator | MYKSA CONNECT",
    description: "Estimate Saudi GOSI employee and employer contributions.",
    type: "website",
  },
};

export default function Page() {
  return <ProfessionalTool tool="gosi" />;
}
