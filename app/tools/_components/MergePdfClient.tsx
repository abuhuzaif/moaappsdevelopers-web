"use client";

import { useState } from "react";

declare global { interface Window { PDFLib?: any; } }

const PDF_LIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

type MergeItem = { file: File; pageCount: number | null };

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
  const a = document.createElement("a");
  a.href = url;
  a.download = "merged-pdf.pdf";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MergePdfClient() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function addFile(file: File | null) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please choose a PDF file.");
      return;
    }
    if (items.some((item) => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) {
      setMessage("That PDF is already in the merge list.");
      return;
    }
    setMessage("");
    try {
      const PDFLib = await loadPdfLib();
      const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      setItems((current) => [...current, { file, pageCount: pdf.getPageCount() }]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read this PDF.");
    }
  }

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
    setMessage("");
  }

  async function run() {
    if (items.length < 2) {
      setMessage("Add at least two PDF files to merge.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const PDFLib = await loadPdfLib();
      const out = await PDFLib.PDFDocument.create();
      for (const item of items) {
        const src = await PDFLib.PDFDocument.load(await item.file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((page: any) => out.addPage(page));
      }
      download(await out.save());
      const totalPages = items.reduce((sum, item) => sum + (item.pageCount || 0), 0);
      setMessage(`Done — ${items.length} PDF files (${totalPages} pages) merged in the order shown above.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Merge failed. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 12, padding: "12px 16px", background: "#005744", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
            + Add PDF
            <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => { void addFile(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} />
          </label>
          <span style={{ color: "#65716f", fontSize: 13 }}>Add files one at a time and arrange them before merging.</span>
        </div>

        {items.length > 0 && <div style={{ display: "grid", gap: 8 }}>
          {items.map((item, index) => (
            <div key={`${item.file.name}-${item.file.lastModified}-${index}`} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto auto auto auto", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 12, border: "1px solid #d9e6e0", background: "#fff" }}>
              <strong style={{ color: "#005744" }}>{index + 1}</strong>
              <div style={{ minWidth: 0 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800 }}>{item.file.name}</div>
                <div style={{ color: "#65716f", fontSize: 12 }}>{item.pageCount === null ? "Reading pages…" : `${item.pageCount} page${item.pageCount === 1 ? "" : "s"}`} • {(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move PDF up" style={{ padding: "7px 9px" }}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move PDF down" style={{ padding: "7px 9px" }}>↓</button>
              <button type="button" onClick={() => remove(index)} aria-label={`Remove ${item.file.name}`} style={{ padding: "7px 9px" }}>Remove</button>
              <span style={{ color: "#65716f", fontSize: 12 }}>Source unchanged</span>
            </div>
          ))}
        </div>}

        <button type="button" onClick={run} disabled={busy || items.length < 2} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || items.length < 2 ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || items.length < 2 ? "not-allowed" : "pointer" }}>
          {busy ? "Merging…" : `Merge ${items.length || "PDF"} Files`}
        </button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
        <p style={{ margin: 0, color: "#65716f", fontSize: 12 }}>Safety: your original PDFs are read-only. Removing or reordering an item only changes this merge list; the original files are never edited, deleted, or overwritten. The merged PDF is always downloaded as a new file.</p>
      </div>
    </div>
  );
}
