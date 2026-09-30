import type { Metadata } from "next";
import SalaryCalculator from "./calculator";
import ToolSeoSchema from "../_components/ToolSeoSchema";

export const metadata: Metadata = {
  title: "Saudi Salary Calculator | Monthly & Annual Salary | MYKSA CONNECT",
  description:
    "Free Saudi salary calculator. Calculate monthly and annual salary in SAR using basic salary, housing, transport and other allowances.",
  keywords: [
    "saudi salary calculator",
    "salary calculator Saudi Arabia",
    "monthly salary calculator Saudi",
    "annual salary calculator Saudi",
    "salary calculator SAR",
    "Saudi expat salary calculator",
  ],
  alternates: { canonical: "/tools/salary-calculator/" },
  openGraph: {
    title: "Saudi Salary Calculator | MYKSA CONNECT",
    description:
      "Calculate monthly and annual Saudi salary from basic salary and allowances in SAR.",
    url: "https://www.myksaconnect.com/tools/salary-calculator/",
    type: "website",
    siteName: "MYKSA CONNECT",
  },
};

const faqs = [
  {
    question: "What does this Saudi salary calculator include?",
    answer:
      "It adds basic salary, housing allowance, transport allowance and other monthly allowances to calculate total monthly and annual salary.",
  },
  {
    question: "Can I use this calculator for any SAR salary?",
    answer:
      "Yes. Enter the salary amounts in Saudi Riyals (SAR). The calculator is designed for monthly salary calculations.",
  },
  {
    question: "Does this calculator deduct tax or other payments?",
    answer:
      "No. This tool calculates gross salary from the amounts entered. It does not estimate individual deductions or employer payroll policies.",
  },
];

export default function Page() {
  return (
    <ToolSeoSchema
      name="Saudi Salary Calculator"
      description="Calculate monthly and annual Saudi salary from basic salary and allowances in SAR."
      slug="salary-calculator"
      faqs={faqs}
    >
      <SalaryCalculator />
    </ToolSeoSchema>
  );
}
