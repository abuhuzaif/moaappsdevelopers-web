import type { Metadata } from "next";
import IqamaExpiryCalculator from "./calculator";
import ToolSeoSchema from "../_components/ToolSeoSchema";

export const metadata: Metadata = {
  title: "Iqama Expiry Calculator Saudi Arabia | MYKSA CONNECT",
  description:
    "Free Saudi Iqama expiry calculator. Check remaining days and months until your Iqama expires, plus the expiry date in Gregorian and Hijri formats.",
  keywords: [
    "iqama expiry calculator",
    "iqama expiry date",
    "check iqama expiry",
    "saudi iqama expiry calculator",
    "iqama validity calculator",
    "iqama expiry Saudi Arabia",
  ],
  alternates: { canonical: "/tools/iqama-expiry-calculator/" },
  openGraph: {
    title: "Iqama Expiry Calculator Saudi Arabia | MYKSA CONNECT",
    description:
      "Check your Saudi Iqama expiry date and calculate remaining days and months online for free.",
    url: "https://www.myksaconnect.com/tools/iqama-expiry-calculator/",
    type: "website",
    siteName: "MYKSA CONNECT",
  },
};

const faqs = [
  {
    question: "Can I enter my Iqama number to get the expiry date?",
    answer:
      "No. An Iqama number does not contain the expiry date in a way this calculator can derive. Enter the expiry date shown on your official record.",
  },
  {
    question: "Does this calculator connect to Absher?",
    answer:
      "No. It is a browser-based calculator and does not access your Absher account or government records.",
  },
  {
    question: "Can I use this Iqama expiry calculator on my phone?",
    answer:
      "Yes. The calculator is responsive and works on mobile, tablet and desktop browsers.",
  },
];

export default function Page() {
  return (
    <ToolSeoSchema
      name="Iqama Expiry Calculator Saudi Arabia"
      description="Free calculator for checking the remaining time until a Saudi Iqama expiry date."
      slug="iqama-expiry-calculator"
      faqs={faqs}
    >
      <IqamaExpiryCalculator />
    </ToolSeoSchema>
  );
}
