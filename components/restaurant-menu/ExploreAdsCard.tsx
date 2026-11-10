import ExploreAdsStrip from "./ExploreAdsStrip";

// "Door" from a restaurant menu into the MYKSA Connect classifieds.
// Every link carries utm tags (utm_source=menu_<slug>) so GA4 shows how many
// visitors each restaurant sends to the ads.

const SHORTCUTS = [
  { icon: "🏠", label: "Rooms & flats", category: "Housing" },
  { icon: "💼", label: "Jobs", category: "Jobs" },
  { icon: "🚗", label: "Cars", category: "Car" },
  { icon: "🛠️", label: "Services", category: "Services" },
] as const;

const NAVY = "#0C1730";
const GOLD = "#E8B84B";

function adsLink(slug: string, placement: string, city?: string, category?: string) {
  const p = new URLSearchParams();
  if (category) p.set("category", category);
  if (city) p.set("city", city);
  p.set("utm_source", `menu_${slug}`);
  p.set("utm_medium", "restaurant_menu");
  p.set("utm_campaign", placement);
  return `/ksa-connect?${p.toString()}`;
}

export default function ExploreAdsCard({
  slug,
  city,
  variant = "card",
}: {
  slug: string;
  city?: string;
  variant?: "card" | "strip";
}) {
  const place = city || "Saudi Arabia";

  // Slim rotating line under the contact bar (client component).
  if (variant === "strip") return <ExploreAdsStrip slug={slug} city={city} />;

  // Full card at the end of the menu.
  return (
    <section
      aria-label="Free ads on MYKSA Connect"
      style={{
        margin: "24px 16px",
        padding: "20px 18px",
        borderRadius: 18,
        background: NAVY,
        color: "#fff",
        borderTop: `4px solid ${GOLD}`,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, lineHeight: 1.35, color: GOLD }}>
        Waiting for your food? Browse free ads in {place} 👀
      </h2>
      <p style={{ margin: "6px 0 16px", fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,0.78)" }}>
        Rooms, jobs, cars & services in {place} — new ads every day on MYKSA Connect.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {SHORTCUTS.map((s) => (
          <a
            key={s.category}
            href={adsLink(slug, "menu_card", city, s.category)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(232,184,75,0.35)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span aria-hidden style={{ fontSize: 20 }}>{s.icon}</span>
            {s.label}
          </a>
        ))}
      </div>

      <a
        href={adsLink(slug, "menu_card", city)}
        style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: GOLD, fontWeight: 700 }}
      >
        See all ads
      </a>
    </section>
  );
}
