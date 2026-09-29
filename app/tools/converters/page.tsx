import type { Metadata } from "next";
import { CONVERTER_DEFINITIONS } from "@/lib/converters/converterTypes";

export const metadata: Metadata = {
  title: "Document, PDF, Data & Image Converters | MYKSA CONNECT",
  description: "Free online document, PDF, data and image converter tools from MYKSA CONNECT.",
  alternates: { canonical: "/tools/converters/" },
};

const categoryTitles = {
  document: "Document Tools",
  pdf: "PDF Tools",
  data: "Data Converters",
  image: "Image & File Tools",
} as const;

const categoryStyles = {
  document: {
    border: "#2498e8",
    bg: "linear-gradient(145deg,#102b42 0%,#081a29 100%)",
    iconBg: "rgba(36,152,232,.20)",
    accent: "#73c8ff",
  },
  pdf: {
    border: "#e45f68",
    bg: "linear-gradient(145deg,#3a1820 0%,#211018 100%)",
    iconBg: "rgba(228,95,104,.20)",
    accent: "#ff9ca3",
  },
  data: {
    border: "#25bd79",
    bg: "linear-gradient(145deg,#0c3029 0%,#081d1b 100%)",
    iconBg: "rgba(37,189,121,.20)",
    accent: "#73e6b0",
  },
  image: {
    border: "#9a67ee",
    bg: "linear-gradient(145deg,#281a42 0%,#171126 100%)",
    iconBg: "rgba(154,103,238,.20)",
    accent: "#c8a5ff",
  },
} as const;

export default function ConverterDirectoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#06131e 0%,#081923 48%,#07131c 100%)", padding: "32px 20px 70px" }}>
      <style>{`
        .converter-dark-card {
          position: relative;
          overflow: hidden;
        }
        .converter-dark-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg,rgba(255,255,255,.055),transparent 45%);
        }
        .converter-dark-card:hover {
          transform: translateY(-5px) scale(1.012);
          box-shadow: 0 18px 38px rgba(0,0,0,.42), 0 0 22px rgba(67,190,255,.10) !important;
          filter: brightness(1.12);
        }
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <nav style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/tools/" style={{ color: "#75e0bd", fontWeight: 800, textDecoration: "none" }}>← All Tools</a>
        </nav>

        <header style={{ background: "linear-gradient(135deg,#00483a 0%,#062239 100%)", color: "#fff", border: "1px solid rgba(246,185,31,.28)", borderRadius: 24, padding: "42px 36px", marginBottom: 34, boxShadow: "0 18px 45px rgba(0,0,0,.32)" }}>
          <p style={{ color: "#f6c52f", fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase" }}>MYKSA CONNECT • CONVERTER TOOLS</p>
          <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(32px,5vw,52px)", color: "#ffffff" }}>Document, PDF, Data &amp; Image Converters</h1>
          <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,.84)", lineHeight: 1.7 }}>A growing collection of browser-friendly and format-specific converters. Conversion engines are being enabled progressively while keeping the tool URLs and SEO foundation ready.</p>
        </header>

        {(Object.keys(categoryTitles) as Array<keyof typeof categoryTitles>).map((category) => {
          const items = CONVERTER_DEFINITIONS.filter((tool) => tool.category === category);
          const style = categoryStyles[category];
          return (
            <section key={category} style={{ marginBottom: 38 }}>
              <h2 style={{ color: "#ffffff", marginBottom: 16, fontSize: 24 }}>{categoryTitles[category]}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {items.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/tools/${tool.slug}/`}
                    className="converter-dark-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: 16,
                      padding: 18,
                      minHeight: 128,
                      boxShadow: "0 9px 24px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.045)",
                      transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
                    }}
                  >
                    <span style={{ position: "relative", zIndex: 1, display: "inline-flex", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, background: style.iconBg, color: style.accent, fontWeight: 900, fontSize: 12, marginBottom: 11, border: `1px solid ${style.border}80` }}>
                      {category === "document" ? "DOC" : category === "pdf" ? "PDF" : category === "data" ? "{}" : "IMG"}
                    </span>
                    <strong style={{ position: "relative", zIndex: 1, display: "block", color: "#ffffff", marginBottom: 7, fontSize: 14 }}>{tool.name}</strong>
                    <span style={{ position: "relative", zIndex: 1, display: "block", color: "#c7d4de", fontSize: 13, lineHeight: 1.5 }}>{tool.shortDescription}</span>
                    <span style={{ position: "relative", zIndex: 1, display: "block", color: style.accent, fontSize: 12, fontWeight: 800, marginTop: 13 }}>Open tool →</span>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
