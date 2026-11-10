// Shared building blocks for the category / city-category landing pages,
// styled like the MYKSA Connect homepage (green + gold, white cards).
// Server components only — the ads stay in the HTML for Google.

import { CATEGORY_PAGES } from "@/lib/categoryPages";

export const GREEN = "#005744";
export const GOLD = "#E8B84B";
export const NAVY = "#0C1730";

export type LandingAd = {
  id: string;
  title: string;
  price: string;
  city: string;
  place: string;
  sub: string;
  categoryLabel: string;
  image?: string;
  created?: number;
};

// Soft colour per category (same feel as the homepage category tiles)
const TILE: Record<string, { bg: string; border: string; text: string }> = {
  housing: { bg: "#E8F7EF", border: "#22A06B", text: "#0E6B45" },
  jobs: { bg: "#FFF6DB", border: "#E5A400", text: "#8A5A00" },
  cars: { bg: "#FFEDE3", border: "#F07C3E", text: "#B4471A" },
  services: { bg: "#E9F7F1", border: "#2FA37A", text: "#16694D" },
  household: { bg: "#E8F0FF", border: "#3B82F6", text: "#1D4ED8" },
  "buy-sell": { bg: "#FFE8F1", border: "#E54C8C", text: "#B42363" },
  electronics: { bg: "#F1EAFF", border: "#8B5CF6", text: "#6D28D9" },
  community: { bg: "#E3F7F7", border: "#14A3A3", text: "#0F6F6F" },
  classifieds: { bg: "#FFF3DF", border: "#F0A230", text: "#9A5B00" },
};

export function postedAgo(ms?: number): string {
  if (!ms) return "";
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** Light page background + hover styles used by the cards and chips. */
export function LandingStyles() {
  return (
    <style>{`
      .ksa-land { background: #F7F5EF; }
      .ksa-panel { background: #fff; border-radius: 18px; border: 1px solid #E7E2D3; border-top: 4px solid ${GREEN}; box-shadow: 0 10px 30px rgba(12,23,48,.06); padding: 18px; }
      .ksa-label { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #6B7280; }
      .ksa-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px; background: #fff; border: 1px solid #E6DCC3; color: ${NAVY}; font-size: 13.5px; font-weight: 700; text-decoration: none; transition: border-color .15s, transform .15s; }
      .ksa-chip:hover { border-color: ${GOLD}; transform: translateY(-1px); }
      .ksa-chip b { background: ${GOLD}; color: ${NAVY}; border-radius: 999px; padding: 1px 7px; font-size: 11.5px; }
      .ksa-chip.is-empty { opacity: .55; font-weight: 600; }
      .ksa-chip.is-on { background: ${NAVY}; color: #fff; border-color: ${NAVY}; }
      .ksa-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-width: 96px; flex: 1 0 96px; padding: 12px 8px; border-radius: 14px; border: 1px solid; border-top-width: 4px; text-decoration: none; font-size: 13.5px; font-weight: 800; transition: transform .15s, box-shadow .15s; }
      .ksa-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(12,23,48,.08); }
      .ksa-tile span { font-size: 22px; line-height: 1; }
      .ksa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
      .ksa-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #DDE7E2; border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; transition: transform .15s, box-shadow .15s; }
      .ksa-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(0,87,68,.12); }
      .ksa-card-img { position: relative; aspect-ratio: 4 / 3; background: #E5E7EB; }
      .ksa-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ksa-card-img .ago { position: absolute; top: 8px; right: 8px; background: rgba(12,23,48,.85); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
      .ksa-card-img .noimg { height: 100%; display: grid; place-items: center; color: #9CA3AF; font-size: 13px; }
      .ksa-card-body { padding: 10px 12px 12px; display: flex; flex-direction: column; flex: 1; }
      .ksa-card-tag { font-size: 11px; font-weight: 800; color: #C68A00; text-transform: uppercase; letter-spacing: .04em; padding-bottom: 6px; border-bottom: 1px solid #F1E3BC; margin-bottom: 6px; }
      .ksa-card h2 { font-size: 14.5px; font-weight: 800; margin: 0 0 4px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: ${NAVY}; }
      .ksa-card .price { margin: 0 0 4px; font-weight: 800; color: ${GREEN}; font-size: 15px; }
      .ksa-card .where { margin: 0 0 10px; font-size: 12.5px; color: #6B7280; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .ksa-card .btn { margin-top: auto; text-align: center; background: ${GREEN}; color: #fff; font-weight: 800; font-size: 13.5px; padding: 9px; border-radius: 10px; }
      .ksa-post { display: inline-block; background: ${GOLD}; color: ${NAVY}; font-weight: 900; font-size: 15px; padding: 13px 28px; border-radius: 999px; text-decoration: none; box-shadow: 0 8px 20px rgba(232,184,75,.35); }
    `}</style>
  );
}

/** Coloured category tiles; `current` is highlighted, `hrefFor` builds each link. */
export function CategoryTiles({ current, hrefFor }: { current?: string; hrefFor: (slug: string) => string }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {CATEGORY_PAGES.map((p) => {
        const c = TILE[p.slug] ?? TILE.classifieds;
        const on = p.slug === current;
        return (
          <a
            key={p.slug}
            href={hrefFor(p.slug)}
            className="ksa-tile"
            aria-current={on ? "page" : undefined}
            style={{
              background: on ? c.border : c.bg,
              borderColor: c.border,
              color: on ? "#fff" : c.text,
            }}
          >
            <span aria-hidden>{p.emoji}</span>
            {p.key}
          </a>
        );
      })}
    </div>
  );
}

export function AdGrid({ ads }: { ads: LandingAd[] }) {
  return (
    <div className="ksa-grid">
      {ads.map((a) => (
        <a key={a.id} href={`/ksa-connect/${a.id}`} className="ksa-card">
          <div className="ksa-card-img">
            {a.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.image} alt={a.title} loading="lazy" />
            ) : (
              <div className="noimg">🖼️ No photo</div>
            )}
            {a.created && <span className="ago">{postedAgo(a.created)}</span>}
          </div>
          <div className="ksa-card-body">
            <span className="ksa-card-tag">{[a.categoryLabel, a.sub].filter(Boolean).join(" · ")}</span>
            <h2>{a.title}</h2>
            {a.price && <p className="price">{a.price}</p>}
            <p className="where">📍 {[a.city, a.place].filter(Boolean).join(" · ")}</p>
            <span className="btn">View Details</span>
          </div>
        </a>
      ))}
    </div>
  );
}
