import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailClient, { type ListingPreview } from "./ListingDetailClient";

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

/** "LARGE ROOM FOR RENT!!!" → "Large Room For Rent" (shouting titles look like spam in Google). */
function tidy(text: string): string {
  let t = stripPhones(text).replace(/[!?.]{2,}/g, "").replace(/\s+/g, " ").trim();
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length > 6 && letters === letters.toUpperCase()) t = t.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  return t;
}

/** Cut at a word boundary so it ends cleanly. */
function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const s = text.slice(0, max - 1);
  const i = s.lastIndexOf(" ");
  return (i > max * 0.6 ? s.slice(0, i) : s).replace(/[\s,;:–-]+$/, "") + "…";
}

/**
 * Google shows ~60 characters of a title. Keep the price and the area (area also keeps
 * similar ads — "Room for rent | Riyadh" ×11 — from all getting the same title),
 * and add the brand only when it still fits.
 */
function seoTitle(l: SeoListing): string {
  const name = tidy(l.title) || l.subCategory || l.category || "Ad";
  const brand = " | MYKSA Connect";
  // full area first; if that leaves too little room for the ad's own words, use just the city
  for (const where of [place(l), l.city && l.city !== "All" ? l.city : ""]) {
    const tail = ` – ${priceText(l)}${where ? ` | ${where}` : ""}`;
    const room = 62 - tail.length;
    if (name.length > room && room < 30 && where !== (l.city && l.city !== "All" ? l.city : "")) continue;
    const t = cut(name, Math.max(24, room)) + tail;
    return t.length + brand.length <= 64 ? t + brand : t;
  }
  return cut(name, 60);
}

/** ~155 characters: what, where, price, then the start of the ad text. */
function seoDescription(l: SeoListing): string {
  const where = place(l);
  const lead = [l.subCategory || l.category, where && `in ${where}`].filter(Boolean).join(" ");
  const head = `${lead}. ${priceText(l)}${l.negotiable ? " (negotiable)" : ""}. `;
  const tail = " Contact the seller on MYKSA Connect.";
  const body = tidy(l.description);
  const room = 155 - head.length - tail.length;
  let text = room > 20 && body ? cut(body, room) : "";
  if (text && !/[.!?…]$/.test(text)) text += ".";
  return (head + text + tail).replace(/\s+\./g, ".").replace(/\s{2,}/g, " ").trim();
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

  // absolute: the ad title already carries the brand when it fits — no site-wide template added on top
  const title = seoTitle(l);
  const description = seoDescription(l);

  return {
    title: { absolute: title },
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
            name: tidy(l.title),
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
              { "@type": "ListItem", position: l.city && l.city !== "All" ? 3 : 2, name: tidy(l.title) },
            ],
          },
        ]
      : null;

  // Same words the browser shows once the ad loads — so Google sees the H1 and text in the first HTML.
  const preview: ListingPreview | undefined =
    l && typeof l === "object" && l.status === "active"
      ? {
          title: l.title,
          price: priceText(l) + (l.negotiable ? " (negotiable)" : ""),
          place: place(l),
          category: [l.category, l.subCategory].filter(Boolean).join(" · "),
          description: stripPhones(l.description).slice(0, 600),
        }
      : undefined;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ListingDetailClient preview={preview} />
    </>
  );
}
