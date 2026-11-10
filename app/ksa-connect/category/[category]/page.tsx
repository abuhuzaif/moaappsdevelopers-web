import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CITIES, citySlug } from "@/lib/categories";
import { CATEGORY_PAGES, categoryPageBySlug } from "@/lib/categoryPages";
import { formattedPrice, type Listing } from "@/lib/types";
import KsaBrandHeader from "@/components/ksa/KsaBrandHeader";

// All-Saudi category page: /ksa-connect/category/jobs → "Jobs in Saudi Arabia".
// Server-rendered so Google sees the ads; links on to each city's page for this category.
export const revalidate = 600;

const BASE = "https://www.myksaconnect.com";
const COUNTRY = "Saudi Arabia";

type Props = { params: Promise<{ category: string }> };

type Ad = {
  id: string;
  title: string;
  price: string;
  city: string;
  place: string;
  sub: string;
  image?: string;
  created?: number;
};

async function getAds(categoryKey: string): Promise<Ad[]> {
  try {
    const q = query(
      collection(db, "listings"),
      where("category", "==", categoryKey),
      where("status", "==", "active"),
      limit(300),
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
          city: String(data.city ?? ""),
          place: String(data.location ?? ""),
          sub: String(data.subCategory ?? ""),
          image: images[0],
          created: typeof c?.toMillis === "function" ? c.toMillis() : undefined,
        };
      })
      .filter((a) => a.title)
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
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
  const { category } = await params;
  const page = categoryPageBySlug(category);
  if (!page) return { title: "Not found — MYKSA Connect" };
  const ads = await getAds(page.key);
  const title = `${page.title(COUNTRY)} | MYKSA Connect`;
  const description = `${ads.length ? `${ads.length} live ads. ` : ""}${page.intro(COUNTRY)}`.slice(0, 300);
  const url = `${BASE}/ksa-connect/category/${page.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: ads.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "MYKSA Connect" },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const page = categoryPageBySlug(category);
  if (!page) notFound();

  const all = await getAds(page.key);
  const ads = all.slice(0, 60);

  // Ad count per city → city links (biggest first, then the rest)
  const counts = new Map<string, number>();
  for (const a of all) if (CITIES.includes(a.city)) counts.set(a.city, (counts.get(a.city) ?? 0) + 1);
  const cityLinks = [...CITIES].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

  return (
    <>
    <KsaBrandHeader
      title={`${page.emoji} ${page.title(COUNTRY)}`}
      intro={page.intro(COUNTRY)}
      crumbs={[{ label: "Ads", href: "/" }, { label: page.key }]}
      postHref={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`}
    />
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px 48px" }}>

      {/* Pick a city */}
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>Choose a city:</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {cityLinks.map((c) => (
          <a key={c} href={`/ksa-connect/city/${citySlug(c)}/${page.slug}`} className="pill" style={{ textDecoration: "none" }}>
            {c}
            {counts.get(c) ? ` (${counts.get(c)})` : ""}
          </a>
        ))}
      </div>

      {/* Other categories */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORY_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
          <a key={p.slug} href={`/ksa-connect/category/${p.slug}`} style={{ fontSize: 13.5 }}>
            {p.emoji} {p.key}
          </a>
        ))}
      </div>

      {ads.length ? (
        <>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px" }}>
            {all.length} live {all.length === 1 ? "ad" : "ads"} · newest first
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
                    <img src={a.image} alt={a.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.35 }}>{a.title}</h2>
                  {a.price && <p style={{ margin: "0 0 4px", fontWeight: 800, color: "var(--navy)" }}>{a.price}</p>}
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>
                    📍 {[a.city, a.place].filter(Boolean).join(" · ")}
                    {a.created ? ` · ${postedAgo(a.created)}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
          {all.length > ads.length && (
            <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", marginTop: 16 }}>
              Showing the newest {ads.length}. Choose a city above to see all {page.key.toLowerCase()} ads there.
            </p>
          )}
        </>
      ) : (
        <div style={{ padding: "28px 20px", border: "1px dashed var(--border)", borderRadius: 14, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 15 }}>No {page.key.toLowerCase()} ads right now. Be the first to post one — it&apos;s free.</p>
        </div>
      )}

      <div style={{ textAlign: "center", margin: "28px 0 0" }}>
        <a
          href={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`}
          className="mk-btn mk-btn-gold"
          style={{ fontSize: 15, padding: "12px 26px", fontWeight: 800 }}
        >
          📢 Post a free {page.key} ad
        </a>
      </div>
    </div>
    </>
  );
}
