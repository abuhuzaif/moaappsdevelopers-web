import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CITIES, citySlug } from "@/lib/categories";
import { CATEGORY_PAGES, categoryPageBySlug } from "@/lib/categoryPages";
import { formattedPrice, type Listing } from "@/lib/types";
import KsaBrandHeader from "@/components/ksa/KsaBrandHeader";

// Server-rendered so Google sees the ads in the page HTML.
// Re-built at most every 10 minutes (new ads show up quickly, few Firestore reads).
export const revalidate = 600;

const BASE = "https://www.myksaconnect.com";

type Props = { params: Promise<{ city: string; category: string }> };

type Ad = {
  id: string;
  title: string;
  price: string;
  place: string;
  sub: string;
  image?: string;
  created?: number;
};

function cityFromSlug(slug: string): string | null {
  const s = decodeURIComponent(slug).toLowerCase();
  return CITIES.find((c) => citySlug(c) === s || c.toLowerCase() === s) ?? null;
}

async function getAds(city: string, categoryKey: string): Promise<Ad[]> {
  try {
    // Equality filters only — no composite index needed. Sorted newest-first here.
    const q = query(
      collection(db, "listings"),
      where("city", "==", city),
      where("category", "==", categoryKey),
      where("status", "==", "active"),
      limit(100),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        const c = data.createdAt as { toMillis?: () => number } | undefined;
        const images = (data.imageUrls as string[] | undefined) ?? [];
        let price = "";
        try {
          price = formattedPrice({ id: d.id, ...data } as unknown as Listing);
        } catch {}
        return {
          id: d.id,
          title: String(data.title ?? ""),
          price,
          place: String(data.location ?? ""),
          sub: String(data.subCategory ?? ""),
          image: images[0],
          created: typeof c?.toMillis === "function" ? c.toMillis() : undefined,
        };
      })
      .filter((a) => a.title)
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
      .slice(0, 60);
  } catch {
    return [];
  }
}

function postedAgo(ms?: number): string {
  if (!ms) return "";
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = cityFromSlug(city);
  const page = categoryPageBySlug(category);
  if (!cityName || !page) return { title: "Not found — MYKSA Connect" };

  const ads = await getAds(cityName, page.key);
  const title = `${page.title(cityName)} | MYKSA Connect`;
  const description = `${ads.length ? `${ads.length} live ads. ` : ""}${page.intro(cityName)}`.slice(0, 300);
  const url = `${BASE}/ksa-connect/city/${citySlug(cityName)}/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // An empty page is thin content — keep it out of Google until it has ads.
    robots: ads.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "MYKSA Connect" },
  };
}

export default async function CityCategoryPage({ params }: Props) {
  const { city, category } = await params;
  const cityName = cityFromSlug(city);
  const page = categoryPageBySlug(category);
  if (!cityName || !page) notFound();

  const ads = await getAds(cityName, page.key);
  const cSlug = citySlug(cityName);
  const otherCities = CITIES.filter((c) => c !== cityName).slice(0, 12);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MYKSA Connect", item: `${BASE}/ksa-connect` },
      { "@type": "ListItem", position: 2, name: cityName, item: `${BASE}/ksa-connect/city/${cSlug}` },
      { "@type": "ListItem", position: 3, name: page.title(cityName), item: `${BASE}/ksa-connect/city/${cSlug}/${page.slug}` },
    ],
  };

  return (
    <>
    <KsaBrandHeader
      title={`${page.emoji} ${page.title(cityName)}`}
      intro={page.intro(cityName)}
      crumbs={[
        { label: "Ads", href: "/" },
        { label: page.key, href: `/ksa-connect/category/${page.slug}` },
        { label: cityName },
      ]}
      postHref={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`}
    />
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px 48px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Other categories in this city */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORY_PAGES.map((p) => (
          <a
            key={p.slug}
            href={`/ksa-connect/city/${cSlug}/${p.slug}`}
            className="pill"
            style={{
              textDecoration: "none",
              fontWeight: p.slug === page.slug ? 800 : 600,
              outline: p.slug === page.slug ? "2px solid #E8B84B" : undefined,
            }}
          >
            {p.emoji} {p.key}
          </a>
        ))}
      </div>

      {ads.length ? (
        <>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px" }}>
            {ads.length} live {ads.length === 1 ? "ad" : "ads"} · newest first
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {ads.map((a) => (
              <a
                key={a.id}
                href={`/ksa-connect/${a.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  background: "#fff",
                }}
              >
                <div style={{ aspectRatio: "4 / 3", background: "#E5E7EB" }}>
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.35 }}>{a.title}</h2>
                  {a.price && <p style={{ margin: "0 0 4px", fontWeight: 800, color: "var(--navy)" }}>{a.price}</p>}
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>
                    📍 {[a.place, a.sub].filter(Boolean).join(" · ")}
                    {a.created ? ` · ${postedAgo(a.created)}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: "28px 20px", border: "1px dashed var(--border)", borderRadius: 14, textAlign: "center" }}>
          <p style={{ margin: "0 0 12px", fontSize: 15 }}>
            No {page.key.toLowerCase()} ads in {cityName} right now. Be the first to post one — it&apos;s free.
          </p>
        </div>
      )}

      <div style={{ textAlign: "center", margin: "28px 0" }}>
        <a
          href={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`}
          className="mk-btn mk-btn-gold"
          style={{ fontSize: 15, padding: "12px 26px", fontWeight: 800 }}
        >
          📢 Post a free {page.key} ad in {cityName}
        </a>
      </div>

      {/* Same category in other cities — internal links help Google find every page */}
      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px" }}>
          {page.emoji} {page.key} in other cities
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {otherCities.map((c) => (
            <a key={c} href={`/ksa-connect/city/${citySlug(c)}/${page.slug}`} style={{ fontSize: 13.5 }}>
              {page.title(c)}
            </a>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
