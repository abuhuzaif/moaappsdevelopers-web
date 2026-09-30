import type { Metadata } from "next";
import BrowserPdfOcrClient from "../_components/BrowserPdfOcrClient";

export const metadata: Metadata = {
  title: "PDF OCR Online – Extract Text from Scanned PDF | MYKSA CONNECT",
  description: "Extract text from scanned and image-based PDF files online with browser-based OCR. Supports English and Arabic PDFs without a server upload.",
  alternates: { canonical: "/tools/pdf-ocr/" },
};

const faqs = [
  ["What is PDF OCR?", "OCR means optical character recognition. It converts text visible inside scanned or image-based PDF pages into machine-readable text."],
  ["Can this OCR scanned PDFs?", "Yes. Pages without a usable text layer are rendered in your browser and processed with OCR."],
  ["Does it support Arabic?", "Yes. You can choose English, Arabic, or English + Arabic OCR."],
  ["Is my PDF uploaded to a server?", "No. This version processes the selected PDF in your browser, avoiding the server upload size limitation."],
  ["Is OCR always accurate?", "No. Scan quality, fonts, language, rotation and page layout affect OCR accuracy. Always review important names, numbers and dates."],
];

export default function PdfOcrPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#06131e 0%,#081923 52%,#07131c 100%)", padding: "30px 18px 70px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <nav style={{ fontSize: 13, marginBottom: 20 }}><a href="/tools/converters/" style={{ color: "#75e0bd", fontWeight: 800, textDecoration: "none" }}>← PDF Tools</a></nav>
        <header style={{ background: "linear-gradient(135deg,#00483a 0%,#062239 100%)", color: "#fff", border: "1px solid rgba(246,185,31,.28)", borderRadius: 24, padding: "34px 30px", marginBottom: 20, boxShadow: "0 18px 45px rgba(0,0,0,.30)" }}>
          <p style={{ color: "#f6c52f", fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase", margin: 0 }}>MYKSA CONNECT • PDF TOOL</p>
          <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(30px,5vw,48px)", lineHeight: 1.1 }}>PDF OCR Online</h1>
          <p style={{ margin: 0, maxWidth: 820, color: "rgba(255,255,255,.86)", lineHeight: 1.7 }}>Extract text from searchable PDFs and scan image-only documents. Choose English, Arabic, or both languages and download the extracted text.</p>
        </header>
        <BrowserPdfOcrClient />
        <section style={{ marginTop: 34, background: "#fff", borderRadius: 20, padding: "30px 26px", border: "1px solid #dbe7e2" }}>
          <h2 style={{ marginTop: 0, color: "#102027" }}>How to use PDF OCR</h2>
          <ol style={{ color: "#52615d", lineHeight: 1.8, paddingLeft: 22 }}>
            <li>Upload the PDF you want to read.</li>
            <li>Select English, Arabic, or English + Arabic.</li>
            <li>Click Run PDF OCR and wait while the pages are processed.</li>
            <li>Review the extracted text for names, numbers and formatting.</li>
            <li>Download the TXT result.</li>
          </ol>
          <h2 style={{ color: "#102027", marginTop: 28 }}>Why browser-based OCR?</h2>
          <p style={{ color: "#52615d", lineHeight: 1.75 }}>The PDF is processed on your device, so it does not need to pass through the website's server upload endpoint. This also avoids the 4.5 MB Vercel Function request-body limit that applies when files are sent directly to a serverless function. Browser OCR can take longer on large or image-heavy documents, so keep the tab open until processing finishes.</p>
        </section>
        <section style={{ marginTop: 20, background: "#fff", borderRadius: 20, padding: "30px 26px", border: "1px solid #dbe7e2" }}>
          <h2 style={{ marginTop: 0, color: "#102027" }}>PDF OCR FAQs</h2>
          {faqs.map(([q, a]) => <details key={q} style={{ borderTop: "1px solid #e4ebe8", padding: "15px 0" }}><summary style={{ cursor: "pointer", fontWeight: 800, color: "#15312a" }}>{q}</summary><p style={{ color: "#5c6965", lineHeight: 1.7, marginBottom: 0 }}>{a}</p></details>)}
        </section>
      </div>
    </main>
  );
}
