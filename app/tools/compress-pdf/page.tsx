import type { Metadata } from "next";
import PdfCompressionClient from "../_components/PdfCompressionClient";

export const metadata: Metadata = {
  title: "Compress PDF Online – Free PDF Compressor | MYKSA CONNECT",
  description: "Compress PDF files online in your browser. Reduce PDF file size for easier sharing and upload while keeping your original PDF unchanged.",
  alternates: { canonical: "/tools/compress-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Compress PDF Online – Free PDF Compressor | MYKSA CONNECT",
    description: "Reduce PDF file size online with browser-based PDF compression. Your original PDF remains unchanged.",
    type: "website",
    url: "/tools/compress-pdf/",
  },
};

const siteUrl = "https://www.myksaconnect.com";

export default function CompressPdfPage() {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Compress PDF",
    description: "Reduce PDF file size online in the browser.",
    url: `${siteUrl}/tools/compress-pdf/`,
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
          <span style={{ color: "#52605d" }}>Compress PDF</span>
        </nav>

        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • PDF tool</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(30px,5vw,46px)", margin: "8px 0 12px" }}>Compress PDF Online</h1>
        <p style={{ color: "#5d6a68", fontSize: 16, lineHeight: 1.7 }}>Reduce PDF file size for easier sharing, uploads and storage.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>
        </div>

        <PdfCompressionClient mode="compress" />

        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28 }}>Compress PDF Online | Free MYKSA CONNECT Tool</h2>
          <p>Use this browser-based PDF compressor to create a new, smaller PDF copy. The original file is never overwritten. The tool first attempts safe structural optimization and uses image-based compression when that can produce a smaller result.</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li>Choose the PDF you want to compress.</li>
            <li>Select the quality and image scale that suit your document.</li>
            <li>Click Compress PDF and download the new PDF.</li>
          </ol>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Key features</h2>
          <ul style={{ paddingLeft: 22 }}>
            <li>Browser-based PDF processing</li>
            <li>Creates a separate compressed PDF</li>
            <li>Original PDF remains unchanged</li>
            <li>Adjustable compression quality</li>
          </ul>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Frequently asked questions</h2>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Does the tool change my original PDF?</h3><p>No. It reads the selected file and creates a separate output PDF.</p></section>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Will every PDF become smaller?</h3><p>Not necessarily. Some PDFs are already highly optimized. In that case the tool avoids claiming a reduction that it cannot safely achieve.</p></section>
          <section style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}><h3 style={{ color: "#06172a", fontSize: 17 }}>Is the PDF uploaded to MYKSA CONNECT?</h3><p>No. Processing happens in the browser for this tool.</p></section>
        </article>

        <a href="/tools/converters/" style={{ display: "inline-block", marginTop: 24, color: "#005744", fontWeight: 800, textDecoration: "none" }}>← Back to all converters</a>
      </section>
    </main>
  );
}
