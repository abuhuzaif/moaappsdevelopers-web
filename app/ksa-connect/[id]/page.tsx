import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailClient from "./ListingDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE = "https://www.myksaconnect.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
};

type SeoListing = {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  city: string;
  location: string;
  price: number;
  negotiable: boolean;
  status: string;
  images: string[];
  createdAt: string | null;
};

/**
 * Reads the listing on the server with Firestore's REST API.
 * Returns the listing, "missing" (404) or null (couldn't tell, e.g. 403 from rules).
 */
async function fetchListing(id: string): Promise<SeoListing | "missing" | "hidden" | null> {
  if (!PROJECT_ID) return null;
  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/listings/` +
      `${encodeURIComponent(id)}${API_KEY ? `?key=${API_KEY}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status === 404) return "missing";
    // 403: security rules hide deleted/expired or sold ads from anonymous readers.
    // The page still works for the owner (client side), but Google must not index it.
    if (res.status === 403) return "hidden";
    if (!res.ok) return null;
    const doc = (await res.json()) as { fields?: Record<string, FsValue> };
    const f = doc.fields ?? {};
    const str = (k: string) => (f[k]?.stringValue ?? "").trim();
    return {
      title: str("title"),
      description: str("description"),
      category: str("category"),
      subCategory: str("subCategory"),
      city: str("city"),
      location: str("location"),
      price: Number(f.price?.doubleValue ?? f.price?.integerValue ?? 0),
      negotiable: !!f.negotiable?.booleanValue,
      status: str("status") || "active",
      images: (f.imageUrls?.arrayValue?.values ?? []).map((v) => v.stringValue ?? "").filter((u) => u.startsWith("http")),
      createdAt: f.createdAt?.timestampValue ?? null,
    };
  } catch {
    return null;
  }
}

/** Phone numbers stay on the page (behind Call/WhatsApp), not in search snippets. */
function stripPhones(text: string): string {
  return text.replace(/\+?\d[\d\s\-().]{6,}\d/g, (m) => (m.replace(/\D/g, "").length >= 8 ? "" : m)).replace(/\s{2,}/g, " ");
}

function priceText(l: SeoListing): string {
  if (!(l.price > 0)) return "Price on request";
  const monthly = l.category === "Housing" ? "/month" : "";
  return `${l.price.toLocaleString("en-US")} SAR${monthly}`;
}

function place(l: SeoListing): string {
  if (!l.city || l.city === "All") return l.location;
  if (!l.location || l.location.toLowerCase().includes(l.city.toLowerCase())) return l.city;
  return `${l.location}, ${l.city}`;
}

// ── SEO: title, description, link previews (Facebook / WhatsApp / Google) ──
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const url = `${SITE}/ksa-connect/${encodeURIComponent(id)}`;
  const l = await fetchListing(id);

  if (!l || l === "missing" || l === "hidden") {
    return {
      title: "Ad on MYKSA Connect — Classifieds for Saudi Expats",
      alternates: { canonical: url },
      // Expired/removed/sold ads: tell Google to drop them (avoids "Soft 404").
      ...(l === "hidden" || l === "missing" ? { robots: { index: false, follow: true } } : {}),
    };
  }

  const where = place(l);
  const title = `${stripPhones(l.title)} – ${priceText(l)}${l.city && l.city !== "All" ? ` | ${l.city}` : ""} | MYKSA Connect`;
  const lead = [l.subCategory || l.category, where && `in ${where}`].filter(Boolean).join(" ");
  const body = stripPhones(l.description).slice(0, 120).trim();
  const description = `${lead}. ${priceText(l)}. ${body}${body.length >= 120 ? "…" : ""} Contact the seller free on MYKSA Connect.`
    .replace(/\s+\./g, ".")
    .slice(0, 300);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: l.status === "active" ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "MYKSA Connect",
      images: l.images.slice(0, 1).map((u) => ({ url: u, alt: l.title })),
    },
    twitter: {
      card: l.images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: l.images.slice(0, 1),
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id.length > 200) notFound();

  // notFound() must be called outside any try/catch (it works by throwing).
  const l = await fetchListing(id);
  if (l === "missing") notFound();

  // Structured data so Google understands the ad (product/offer + breadcrumb).
  const jsonLd =
    l && typeof l === "object" && l.status === "active"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: stripPhones(l.title),
            description: stripPhones(l.description).slice(0, 500) || undefined,
            image: l.images.length ? l.images : undefined,
            category: [l.category, l.subCategory].filter(Boolean).join(" > "),
            url: `${SITE}/ksa-connect/${id}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "SAR",
              ...(l.price > 0 ? { price: l.price } : {}),
              availability: "https://schema.org/InStock",
              areaServed: l.city && l.city !== "All" ? { "@type": "City", name: l.city } : undefined,
              url: `${SITE}/ksa-connect/${id}`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              ...(l.city && l.city !== "All"
                ? [{ "@type": "ListItem", position: 2, name: l.city, item: `${SITE}/ksa-connect/city/${l.city.toLowerCase().replace(/\s+/g, "-")}` }]
                : []),
              { "@type": "ListItem", position: l.city && l.city !== "All" ? 3 : 2, name: stripPhones(l.title) },
            ],
          },
        ]
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ListingDetailClient />
    </>
  );
}
