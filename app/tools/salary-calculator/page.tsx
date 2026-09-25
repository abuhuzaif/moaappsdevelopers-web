import type { Metadata } from "next";
import SalaryCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Saudi Salary Calculator | Monthly & Annual Salary Calculator | MYKSA CONNECT",
  description:
    "Free Saudi salary calculator. Calculate monthly and annual salary including basic salary, housing, transport and other allowances in SAR.",
  alternates: {
    canonical: "/tools/salary-calculator/",
  },
  openGraph: {
    title: "Saudi Salary Calculator | MYKSA CONNECT",
    description:
      "Calculate your monthly and annual Saudi salary with allowances.",
    type: "website",
  },
};

export default function Page() {
  return <SalaryCalculator />;
}
