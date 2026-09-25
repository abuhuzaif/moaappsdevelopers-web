import type { Metadata } from "next";
import HijriGregorianConverter from "./calculator";

export const metadata: Metadata = {
  title: "Hijri Gregorian Converter Saudi Arabia | MYKSA CONNECT",
  description:
    "Free Hijri and Gregorian date converter using the Saudi Umm al-Qura calendar. Fast, simple and mobile friendly.",
  alternates: { canonical: "/tools/hijri-gregorian-converter/" },
};

export default function Page() {
  return <HijriGregorianConverter />;
}
