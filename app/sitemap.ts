import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getBlogSlugs(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "blogPosts"));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

const TOOL_SLUGS = [
  "iqama-expiry-calculator",
  "hijri-gregorian-converter",
  "salary-calculator",
  "sar-currency-converter",
  "rent-split-calculator",
  "travel-currency-calculator",
  "working-hours-calculator",
  "days-between-dates",
  "end-of-service-calculator",
  "gosi-calculator",
  "overtime-calculator",
  "annual-leave-calculator",
  "final-settlement-calculator",
  "vat-calculator",
  "fuel-cost-calculator",
  "shp-to-kml",
  "kml-to-shp",
  "shp-to-geojson",
  "geojson-to-kml",
  "csv-to-kml",
  "kml-to-csv",
  "dxf-to-kml",
  "kml-to-dxf",
  "latlon-to-utm",
  "utm-to-latlon",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

  if (isKsaConnectSite) {
    const base = "https://www.myksaconnect.com";
    const cities = ["riyadh", "jeddah", "dammam", "khobar", "jubail", "yanbu", "madinah"];
    const blogSlugs = await getBlogSlugs();

    return [
      { url: `${base}/`, changeFrequency: "daily", priority: 1 },
      {
        url: `${base}/tools/`,
        changeFrequency: "weekly",
        priority: 0.95,
      },
      ...TOOL_SLUGS.map((slug) => ({
        url: `${base}/tools/${slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      {
        url: `${base}/restaurants`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      ...cities.map((slug) => ({
        url: `${base}/ksa-connect/city/${slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      { url: `${base}/ksa-connect/privacy`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${base}/ksa-connect/safety`, changeFrequency: "yearly", priority: 0.4 },
      { url: `${base}/ksa-connect/faq`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/ksa-connect/blog`, changeFrequency: "weekly", priority: 0.7 },
      ...blogSlugs.map((slug) => ({
        url: `${base}/ksa-connect/blog/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  }

  const base = "https://www.moaappsdevelopers.com";
  return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];
}
