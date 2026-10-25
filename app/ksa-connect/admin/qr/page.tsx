"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";

/**
 * Admin → Restaurant QR generator.
 * Pick a restaurant → QR code with the restaurant's LOGO in the centre
 * (high error-correction so it still scans) → download the QR or a print card.
 */

const SITE = "https://www.myksaconnect.com";
const QR_LIB = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";

type R = { id: string; name: string; slug: string; isActive?: boolean; city?: string };
type QRFactory = (type: number, level: "L" | "M" | "Q" | "H") => {
  addData: (d: string) => void;
  make: () => void;
  getModuleCount: () => number;
  isDark: (r: number, c: number) => boolean;
};

const COLORS: { name: string; fg: string; accent: string; bg: string }[] = [
  { name: "Brown", fg: "#5d261e", accent: "#c88c3c", bg: "#faf3e2" },
  { name: "Navy", fg: "#0c1730", accent: "#d4a017", bg: "#f4f6fb" },
  { name: "Green", fg: "#005744", accent: "#d4a017", bg: "#f1f8f5" },
  { name: "Black", fg: "#111111", accent: "#c8a13c", bg: "#f7f7f7" },
  { name: "Red", fg: "#8e1b1b", accent: "#d4a017", bg: "#fdf3f2" },
];

function loadQrLib(): Promise<QRFactory> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { qrcode?: QRFactory };
    if (w.qrcode) return resolve(w.qrcode);
    const s = document.createElement("script");
    s.src = QR_LIB;
    s.async = true;
    s.onload = () => (w.qrcode ? resolve(w.qrcode) : reject(new Error("QR library failed to load")));
    s.onerror = () => reject(new Error("QR library failed to load"));
    document.head.appendChild(s);
  });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the QR (with centre logo) onto a square canvas of `size` px. */
async function drawQr(canvas: HTMLCanvasElement, url: string, slug: string, color: (typeof COLORS)[number], size = 1200) {
  const qrcode = await loadQrLib();
  const qr = qrcode(0, "H");
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 3;
  const cell = Math.floor(size / (n + quiet * 2));
  const real = cell * (n + quiet * 2);
  canvas.width = real;
  canvas.height = real;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, real, real);
  ctx.fillStyle = color.fg;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
  }
  // centre badge with the restaurant logo (same-site icon route → no CORS issues)
  const badge = Math.round(real * 0.26);
  const bx = Math.round((real - badge) / 2);
  ctx.fillStyle = color.bg;
  roundRect(ctx, bx, bx, badge, badge, badge * 0.18);
  ctx.fill();
  ctx.lineWidth = Math.max(4, badge / 40);
  ctx.strokeStyle = color.accent;
  ctx.stroke();
  const logo = await loadImage(`/${slug}/app-icon?size=512`);
  if (logo) {
    const pad = badge * 0.1;
    ctx.save();
    roundRect(ctx, bx + pad, bx + pad, badge - pad * 2, badge - pad * 2, badge * 0.12);
    ctx.clip();
    ctx.drawImage(logo, bx + pad, bx + pad, badge - pad * 2, badge - pad * 2);
    ctx.restore();
  }
}

/** Printable card: SCAN FOR MENU + Arabic + QR + name + link. */
async function drawCard(card: HTMLCanvasElement, qrCanvas: HTMLCanvasElement, r: R, color: (typeof COLORS)[number]) {
  const W = 1600, H = 2200;
  card.width = W;
  card.height = H;
  const ctx = card.getContext("2d")!;
  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 10;
  ctx.strokeStyle = color.accent;
  roundRect(ctx, 40, 40, W - 80, H - 80, 60);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = color.fg;
  ctx.font = "800 120px Georgia, 'Times New Roman', serif";
  ctx.fillText("SCAN FOR MENU", W / 2, 250);
  ctx.fillStyle = color.accent;
  ctx.font = "700 72px Arial, sans-serif";
  ctx.direction = "rtl";
  ctx.fillText("امسح لعرض القائمة", W / 2, 360);
  ctx.direction = "ltr";
  const q = 1150;
  ctx.drawImage(qrCanvas, (W - q) / 2, 450, q, q);
  ctx.fillStyle = color.fg;
  ctx.font = "800 84px Georgia, serif";
  ctx.fillText(r.name, W / 2, 1720);
  ctx.font = "500 50px Arial, sans-serif";
  ctx.fillText("Order on WhatsApp  •  Prices & Calories", W / 2, 1810);
  ctx.font = "700 58px Arial, sans-serif";
  ctx.fillText(`myksaconnect.com/${r.slug}`, W / 2, 1920);
  ctx.fillStyle = color.accent;
  ctx.font = "500 42px Arial, sans-serif";
  ctx.fillText("Powered by MYKSA CONNECT", W / 2, 2050);
}

