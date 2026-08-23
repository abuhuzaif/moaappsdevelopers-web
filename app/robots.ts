import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";
  const base = isKsaConnectSite
    ? "https://www.myksaconnect.com"
    : "https://moaappsdevelopers.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ksa-connect/post"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}