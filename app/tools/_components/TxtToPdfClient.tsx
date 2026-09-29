"use client";

import { useState } from "react";

declare global {
  interface Window {
    PDFLib?: any;
  }
}

const PDF_LIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

function loadPdfLib() {
  return new Promise<any>((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const existing = document.querySelector('script[data-converter-lib="PDFLib"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PDFLib));
      existing.addEventListener("error", () => reject(new Error("Could not load PDF engine.")));
      return;
    }
    const script = document.createElement("script");
    script.src = PDF_LIB_CDN;
    script.async = true;
    script.dataset.converterLib = "PDFLib";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Could not load PDF engine."));
    document.head.appendChild(script);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

async function buildUnicodeTextPdf(text: string, PDFLib: any) {
  const pdf = await PDFLib.PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const fontSize = 11;
  const lineHeight = 17;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.font = `${fontSize * 2}px Arial, sans-serif`;

  const lines = wrapLines(ctx, text, contentWidth * 2);
  const linesPerPage = Math.max(1, Math.floor(contentHeight / lineHeight));

  for (let start = 0; start < Math.max(lines.length, 1); start += linesPerPage) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    const pageLines = lines.slice(start, start + linesPerPage);
    const raster = document.createElement("canvas");
    const scale = 2;
    raster.width = Math.round(pageWidth * scale);
    raster.height = Math.round(pageHeight * scale);
    const rctx = raster.getContext("2d");
    if (!rctx) throw new Error("Canvas is not available in this browser.");

    rctx.fillStyle = "#ffffff";
    rctx.fillRect(0, 0, raster.width, raster.height);
    rctx.fillStyle = "#111827";
    rctx.font = `${fontSize * scale}px Arial, sans-serif`;
    rctx.textBaseline = "top";

    pageLines.forEach((line, index) => {
      rctx.fillText(line, margin * scale, (margin + index * lineHeight) * scale);
    });

    const pngBlob = await new Promise<Blob>((resolve, reject) =>
      raster.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create PDF page."))), "image/png")
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const image = await pdf.embedPng(pngBytes);
    page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  return pdf.save();
}

export default function TxtToPdfClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function convert() {
    setBusy(true);
    setMessage("");
    try {
      let source = text;
      if (!source.trim() && files[0]) source = await files[0].text();
      if (!source.trim()) throw new Error("Paste text or select a TXT file first.");

      const PDFLib = await loadPdfLib();
      const bytes = await buildUnicodeTextPdf(source, PDFLib);
      downloadBlob(new Blob([bytes as any], { type: "application/pdf" }), "myksa-converted.pdf");
      setMessage("PDF created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, borderRadius: 16, background: "#f6f9f7", border: "1px solid #d7e4df" }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or paste text here..."
        style={{ width: "100%", minHeight: 180, resize: "vertical", padding: 14, borderRadius: 12, border: "1px solid #cbd8d3", boxSizing: "border-box", font: "inherit" }}
      />
      <input
        type="file"
        accept=".txt,text/plain"
        multiple={false}
        onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        style={{ marginTop: 12 }}
      />
      {files.length > 0 && <div style={{ marginTop: 8, fontSize: 13, color: "#65716f" }}>{files[0].name}</div>}
      <button
        type="button"
        onClick={convert}
        disabled={busy}
        style={{ width: "100%", marginTop: 14, padding: "12px 16px", border: 0, borderRadius: 10, background: "#006b55", color: "#fff", fontWeight: 800, cursor: busy ? "wait" : "pointer" }}
      >
        {busy ? "Converting..." : "Convert TXT → PDF"}
      </button>
      {message && <div style={{ marginTop: 10, color: message.includes("successfully") ? "#006b55" : "#b45309", fontWeight: 700 }}>{message}</div>}
      <p style={{ margin: "12px 0 0", color: "#65716f", fontSize: 12 }}>Files are processed in your browser and are not uploaded to MYKSA CONNECT.</p>
    </div>
  );
}
