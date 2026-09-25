import type { Metadata } from "next";
import IqamaExpiryCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Iqama Expiry Calculator Saudi Arabia | MYKSA CONNECT",
  description:
    "Free Saudi Iqama expiry calculator. Enter your Iqama expiry date to see remaining days, months and expiry status. No login required.",
  alternates: { canonical: "/tools/iqama-expiry-calculator/" },
};

export default function Page() {
  return <IqamaExpiryCalculator />;
}
