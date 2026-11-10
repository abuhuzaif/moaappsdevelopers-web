// MYKSA Connect branded banner for the category / city-category pages:
// logo + menu on top, then the page title and intro on the navy background.
// Plain links only (no client code), so it renders on the server for Google.

const NAVY = "#0C1730";
const GOLD = "#E8B84B";

export type Crumb = { label: string; href?: string };

export default function KsaBrandHeader({
  title,
  intro,
  crumbs = [],
  postHref = "/ksa-connect/post",
}: {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  postHref?: string;
}) {
  const link = { color: "rgba(255,255,255,0.88)", textDecoration: "none", fontSize: 14, fontWeight: 600 } as const;

  return (
    <header
      style={{
        background: `radial-gradient(circle at 85% 0%, rgba(232,184,75,0.18), transparent 45%), linear-gradient(180deg, #0f1d3a 0%, ${NAVY} 100%)`,
        color: "#fff",
        borderBottom: `3px solid ${GOLD}`,
      }}
    >
      {/* Top bar: logo + menu */}
      <nav
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <a href="/" aria-label="MYKSA CONNECT home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ksa-logo.png" alt="" width={42} height={42} style={{ borderRadius: "50%", display: "block" }} />
          <span style={{ lineHeight: 1.1 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: 0.3 }}>MYKSA </span>
            <span style={{ color: GOLD, fontWeight: 900, fontSize: 18, letterSpacing: 0.3 }}>CONNECT</span>
            <small style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>
              BUY. SELL. CONNECT.
            </small>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <a href="/" style={link}>Home</a>
          <a href="/ksa-connect/category/housing" style={link}>Housing</a>
          <a href="/ksa-connect/category/jobs" style={link}>Jobs</a>
          <a href="/restaurants" style={link}>🍽️ Digital Menu</a>
          <a
            href={postHref}
            style={{
              background: GOLD,
              color: NAVY,
              padding: "8px 16px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ＋ Post an Ad
          </a>
        </div>
      </nav>

      {/* Page title */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 16px 26px" }}>
        {crumbs.length > 0 && (
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && " › "}
                {c.href ? (
                  <a href={c.href} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>{c.label}</a>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, lineHeight: 1.2, color: "#fff" }}>{title}</h1>
        {intro && (
          <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", maxWidth: 760 }}>{intro}</p>
        )}
      </div>
    </header>
  );
}
