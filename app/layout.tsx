
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./file-picker.css";
import ToolsBanner from "./_components/ToolsBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";
const GA_MEASUREMENT_ID = "G-R9E3J40KXD";

export const metadata: Metadata = isKsaConnectSite
  ? {
      title: "MYKSA CONNECT — Saudi Arabia Classifieds, Expat Tools & Local Services",
      description:
        "MYKSA CONNECT helps expatriates and residents in Saudi Arabia find housing, cars, jobs, services, restaurants and free online tools for everyday life.",
      metadataBase: new URL("https://www.myksaconnect.com"),
      keywords: [
        "Saudi Arabia classifieds",
        "Saudi Arabia expat tools",
        "Riyadh classifieds",
        "Jeddah classifieds",
        "Saudi housing",
        "rooms for rent Saudi Arabia",
        "cars for sale Saudi Arabia",
        "Iqama expiry calculator",
        "Hijri Gregorian converter",
        "Saudi salary calculator",
        "SAR currency converter",
        "Saudi online tools",
      ],
      // No site-wide canonical here: a canonical in the root layout is inherited by
      // every page that doesn't set its own, telling Google they are all copies of
      // the homepage. Each page sets its own canonical instead.
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
        title: "MYKSA CONNECT — Saudi Arabia Classifieds, Expat Tools & Local Services",
        description:
          "Find housing, cars, jobs, services, restaurants and useful free tools for life and work in Saudi Arabia.",
        type: "website",
        url: "https://www.myksaconnect.com",
        siteName: "MYKSA CONNECT",
        locale: "en_SA",
        images: [
          {
            url: "/og",
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
          "Classifieds, local services and free Saudi expat tools for residents across Saudi Arabia.",
        images: ["/og"],
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
        "Saudi Arabia classifieds, local services, restaurants and free digital tools for expatriates and residents.",
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
      knowsAbout: [
        "Mobile App Development",
        "Website Development",
        "Digital Marketing",
      ],
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
  const schema = isKsaConnectSite
    ? ksaConnectSchema
    : moaAppsDevelopersSchema;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        {/* Preload the homepage hero image for MYKSA CONNECT */}
        {isKsaConnectSite && (
          <link
            rel="preload"
            as="image"
            href="/images/ksa-connect-hero.webp"
            fetchPriority="high"
          />
        )}

        <meta
          name="google-site-verification"
          content="googleeed0f7655921d9e45"
        />

        {/* MYKSA tool colours — only on myksaconnect.com (it restyles shared classes
            like buttons and cards, which broke the MOA company homepage). */}
        {isKsaConnectSite && <link rel="stylesheet" href="/myksa-tool-colors.css?v=2" />}

        <style>{`
          .mk-page .mk-tools-showcase {
            display: none !important;
          }
          .tool-page > .shell > .banner {
            display: none !important;
          }
          .tool-page .banner,
          .tool-page .hero-banner,
          .tool-page img[src*="myksa-tools-banner.png"] {
            display: none !important;
          }
        `}</style>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />

        {/* Google Analytics 4 — MYKSA CONNECT only */}
        {isKsaConnectSite && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}

                // Mark our own devices as internal traffic so GA4's
                // "Internal Traffic" data filter removes them from reports.
                // Open any page once with ?internal=1 on each device/browser
                // to turn it on, or ?internal=0 to turn it off again.
                var mkInternal = false;
                try {
                  var mkFlag = new URLSearchParams(window.location.search).get('internal');
                  if (mkFlag === '1') localStorage.setItem('mk_internal', '1');
                  if (mkFlag === '0') localStorage.removeItem('mk_internal');
                  mkInternal = localStorage.getItem('mk_internal') === '1';
                } catch (e) {}

                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', mkInternal ? { traffic_type: 'internal' } : {});
              `}
            </Script>
          </>
        )}
      </head>

      <body>
        {/* MYKSA-only banner (its styles must not touch the MOA company homepage) */}
        {isKsaConnectSite && <ToolsBanner />}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
