import type { Metadata } from "next";
import CurrencyConverter from "./calculator";
import ToolSeoSchema from "../_components/ToolSeoSchema";

export const metadata: Metadata = {
  title: "SAR Currency Converter | Saudi Riyal Exchange Rates | MYKSA CONNECT",
  description:
    "Free SAR currency converter for Saudi expats. Convert Saudi Riyal to INR, PKR, BDT, AED, USD and other supported currencies using reference exchange rates.",
  keywords: [
    "SAR currency converter",
    "Saudi Riyal converter",
    "SAR to INR",
    "SAR to PKR",
    "SAR to BDT",
    "Saudi Riyal exchange rate",
    "Saudi expat currency converter",
  ],
  alternates: { canonical: "/tools/sar-currency-converter/" },
  openGraph: {
    title: "SAR Currency Converter | MYKSA CONNECT",
    description:
      "Convert Saudi Riyal to INR, PKR, BDT, AED, USD and other supported currencies online.",
    url: "https://www.myksaconnect.com/tools/sar-currency-converter/",
    type: "website",
    siteName: "MYKSA CONNECT",
  },
};

const faqs = [
  {
    question: "Are these live exchange-house rates?",
    answer:
      "No. They are reference rates. Banks, exchange houses and payment providers may use different customer rates and may add fees.",
  },
  {
    question: "Can I convert between any two countries?",
    answer:
      "The converter supports the currencies available from the configured reference-rate provider. Countries sharing the same currency use the same currency rate.",
  },
  {
    question: "Can I swap the From and To countries?",
    answer:
      "Yes. Use the swap button between the two country selectors to reverse the conversion instantly.",
  },
  {
    question: "Can I use this SAR currency converter on my phone?",
    answer:
      "Yes. The converter is responsive and works on mobile, tablet and desktop browsers.",
  },
];

export default function Page() {
  return (
    <ToolSeoSchema
      name="SAR Currency Converter"
      description="Convert Saudi Riyal to supported world currencies using automatically updated reference exchange rates."
      slug="sar-currency-converter"
      faqs={faqs}
    >
      <CurrencyConverter />
    </ToolSeoSchema>
  );
}
