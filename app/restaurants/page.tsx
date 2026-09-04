import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface Restaurant {
  slug: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  city?: string;
  cuisine?: string;
  isActive?: boolean;
}

const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

export const metadata: Metadata = isKsaConnectSite
  ? {
      title: "Digital Menus — Restaurants in Saudi Arabia | KSA-Connect",
      description:
        "Browse digital menus from restaurants across Saudi Arabia. View prices, order via WhatsApp, and discover new places to eat — powered by KSA-Connect.",
    }
  : {};

export default async function RestaurantsDirectoryPage() {
  if (!isKsaConnectSite) notFound();

  const q = query(collection(db, "restaurants"), where("isActive", "==", true));
  const snap = await getDocs(q);
  const restaurants = snap.docs.map((d) => d.data() as Restaurant);

  return (
    <div>
      {/* Scoped styles for hover effects — plain CSS since this is a server component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .rd-hero-band {
              width: 100%;
              background: linear-gradient(135deg, #04160f 0%, #0a2a1f 100%);
            }
            .rd-hero-wrap {
              max-width: 1400px;
              margin: 0 auto;
              padding: 24px 20px;
            }
            .rd-hero {
              position: relative;
              width: 100%;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .rd-hero img {
              width: 100%;
              height: auto;
              display: block;
            }
            .rd-grid-wrap {
              max-width: 1100px;
              margin: 0 auto;
              padding: 36px 20px 60px;
            }
            .rd-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
              gap: 24px;
            }
            .rd-card {
              display: block;
              border-radius: 18px;
              overflow: hidden;
              border: 1px solid rgba(0,87,68,0.12);
              text-decoration: none;
              color: inherit;
              background: #fff;
              box-shadow: 0 3px 14px rgba(0,0,0,0.07);
              transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
            }
            .rd-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 16px 32px rgba(0,87,68,0.18);
              border-color: #f6b91f;
            }
            .rd-card-media {
              position: relative;
              width: 100%;
              height: 150px;
              background: linear-gradient(135deg, #0C1730, #1a2c50);
            }
            .rd-card-media::after {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%);
            }
            .rd-card-logo {
              position: absolute;
              bottom: -22px;
              left: 16px;
              width: 56px;
              height: 56px;
              border-radius: 14px;
              overflow: hidden;
              border: 3px solid #fff;
              background: #fff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              z-index: 2;
            }
            .rd-view-menu {
              position: absolute;
              top: 10px;
              right: 10px;
              background: #f6b91f;
              color: #0C1730;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.4px;
              text-transform: uppercase;
              padding: 5px 10px;
              border-radius: 999px;
              z-index: 2;
            }
            .rd-card-body {
              padding: 30px 16px 18px;
            }
            .rd-card-name {
              margin: 0;
              font-size: 17px;
              font-weight: 800;
              color: #0C1730;
            }
            .rd-card-tagline {
              margin: 3px 0 0;
              font-size: 12.5px;
              color: #6b7280;
            }
            .rd-card-tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              margin-top: 12px;
            }
            .rd-tag {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 11.5px;
              font-weight: 600;
              padding: 3px 10px;
              border-radius: 999px;
            }
            .rd-tag-cuisine {
              background: rgba(0,87,68,0.08);
              color: #005744;
            }
            .rd-tag-city {
              background: rgba(246,185,31,0.14);
              color: #a3760a;
            }
            .rd-empty {
              text-align: center;
              color: #6b7280;
              padding: 40px 20px;
              font-size: 14px;
            }
          `,
        }}
      />

      <div className="rd-hero-band">
        <div className="rd-hero-wrap">
          <div className="rd-hero">
            <h1
              style={{
                position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
                overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
              }}
            >
              Restaurants on KSA-Connect — Digital Menus in Saudi Arabia
            </h1>
            <Image
              src="/restaurants-hero-banner.png"
              alt="Restaurants on KSA-Connect — browse digital menus, compare prices, and order online"
              width={1774}
              height={886}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>

      <div className="rd-grid-wrap">
        {restaurants.length === 0 && (
          <p className="rd-empty">No restaurants listed yet — check back soon!</p>
        )}

        <div className="rd-grid">
          {restaurants.map((r) => (
            <a key={r.slug} href={`/${r.slug}`} className="rd-card">
              <div className="rd-card-media">
                {r.coverImageUrl && (
                  <Image src={r.coverImageUrl} alt={r.name} fill style={{ objectFit: "cover" }} />
                )}
                <span className="rd-view-menu">View Menu →</span>
                {r.logoUrl && (
                  <div className="rd-card-logo">
                    <Image src={r.logoUrl} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                )}
              </div>
              <div className="rd-card-body">
                <h3 className="rd-card-name">{r.name}</h3>
                {r.tagline && <p className="rd-card-tagline">{r.tagline}</p>}
                <div className="rd-card-tags">
                  {r.cuisine && <span className="rd-tag rd-tag-cuisine">🍴 {r.cuisine}</span>}
                  {r.city && <span className="rd-tag rd-tag-city">📍 {r.city}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
