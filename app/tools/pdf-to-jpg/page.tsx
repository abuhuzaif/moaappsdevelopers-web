import type { Metadata } from "next";
import PdfCompressionClient from "../_components/PdfCompressionClient";

export const metadata: Metadata = {
  title: "PDF to JPG Online – Convert PDF Pages to JPG | MYKSA CONNECT",
  description: "Convert PDF pages to high-quality JPG images online in your browser. Download all pages as a ZIP while keeping your original PDF unchanged.",
  alternates: { canonical: "/tools/pdf-to-jpg/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "PDF to JPG Online – Convert PDF Pages to JPG | MYKSA CONNECT",
    description: "Convert PDF pages to JPG images in your browser and download the result as a ZIP file.",
    type: "website",
    url: "/tools/pdf-to-jpg/",
  },
};

const siteUrl = "https://www.myksaconnect.com";

export default function PdfToJpgPage() {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to JPG",
    description: "Convert PDF pages to JPG images online.",
    url: `${siteUrl}/tools/pdf-to-jpg/`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: "MYKSA CONNECT", url: siteUrl },
  };

  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/converters/" style={{ color: "#005744", textDecoration: "none" }}>Converters</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>PDF to JPG</span>
        </nav>

        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • PDF tool</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(30px,5vw,46px)", margin: "8px 0 12px" }}>PDF to JPG Online</h1>
        <p style={{ color: "#5d6a68", fontSize: 16, lineHeight: 1.7 }}>Convert PDF pages into JPG images and download all pages together.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: JPG</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>
        </div>

        <PdfCompressionClient mode="jpg" />

        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28 }}>PDF to JPG Online | Free MYKSA CONNECT Tool</h2>
          <p>Convert every page of a PDF into a JPG image directly in your browser. Multi-page PDFs are packaged into one ZIP file so you can download the complete result without changing the original PDF.</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li>Choose the PDF you want to convert.</li>
            <li>Set JPG quality and image scale if needed.</li>
            <li>Click Convert PDF → JPG and download the ZIP file containing the pages.</li>
          </ol>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Key features</h2>
          <ul style={{ paddingLeft: 22 }}>
            <li>Multi-page PDF to JPG conversion</li>
            <li>JPG quality and scale controls</li>
            <li>All pages bundled into one ZIP</li>
            <li>Original PDF remains unchanged</li>
          </ul>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Frequently asked questions</h2>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Does it convert every PDF page?</h3><p>Yes. Each page is rendered into a separate JPG image and included in the ZIP download.</p></section>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Can I control JPG quality?</h3><p>Yes. Use the quality slider before starting the conversion.</p></section>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Is my original PDF changed?</h3><p>No. The PDF is read in the browser and the JPG files are created as new output files.</p></section>
        </article>

        <a href="/tools/converters/" style={{ display: "inline-block", marginTop: 24, color: "#005744", fontWeight: 800, textDecoration: "none" }}>← Back to all converters</a>
      </section>
    </main>
  );
}
