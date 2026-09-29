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
  document: { border: "#248bd8", iconBg: "rgba(36,139,216,.18)", accent: "#70c4ff", arrow: "#70c4ff" },
  pdf: { border: "#e05b5b", iconBg: "rgba(224,91,91,.18)", accent: "#ff9696", arrow: "#ff9696" },
  data: { border: "#2dbb78", iconBg: "rgba(45,187,120,.18)", accent: "#72e0ad", arrow: "#72e0ad" },
  image: { border: "#9a68e5", iconBg: "rgba(154,104,229,.18)", accent: "#c19aff", arrow: "#c19aff" },
} as const;

export default function ConverterDirectoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fbfaf7", padding: "32px 20px 70px" }}>
      <style>{`
        .converter-dark-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(6,23,42,.22) !important;
          filter: brightness(1.08);
        }
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <nav style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/tools/" style={{ color: "#005744", fontWeight: 800, textDecoration: "none" }}>← All Tools</a>
        </nav>
        <header style={{ background: "linear-gradient(135deg,#003c31,#06172a)", color: "#fff", borderRadius: 24, padding: "42px 36px", marginBottom: 34 }}>
          <p style={{ color: "#f6b91f", fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase" }}>MYKSA CONNECT • CONVERTER TOOLS</p>
          <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(32px,5vw,52px)" }}>Document, PDF, Data &amp; Image Converters</h1>
          <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,.86)", lineHeight: 1.7 }}>A growing collection of browser-friendly and format-specific converters. Conversion engines are being enabled progressively while keeping the tool URLs and SEO foundation ready.</p>
        </header>

        {(Object.keys(categoryTitles) as Array<keyof typeof categoryTitles>).map((category) => {
          const items = CONVERTER_DEFINITIONS.filter((tool) => tool.category === category);
          const style = categoryStyles[category];
          return (
            <section key={category} style={{ marginBottom: 38 }}>
              <h2 style={{ color: "#06172a", marginBottom: 16 }}>{categoryTitles[category]}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {items.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/tools/${tool.slug}/`}
                    className="converter-dark-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: "linear-gradient(145deg,#132b3c 0%,#0b1d2b 100%)",
                      border: `1px solid ${style.border}`,
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: "0 7px 20px rgba(6,23,42,.14)",
                      transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
                    }}
                  >
                    <span style={{ display: "inline-flex", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, background: style.iconBg, color: style.accent, fontWeight: 900, fontSize: 13, marginBottom: 11, border: `1px solid ${style.border}66` }}>
                      {category === "document" ? "▤" : category === "pdf" ? "PDF" : category === "data" ? "{}" : "◆"}
                    </span>
                    <strong style={{ display: "block", color: "#ffffff", marginBottom: 7, fontSize: 14 }}>{tool.name}</strong>
                    <span style={{ display: "block", color: "#b9c8d3", fontSize: 13, lineHeight: 1.5 }}>{tool.shortDescription}</span>
                    <span style={{ display: "block", color: style.arrow, fontSize: 12, fontWeight: 800, marginTop: 13 }}>Open tool →</span>
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
