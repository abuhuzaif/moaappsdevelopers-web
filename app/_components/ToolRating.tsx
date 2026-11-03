"use client";

// Star ratings for the free tools.
//
// Firestore:
//   toolRatings/{slug}/votes/{voterId}  → { stars: 1-5, createdAt }   one vote per browser per tool
//   toolFeedback/{autoId}               → { slug, stars, comment, createdAt }   private, never read by the site
//
// The page shows "★ 4.8 (126 ratings)" and, once a tool has MIN_FOR_SCHEMA real votes,
// adds WebApplication + aggregateRating structured data so Google may show stars.

import { useEffect, useState, type CSSProperties } from "react";
import * as fs from "firebase/firestore";
import { db } from "@/lib/firebase";

const MIN_FOR_SCHEMA = 5;
const SITE = "https://www.myksaconnect.com";

export function voterId(): string {
  try {
    let id = localStorage.getItem("mk_voter_id");
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
      localStorage.setItem("mk_voter_id", id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export function hasRated(slug: string): boolean {
  try { return !!localStorage.getItem(`mk_rated_${slug}`); } catch { return false; }
}

export async function submitRating(slug: string, stars: number, comment: string) {
  const id = voterId();
  try { localStorage.setItem(`mk_rated_${slug}`, String(stars)); } catch {}
  try { sessionStorage.removeItem(`mk_rating_${slug}`); } catch {}
  await fs.setDoc(fs.doc(db, "toolRatings", slug, "votes", id), { stars, createdAt: fs.serverTimestamp() });
  const text = comment.trim().slice(0, 500);
  if (text) {
    await fs.addDoc(fs.collection(db, "toolFeedback"), { slug, stars, comment: text, createdAt: fs.serverTimestamp() });
  }
  try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "tool_rating", { tool: slug, stars }); } catch {}
}

type Summary = { count: number; avg: number };

/** Count + average of a tool's votes (cached for the browser session). */
export async function fetchRating(slug: string): Promise<Summary> {
  try {
    const cached = sessionStorage.getItem(`mk_rating_${slug}`);
    if (cached) return JSON.parse(cached) as Summary;
  } catch {}
  const votes = fs.collection(db, "toolRatings", slug, "votes");
  let out: Summary = { count: 0, avg: 0 };
  const anyFs = fs as unknown as Record<string, unknown>;
  if (typeof anyFs.average === "function" && typeof anyFs.getAggregateFromServer === "function") {
    const snap = await fs.getAggregateFromServer(votes, { n: fs.count(), a: fs.average("stars") });
    out = { count: snap.data().n, avg: Number(snap.data().a ?? 0) };
  } else {
    const snap = await fs.getDocs(fs.query(votes, fs.limit(1000)));
    const s = snap.docs.reduce((t, d) => t + Number(d.get("stars") || 0), 0);
    out = { count: snap.size, avg: snap.size ? s / snap.size : 0 };
  }
  try { sessionStorage.setItem(`mk_rating_${slug}`, JSON.stringify(out)); } catch {}
  return out;
}

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span aria-hidden style={{ letterSpacing: 1, fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: value >= i - 0.25 ? "#f5a524" : "#d6dcda" }}>★</span>
      ))}
    </span>
  );
}

/** "★★★★★ 4.8 (126 ratings) · Rate this tool" under the banner, plus the structured data for Google. */
export function RatingBadge({ slug, onRate, refreshKey }: { slug: string; onRate: () => void; refreshKey: number }) {
  const [sum, setSum] = useState<Summary | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let alive = true;
    fetchRating(slug).then((s) => alive && setSum(s)).catch(() => alive && setSum({ count: 0, avg: 0 }));
    const h1 = document.querySelector("h1")?.textContent?.trim();
    setName(h1 || document.title.split("|")[0].trim());
    return () => { alive = false; };
  }, [slug, refreshKey]);

  if (!sum) return null;
  const rated = hasRated(slug);
  const avg = Math.round(sum.avg * 10) / 10;

  const schema =
    sum.count >= MIN_FOR_SCHEMA && name
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name,
          url: `${SITE}/tools/${slug}`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), ratingCount: sum.count, bestRating: "5", worstRating: "1" },
        }
      : null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "12px auto 0", fontSize: 13, color: "#36504a", fontFamily: "Inter, Arial, sans-serif" }}>
      {sum.count > 0 ? (
        <>
          <Stars value={avg} />
          <strong style={{ color: "#102f29" }}>{avg.toFixed(1)}</strong>
          <span>({sum.count} rating{sum.count === 1 ? "" : "s"})</span>
        </>
      ) : (
        <span>No ratings yet</span>
      )}
      {!rated && (
        <button type="button" onClick={onRate} style={{ background: "none", border: 0, padding: 0, color: "#005744", fontWeight: 800, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}>
          {sum.count > 0 ? "Rate this tool" : "Be the first to rate it"}
        </button>
      )}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
    </div>
  );
}

/** The "How was this tool?" card. Calls onDone(stars) after saving. */
export function RatingPrompt({ slug, onDone, onClose }: { slug: string; onDone: (stars: number) => void; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(n: number, text: string) {
    setBusy(true); setErr("");
    try { await submitRating(slug, n, text); onDone(n); }
    catch { setErr("Could not save your rating. Please try again."); setBusy(false); }
  }

  return (
    <div role="dialog" aria-label="Rate this tool" style={cardStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", fontSize: 14 }}>✅ Done! How was this tool?</strong>
        <div style={{ display: "flex", gap: 2, margin: "6px 0 2px" }} onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i} star${i === 1 ? "" : "s"}`}
              disabled={busy}
              onMouseEnter={() => setHover(i)}
              onClick={() => { setStars(i); if (i >= 4) void send(i, ""); }}
              style={{ background: "none", border: 0, padding: "0 2px", cursor: "pointer", fontSize: 28, lineHeight: 1, color: (hover || stars) >= i ? "#f6b91f" : "rgba(255,255,255,.35)" }}
            >
              ★
            </button>
          ))}
        </div>
        {stars > 0 && stars < 4 && (
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="What can we improve? (optional)"
              style={{ flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: 8, border: 0, fontSize: 13 }}
            />
            <button type="button" disabled={busy} onClick={() => void send(stars, comment)} style={btnStyle}>
              {busy ? "…" : "Send"}
            </button>
          </div>
        )}
        {err && <div style={{ fontSize: 12, color: "#ffd2d2", marginTop: 4 }}>{err}</div>}
      </div>
      <button type="button" aria-label="Close" onClick={onClose} style={closeStyle}>✕</button>
    </div>
  );
}

export const cardStyle: CSSProperties = {
  position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)", zIndex: 1000,
  width: "min(460px, calc(100% - 24px))", display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px", borderRadius: 16, background: "linear-gradient(135deg,#0c1730,#005744)",
  color: "#fff", border: "1px solid rgba(246,185,31,.6)", boxShadow: "0 14px 34px rgba(0,0,0,.28)",
  fontFamily: "Inter, Arial, sans-serif",
};
export const btnStyle: CSSProperties = {
  flex: "0 0 auto", padding: "9px 12px", borderRadius: 10, border: 0, background: "#f6b91f", color: "#0c1730",
  fontWeight: 900, fontSize: 12.5, textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer",
};
export const closeStyle: CSSProperties = {
  flex: "0 0 auto", background: "none", border: 0, color: "#fff", opacity: 0.75, fontSize: 18, cursor: "pointer", padding: 4, alignSelf: "flex-start",
};
