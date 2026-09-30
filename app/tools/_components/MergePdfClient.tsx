"use client";

import { useState } from "react";

declare global { interface Window { PDFLib?: any; } }

const PDF_LIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

function loadPdfLib() {
  return new Promise<any>((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const existing = document.querySelector('script[data-merge-pdf-lib="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PDFLib));
      existing.addEventListener("error", () => reject(new Error("Could not load the PDF processing library.")));
      return;
    }
    const script = document.createElement("script");
    script.src = PDF_LIB_CDN; script.async = true; script.dataset.mergePdfLib = "1";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Could not load the PDF processing library."));
    document.head.appendChild(script);
  });
}

function download(bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([bytes as any], { type: "application/pdf" }));
  const a = document.createElement("a"); a.href = url; a.download = "merged.pdf"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MergePdfClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function addFiles(next: FileList | null) {
    if (!next) return;
    const incoming = Array.from(next).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setFiles((current) => [...current, ...incoming]); setMessage("");
  }

  function move(index: number, direction: -1 | 1) {
    setFiles((current) => {
      const next = [...current]; const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]]; return next;
    });
  }

  function remove(index: number) { setFiles((current) => current.filter((_, i) => i !== index)); }

  async function run() {
    if (files.length < 2) { setMessage("Choose at least two PDF files to merge."); return; }
    setBusy(true); setMessage("");
    try {
      const PDFLib = await loadPdfLib();
      const out = await PDFLib.PDFDocument.create();
      for (const file of files) {
        const src = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((page: any) => out.addPage(page));
      }
      download(await out.save());
      setMessage(`Done — ${files.length} PDF files merged in the order shown above.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Merge failed. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => addFiles(e.target.files)} />
        <small style={{ color: "#65716f" }}>Select multiple PDF files at once, or add more files. Use ↑ and ↓ to control the merge order.</small>
        {files.length > 0 && <div style={{ display: "grid", gap: 8 }}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid #d9e6e0", background: "#fff" }}>
              <strong style={{ minWidth: 26, color: "#005744" }}>{index + 1}</strong>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === files.length - 1} aria-label="Move down">↓</button>
              <button type="button" onClick={() => remove(index)} aria-label="Remove file">×</button>
            </div>
          ))}
        </div>}
        <button type="button" onClick={run} disabled={busy || files.length < 2} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || files.length < 2 ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || files.length < 2 ? "not-allowed" : "pointer" }}>
          {busy ? "Merging…" : "Merge PDF Files"}
        </button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
        <p style={{ margin: 0, color: "#65716f", fontSize: 12 }}>Browser-based processing. Your PDFs are not uploaded to MYKSA CONNECT.</p>
      </div>
    </div>
  );
}
