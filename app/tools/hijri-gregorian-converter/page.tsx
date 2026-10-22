import type { Metadata } from "next";
import HijriGregorianConverter from "./calculator";

const TITLE = "Hijri to Gregorian (Miladi) Date Converter – Umm al-Qura | MYKSA CONNECT";
const DESCRIPTION =
  "Convert Hijri to Miladi (Gregorian) and Gregorian to Hijri dates instantly with the Saudi Umm al-Qura calendar. Free, fast and mobile friendly. تحويل التاريخ من هجري إلى ميلادي.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "hijri to gregorian",
    "hijri to miladi",
    "convert hijri to miladi",
    "gregorian to hijri",
    "umm al qura calendar",
    "hijri date today saudi arabia",
    "تحويل التاريخ من هجري إلى ميلادي",
    "تحويل التاريخ الهجري",
  ],
  // No trailing slash: the site serves /tools/... without it (a "/" only redirects).
  alternates: { canonical: "/tools/hijri-gregorian-converter" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/tools/hijri-gregorian-converter",
    type: "website",
    siteName: "MYKSA CONNECT",
  },
};

export default function Page() {
  return <HijriGregorianConverter />;
}
