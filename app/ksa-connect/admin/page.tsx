"use client";

// Admin dashboard: one place for every admin page + the outside tools used every day.
// Add a card to SECTIONS to add a new admin page.

import type { CSSProperties } from "react";
import { signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";

type Card = { icon: string; title: string; text: string; href: string; external?: boolean; color: string };

const SECTIONS: { title: string; cards: Card[] }[] = [
  {
    title: "MYKSA Connect",
    cards: [
      { icon: "📹", title: "Daily Videos", text: "Today's new-ads video, caption & download", href: "/ksa-connect/admin/videos", color: "#7c3aed" },
      { icon: "🔳", title: "QR Generator", text: "QR codes for menus, ads & stickers", href: "/ksa-connect/admin/qr", color: "#0891b2" },
      { icon: "🍽️", title: "Restaurant Menus", text: "Edit digital menus & dishes", href: "/ksa-connect/admin/menu", color: "#ea580c" },
      { icon: "📝", title: "Blog", text: "Write & publish blog posts", href: "/ksa-connect/admin/blog", color: "#16a34a" },
      { icon: "➕", title: "Post an Ad", text: "Post a new listing", href: "/ksa-connect/post", color: "#005744" },
      { icon: "🏪", title: "Restaurants", text: "All live digital menus", href: "/restaurants", color: "#b45309" },
      { icon: "🧰", title: "Tools", text: "All free online tools", href: "/tools", color: "#2563eb" },
      { icon: "🏠", title: "Website", text: "Open the home page", href: "/", color: "#0c1730" },
    ],
  },
  {
    title: "Shortcuts",
    cards: [
      { icon: "🔥", title: "Firebase", text: "Firestore, Storage, Auth, Functions", href: "https://console.firebase.google.com/project/riyadhconnect-9520a/overview", external: true, color: "#f59e0b" },
      { icon: "📊", title: "Google Analytics", text: "Visitors, orders, events", href: "https://analytics.google.com/", external: true, color: "#e37400" },
      { icon: "🔎", title: "Search Console", text: "Google search traffic & indexing", href: "https://search.google.com/search-console?resource_id=sc-domain:myksaconnect.com", external: true, color: "#4285f4" },
      { icon: "▲", title: "Vercel", text: "Deployments of the website", href: "https://vercel.com/dashboard", external: true, color: "#111827" },
      { icon: "⚙️", title: "Make.com", text: "Facebook & Instagram auto-post", href: "https://www.make.com/en/login", external: true, color: "#6d28d9" },
      { icon: "🗓️", title: "Metricool", text: "Schedule videos on all socials", href: "https://app.metricool.com/", external: true, color: "#0ea5e9" },
      { icon: "📱", title: "Play Console", text: "KSA-Connect Android app", href: "https://play.google.com/console", external: true, color: "#01875f" },
      { icon: "📜", title: "Function Logs", text: "Errors from Cloud Functions", href: "https://console.cloud.google.com/logs/query?project=riyadhconnect-9520a", external: true, color: "#dc2626" },
    ],
  },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const wrap: CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "28px 16px 70px", color: "#0c1730" };

  if (loading) return <main style={wrap}>Loading…</main>;
  if (!user)
    return (
      <main style={{ ...wrap, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48 }}>🔐</div>
        <h1>Admin Dashboard</h1>
        <button onClick={() => signInWithGoogle()} style={btn("#005744")}>Sign in with Google</button>
      </main>
    );
  if (!isAdmin(user))
    return (
      <main style={{ ...wrap, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h1>Admins only</h1>
        <p style={{ color: "#5d6a68" }}>Signed in as {user.email}</p>
        <button onClick={() => signOutUser()} style={btn("#6b7280")}>Sign out</button>
      </main>
    );

  return (
    <main style={wrap}>
      <style>{`
        .ad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
        .ad-card { display: flex; gap: 14px; align-items: center; padding: 16px; border-radius: 16px; background: #fff;
          border: 1px solid #e3ebe8; text-decoration: none; color: inherit; box-shadow: 0 4px 14px rgba(0,0,0,.05);
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .ad-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(0,0,0,.10); border-color: var(--c); }
        .ad-icon { flex: 0 0 52px; width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 26px;
          background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); font-weight: 900; }
        .ad-card strong { display: block; font-size: 15.5px; }
        .ad-card small { display: block; color: #5d6a68; font-size: 12.5px; line-height: 1.4; margin-top: 2px; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        padding: "22px 22px", borderRadius: 20, background: "linear-gradient(135deg,#0c1730,#005744)", color: "#fff", marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#f6b91f" }}>MYKSA CONNECT</div>
          <h1 style={{ margin: "4px 0 2px", fontSize: 28 }}>Admin Dashboard</h1>
          <div style={{ opacity: 0.85, fontSize: 14 }}>Signed in as {user.email}</div>
        </div>
        <button onClick={() => signOutUser()} style={btn("rgba(255,255,255,.14)")}>Sign out</button>
      </div>

      {SECTIONS.map((s) => (
        <section key={s.title} style={{ marginBottom: 30 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>{s.title}</h2>
          <div className="ad-grid">
            {s.cards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="ad-card"
                style={{ ["--c" as string]: c.color } as CSSProperties}
                {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                <span className="ad-icon" aria-hidden>{c.icon}</span>
                <span style={{ minWidth: 0 }}>
                  <strong>{c.title}{c.external ? " ↗" : ""}</strong>
                  <small>{c.text}</small>
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function btn(bg: string): CSSProperties {
  return { padding: "10px 18px", borderRadius: 12, border: 0, background: bg, color: "#fff", fontWeight: 800, cursor: "pointer" };
}
