import type { Metadata } from "next";
import MergePdfClient from "../_components/MergePdfClient";

export const metadata: Metadata = {
  title: "Merge PDF Online – Combine Multiple PDF Files | MYKSA CONNECT",
  description: "Combine multiple PDF files into one PDF online. Add several files, reorder them, and merge them directly in your browser.",
  alternates: { canonical: "/tools/merge-pdf/" },
};

export default function MergePdfPage() {
  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>Merge PDF</span>
        </nav>
        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • PDF TOOL</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(34px,5vw,48px)", margin: "8px 0 12px" }}>Merge PDF Online</h1>
        <p style={{ color: "#5d6a68", fontSize: 17, lineHeight: 1.7 }}>Combine multiple PDF files into one document and control the order before merging.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: PDF</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>
        </div>
        <MergePdfClient />
        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28 }}>Merge PDF Online</h2>
          <p>Add two or more PDF files, arrange them in the required order, and create a single merged PDF. Processing happens in your browser and the source files are not uploaded.</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li>Select multiple PDF files.</li>
            <li>Move files up or down to set the correct order.</li>
            <li>Click Merge PDF Files and download the combined PDF.</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
