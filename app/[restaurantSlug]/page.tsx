import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────
interface Restaurant {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  cuisine?: string;
  isActive?: boolean;
  // Link to the restaurant's own digital menu (e.g. urbanredchillies.com/menu).
  // When set, this page shows a "View Full Menu" button + QR code that send
  // visitors there instead of rendering a menu inline — keeps this page as
  // a lightweight SEO listing while the restaurant's own site stays the
  // single source of truth for prices/availability.
  menuUrl?: string;
}

// This shared codebase also powers moaappsdevelopers.com — restaurant
// pages should only exist on the myksaconnect.com deployment.
const isKsaConnectSite = process.env.SITE_MODE === "ksaconnect";

async function getRestaurant(slug: string): Promise<Restaurant | null> {
  const q = query(
    collection(db, "restaurants"),
    where("slug", "==", slug),
    where("isActive", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Restaurant;
}

// ── SEO metadata, generated per-restaurant ─────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}): Promise<Metadata> {
  if (!isKsaConnectSite) return {};
  const { restaurantSlug } = await params;
  const restaurant = await getRestaurant(restaurantSlug);
  if (!restaurant) return { title: "Restaurant Not Found — KSA-Connect" };

  const title = `${restaurant.name} — Digital Menu | KSA-Connect`;
  const description =
    restaurant.description ||
    `View the full menu, prices, and contact details for ${restaurant.name}${restaurant.city ? ` in ${restaurant.city}` : ""}. Powered by KSA-Connect.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.myksaconnect.com/${restaurant.slug}`,
      images: restaurant.coverImageUrl ? [restaurant.coverImageUrl] : undefined,
    },
  };
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  if (!isKsaConnectSite) notFound();

  const { restaurantSlug } = await params;
  const restaurant = await getRestaurant(restaurantSlug);
  if (!restaurant) notFound();

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    servesCuisine: restaurant.cuisine,
    address: restaurant.address,
    telephone: restaurant.phone,
    image: restaurant.coverImageUrl,
    url: `https://www.myksaconnect.com/${restaurant.slug}`,
    ...(restaurant.menuUrl ? { hasMenu: restaurant.menuUrl } : {}),
  };

  const qrCodeUrl = restaurant.menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        restaurant.menuUrl
      )}`
    : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />

      {/* ── Cover + Logo ── */}
      <div style={{ position: "relative", width: "100%", height: 220, background: "#0C1730" }}>
        {restaurant.coverImageUrl && (
          <Image src={restaurant.coverImageUrl} alt={restaurant.name} fill style={{ objectFit: "cover", opacity: 0.85 }} />
        )}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(6,11,22,0.2) 0%, rgba(6,11,22,0.85) 100%)",
          }}
        />
        <div style={{ position: "absolute", bottom: 16, left: 20, right: 20, display: "flex", alignItems: "flex-end", gap: 14 }}>
          {restaurant.logoUrl && (
            <div style={{ position: "relative", width: 72, height: 72, borderRadius: 16, overflow: "hidden", border: "3px solid #E8B84B", flexShrink: 0, background: "#fff" }}>
              <Image src={restaurant.logoUrl} alt={`${restaurant.name} logo`} fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>{restaurant.name}</h1>
            {restaurant.tagline && (
              <p style={{ color: "#E8B84B", fontSize: 13, margin: "2px 0 0" }}>{restaurant.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Contact bar ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        {restaurant.address && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>📍 {restaurant.address}</span>
        )}
        {restaurant.phone && (
          <a href={`tel:${restaurant.phone}`} className="mk-btn" style={{ fontSize: 13, padding: "6px 14px" }}>
            📞 Call
          </a>
        )}
        {restaurant.whatsapp && (
          <a
            href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank" rel="noreferrer"
            className="mk-btn mk-btn-gold"
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            💬 WhatsApp Order
          </a>
        )}
      </div>

      {restaurant.description && (
        <p style={{ padding: "16px 20px 0", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
          {restaurant.description}
        </p>
      )}

      {/* ── Digital Menu: link + QR ── */}
      <div style={{ padding: "28px 20px" }}>
        {restaurant.menuUrl ? (
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
              padding: "28px 20px", border: "1px solid var(--border)", borderRadius: 16,
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🍽️ View Full Digital Menu</h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", maxWidth: 340 }}>
              Scan the QR code with your phone camera, or tap the button below to open the menu.
            </p>

            {qrCodeUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt={`QR code to ${restaurant.name} digital menu`}
                width={180}
                height={180}
                style={{ borderRadius: 12, border: "1px solid var(--border)" }}
              />
            )}

            <a
              href={restaurant.menuUrl}
              target="_blank"
              rel="noreferrer"
              className="mk-btn mk-btn-gold"
              style={{ fontSize: 14, padding: "10px 24px", fontWeight: 700 }}
            >
              Open Digital Menu →
            </a>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Menu coming soon.</p>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px", borderTop: "1px solid var(--border)" }}>
        <a href="/restaurants" style={{ fontSize: 13, color: "var(--text-muted)" }}>← Browse other restaurants on KSA-Connect</a>
      </div>
    </div>
  );
}
