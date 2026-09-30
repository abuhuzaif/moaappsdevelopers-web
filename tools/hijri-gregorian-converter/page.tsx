import type { Metadata } from "next";
import HijriGregorianConverter from "./calculator";
import ToolSeoSchema from "../_components/ToolSeoSchema";

export const metadata: Metadata = {
  title: "Hijri Gregorian Converter Saudi Arabia | MYKSA CONNECT",
  description:
    "Free Hijri and Gregorian date converter using the Saudi Umm al-Qura calendar. Convert dates quickly on mobile, tablet or desktop.",
  keywords: [
    "Hijri Gregorian converter",
    "Gregorian to Hijri converter",
    "Hijri to Gregorian converter",
    "Umm al-Qura converter",
    "Saudi Hijri date converter",
    "Islamic date converter Saudi Arabia",
  ],
  alternates: { canonical: "/tools/hijri-gregorian-converter/" },
  openGraph: {
    title: "Hijri Gregorian Converter | Saudi Umm al-Qura Calendar",
    description:
      "Convert Gregorian dates to Hijri dates using the Saudi Umm al-Qura calendar reference.",
    url: "https://www.myksaconnect.com/tools/hijri-gregorian-converter/",
    type: "website",
    siteName: "MYKSA CONNECT",
  },
};

const faqs = [
  {
    question: "Which Hijri calendar does this tool use?",
    answer:
      "It uses the browser's Islamic Umm al-Qura calendar implementation where available.",
  },
  {
    question: "Can I use this Hijri Gregorian converter on my phone?",
    answer:
      "Yes. It is responsive and works on mobile, tablet and desktop browsers.",
  },
  {
    question: "Are my dates uploaded or stored?",
    answer:
      "No login is required and the date conversion is performed in the browser.",
  },
];

export default function Page() {
  return (
    <ToolSeoSchema
      name="Hijri Gregorian Converter Saudi Arabia"
      description="Convert Gregorian and Hijri dates using the Saudi Umm al-Qura calendar reference."
      slug="hijri-gregorian-converter"
      faqs={faqs}
    >
      <HijriGregorianConverter />
    </ToolSeoSchema>
  );
}
