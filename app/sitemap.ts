import type { MetadataRoute } from "next";

// NOTE: This lists the static pages only. Listing detail pages
// (/ksa-connect/[id]) aren't included here yet since generating them
// would require fetching all listing IDs at build/request time with
// Firebase Admin credentials — a good next upgrade once you're ready
// to set that up.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://moaappsdevelopers.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ksa-connect`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/ksa-connect/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
