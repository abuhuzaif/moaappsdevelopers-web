"use client";

import { useMemo, useState } from "react";

const CONFIG: Record<string, { accept: string; hint: string; button: string; output: string }> = {
  "add-pdf-page-numbers": { accept: ".pdf,application/pdf", hint: "Add page numbers to the bottom-right of every page.", button: "Add Page Numbers", output: "pdf" },
  "watermark-pdf": { accept: ".pdf,application/pdf", hint: "Add a light text watermark across every page.", button: "Watermark PDF", output: "pdf" },
  "protect-pdf": { accept: ".pdf,application/pdf", hint: "Encrypt the PDF with a password you choose.", button: "Protect PDF", output: "pdf" },
  "unlock-pdf": { accept: ".pdf,application/pdf", hint: "Enter the existing PDF password. This does not bypass unknown passwords.", button: "Unlock PDF", output: "pdf" },
  "remove-pdf-pages": { accept: ".pdf,application/pdf", hint: "Enter pages to remove, e.g. 2,4-6.", button: "Remove Pages", output: "pdf" },
  "reorder-pdf-pages": { accept: ".pdf,application/pdf", hint: "Enter the complete page order, e.g. 3,1,2,4. Every page must appear exactly once.", button: "Reorder Pages", output: "pdf" },
  "extract-images-from-pdf": { accept: ".pdf,application/pdf", hint: "Extract embedded raster images and download them as a ZIP archive.", button: "Extract Images", output: "zip" },
  "sign-pdf": { accept: ".pdf,application/pdf", hint: "Add a typed signature and date to the last page.", button: "Sign PDF", output: "pdf" },
  "compare-pdf": { accept: ".pdf,application/pdf", hint: "Choose two PDFs to compare their extracted text. A text report will be downloaded.", button: "Compare PDFs", output: "txt" },
  "repair-pdf": { accept: ".pdf,application/pdf", hint: "Rewrite a readable PDF into a fresh PDF file. Encrypted PDFs require their password first.", button: "Repair PDF", output: "pdf" },
};

function fieldFor(slug: string) {
  if (slug === "watermark-pdf") return { label: "Watermark text", placeholder: "MYKSA CONNECT", type: "text" };
  if (slug === "protect-pdf" || slug === "unlock-pdf") return { label: "PDF password", placeholder: "Enter password", type: "password" };
  if (slug === "remove-pdf-pages" || slug === "reorder-pdf-pages") return { label: "Page selection / order", placeholder: slug === "remove-pdf-pages" ? "2,4-6" : "3,1,2,4", type: "text" };
  if (slug === "sign-pdf") return { label: "Signature", placeholder: "Your name / signature", type: "text" };
  return null;
}

export default function AdvancedPdfToolClient({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const config = useMemo(() => CONFIG[slug] ?? CONFIG["repair-pdf"], [slug]);
  const field = fieldFor(slug);

  async function run() {
    if (!file) return setMessage("Please choose a PDF first.");
    if (slug === "compare-pdf" && !secondFile) return setMessage("Please choose the second PDF.");
    if (field && !value.trim()) return setMessage(`Please enter ${field.label.toLowerCase()}.`);
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("operation", slug);
      form.append("file", file);
      if (secondFile) form.append("file2", secondFile);
      if (value.trim()) form.append("value", value.trim());
      const response = await fetch("/api/convert", { method: "POST", body: form });
      if (!response.ok) {
        let error = "PDF operation failed. Please try again.";
        try { const data = await response.json(); if (data?.detail) error = data.detail; } catch {}
        throw new Error(error);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fallback = `${file.name.replace(/\.[^.]+$/, "") || "document"}-${slug}.${config.output}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] || fallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Completed successfully. Your download should start automatically.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF operation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 20, borderRadius: 16, background: "#f6f8f7", border: "1px solid #d7e3de" }}>
      <label style={{ display: "block", fontWeight: 800, color: "#06172a", marginBottom: 8 }}>PDF file</label>
      <input type="file" accept={config.accept} onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "block", width: "100%", marginBottom: 16 }} />

      {slug === "compare-pdf" && (
        <>
          <label style={{ display: "block", fontWeight: 800, color: "#06172a", marginBottom: 8 }}>Second PDF</label>
          <input type="file" accept={config.accept} onChange={(e) => setSecondFile(e.target.files?.[0] ?? null)} style={{ display: "block", width: "100%", marginBottom: 16 }} />
        </>
      )}

      {field && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 800, color: "#06172a", marginBottom: 8 }}>{field.label}</label>
          <input type={field.type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={field.placeholder} style={{ width: "100%", boxSizing: "border-box", padding: "12px 13px", border: "1px solid #cbd8d3", borderRadius: 10, background: "#fff" }} />
        </div>
      )}

      <p style={{ margin: "0 0 14px", color: "#65716f", fontSize: 13, lineHeight: 1.6 }}>{config.hint}</p>
      <p style={{ margin: "0 0 14px", color: "#725600", fontSize: 12, fontWeight: 700 }}>Server processing • Please keep uploads under 4 MB for now.</p>
      <button type="button" onClick={run} disabled={busy || !file} style={{ border: 0, borderRadius: 10, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}>
        {busy ? "Processing…" : config.button}
      </button>
      {message && <p style={{ margin: "14px 0 0", color: "#42504d", fontSize: 13 }}>{message}</p>}
    </div>
  );
}
