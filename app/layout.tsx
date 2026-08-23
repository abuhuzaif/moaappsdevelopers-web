import type { Metadata } from "next";
import "./globals.css";

const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

export const metadata: Metadata = isKsaConnectSite
  ? {
      title: "KSA-Connect — Housing, Cars & Classifieds in Saudi Arabia",
      description:
        "Browse live classifieds across Riyadh, Jeddah, Dammam, Khobar, Jubail, Yanbu, and Madinah. Housing, cars, household items, services, and more.",
      metadataBase: new URL("https://www.myksaconnect.com"),
      openGraph: {
        title: "KSA-Connect — Housing, Cars & Classifieds in Saudi Arabia",
        description:
          "Browse live classifieds across 7 Saudi cities. Housing, cars, household items, services, and more.",
        type: "website",
        url: "https://www.myksaconnect.com",
      },
    }
  : {
      title: "MOA Apps Developer's — Smart Apps. Powerful Solutions.",
      description:
        "We design and develop mobile apps, websites, and digital marketing solutions that help businesses grow, connect, and succeed globally.",
      metadataBase: new URL("https://www.moaappsdevelopers.com"),
      openGraph: {
        title: "MOA Apps Developer's — Smart Apps. Powerful Solutions.",
        description:
          "We design and develop mobile apps, websites, and digital marketing solutions that help businesses grow, connect, and succeed globally.",
        type: "website",
        url: "https://www.moaappsdevelopers.com",
      },
    };

// Organization + WebSite JSON-LD — rendered for whichever site is currently
// building (SITE_MODE decides at build/request time). Helps Google show
// rich results and helps AI answer engines correctly identify each site.
const ksaConnectSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.myksaconnect.com/#organization",
      name: "KSA-Connect",
      url: "https://www.myksaconnect.com",
      description:
        "Free classifieds and matrimonial platform for expatriates and residents in Saudi Arabia, covering 7 cities.",
      areaServed: {
        "@type": "Country",
        name: "Saudi Arabia",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.myksaconnect.com/#website",
      url: "https://www.myksaconnect.com",
      name: "KSA-Connect",
      description:
        "Browse live classifieds across Riyadh, Jeddah, Dammam, Khobar, Jubail, Yanbu, and Madinah — housing, cars, household items, services, jobs, and more.",
      publisher: { "@id": "https://www.myksaconnect.com/#organization" },
      inLanguage: "en",
    },
  ],
};

const moaAppsDevelopersSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.moaappsdevelopers.com/#organization",
      name: "MOA Apps Developer's",
      alternateName: "MOA Apps Developers",
      url: "https://www.moaappsdevelopers.com",
      description:
        "MOA Apps Developer's is an independent app and web development studio focused on building smart, reliable digital tools — from community marketplaces to Islamic content apps — designed, built, and maintained end-to-end using Flutter, Firebase, and Next.js.",
      email: "abuman.moa@gmail.com",
      knowsAbout: ["Mobile App Development", "Website Development", "Digital Marketing"],
      sameAs: ["https://www.myksaconnect.com"],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.moaappsdevelopers.com/#website",
      url: "https://www.moaappsdevelopers.com",
      name: "MOA Apps Developer's",
      description:
        "We design and develop mobile apps, websites, and digital marketing solutions that help businesses grow, connect, and succeed globally.",
      publisher: { "@id": "https://www.moaappsdevelopers.com/#organization" },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = isKsaConnectSite ? ksaConnectSchema : moaAppsDevelopersSchema;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
