"use client";

import { useState } from "react";

declare global {
  interface Window {
    PDFLib?: any;
    pdfjsLib?: any;
    JSZip?: any;
  }
}

const PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFLIB_SRC = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
const JSZIP_SRC = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

function loadGlobalScript(src: string, globalName: "pdfjsLib" | "PDFLib" | "JSZip") {
  return new Promise<any>((resolve, reject) => {
    const existingGlobal = (window as any)[globalName];
    if (existingGlobal) return resolve(existingGlobal);

    const selector = `script[data-myksa-pdf-lib="${globalName}"]`;
    const existing = document.querySelector(selector) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any)[globalName]));
      existing.addEventListener("error", () => reject(new Error(`Could not load ${globalName}.`)));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.myksaPdfLib = globalName;
    script.onload = () => resolve((window as any)[globalName]);
    script.onerror = () => reject(new Error(`Could not load ${globalName}.`));
    document.head.appendChild(script);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function baseName(filename: string) {
  return filename.replace(/\.pdf$/i, "") || "document";
}

async function renderPdfToJpegs(file: File, pdfjsLib: any, quality: number, scale: number) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const images: { name: string; blob: Blob }[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Your browser could not create a PDF rendering canvas.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Could not create JPG for page ${pageNumber}.`)), "image/jpeg", quality / 100);
    });
    images.push({ name: `${baseName(file.name)}-page-${pageNumber}.jpg`, blob });
  }

  return images;
}

async function rasterizePdf(file: File, pdfjsLib: any, PDFLib: any, quality: number, scale: number) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await pdfjsLib.getDocument({ data: bytes }).promise;
  const output = await PDFLib.PDFDocument.create();

  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
    const page = await source.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Your browser could not create a PDF rendering canvas.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport: renderViewport }).promise;

    const jpg = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Could not compress page ${pageNumber}.`)), "image/jpeg", quality / 100);
    });
    const jpgBytes = new Uint8Array(await jpg.arrayBuffer());
    const embedded = await output.embedJpg(jpgBytes);
    const outPage = output.addPage([baseViewport.width, baseViewport.height]);
    outPage.drawImage(embedded, { x: 0, y: 0, width: baseViewport.width, height: baseViewport.height });
  }

  return output.save({ useObjectStreams: true });
}

async function structurallyOptimizePdf(file: File, PDFLib: any) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
  return source.save({ useObjectStreams: true, addDefaultPage: false });
}

export default function PdfCompressionClient({ mode }: { mode: "compress" | "jpg" }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [quality, setQuality] = useState(mode === "compress" ? 72 : 86);
  const [scale, setScale] = useState(mode === "compress" ? 0.85 : 1.5);

  async function run() {
    if (!file) {
      setMessage("Please choose a PDF first.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const pdfjsLib = await loadGlobalScript(PDFJS_SRC, "pdfjsLib");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

      if (mode === "jpg") {
        const JSZip = await loadGlobalScript(JSZIP_SRC, "JSZip");
        const images = await renderPdfToJpegs(file, pdfjsLib, quality, scale);
        const zip = new JSZip();
        for (const image of images) zip.file(image.name, image.blob);
        const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
        downloadBlob(zipBlob, `${baseName(file.name)}-jpg-images.zip`);
        setMessage(`${images.length} page(s) converted successfully. Your JPG images are in the ZIP file.`);
      } else {
        const PDFLib = await loadGlobalScript(PDFLIB_SRC, "PDFLib");
        const originalBytes = new Uint8Array(await file.arrayBuffer());
        let bestBytes = originalBytes;

        try {
          const optimized = await structurallyOptimizePdf(file, PDFLib);
          if (optimized.length < bestBytes.length) bestBytes = optimized;
        } catch {
          // Some PDFs cannot be rewritten by pdf-lib; the raster fallback below can still work.
        }

        if (bestBytes.length >= originalBytes.length) {
          const rasterized = await rasterizePdf(file, pdfjsLib, PDFLib, quality, scale);
          if (rasterized.length < bestBytes.length) bestBytes = rasterized;
        }

        const savedPercent = Math.max(0, Math.round((1 - bestBytes.length / originalBytes.length) * 100));
        downloadBlob(new Blob([bestBytes as any], { type: "application/pdf" }), `${baseName(file.name)}-compressed.pdf`);
        if (savedPercent > 0) {
          setMessage(`Compression complete. File size reduced by about ${savedPercent}%. Original PDF was not changed.`);
        } else {
          setMessage("A new PDF was created, but this PDF could not be reduced further without risking unnecessary quality loss. Original PDF was not changed.");
        }
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong. Please try another PDF.");
    } finally {
      setBusy(false);
    }
  }

  const isJpg = mode === "jpg";
  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="pdf-tool-file" style={{ display: "block", fontWeight: 800, color: "#06172a", marginBottom: 8 }}>
            PDF file
          </label>
          <input
            id="pdf-tool-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setMessage("");
            }}
          />
          {file && <div style={{ marginTop: 8, color: "#52615e", fontSize: 13 }}>{file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
        </div>

        {isJpg ? (
          <>
            <label style={{ color: "#33413f", fontWeight: 700 }}>
              JPG quality: {quality}%
              <input type="range" min="50" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
            <label style={{ color: "#33413f", fontWeight: 700 }}>
              Image scale: {scale.toFixed(1)}×
              <input type="range" min="1" max="2" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
          </>
        ) : (
          <>
            <label style={{ color: "#33413f", fontWeight: 700 }}>
              Compression quality: {quality}%
              <input type="range" min="45" max="90" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
            <label style={{ color: "#33413f", fontWeight: 700 }}>
              Image scale: {scale.toFixed(2)}×
              <input type="range" min="0.55" max="1" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
          </>
        )}

        <button onClick={run} disabled={busy} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: "#005744", color: "#fff", fontWeight: 800, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "Processing…" : isJpg ? "Convert PDF → JPG" : "Compress PDF"}
        </button>

        {message && <p style={{ margin: 0, color: message.startsWith("Compression complete") || message.includes("converted successfully") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
      </div>
      <p style={{ margin: "14px 0 0", color: "#65716f", fontSize: 12 }}>
        Browser-based processing. Your original PDF stays on your device and is never overwritten; the tool creates a new output file.
      </p>
    </div>
  );
}
