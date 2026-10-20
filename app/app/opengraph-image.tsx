import { ImageResponse } from "next/og";

// Preview card for https://www.myksaconnect.com/app (WhatsApp, Facebook, X…)
export const alt = "MYKSA-Connect — free app for Saudi expats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "70px 80px", color: "#fff",
          background: "linear-gradient(135deg, #071228 0%, #0b2338 55%, #005744 100%)",
          borderBottom: "12px solid #f6b91f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 110, height: 110, borderRadius: 999, border: "8px solid #f6b91f", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, background: "#0c1730",
            }}
          >
            <span style={{ color: "#fff" }}>K</span>
            <span style={{ color: "#f6b91f" }}>C</span>
          </div>
          <div style={{ display: "flex", marginLeft: 30, fontSize: 72, fontWeight: 900 }}>
            <span>MYKSA</span>
            <span style={{ color: "#f6b91f" }}>-Connect</span>
          </div>
        </div>
        <div style={{ marginTop: 34, fontSize: 44, fontWeight: 700 }}>Buy, sell, rent &amp; connect across Saudi Arabia</div>
        <div style={{ marginTop: 16, fontSize: 30, opacity: 0.85 }}>
          Free ads · Restaurant menus · Hijri, VAT &amp; Iqama tools · Scan to PDF
        </div>
        <div
          style={{
            marginTop: 40, display: "flex", alignSelf: "flex-start", padding: "16px 34px", borderRadius: 18,
            background: "#f6b91f", color: "#071228", fontSize: 34, fontWeight: 900,
          }}
        >
          Get it free on Google Play
        </div>
      </div>
    ),
    size
  );
}
