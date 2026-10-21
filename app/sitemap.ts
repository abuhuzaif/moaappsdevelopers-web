import type { MetadataRoute } from "next";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEO_POSTS } from "@/lib/seoContent";
import { CITIES, citySlug } from "@/lib/categories";

async function getBlogSlugs(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "blogPosts"));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

// Active listings (newest first is not guaranteed without an index, so we sort here),
// with their date so Google knows what's new.
async function getActiveListings(): Promise<{ id: string; date?: Date }[]> {
  try {
    const q = query(collection(db, "listings"), where("status", "==", "active"), limit(500));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const c = d.get("createdAt");
      const date = c && typeof c.toDate === "function" ? (c.toDate() as Date) : undefined;
      return { id: d.id, date };
    });
  } catch {
    return [];
  }
}

// Public restaurant digital menus (myksaconnect.com/<slug>).
async function getRestaurantSlugs(): Promise<string[]> {
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where("isActive", "==", true)));
    return snap.docs
      .filter((d) => d.get("hidden") !== true)
      .map((d) => String(d.get("slug") ?? d.id))
      .filter(Boolean);
  } catch {
    return [];
  }
}

const TOOL_SLUGS = [
  "iqama-expiry-calculator", "hijri-gregorian-converter", "salary-calculator", "sar-currency-converter", "rent-split-calculator", "travel-currency-calculator", "working-hours-calculator", "days-between-dates",
  "gaz-square-meter-converter", "square-feet-square-meter-converter", "marla-converter", "acre-hectare-square-meter-converter", "feet-inches-centimeter-converter", "bmi-calculator", "age-calculator", "percentage-calculator", "loan-emi-calculator", "saudi-vat-calculator",
  "end-of-service-calculator", "gosi-calculator", "overtime-calculator", "annual-leave-calculator", "final-settlement-calculator", "vat-calculator", "fuel-cost-calculator",
  "shp-to-kml", "kml-to-shp", "shp-to-geojson", "geojson-to-kml", "csv-to-kml", "kml-to-csv", "dxf-to-kml", "kml-to-dxf", "latlon-to-utm", "utm-to-latlon",
  "dwg-to-pdf", "dwg-to-dxf", "dwg-to-svg", "dxf-to-svg", "cad", "pdf-to-dxf",
];

const CONVERTER_SLUGS = [
  "word-to-pdf", "pdf-to-word", "pdf-to-csv", "pdf-to-excel", "pdf-to-text", "pdf-ocr", "pdf-to-html", "pdf-to-markdown",
  "pdf-to-jpg", "jpg-to-pdf", "ppt-to-pdf", "pdf-to-ppt", "txt-to-pdf",
  "merge-pdf", "split-pdf", "compress-pdf", "rotate-pdf", "extract-pdf-pages", "add-pdf-page-numbers", "watermark-pdf", "protect-pdf", "unlock-pdf",
  "remove-pdf-pages", "reorder-pdf-pages", "extract-images-from-pdf", "sign-pdf", "compare-pdf", "repair-pdf", "images-to-pdf", "pdf-to-images",
  "csv-to-json", "json-to-csv", "xml-to-json", "json-to-xml", "json-formatter",
  "jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png", "image-merger", "image-compressor", "image-resizer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";
  if (isKsaConnectSite) {
    const base = "https://www.myksaconnect.com";
    const [blogSlugs, listings, restaurantSlugs] = await Promise.all([
      getBlogSlugs(),
      getActiveListings(),
      getRestaurantSlugs(),
    ]);
    const seoSlugs = SEO_POSTS.map((post) => post.slug);
    const allBlogSlugs = [...new Set([...seoSlugs, ...blogSlugs])];
    const now = new Date();

    // No trailing slashes: the site serves /tools/pdf-to-word (a "/" at the end
    // only redirects), and Google reports redirecting sitemap URLs as not indexed.
    return [
      { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
      { url: `${base}/ksa-connect`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
      { url: `${base}/ksa-connect/post`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/app`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${base}/tools`, changeFrequency: "weekly", priority: 0.95 },
      { url: `${base}/tools/converters`, changeFrequency: "weekly", priority: 0.9 },
      ...TOOL_SLUGS.map((slug) => ({ url: `${base}/tools/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
      ...CONVERTER_SLUGS.map((slug) => ({ url: `${base}/tools/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
      { url: `${base}/restaurants`, changeFrequency: "daily" as const, priority: 0.8 },
      ...restaurantSlugs.map((slug) => ({ url: `${base}/${slug}`, changeFrequency: "weekly" as const, priority: 0.75 })),
      ...CITIES.map((c) => ({ url: `${base}/ksa-connect/city/${citySlug(c)}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
      ...listings.map((l) => ({
        url: `${base}/ksa-connect/${l.id}`,
        ...(l.date ? { lastModified: l.date } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      { url: `${base}/ksa-connect/rental-scam-warning`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/ksa-connect/faq`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/ksa-connect/privacy`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${base}/ksa-connect/blog`, changeFrequency: "weekly", priority: 0.8 },
      ...allBlogSlugs.map((slug) => ({ url: `${base}/ksa-connect/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    ];
  }
  const base = "https://www.moaappsdevelopers.com";
  return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];
}
