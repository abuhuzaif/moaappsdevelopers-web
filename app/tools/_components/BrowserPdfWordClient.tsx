"use client";

import { useState } from "react";

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
const DOCX_URL = "https://esm.sh/docx@9.2.0?bundle";

async function loadPdfJs() { return (0, eval)(`import(${JSON.stringify(PDFJS_URL)})`); }
async function loadDocx() { return (0, eval)(`import(${JSON.stringify(DOCX_URL)})`); }

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BrowserPdfWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    if (!file) { setMessage("Choose a PDF file first."); return; }
    setBusy(true); setMessage("Reading PDF text in your browser…");
    try {
      const pdfjs = await loadPdfJs();
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      const pdf = await loadingTask.promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setMessage(`Extracting page ${pageNumber} of ${pdf.numPages}…`);
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const items = content.items as Array<{ str?: string }>;
        const text = items.map((item) => item.str ?? "").join(" ").replace(/\s+([,.;:!?])/g, "$1").trim();
        pages.push(text || "[No selectable text found on this page]");
      }

      setMessage("Creating editable Word document…");
      const docx = await loadDocx();
      const children: any[] = [];
      pages.forEach((text, index) => {
        if (index > 0) children.push(new docx.Paragraph({ children: [new docx.TextRun({ break: 1 })] }));
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: `Page ${index + 1}`, bold: true, size: 24 })] }));
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        for (const line of lines.length ? lines : [text]) children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: line, size: 22 })], spacing: { after: 120 } }));
      });
      const document = new docx.Document({ sections: [{ children }] });
      const blob = await docx.Packer.toBlob(document);
      download(blob, `${file.name.replace(/\.[^.]+$/, "") || "converted"}.docx`);
      setMessage(`Done — ${pdf.numPages} page(s) converted to a new editable DOCX. Your original PDF remains unchanged.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF to Word conversion failed. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <input type="file" accept=".pdf,application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setMessage(""); }} />
        {file && <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>PDF selected • {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB • Source unchanged</div>}
        <small style={{ color: "#65716f", lineHeight: 1.6 }}>Browser-based conversion. Your PDF is processed on your device instead of being sent to the Vercel upload endpoint. The conversion creates a new DOCX; it never edits, deletes, or overwrites the original PDF.</small>
        <button type="button" onClick={run} disabled={busy || !file} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}>
          {busy ? "Converting…" : "Convert PDF → Word"}
        </button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
      </div>
    </div>
  );
}
