import type { Metadata } from "next";
import EssentialCalculator from "../_components/EssentialCalculator";
export const metadata: Metadata = { title: "Loan EMI Calculator | MYKSA CONNECT", description: "Calculate monthly loan EMI, total repayment and total interest using loan amount, rate and term.", alternates: { canonical: "/tools/loan-emi-calculator/" } };
export default function Page(){ return <EssentialCalculator kind="emi" title="Loan / EMI Calculator" description="Estimate monthly EMI, total repayment and interest for a loan."/>; }
