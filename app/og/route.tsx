import { ImageResponse } from "next/og";

// Link-preview card for the homepage and pages without their own image
// (WhatsApp, Facebook, X, LinkedIn). Generated on the fly: small, fast PNG.
export const revalidate = 86400;

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 80px", color: "#fff",
          background: "linear-gradient(135deg, #071228 0%, #0b2338 55%, #005744 100%)",
          borderBottom: "12px solid #f6b91f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 104, height: 104, borderRadius: 999, border: "8px solid #f6b91f", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 50, fontWeight: 900, background: "#0c1730",
            }}
          >
            <span style={{ color: "#fff" }}>K</span>
            <span style={{ color: "#f6b91f" }}>C</span>
          </div>
          <div style={{ display: "flex", marginLeft: 28, fontSize: 64, fontWeight: 900 }}>
            <span>MYKSA</span>
            <span style={{ color: "#f6b91f", marginLeft: 16 }}>CONNECT</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 58, fontWeight: 900, lineHeight: 1.1 }}>
          <span>Your Connection Across</span>
          <span style={{ color: "#f6b91f", marginLeft: 16 }}>Saudi Arabia</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 30, opacity: 0.88 }}>
          Housing · Cars · Jobs · Services · Restaurants · Free expat tools
        </div>
        <div style={{ display: "flex", marginTop: 38 }}>
          <div style={{ display: "flex", padding: "14px 30px", borderRadius: 16, background: "#f6b91f", color: "#071228", fontSize: 32, fontWeight: 900 }}>
            Post your ad FREE
          </div>
          <div style={{ display: "flex", marginLeft: 18, padding: "14px 30px", borderRadius: 16, border: "3px solid #fff", fontSize: 32, fontWeight: 800 }}>
            myksaconnect.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
