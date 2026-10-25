import { ImageResponse } from "next/og";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Home-screen icon for a restaurant menu: the restaurant's logo on a cream tile.
export const revalidate = 86400;

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

export async function GET(req: Request, { params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug: slug } = await params;
  const u = new URL(req.url);
  const size = [180, 192, 512].includes(Number(u.searchParams.get("size"))) ? Number(u.searchParams.get("size")) : 512;
  const maskable = u.searchParams.get("maskable") === "1";

  let name = "Menu";
  let logoUrl: string | undefined;
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where("slug", "==", slug), limit(1)));
    if (!snap.empty) {
      name = String(snap.docs[0].get("name") ?? name);
      logoUrl = snap.docs[0].get("logoUrl") ?? undefined;
    }
  } catch {}
  const logo = await asDataUrl(logoUrl);
  const inner = Math.round(size * (maskable ? 0.62 : 0.8)); // maskable icons need a safe zone

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf5e8" }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={inner} height={inner} style={{ width: inner, height: inner, objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", fontSize: Math.round(size * 0.5), fontWeight: 900, color: "#5d261e" }}>{name.slice(0, 1)}</div>
        )}
      </div>
    ),
    { width: size, height: size }
  );
}
