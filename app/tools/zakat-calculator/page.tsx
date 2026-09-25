import type { Metadata } from "next";
import ZakatCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Zakat Calculator Saudi Arabia | MYKSA CONNECT",
  description: "Free Zakat calculator for Saudi Arabia. Estimate 2.5% Zakat on eligible net wealth after entering your own Nisab threshold and liabilities.",
  alternates: { canonical: "/tools/zakat-calculator/" },
};

export default function ZakatPage() {
  return <ZakatCalculator />;
}
