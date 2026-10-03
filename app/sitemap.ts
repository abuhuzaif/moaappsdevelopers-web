import type { MetadataRoute } from "next";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEO_POSTS } from "@/lib/seoContent";

async function getBlogSlugs(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "blogPosts"));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

// Active listing IDs so each classified ad gets its own sitemap entry.
// Capped at 500 most relevant (active) listings to keep sitemap generation
// fast â€” well under Google's per-sitemap limit either way.
async function getActiveListingIds(): Promise<string[]> {
  try {
    const q = query(collection(db, "listings"), where("status", "==", "active"), limit(500));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

const TOOL_SLUGS = [
  "iqama-expiry-calculator", "hijri-gregorian-converter", "salary-calculator", "sar-currency-converter", "rent-split-calculator", "travel-currency-calculator", "working-hours-calculator", "days-between-dates",
  "gaz-square-meter-converter", "square-feet-square-meter-converter", "marla-converter", "acre-hectare-square-meter-converter", "feet-inches-centimeter-converter", "bmi-calculator", "age-calculator", "percentage-calculator", "loan-emi-calculator", "saudi-vat-calculator",
  "end-of-service-calculator", "gosi-calculator", "overtime-calculator", "annual-leave-calculator", "final-settlement-calculator", "vat-calculator", "fuel-cost-calculator",
  "shp-to-kml", "kml-to-shp", "shp-to-geojson", "geojson-to-kml", "csv-to-kml", "kml-to-csv", "dxf-to-kml", "kml-to-dxf", "latlon-to-utm", "utm-to-latlon",
  // CAD/DWG tools â€” previously had their own page.tsx files but were missing from the sitemap
  "dwg-to-pdf", "dwg-to-dxf", "dwg-to-svg", "dxf-to-svg", "cad", "pdf-to-dxf",
];

const CONVERTER_SLUGS = [
  "word-to-pdf", "pdf-to-word", "pdf-to-csv", "pdf-to-excel", "pdf-to-text", "pdf-ocr", "pdf-to-html", "pdf-to-markdown",
  "csv-to-excel", "excel-to-csv", "pdf-to-jpg", "jpg-to-pdf", "ppt-to-pdf", "pdf-to-ppt", "txt-to-pdf",
  "merge-pdf", "split-pdf", "compress-pdf", "rotate-pdf", "extract-pdf-pages", "add-pdf-page-numbers", "watermark-pdf", "protect-pdf", "unlock-pdf",
  "remove-pdf-pages", "reorder-pdf-pages", "extract-images-from-pdf", "sign-pdf", "compare-pdf", "repair-pdf", "images-to-pdf", "pdf-to-images",
  "csv-to-json", "json-to-csv", "xml-to-json", "json-to-xml", "json-formatter",
  "jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png", "image-merger", "image-compressor", "image-resizer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";
  if (isKsaConnectSite) {
    const base = "https://www.myksaconnect.com";
    const cities = ["riyadh", "jeddah", "dammam", "khobar", "jubail", "yanbu", "madinah"];
    const blogSlugs = await getBlogSlugs();
    const seoSlugs = SEO_POSTS.map((post) => post.slug);
    const allBlogSlugs = [...new Set([...seoSlugs, ...blogSlugs])];
    const listingIds = await getActiveListingIds();

    return [
      { url: `${base}/`, changeFrequency: "daily", priority: 1 },
      { url: `${base}/ksa-connect`, changeFrequency: "hourly", priority: 0.95 },
      { url: `${base}/tools/`, changeFrequency: "weekly", priority: 0.95 },
      { url: `${base}/tools/converters/`, changeFrequency: "weekly", priority: 0.9 },
      ...TOOL_SLUGS.map((slug) => ({ url: `${base}/tools/${slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
      ...CONVERTER_SLUGS.map((slug) => ({ url: `${base}/tools/${slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
      { url: `${base}/restaurants`, changeFrequency: "daily" as const, priority: 0.8 },
      ...cities.map((slug) => ({ url: `${base}/ksa-connect/city/${slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
      ...listingIds.map((id) => ({ url: `${base}/ksa-connect/${id}`, changeFrequency: "weekly" as const, priority: 0.6 })),
      { url: `${base}/ksa-connect/privacy`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${base}/ksa-connect/safety`, changeFrequency: "yearly", priority: 0.4 },
      { url: `${base}/ksa-connect/faq`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/ksa-connect/blog`, changeFrequency: "weekly", priority: 0.8 },
      ...allBlogSlugs.map((slug) => ({ url: `${base}/ksa-connect/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    ];
  }
  const base = "https://www.moaappsdevelopers.com";
  return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];
}
