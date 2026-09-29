import type { Metadata } from "next";
import "./globals.css";

const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

export const metadata: Metadata = isKsaConnectSite
  ? {
      title: "MYKSA CONNECT — Saudi Arabia Classifieds & Expat Tools",
      description:
        "MYKSA CONNECT helps expatriates and residents in Saudi Arabia find classifieds, housing, cars, services, restaurants and free Saudi expat tools.",
      metadataBase: new URL("https://www.myksaconnect.com"),
      alternates: { canonical: "/" },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
      openGraph: {
        title: "MYKSA CONNECT — Saudi Arabia Classifieds & Expat Tools",
        description:
          "Find housing, cars, services, restaurants and useful free tools for life and work in Saudi Arabia.",
        type: "website",
        url: "https://www.myksaconnect.com",
        siteName: "MYKSA CONNECT",
        locale: "en_SA",
        images: [
          {
            url: "/images/myksa-tools-banner.png",
            width: 1200,
            height: 630,
            alt: "MYKSA CONNECT — Saudi Arabia classifieds and expat tools",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "MYKSA CONNECT — Saudi Arabia Classifieds & Expat Tools",
        description:
          "Classifieds, services and free Saudi expat tools for residents across Saudi Arabia.",
        images: ["/images/myksa-tools-banner.png"],
      },
      other: {
        "facebook-domain-verification": "6clnzykpdbwzf363ahl9yqy3olpz25",
      },
    }
  : {
      title: "MOA Apps Developer's — Smart Apps. Powerful Solutions.",
      description:
        "We design and develop mobile apps, websites, and digital marketing solutions that help businesses grow, connect, and succeed globally.",
      metadataBase: new URL("https://www.moaappsdevelopers.com"),
      alternates: { canonical: "/" },
      openGraph: {
        title: "MOA Apps Developer's — Smart Apps. Powerful Solutions.",
        description:
          "We design and develop mobile apps, websites, and digital marketing solutions that help businesses grow, connect, and succeed globally.",
        type: "website",
        url: "https://www.moaappsdevelopers.com",
      },
    };

const ksaConnectSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.myksaconnect.com/#organization",
      name: "MYKSA CONNECT",
      alternateName: "KSA-Connect",
      url: "https://www.myksaconnect.com",
      description:
        "Classifieds, services, restaurants and free digital tools for expatriates and residents in Saudi Arabia.",
      areaServed: { "@type": "Country", name: "Saudi Arabia" },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.myksaconnect.com/#website",
      url: "https://www.myksaconnect.com",
      name: "MYKSA CONNECT",
      description:
        "Saudi Arabia classifieds and free expat tools for housing, cars, services, work and everyday life.",
      publisher: { "@id": "https://www.myksaconnect.com/#organization" },
      inLanguage: "en-SA",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <link rel="stylesheet" href="/myksa-tool-colors.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
