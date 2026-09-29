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
  document: { border: "#b9d9ff", iconBg: "#e8f2ff", accent: "#1976d2", arrow: "#1976d2" },
  pdf: { border: "#ffd0d0", iconBg: "#fff0f0", accent: "#d83a3a", arrow: "#d83a3a" },
  data: { border: "#c9edda", iconBg: "#eaf9f0", accent: "#14804a", arrow: "#14804a" },
  image: { border: "#e0cffd", iconBg: "#f3ebff", accent: "#7a42c8", arrow: "#7a42c8" },
} as const;

export default function ConverterDirectoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fbfaf7", padding: "32px 20px 70px" }}>
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
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: "#fff",
                      border: `1px solid ${style.border}`,
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: "0 6px 18px rgba(6,23,42,.05)",
                      transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                    }}
                  >
                    <span style={{ display: "inline-flex", width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 10, background: style.iconBg, color: style.accent, fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
                      {category === "document" ? "▤" : category === "pdf" ? "PDF" : category === "data" ? "{}" : "◆"}
                    </span>
                    <strong style={{ display: "block", color: "#06172a", marginBottom: 7 }}>{tool.name}</strong>
                    <span style={{ display: "block", color: "#65716f", fontSize: 13, lineHeight: 1.5 }}>{tool.shortDescription}</span>
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
