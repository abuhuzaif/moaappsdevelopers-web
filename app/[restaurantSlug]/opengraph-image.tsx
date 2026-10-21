import { ImageResponse } from "next/og";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Link-preview card for every restaurant menu (myksaconnect.com/<slug>):
// cover photo, logo, name, cuisine, city and a "VIEW MENU" button.
export const alt = "Digital menu on MYKSA Connect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

type R = { name?: string; tagline?: string; cuisine?: string; city?: string; coverImageUrl?: string; logoUrl?: string };

async function getRestaurant(slug: string): Promise<R | null> {
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where("slug", "==", slug), limit(1)));
    return snap.empty ? null : (snap.docs[0].data() as R);
  } catch {
    return null;
  }
}

/**
 * Loads an image as a data URL for the card. Only real PNG/JPEG files are used
 * (checked by their first bytes — the server's content-type can be wrong, e.g.
 * a WebP saved as .jpg), small enough and fast enough; anything else is skipped
 * so the card still renders (navy background / first letter instead).
 */
async function asDataUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 16 || buf.length > 2_500_000) return null;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (!isPng && !isJpg) return null;
    return `data:${isPng ? "image/png" : "image/jpeg"};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function Image({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;
  const r = (await getRestaurant(restaurantSlug)) ?? { name: "Digital Menu" };
  const [cover, logo] = await Promise.all([asDataUrl(r.coverImageUrl), asDataUrl(r.logoUrl)]);
  const name = r.name ?? "Digital Menu";
  const subtitle = r.tagline || r.cuisine || "Restaurant";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0c1730", color: "#fff" }}>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        )}
        {/* darken the bottom so the text is always readable */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex",
            background: cover
              ? "linear-gradient(180deg, rgba(6,11,22,0.10) 0%, rgba(6,11,22,0.35) 45%, rgba(6,11,22,0.92) 100%)"
              : "linear-gradient(135deg, #071228 0%, #0b2338 55%, #005744 100%)",
          }}
        />

        {/* VIEW MENU button */}
        <div
          style={{
            position: "absolute", top: 36, right: 40, display: "flex", padding: "16px 30px", borderRadius: 999,
            background: "#f6b91f", color: "#0c1730", fontSize: 34, fontWeight: 900, letterSpacing: 1,
          }}
        >
          VIEW MENU
        </div>

        {/* name block */}
        <div style={{ position: "absolute", left: 48, right: 48, bottom: 44, display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              width: 170, height: 170, borderRadius: 30, background: "#fff", border: "6px solid #f6b91f",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={158} height={158} style={{ width: 158, height: 158, objectFit: "contain" }} />
            ) : (
              <div style={{ display: "flex", fontSize: 80, fontWeight: 900, color: "#0c1730" }}>{name.slice(0, 1)}</div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 34, flex: 1 }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>{name}</div>
            <div style={{ display: "flex", fontSize: 34, marginTop: 8, color: "#e8b84b" }}>{subtitle}</div>
            <div style={{ display: "flex", marginTop: 18 }}>
              {r.cuisine && (
                <div style={{ display: "flex", padding: "8px 22px", borderRadius: 999, background: "rgba(255,255,255,0.18)", fontSize: 26, fontWeight: 700, marginRight: 14 }}>
                  {r.cuisine}
                </div>
              )}
              {r.city && (
                <div style={{ display: "flex", padding: "8px 22px", borderRadius: 999, background: "rgba(246,185,31,0.25)", color: "#ffd66b", fontSize: 26, fontWeight: 700, marginRight: 14 }}>
                  {r.city}
                </div>
              )}
              <div style={{ display: "flex", padding: "8px 22px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 26, fontWeight: 700 }}>
                Order on WhatsApp
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", top: 46, left: 48, display: "flex", fontSize: 28, fontWeight: 800 }}>
          <span>MYKSA</span>
          <span style={{ color: "#f6b91f", marginLeft: 10 }}>CONNECT</span>
          <span style={{ marginLeft: 14, opacity: 0.85, fontWeight: 600 }}>· Digital Menu</span>
        </div>
      </div>
    ),
    size
  );
}
