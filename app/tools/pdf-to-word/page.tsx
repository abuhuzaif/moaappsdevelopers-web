import type { Metadata } from "next";
import BrowserPdfWordClient from "../_components/BrowserPdfWordClient";

export const metadata: Metadata = {
  title: "PDF to Word Converter Online – Convert PDF to DOCX | MYKSA CONNECT",
  description: "Convert PDF documents to editable Word DOCX files online. Browser-based PDF to Word conversion without the Vercel upload limit.",
  alternates: { canonical: "/tools/pdf-to-word/" },
};

export default function PdfToWordPage() {
  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>PDF to Word</span>
        </nav>
        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • PDF TOOL</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(34px,5vw,48px)", margin: "8px 0 12px" }}>PDF to Word Online</h1>
        <p style={{ color: "#5d6a68", fontSize: 17, lineHeight: 1.7 }}>Convert a PDF into an editable Word DOCX document directly in your browser.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: DOCX</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>
        </div>
        <BrowserPdfWordClient />
        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28 }}>PDF to Word Converter Online</h2>
          <p>Convert text-based PDF documents into editable Word files for reuse, editing, reporting and document workflows. Processing happens in your browser, so large files are not sent through a server upload endpoint.</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li>Choose your PDF document.</li>
            <li>Click Convert PDF → Word.</li>
            <li>Download the generated DOCX and review its formatting.</li>
          </ol>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Important note</h2>
          <p>This browser converter is best for PDFs with selectable text. Scanned or image-only PDFs should be processed with the <a href="/tools/pdf-ocr/" style={{ color: "#005744", fontWeight: 700 }}>PDF OCR</a> tool first. Complex PDF layouts, graphics and tables may require manual formatting after conversion.</p>
        </article>
      </section>
    </main>
  );
}
