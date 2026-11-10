import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CITIES, citySlug } from "@/lib/categories";
import { categoryPageBySlug, type CategoryPage } from "@/lib/categoryPages";
import { formattedPrice, type Listing } from "@/lib/types";
import KsaBrandHeader from "@/components/ksa/KsaBrandHeader";
import { AdGrid, CategoryTiles, LandingStyles, type LandingAd } from "@/components/ksa/LandingParts";

// City × category page: /ksa-connect/city/riyadh/jobs → "Jobs in Riyadh". (CityCategoryPage)
// Server-rendered so Google sees the ads in the page HTML.
// Re-built at most every 10 minutes (new ads show up quickly, few Firestore reads).
export const revalidate = 600;

const BASE = "https://www.myksaconnect.com";

type Props = { params: Promise<{ city: string; category: string }> };

function cityFromSlug(slug: string): string | null {
  const s = decodeURIComponent(slug).toLowerCase();
  return CITIES.find((c) => citySlug(c) === s || c.toLowerCase() === s) ?? null;
}

// ok=false means Firestore failed — then we must NOT mark the page noindex.
async function getAds(city: string, page: CategoryPage): Promise<{ ads: LandingAd[]; ok: boolean }> {
  try {
    // Equality filters only — no composite index needed. Sorted newest-first here.
    const queries = [
      query(collection(db, "listings"), where("city", "==", city), where("category", "==", page.key), where("status", "==", "active"), limit(100)),
      ...(page.extra ?? []).map((e) =>
        query(
          collection(db, "listings"),
          where("city", "==", city),
          where("category", "==", e.category),
          where("subCategory", "==", e.subCategory),
          where("status", "==", "active"),
          limit(100),
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
    console.error("city/category ads query failed", err);
    return { ads: [], ok: false };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = cityFromSlug(city);
  const page = categoryPageBySlug(category);
  if (!cityName || !page) return { title: "Not found — MYKSA Connect" };

  const { ads, ok } = await getAds(cityName, page);
  const title = `${page.title(cityName)} | MYKSA Connect`;
  const description = `${ads.length ? `${ads.length} live ads. ` : ""}${page.intro(cityName)}`.slice(0, 300);
  const url = `${BASE}/ksa-connect/city/${citySlug(cityName)}/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // An empty page is thin content — keep it out of Google until it has ads.
    robots: ads.length || !ok ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "MYKSA Connect" },
  };
}

export default async function CityCategoryPage({ params }: Props) {
  const { city, category } = await params;
  const cityName = cityFromSlug(city);
  const page = categoryPageBySlug(category);
  if (!cityName || !page) notFound();

  const { ads: all } = await getAds(cityName, page);
  const ads = all.slice(0, 60);
  const cSlug = citySlug(cityName);
  const otherCities = CITIES.filter((c) => c !== cityName);

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
    <div className="ksa-land">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LandingStyles />
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

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px", display: "grid", gap: 18 }}>
        <section className="ksa-panel">
          <p className="ksa-label">🗂️ More in {cityName}</p>
          <CategoryTiles current={page.slug} hrefFor={(slug) => `/ksa-connect/city/${cSlug}/${slug}`} />
        </section>

        <section className="ksa-panel">
          {ads.length ? (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
                {all.length} live {all.length === 1 ? "ad" : "ads"} in {cityName} · newest first
              </p>
              <AdGrid ads={ads} />
              {all.length > ads.length && (
                <p style={{ textAlign: "center", fontSize: 13.5, color: "#6B7280", marginTop: 16 }}>Showing the newest {ads.length}.</p>
              )}
            </>
          ) : (
            <div style={{ padding: "24px 8px", textAlign: "center" }}>
              <p style={{ margin: "0 0 10px", fontSize: 15 }}>
                No {page.key.toLowerCase()} ads in {cityName} right now. Be the first to post one — it&apos;s free.
              </p>
              <a href={`/ksa-connect/category/${page.slug}`} style={{ fontSize: 14, fontWeight: 700 }}>
                See {page.key.toLowerCase()} ads in all of Saudi Arabia →
              </a>
            </div>
          )}
        </section>

        <div style={{ textAlign: "center" }}>
          <a href={`/ksa-connect/post?category=${encodeURIComponent(page.key)}`} className="ksa-post">
            📢 Post a free {page.key} ad in {cityName}
          </a>
        </div>

        {/* Same category in other cities — internal links help Google find every page */}
        <section className="ksa-panel">
          <p className="ksa-label">
            {page.emoji} {page.key} in other cities
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {otherCities.map((c) => (
              <a key={c} href={`/ksa-connect/city/${citySlug(c)}/${page.slug}`} className="ksa-chip">
                {c}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