function download(canvas: HTMLCanvasElement, name: string) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = name;
  a.click();
}

export default function RestaurantQrAdminPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [list, setList] = useState<R[]>([]);
  const [slug, setSlug] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const qrRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!admin) return;
    getDocs(collection(db, "restaurants"))
      .then((snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, name: String(d.get("name") ?? d.id), slug: String(d.get("slug") ?? d.id), isActive: d.get("isActive"), city: d.get("city") }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setList(rows);
        if (rows.length && !slug) setSlug(rows[0].slug);
      })
      .catch(() => setMsg("Could not load restaurants."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const restaurant = list.find((r) => r.slug === slug);
  const color = COLORS[colorIdx];
  const url = restaurant ? `${SITE}/${restaurant.slug}?utm_source=qr&utm_medium=print&utm_campaign=${restaurant.slug}` : "";

  useEffect(() => {
    if (!restaurant || !qrRef.current || !cardRef.current) return;
    let cancelled = false;
    setBusy(true);
    setMsg("");
    (async () => {
      try {
        await drawQr(qrRef.current!, url, restaurant.slug, color);
        if (!cancelled) await drawCard(cardRef.current!, qrRef.current!, restaurant, color);
      } catch (e) {
        if (!cancelled) setMsg(e instanceof Error ? e.message : "Could not create the QR.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, colorIdx, list.length]);

  if (!user) return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}><h1>Restaurant QR</h1><p>Please sign in as admin.</p></main>;
  if (!admin) return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}><h1>Restaurant QR</h1><p>Admins only.</p></main>;

  const pill = (on: boolean) => ({
    padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13,
    border: on ? "2px solid #0c1730" : "1px solid #d7e2df", background: on ? "#0c1730" : "#fff", color: on ? "#fff" : "#31403d",
  } as const);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 60px", color: "#0c1730" }}>
      <a href="/ksa-connect/admin/blog" style={{ color: "#005744", fontWeight: 700, fontSize: 14 }}>← Admin</a>
      <h1 style={{ margin: "10px 0 4px" }}>Restaurant QR codes</h1>
      <p style={{ marginTop: 0, color: "#52615e" }}>
        Choose a restaurant to make its menu QR with the restaurant logo in the centre. Download the QR or a ready-to-print table card.
      </p>

      <div style={{ display: "grid", gap: 14, padding: 18, borderRadius: 16, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
        <label style={{ fontWeight: 700 }}>
          Restaurant
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: "1px solid #cbd8d3", fontSize: 15 }}
          >
            {list.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}{r.city ? ` — ${r.city}` : ""}{r.isActive === false ? " (draft)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Colour</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map((c, i) => (
              <button key={c.name} type="button" onClick={() => setColorIdx(i)} style={pill(i === colorIdx)}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 999, background: c.fg, marginRight: 6, verticalAlign: "-1px" }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {url && <div style={{ fontSize: 13, color: "#52615e", wordBreak: "break-all" }}>Link: {url}</div>}
        {busy && <div style={{ color: "#52615e" }}>Creating QR…</div>}
        {msg && <div style={{ color: "#9a4d00", fontWeight: 700 }}>{msg}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
        <div style={{ textAlign: "center" }}>
          <canvas ref={qrRef} style={{ width: "100%", maxWidth: 380, height: "auto", borderRadius: 12, border: "1px solid #e5e7eb" }} />
          <button
            type="button"
            disabled={busy || !restaurant}
            onClick={() => restaurant && qrRef.current && download(qrRef.current, `${restaurant.slug}-qr.png`)}
            style={{ marginTop: 10, padding: "12px 18px", borderRadius: 12, border: 0, background: "#005744", color: "#fff", fontWeight: 800, cursor: "pointer" }}
          >
            ⬇ Download QR
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <canvas ref={cardRef} style={{ width: "100%", maxWidth: 300, height: "auto", borderRadius: 12, border: "1px solid #e5e7eb" }} />
          <button
            type="button"
            disabled={busy || !restaurant}
            onClick={() => restaurant && cardRef.current && download(cardRef.current, `${restaurant.slug}-qr-card.png`)}
            style={{ marginTop: 10, padding: "12px 18px", borderRadius: 12, border: 0, background: "#f6b91f", color: "#0c1730", fontWeight: 900, cursor: "pointer" }}
          >
            ⬇ Download print card
          </button>
        </div>
      </div>
      <p style={{ marginTop: 18, fontSize: 12.5, color: "#65716f" }}>
        Tip: always test a printed QR with 2–3 phones before printing many. The logo comes from the restaurant&apos;s logo in the database
        (PNG/JPG). The link includes utm_source=qr so QR visits show separately in Analytics.
      </p>
    </main>
  );
}
