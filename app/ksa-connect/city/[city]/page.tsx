import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CITIES, citySlug } from "@/lib/categories";
import { CATEGORY_PAGES } from "@/lib/categoryPages";
import { formattedPrice, type Listing } from "@/lib/types";
import KsaBrandHeader from "@/components/ksa/KsaBrandHeader";
import { AdGrid, CategoryTiles, LandingStyles, type LandingAd } from "@/components/ksa/LandingParts";

// City page: /ksa-connect/city/jubail → all ads in Jubail. (CityOverviewPage)
// Same design as the category pages, and server-rendered so Google sees the ads.
export const revalidate = 600;

const BASE = "https://www.myksaconnect.com";

type Props = { params: Promise<{ city: string }> };

function slugToCityValue(slug: string): string | null {
  const s = decodeURIComponent(slug).toLowerCase();
  return CITIES.find((c) => citySlug(c) === s || c.toLowerCase() === s) ?? null;
}

// Pre-generates a route for each real city at build time.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: citySlug(c) }));
}

async function getAds(city: string): Promise<{ ads: LandingAd[]; ok: boolean }> {
  try {
    const snap = await getDocs(
      query(collection(db, "listings"), where("city", "==", city), where("status", "==", "active"), limit(300)),
    );
    const ads = snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        const c = data.createdAt as { toMillis?: () => number } | undefined;
        const images = (data.imageUrls as string[] | undefined) ?? [];
        let price = "";
        try {
          price = formattedPrice({ id: d.id, ...data } as unknown as Listing);
        } catch {}
        const cat = String(data.category ?? "");
        return {
          id: d.id,
          title: String(data.title ?? ""),
          price,
          city: String(data.city ?? ""),
          place: String(data.location ?? ""),
          sub: String(data.subCategory ?? ""),
          categoryLabel: CATEGORY_PAGES.find((p) => p.key === cat)?.key ?? cat,
          image: images[0],
          created: typeof c?.toMillis === "function" ? c.toMillis() : undefined,
        };
      })
      .filter((a) => a.title)
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    return { ads, ok: true };
  } catch (err) {
    console.error("city ads query failed", err);
    return { ads: [], ok: false };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityValue = slugToCityValue(city);
  if (!cityValue) return { title: "Not found — MYKSA Connect" };
  const { ads, ok } = await getAds(cityValue);
  const title = `Classifieds in ${cityValue} — Housing, Jobs, Cars & More | MYKSA Connect`;
  const description = `${ads.length ? `${ads.length} live ads. ` : ""}Browse flats and rooms for rent, jobs, cars, services and more in ${cityValue}, Saudi Arabia. Post a free ad on MYKSA Connect.`;
  const url = `${BASE}/ksa-connect/city/${citySlug(cityValue)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: ads.length || !ok ? undefined : { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "MYKSA Connect" },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityValue = slugToCityValue(city);
  if (!cityValue) notFound();

  const { ads: all } = await getAds(cityValue);
  const ads = all.slice(0, 60);
  const cSlug = citySlug(cityValue);

  return (
    <div className="ksa-land">
      <LandingStyles />
      <KsaBrandHeader
        title={`📍 Classifieds in ${cityValue}`}
        intro={`Flats and rooms for rent, jobs, cars, services and more in ${cityValue} — posted by the local community. Contact sellers directly on call or WhatsApp.`}
        crumbs={[{ label: "Ads", href: "/" }, { label: cityValue }]}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px", display: "grid", gap: 18 }}>
        <section className="ksa-panel">
          <p className="ksa-label">🗂️ Browse {cityValue} by category</p>
          <CategoryTiles hrefFor={(slug) => `/ksa-connect/city/${cSlug}/${slug}`} />
        </section>

        <section className="ksa-panel">
          {ads.length ? (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
                {all.length} live {all.length === 1 ? "ad" : "ads"} in {cityValue} · newest first
              </p>
              <AdGrid ads={ads} />
              {all.length > ads.length && (
                <p style={{ textAlign: "center", fontSize: 13.5, color: "#6B7280", marginTop: 16 }}>
                  Showing the newest {ads.length}. Choose a category above to see more.
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, padding: "24px 8px", textAlign: "center", fontSize: 15 }}>
              No ads in {cityValue} right now. Be the first to post one — it&apos;s free.
            </p>
          )}
        </section>

        <div style={{ textAlign: "center" }}>
          <a href="/ksa-connect/post" className="ksa-post">
            📢 Post a free ad in {cityValue}
          </a>
        </div>

        <section className="ksa-panel">
          <p className="ksa-label">📍 Other cities</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CITIES.filter((c) => c !== cityValue).map((c) => (
              <a key={c} href={`/ksa-connect/city/${citySlug(c)}`} className="ksa-chip">
                {c}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
