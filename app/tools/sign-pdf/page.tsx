import type { Metadata } from "next";
import SignPdfToolClient from "../_components/SignPdfToolClient";

export const metadata: Metadata = {
  title: "Sign PDF Online Free – Add Signature to PDF | MYKSA CONNECT",
  description: "Sign PDF online for free. Upload a PDF, add a signature image, draw or type your signature, drag and resize it, then download the signed PDF.",
  alternates: { canonical: "/tools/sign-pdf/" },
};

const faqs = [
  ["Can I upload my own signature image?", "Yes. Upload a PNG or JPG signature and place it anywhere on the PDF. Transparent PNG files give the cleanest result."],
  ["Can I resize and move my signature?", "Yes. Drag the signature on the PDF preview to position it, then use the resize handle to make it larger or smaller."],
  ["Can I sign more than one PDF page?", "Yes. You can apply the same signature to the current page, every page, or selected pages such as 1,3,5-7."],
  ["Can I draw my signature instead of uploading an image?", "Yes. The tool includes Draw, Type and Upload signature options."],
  ["Are my PDF and signature uploaded to a server?", "No. The editor is designed to process the PDF and signature in your browser before generating the signed PDF."],
];

export default function SignPdfPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#06131e 0%,#081923 52%,#07131c 100%)", padding: "30px 18px 70px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <nav style={{ fontSize: 13, marginBottom: 20 }}><a href="/tools/converters/" style={{ color: "#75e0bd", fontWeight: 800, textDecoration: "none" }}>← PDF Tools</a></nav>
        <header style={{ background: "linear-gradient(135deg,#00483a 0%,#062239 100%)", color: "#fff", border: "1px solid rgba(246,185,31,.28)", borderRadius: 24, padding: "34px 30px", marginBottom: 20, boxShadow: "0 18px 45px rgba(0,0,0,.30)" }}>
          <p style={{ color: "#f6c52f", fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: "uppercase", margin: 0 }}>MYKSA CONNECT • PDF TOOL</p>
          <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(30px,5vw,48px)", lineHeight: 1.1 }}>Sign PDF Online</h1>
          <p style={{ margin: 0, maxWidth: 820, color: "rgba(255,255,255,.86)", lineHeight: 1.7 }}>Upload a PDF, add your signature image, draw or type a signature, move it anywhere on the document, resize it to the required size, and download your signed PDF.</p>
        </header>
        <SignPdfToolClient />
        <section style={{ marginTop: 34, background: "#fff", borderRadius: 20, padding: "30px 26px", border: "1px solid #dbe7e2" }}>
          <h2 style={{ marginTop: 0, color: "#102027" }}>How to sign a PDF online</h2>
          <ol style={{ color: "#52615d", lineHeight: 1.8, paddingLeft: 22 }}><li>Upload the PDF document you need to sign.</li><li>Choose Upload, Draw, or Type to create your signature.</li><li>Drag the signature to the required location on the PDF.</li><li>Resize the signature with the corner handle.</li><li>Choose the current page, all pages, or custom pages.</li><li>Download the completed signed PDF.</li></ol>
          <h2 style={{ color: "#102027", marginTop: 28 }}>Why use MYKSA CONNECT Sign PDF?</h2>
          <p style={{ color: "#52615d", lineHeight: 1.75 }}>The tool is designed for quick browser-based signing without requiring a desktop PDF editor. It supports signature images, drawn signatures and typed signatures, with direct positioning and resizing on the PDF preview.</p>
        </section>
        <section style={{ marginTop: 20, background: "#fff", borderRadius: 20, padding: "30px 26px", border: "1px solid #dbe7e2" }}>
          <h2 style={{ marginTop: 0, color: "#102027" }}>Sign PDF FAQs</h2>
          {faqs.map(([q, a]) => <details key={q} style={{ borderTop: "1px solid #e4ebe8", padding: "15px 0" }}><summary style={{ cursor: "pointer", fontWeight: 800, color: "#15312a" }}>{q}</summary><p style={{ color: "#5c6965", lineHeight: 1.7, marginBottom: 0 }}>{a}</p></details>)}
        </section>
      </div>
    </main>
  );
}
