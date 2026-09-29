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

export default function ConverterDirectoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fbfaf7", padding: "32px 20px 70px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <nav style={{ fontSize: 13, marginBottom: 22 }}><a href="/tools/" style={{ color: "#005744", fontWeight: 800, textDecoration: "none" }}>← All Tools</a></nav>
        <header style={{ background: "linear-gradient(135deg,#003c31,#06172a)", color: "#fff", borderRadius: 24, padding: "42px 36px", marginBottom: 34 }}>
          <p style={{ color: "#f6b91f", fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase" }}>MYKSA CONNECT • CONVERTER TOOLS</p>
          <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(32px,5vw,52px)" }}>Document, PDF, Data &amp; Image Converters</h1>
          <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,.86)", lineHeight: 1.7 }}>A growing collection of browser-friendly and format-specific converters. Conversion engines are being enabled progressively while keeping the tool URLs and SEO foundation ready.</p>
        </header>

        {(Object.keys(categoryTitles) as Array<keyof typeof categoryTitles>).map((category) => {
          const items = CONVERTER_DEFINITIONS.filter((tool) => tool.category === category);
          return (
            <section key={category} style={{ marginBottom: 38 }}>
              <h2 style={{ color: "#06172a", marginBottom: 16 }}>{categoryTitles[category]}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {items.map((tool) => (
                  <a key={tool.slug} href={`/tools/${tool.slug}/`} style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 16, padding: 18, boxShadow: "0 6px 18px rgba(6,23,42,.05)" }}>
                    <strong style={{ display: "block", color: "#06172a", marginBottom: 7 }}>{tool.name}</strong>
                    <span style={{ display: "block", color: "#65716f", fontSize: 13, lineHeight: 1.5 }}>{tool.shortDescription}</span>
                    <span style={{ display: "block", color: "#005744", fontSize: 12, fontWeight: 800, marginTop: 13 }}>Open tool →</span>
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
