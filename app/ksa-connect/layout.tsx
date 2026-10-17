import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MYKSA Connect — Housing, Cars & Classifieds in Saudi Arabia",
  description:
    "Browse live classifieds across Saudi Arabia — Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Jubail, Al Ahsa, Taif, Abha, Tabuk and more. Housing, cars, household items, services, and more.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect",
  },
  openGraph: {
    title: "MYKSA Connect — Housing, Cars & Classifieds in Saudi Arabia",
    description:
      "Browse live classifieds across every region of Saudi Arabia. Housing, cars, household items, services, and more.",
    type: "website",
  },
};

export default function KsaConnectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
