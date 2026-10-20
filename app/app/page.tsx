import type { Metadata } from "next";
import AndroidRedirect from "./AndroidRedirect";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect";
const URL = "https://www.myksaconnect.com/app";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.myksaconnect.com"),
  title: "Download MYKSA-Connect App — Free Ads, Menus & Daily Tools for Saudi Expats",
  description:
    "Buy, sell, rent and connect across Saudi Arabia. Free ads, restaurant menus and daily tools — Hijri converter, VAT, Iqama reminders and Scan to PDF. Get the free Android app.",
  alternates: { canonical: URL },
  openGraph: {
    title: "MYKSA-Connect — Free App for Saudi Expats",
    description: "Free ads, restaurant menus & daily tools (Hijri, VAT, Iqama reminders, Scan to PDF). Download free on Google Play.",
    url: URL,
    type: "website",
    siteName: "MYKSA Connect",
  },
  twitter: { card: "summary_large_image" },
};

const features = [
  ["🏠", "Free ads", "Rooms, flats, cars, jobs & more in 19 cities"],
  ["🍽️", "Digital menus", "Browse restaurant menus & order on WhatsApp"],
  ["🧰", "Daily tools", "Hijri converter, VAT, End of Service, currency"],
  ["⏰", "Iqama reminders", "Never miss Iqama, passport or licence expiry"],
  ["📄", "Scan to PDF", "Turn papers into clean PDFs in seconds"],
  ["💬", "Chat & WhatsApp", "Contact sellers with one tap"],
];

export default function AppDownloadPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #071228 0%, #0b2338 55%, #005744 100%)", color: "#fff" }}>
      <AndroidRedirect url={PLAY_URL} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ksa-logo.png" alt="MYKSA-Connect" width={96} height={96} style={{ borderRadius: "50%", boxShadow: "0 0 30px rgba(246,185,31,.45)" }} />
        <h1 style={{ margin: "18px 0 6px", fontSize: "clamp(1.8rem, 6vw, 2.6rem)", lineHeight: 1.15 }}>
          MYKSA<span style={{ color: "#f6b91f" }}>-Connect</span>
        </h1>
        <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>Buy, sell, rent &amp; connect across Saudi Arabia 🇸🇦</p>

        <a
          href={PLAY_URL}
          style={{
            display: "inline-block", marginTop: 24, padding: "15px 30px", borderRadius: 14, background: "#f6b91f",
            color: "#071228", fontWeight: 900, fontSize: "1.1rem", textDecoration: "none", boxShadow: "0 10px 28px rgba(246,185,31,.35)",
          }}
        >
          ▶ Get it free on Google Play
        </a>
        <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.75 }}>
          No Android? <a href="/" style={{ color: "#f6b91f" }}>Use the website →</a>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 34, textAlign: "left" }}>
          {features.map(([icon, title, text]) => (
            <div key={title} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(246,185,31,.3)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 24 }} aria-hidden="true">{icon}</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>{title}</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
