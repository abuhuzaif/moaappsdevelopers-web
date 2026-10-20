import type { Metadata } from "next";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

type Mini = { id: string; title: string; city: string; location: string; price: string; image: string | null; category: string };
type FsValue = { stringValue?: string; integerValue?: string; doubleValue?: number; arrayValue?: { values?: FsValue[] } };

/** Latest 6 active ads via Firestore REST (works reliably on the server). */
async function latestAds(): Promise<Mini[]> {
  if (!PROJECT_ID) return [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery${API_KEY ? `?key=${API_KEY}` : ""}`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "listings" }],
            where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "active" } } },
            orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
            limit: 6,
          },
        }),
      }
    );
    if (!res.ok) {
      console.warn(`latestAds: Firestore replied ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as { document?: { name: string; fields?: Record<string, FsValue> } }[];
    return rows
      .filter((r) => r.document)
      .map((r) => {
        const f = r.document!.fields ?? {};
        const str = (k: string) => f[k]?.stringValue ?? "";
        const num = Number(f.price?.doubleValue ?? f.price?.integerValue ?? 0);
        const imgs = (f.imageUrls?.arrayValue?.values ?? []).map((v) => v.stringValue ?? "").filter(Boolean);
        return {
          id: r.document!.name.split("/").pop() ?? "",
          title: str("title"),
          city: str("city"),
          location: str("location"),
          price: num > 0 ? `${num.toLocaleString("en-US")} SAR` : "Price on request",
          image: imgs[0] ?? null,
          category: str("category"),
        };
      });
  } catch (err) {
    console.warn("latestAds failed", err);
    return [];
  }
}

export default async function ListingNotFound() {
  const ads = await latestAds();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px", color: "#0c1730" }}>
      <a href="/" style={{ color: "#005744", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← MYKSA Connect home</a>

      <section
        style={{
          marginTop: 14, padding: "clamp(20px, 4vw, 34px)", borderRadius: 18, textAlign: "center",
          background: "linear-gradient(135deg, #0c1730, #005744)", color: "#fff", border: "1px solid #d4a017",
        }}
      >
        <div style={{ fontSize: 44 }} aria-hidden="true">⏳</div>
        <h1 style={{ margin: "6px 0 6px", fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>This ad is no longer available</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          It may have expired, been sold, or been removed by the seller.
        </p>
        <p dir="rtl" style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 14 }}>هذا الإعلان لم يعد متاحاً — تصفح أحدث الإعلانات أدناه</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
          <a href="/#listings" style={{ padding: "11px 20px", borderRadius: 12, background: "#f6b91f", color: "#0c1730", fontWeight: 800, textDecoration: "none" }}>
            Browse latest ads →
          </a>
          <a href="/ksa-connect/post" style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid #fff", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
            + Post a free ad
          </a>
        </div>
      </section>

      {ads.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, margin: "0 0 12px" }}>Latest ads on MYKSA Connect</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {ads.map((a) => (
              <a
                key={a.id}
                href={`/ksa-connect/${a.id}`}
                style={{ display: "block", borderRadius: 14, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff", color: "#0c1730", textDecoration: "none" }}
              >
                <div style={{ height: 140, background: "#eef2f1" }}>
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#b7791f" }}>{a.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, margin: "3px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{a.price}</div>
                  <div style={{ fontSize: 12, color: "#5d6a68", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    📍 {a.city}{a.location && !a.location.toLowerCase().includes(a.city.toLowerCase()) ? ` · ${a.location}` : ""}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
