import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CITIES, citySlug } from "@/lib/categories";
import { categoryPageBySlug, type CategoryPage } from "@/lib/categoryPages";
import { formattedPrice, type Listing } from "@/lib/types";
import KsaBrandHeader from "@/components/ksa/KsaBrandHeader";
import { AdGrid, CategoryTiles, LandingStyles, type LandingAd } from "@/components/ksa/LandingParts";

// All-Saudi category page: /ksa-connect/category/jobs → "Jobs in Saudi Arabia".
// Server-rendered so Google sees the ads; links on to each city's page for this category.
export const revalidate = 600;

const BASE = "https://www.myksaconnect.com";
const COUNTRY = "Saudi Arabia";

type Props = { params: Promise<{ category: string }> };

// ok=false means Firestore failed — then we must NOT mark the page noindex.
async function getAds(page: CategoryPage): Promise<{ ads: LandingAd[]; ok: boolean }> {
  try {
    const queries = [
      query(collection(db, "listings"), where("category", "==", page.key), where("status", "==", "active"), limit(300)),
      ...(page.extra ?? []).map((e) =>
        query(
          collection(db, "listings"),
          where("category", "==", e.category),
          where("subCategory", "==", e.subCategory),
          where("status", "==", "active"),
          limit(300),
        ),
      ),
    ];
    const snaps = await Promise.all(queries.map((q) => getDocs(q)));
    const docs = [...new Map(snaps.flatMap((s) => s.docs).map((d) => [d.id, d])).values()];
    const ads = docs
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
          categoryLabel: page.key,
          image: images[0],
          created: typeof c?.toMillis === "function" ? c.toMillis() : undefined,
        };
      })
      .filter((a) => a.title)
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    return { ads, ok: true };
  } catch (err) {
    console.error("category ads query failed", err);
    return { ads: [], ok: false };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = categoryPageBySlug(category);
  if (!page) return { title: "Not found — MYKSA Connect" };
  const { ads, ok } = await getAds(page);
  const title = `${page.title(COUNTRY)} | MYKSA Connect`;
  const description = `${ads.length ? `${ads.length} live ads. ` : ""}${page.intro(COUNTRY)}`.slice(0, 300);
  const url = `${BASE}/ksa-connect/category/${page.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: ads.length || !ok ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "MYKSA Connect" },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const page = categoryPageBySlug(category);
  if (!page) notFound();

  const { ads: all } = await getAds(page);
  const ads = all.slice(0, 60);

  // Ad count per city → city chips (busiest first)
  const counts = new Map<string, number>();
  for (const a of all) if (CITIES.includes(a.city)) counts.set(a.city, (counts.get(a.city) ?? 0) + 1);
  const cityLinks = [...CITIES].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

  return (
    <div className="ksa-land">
      <LandingStyles />
      <KsaBrandHeader
        title={`${page.emoji} ${page.title(COUNTRY)}`}
        intro={page.intro(COUNTRY)}
        crumbs={[{ label: "Ads", href: "/" }, { label: page.key }]}
        postHref={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px", display: "grid", gap: 18 }}>
        <section className="ksa-panel">
          <p className="ksa-label">📍 Choose a city</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {cityLinks.map((c) => {
              const n = counts.get(c) ?? 0;
              return (
                <a key={c} href={`/ksa-connect/city/${citySlug(c)}/${page.slug}`} className={`ksa-chip${n ? "" : " is-empty"}`}>
                  {c}
                  {n > 0 && <b>{n}</b>}
                </a>
              );
            })}
          </div>
          <p className="ksa-label">🗂️ Browse other categories</p>
          <CategoryTiles current={page.slug} hrefFor={(slug) => `/ksa-connect/category/${slug}`} />
        </section>

        <section className="ksa-panel">
          {ads.length ? (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
                {all.length} live {all.length === 1 ? "ad" : "ads"} across Saudi Arabia · newest first
              </p>
              <AdGrid ads={ads} />
              {all.length > ads.length && (
                <p style={{ textAlign: "center", fontSize: 13.5, color: "#6B7280", marginTop: 16 }}>
                  Showing the newest {ads.length}. Choose a city above to see all {page.key.toLowerCase()} ads there.
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, padding: "24px 8px", textAlign: "center", fontSize: 15 }}>
              No {page.key.toLowerCase()} ads right now. Be the first to post one — it&apos;s free.
            </p>
          )}
        </section>

        <div style={{ textAlign: "center" }}>
          <a href={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`} className="ksa-post">
            📢 Post a free {page.key} ad
          </a>
        </div>
      </div>
    </div>
  );
}
