import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KSA-Connect — Housing, Cars & Classifieds in Saudi Arabia",
  description:
    "Browse live classifieds across Riyadh, Jeddah, Dammam, Khobar, Jubail, Yanbu, and Madinah. Housing, cars, household items, services, and more.",
  openGraph: {
    title: "KSA-Connect — Housing, Cars & Classifieds in Saudi Arabia",
    description:
      "Browse live classifieds across 7 Saudi cities. Housing, cars, household items, services, and more.",
    type: "website",
  },
};

export default function KsaConnectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
