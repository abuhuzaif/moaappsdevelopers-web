import type { Metadata } from "next";
import SplitPdfClient from "../_components/SplitPdfClient";

export const metadata: Metadata = {
  title: "Split PDF Online – Extract PDF Pages | MYKSA CONNECT",
  description: "Split PDF files online by page numbers and ranges. Extract selected pages, remove pages, or create separate PDFs directly in your browser.",
  alternates: { canonical: "/tools/split-pdf/" },
};

export default function SplitPdfPage() {
  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>Split PDF</span>
        </nav>
        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • PDF TOOL</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(34px,5vw,48px)", margin: "8px 0 12px" }}>Split PDF Online</h1>
        <p style={{ color: "#5d6a68", fontSize: 17, lineHeight: 1.7 }}>Extract selected pages, remove pages, or create one PDF for each selected page.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>
        </div>
        <SplitPdfClient />
        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28 }}>Split PDF Online</h2>
          <p>Choose exactly which pages you need using individual page numbers or ranges. The PDF is processed locally in your browser instead of being uploaded to MYKSA CONNECT.</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li>Select one PDF file.</li>
            <li>Choose a split mode.</li>
            <li>Enter pages such as 1, 3, 5-8.</li>
            <li>Click Split PDF and download the result.</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
