import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Web-app manifest for each restaurant menu, so customers can "Add to Home screen"
// and open the menu next time like an app (no QR scan needed).
export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug: slug } = await params;
  let name = "Digital Menu";
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where("slug", "==", slug), limit(1)));
    if (!snap.empty) name = String(snap.docs[0].get("name") ?? name);
  } catch {}

  const manifest = {
    id: `/${slug}`,
    name: `${name} — Menu`,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: `${name} digital menu — prices, photos & calories. Order on WhatsApp.`,
    start_url: `/${slug}?utm_source=homescreen`,
    scope: `/${slug}`,
    display: "standalone",
    background_color: "#fbf5e8",
    theme_color: "#0c1730",
    icons: [
      { src: `/${slug}/app-icon?size=192`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `/${slug}/app-icon?size=512`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `/${slug}/app-icon?size=512&maskable=1`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
