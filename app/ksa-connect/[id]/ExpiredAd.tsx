"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Mini = { id: string; title: string; city: string; location: string; price: string; image: string | null; category: string };

/** Shown when an ad has expired / been removed — keeps visitors from old
 *  Facebook/Instagram posts on the site with the latest ads. */
export default function ExpiredAd() {
  const [ads, setAds] = useState<Mini[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "listings"), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(6)))
      .then((snap) =>
        setAds(
          snap.docs.map((d) => {
            const x = d.data() as Record<string, unknown>;
            const n = typeof x.price === "number" ? x.price : 0;
            const imgs = Array.isArray(x.imageUrls) ? (x.imageUrls as string[]) : [];
            return {
              id: d.id,
              title: String(x.title ?? ""),
              city: String(x.city ?? ""),
              location: String(x.location ?? ""),
              price: n > 0 ? `${n.toLocaleString("en-US")} SAR` : "Price on request",
              image: imgs[0] ?? null,
              category: String(x.category ?? ""),
            };
          })
        )
      )
      .catch(() => setAds([]));
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 0 40px", color: "#0c1730" }}>
      <section
        style={{
          padding: "clamp(20px, 4vw, 34px)", borderRadius: 18, textAlign: "center",
          background: "linear-gradient(135deg, #0c1730, #005744)", color: "#fff", border: "1px solid #d4a017",
        }}
      >
        <div style={{ fontSize: 44 }} aria-hidden="true">⏳</div>
        <h1 style={{ margin: "6px 0 6px", fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>This ad is no longer available</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>It may have expired, been sold, or been removed by the seller.</p>
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
    </div>
  );
}
