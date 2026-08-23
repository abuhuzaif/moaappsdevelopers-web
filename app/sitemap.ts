import type { MetadataRoute } from "next";

// NOTE: Static pages only for now. Listing detail pages would need
// Firebase Admin fetch at build/request time — good next upgrade.
export default function sitemap(): MetadataRoute.Sitemap {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

  if (isKsaConnectSite) {
    // myksaconnect.com — SITE_MODE renders KsaConnectPage at root,
    // so these paths are NOT prefixed with /ksa-connect
    const base = "https://www.myksaconnect.com";
    return [
      { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
      { url: `${base}/ksa-connect/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];
  }

  // moaappsdevelopers.com — main portfolio site, ksa-connect lives under /ksa-connect
  const base = "https://moaappsdevelopers.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ksa-connect`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/ksa-connect/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}