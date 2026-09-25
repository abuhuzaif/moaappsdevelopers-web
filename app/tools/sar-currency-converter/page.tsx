import type { Metadata } from "next";
import CurrencyConverter from "./calculator";

export const metadata: Metadata = {
  title: "Currency Converter | MYKSA CONNECT",
  description: "Free currency converter for Saudi expatriates. Select a From Country and To Country and convert between supported currencies using automatically updated reference exchange rates.",
  alternates: { canonical: "/tools/sar-currency-converter/" },
};

export default function Page() {
  return <CurrencyConverter />;
}
