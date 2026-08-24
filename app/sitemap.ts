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

// NOTE: Listing detail pages would need Firebase Admin fetch at
// build/request time — good next upgrade.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

  if (isKsaConnectSite) {
    // myksaconnect.com — SITE_MODE renders KsaConnectPage at root,
    // so these paths are NOT prefixed with /ksa-connect
    const base = "https://www.myksaconnect.com";
    const cities = ["riyadh", "jeddah", "dammam", "khobar", "jubail", "yanbu", "madinah"];
    const blogSlugs = await getBlogSlugs();
    return [
      { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
      ...cities.map((slug) => ({
        url: `${base}/ksa-connect/city/${slug}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      })),
      { url: `${base}/ksa-connect/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${base}/ksa-connect/safety`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
      { url: `${base}/ksa-connect/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/ksa-connect/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
      ...blogSlugs.map((slug) => ({
        url: `${base}/ksa-connect/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  }

  // moaappsdevelopers.com — main portfolio site. The /ksa-connect pages
  // exist here too (same codebase) but canonicalize to myksaconnect.com,
  // so they're intentionally left out of this site's own sitemap.
  const base = "https://www.moaappsdevelopers.com";
  return [{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}