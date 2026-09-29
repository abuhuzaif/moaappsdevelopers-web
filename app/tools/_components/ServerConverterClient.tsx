"use client";

import { useMemo, useState } from "react";

const CONFIG: Record<string, { accept: string; hint: string; button: string }> = {
  "word-to-pdf": { accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", hint: "DOCX only • text and tables are converted server-side.", button: "Convert Word → PDF" },
  "pdf-to-word": { accept: ".pdf,application/pdf", hint: "PDF text is extracted into an editable DOCX.", button: "Convert PDF → Word" },
  "pdf-to-csv": { accept: ".pdf,application/pdf", hint: "Tables are extracted when detected; text-only PDFs fall back to page/text rows.", button: "Extract PDF → CSV" },
  "pdf-to-excel": { accept: ".pdf,application/pdf", hint: "Detected PDF tables are written to an XLSX workbook, one sheet per page/table group.", button: "Convert PDF → Excel" },
  "pdf-to-text": { accept: ".pdf,application/pdf", hint: "Extract selectable/searchable PDF text into a UTF-8 text file.", button: "Extract PDF → Text" },
  "pdf-ocr": { accept: ".pdf,application/pdf", hint: "Extract text from the PDF. Scanned PDFs without an embedded text layer need an OCR runtime with Tesseract enabled on the server.", button: "Run PDF OCR" },
  "pdf-to-html": { accept: ".pdf,application/pdf", hint: "Convert extracted PDF text into a clean standalone HTML document.", button: "Convert PDF → HTML" },
  "pdf-to-markdown": { accept: ".pdf,application/pdf", hint: "Convert extracted PDF text into Markdown with page headings.", button: "Convert PDF → Markdown" },
  "ppt-to-pdf": { accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation", hint: "PPTX slide text is converted into a PDF document.", button: "Convert PowerPoint → PDF" },
  "pdf-to-ppt": { accept: ".pdf,application/pdf", hint: "Each PDF page becomes an editable PowerPoint slide with extracted text.", button: "Convert PDF → PowerPoint" },
};

export default function ServerConverterClient({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const config = useMemo(() => CONFIG[slug] ?? CONFIG["word-to-pdf"], [slug]);

  async function run() {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("operation", slug);
      form.append("file", file);
      const response = await fetch("/api/convert", { method: "POST", body: form });
      if (!response.ok) {
        let error = "Conversion failed. Please try again.";
        try {
          const data = await response.json();
          if (data?.detail) error = data.detail;
        } catch {}
        throw new Error(error);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const ext: Record<string, string> = {
        "pdf-to-word": "docx", "pdf-to-csv": "csv", "pdf-to-excel": "xlsx", "pdf-to-text": "txt", "pdf-ocr": "txt",
        "pdf-to-html": "html", "pdf-to-markdown": "md", "pdf-to-ppt": "pptx", "word-to-pdf": "pdf", "ppt-to-pdf": "pdf",
      };
      const fallback = `${file.name.replace(/\.[^.]+$/, "") || "converted"}.${ext[slug] || "bin"}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] || fallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Conversion completed. Your file download should start automatically.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 20, borderRadius: 16, background: "#f6f8f7", border: "1px solid #d7e3de" }}>
      <input
        type="file"
        accept={config.accept}
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        style={{ display: "block", width: "100%", marginBottom: 14 }}
      />
      <p style={{ margin: "0 0 14px", color: "#65716f", fontSize: 13, lineHeight: 1.6 }}>{config.hint}</p>
      <p style={{ margin: "0 0 14px", color: "#725600", fontSize: 12, fontWeight: 700 }}>Server processing • Please keep the upload under 4 MB for now.</p>
      <button
        type="button"
        onClick={run}
        disabled={busy || !file}
        style={{ border: 0, borderRadius: 10, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}
      >
        {busy ? "Converting…" : config.button}
      </button>
      {message && <p style={{ margin: "14px 0 0", color: "#42504d", fontSize: 13 }}>{message}</p>}
    </div>
  );
}
