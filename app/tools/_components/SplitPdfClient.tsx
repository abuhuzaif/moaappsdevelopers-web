"use client";

import { useState } from "react";

declare global {
  interface Window { PDFLib?: any; }
}

const PDF_LIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

function loadPdfLib() {
  return new Promise<any>((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const existing = document.querySelector('script[data-split-pdf-lib="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PDFLib));
      existing.addEventListener("error", () => reject(new Error("Could not load the PDF processing library.")));
      return;
    }
    const script = document.createElement("script");
    script.src = PDF_LIB_CDN;
    script.async = true;
    script.dataset.splitPdfLib = "1";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Could not load the PDF processing library."));
    document.head.appendChild(script);
  });
}

function download(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(new Blob([bytes as any], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parsePages(value: string, total: number) {
  const pages = new Set<number>();
  for (const part of value.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = Math.max(1, Number(range[1]));
      const to = Math.min(total, Number(range[2]));
      for (let p = Math.min(from, to); p <= Math.max(from, to); p++) pages.add(p - 1);
    } else {
      const page = Number(token);
      if (Number.isInteger(page) && page >= 1 && page <= total) pages.add(page - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<"extract" | "remove" | "every">("extract");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function inspect(nextFile: File | null) {
    setFile(nextFile); setMessage(""); setPages(""); setPageCount(null);
    if (!nextFile) return;
    try {
      const PDFLib = await loadPdfLib();
      const pdf = await PDFLib.PDFDocument.load(await nextFile.arrayBuffer());
      setPageCount(pdf.getPageCount());
      setPages(`1-${pdf.getPageCount()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read this PDF.");
    }
  }

  async function run() {
    if (!file) { setMessage("Choose a PDF file first."); return; }
    setBusy(true); setMessage("");
    try {
      const PDFLib = await loadPdfLib();
      const src = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      const total = src.getPageCount();
      const selected = parsePages(pages, total);
      if (!selected.length) throw new Error(`Enter valid page numbers from 1 to ${total}.`);

      if (mode === "every") {
        for (const index of selected) {
          const out = await PDFLib.PDFDocument.create();
          const copied = await out.copyPages(src, [index]);
          out.addPage(copied[0]);
          download(await out.save(), `split-page-${index + 1}.pdf`);
        }
        setMessage(`Created ${selected.length} PDF file(s). Your downloads should start automatically.`);
      } else {
        const indices = mode === "extract" ? selected : Array.from({ length: total }, (_, i) => i).filter((i) => !selected.includes(i));
        if (!indices.length) throw new Error("The selected pages would leave an empty PDF.");
        const out = await PDFLib.PDFDocument.create();
        const copied = await out.copyPages(src, indices);
        copied.forEach((page: any) => out.addPage(page));
        download(await out.save(), mode === "extract" ? "selected-pages.pdf" : "pages-removed.pdf");
        setMessage(`Done — ${indices.length} page(s) exported.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Split failed. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <input type="file" accept=".pdf,application/pdf" onChange={(e) => inspect(e.target.files?.[0] ?? null)} />
        {pageCount !== null && <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>PDF loaded successfully • {pageCount} page{pageCount === 1 ? "" : "s"}</div>}
        <label style={{ display: "grid", gap: 7, fontWeight: 700, color: "#06172a" }}>
          Split mode
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ padding: 11, borderRadius: 10, border: "1px solid #cbd8d3", font: "inherit" }}>
            <option value="extract">Extract selected pages into one PDF</option>
            <option value="remove">Remove selected pages and keep the rest</option>
            <option value="every">Create one PDF for each selected page</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 7, fontWeight: 700, color: "#06172a" }}>
          {mode === "remove" ? "Pages to remove" : "Pages to extract"}
          <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Example: 1, 3, 5-8" style={{ padding: 11, borderRadius: 10, border: "1px solid #cbd8d3", font: "inherit" }} />
        </label>
        <small style={{ color: "#65716f" }}>Use commas and ranges, for example <strong>1, 3, 5-8</strong>. Processing happens in your browser; the PDF is not uploaded.</small>
        <button type="button" onClick={run} disabled={busy || !file} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}>
          {busy ? "Processing…" : "Split PDF"}
        </button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") || message.startsWith("Created") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
      </div>
    </div>
  );
}
