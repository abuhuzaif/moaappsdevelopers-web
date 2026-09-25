import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zakat Calculator | MYKSA CONNECT",
  description: "Zakat Calculator is temporarily unavailable while it is being reviewed.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ZakatCalculatorTemporarilyUnavailable() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fbfaf7",
        color: "#0b1719",
        fontFamily: "inherit",
        padding: "48px 20px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <nav style={{ fontSize: 12, color: "#65716f", marginBottom: 18 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none", fontWeight: 800 }}>
            MYKSA CONNECT
          </a>
          <span> &nbsp;›&nbsp; </span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none", fontWeight: 800 }}>
            Saudi Expat Tools
          </a>
          <span> &nbsp;›&nbsp; Zakat Calculator</span>
        </nav>

        <section
          style={{
            background: "#fff",
            border: "1px solid #dfe7e3",
            borderRadius: 20,
            padding: "48px 28px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(6,23,42,.06)",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🧮</div>
          <h1 style={{ margin: "0 0 12px", color: "#06172a" }}>
            Zakat Calculator
          </h1>
          <p style={{ maxWidth: 620, margin: "0 auto 24px", color: "#5d6a68", lineHeight: 1.7 }}>
            This tool is temporarily unavailable while we review the calculation
            methodology with appropriate religious guidance.
          </p>
          <a
            href="/tools/"
            style={{
              display: "inline-block",
              background: "#005744",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
              padding: "12px 20px",
              borderRadius: 10,
            }}
          >
            Browse Saudi Expat Tools →
          </a>
        </section>
      </div>
    </main>
  );
}
