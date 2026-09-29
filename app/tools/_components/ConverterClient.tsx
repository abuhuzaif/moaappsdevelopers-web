"use client";

import { useMemo, useState } from "react";

declare global {
  interface Window {
    PDFLib?: any;
    pdfjsLib?: any;
    XLSX?: any;
  }
}

const CDN = {
  pdfLib: "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js",
  pdfJs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs",
  xlsx: "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",
};

function loadScript(src: string, globalName: "PDFLib" | "XLSX") {
  return new Promise<any>((resolve, reject) => {
    if ((window as any)[globalName]) return resolve((window as any)[globalName]);
    const existing = document.querySelector(`script[data-converter-lib="${globalName}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any)[globalName]));
      existing.addEventListener("error", () => reject(new Error(`Could not load ${globalName}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.converterLib = globalName;
    script.onload = () => resolve((window as any)[globalName]);
    script.onerror = () => reject(new Error(`Could not load ${globalName}`));
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

function downloadBytes(bytes: Uint8Array, filename: string, type = "application/octet-stream") {
  downloadBlob(new Blob([bytes as any], { type }), filename);
}

function readText(file: File) {
  return file.text();
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === "," && !quoted) { row.push(cell); cell = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(rows: unknown[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

function xmlEscape(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function imageToBlob(file: File, mime: string, quality?: number, width?: number, height?: number) {
  const img = await fileToImage(file);
  const w = width ?? img.naturalWidth;
  const h = height ?? img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Image conversion failed.")), mime, quality));
}

async function imagesToPdf(files: File[], PDFLib: any) {
  const pdf = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const img = await fileToImage(file);
    const max = 595;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, img.naturalWidth * scale);
    const height = Math.max(1, img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width); canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const jpg = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Could not prepare image")), "image/jpeg", 0.92));
    const bytes = new Uint8Array(await jpg.arrayBuffer());
    const embedded = await pdf.embedJpg(bytes);
    const page = pdf.addPage([width, height]);
    page.drawImage(embedded, { x: 0, y: 0, width, height });
  }
  return pdf.save();
}

function buildTextPdf(text: string, PDFLib: any) {
  const pdf = PDFLib.PDFDocument.create();
  return pdf.then(async (doc: any) => {
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const lines = text.replace(/\r/g, "").split("\n");
    let page = doc.addPage([595.28, 841.89]);
    let y = 800;
    for (const raw of lines) {
      const chunks = raw.match(/.{1,92}/g) || [""];
      for (const line of chunks) {
        if (y < 45) { page = doc.addPage([595.28, 841.89]); y = 800; }
        page.drawText(line, { x: 40, y, size: 11, font });
        y -= 16;
      }
      y -= 2;
    }
    return doc.save();
  });
}

const easySlugs = new Set([
  "jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png", "image-merger", "image-compressor", "image-resizer",
  "csv-to-json", "json-to-csv", "xml-to-json", "json-to-xml", "json-formatter", "csv-to-excel", "excel-to-csv",
  "txt-to-pdf", "jpg-to-pdf", "images-to-pdf", "merge-pdf", "split-pdf", "rotate-pdf", "extract-pdf-pages",
]);

export function converterIsInteractive(slug: string) { return easySlugs.has(slug); }

export default function ConverterClient({ slug, input, output }: { slug: string; input: string; output: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [quality, setQuality] = useState(82);
  const [text, setText] = useState("");

  const accept = useMemo(() => {
    if (slug.includes("csv")) return ".csv,text/csv";
    if (slug.includes("json")) return ".json,application/json";
    if (slug.includes("xml")) return ".xml,text/xml,application/xml";
    if (slug.includes("excel")) return ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (slug.includes("pdf")) return ".pdf,application/pdf";
    if (slug.includes("txt")) return ".txt,text/plain";
    return "image/jpeg,image/png,image/webp";
  }, [slug]);

  async function run() {
    setBusy(true); setMessage("");
    try {
      if (["jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png"].includes(slug)) {
        if (!files[0]) throw new Error("Select an image first.");
        const target = slug.endsWith("webp") ? "image/webp" : slug.endsWith("png") ? "image/png" : "image/jpeg";
        const ext = target.split("/")[1];
        downloadBlob(await imageToBlob(files[0], target, quality / 100), `myksa-converted.${ext}`);
      } else if (slug === "image-compressor") {
        if (!files[0]) throw new Error("Select an image first.");
        const blob = await imageToBlob(files[0], "image/jpeg", quality / 100);
        downloadBlob(blob, "myksa-compressed.jpg");
      } else if (slug === "image-resizer") {
        if (!files[0]) throw new Error("Select an image first.");
        const blob = await imageToBlob(files[0], "image/png", 1, Number(width), Number(height));
        downloadBlob(blob, "myksa-resized.png");
      } else if (slug === "image-merger") {
        if (files.length < 2) throw new Error("Select at least two images.");
        const imgs = await Promise.all(files.map(fileToImage));
        const w = direction === "horizontal" ? imgs.reduce((n, i) => n + i.naturalWidth, 0) : Math.max(...imgs.map((i) => i.naturalWidth));
        const h = direction === "vertical" ? imgs.reduce((n, i) => n + i.naturalHeight, 0) : Math.max(...imgs.map((i) => i.naturalHeight));
        const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
        let offset = 0;
        for (const img of imgs) { ctx.drawImage(img, direction === "horizontal" ? offset : 0, direction === "vertical" ? offset : 0); offset += direction === "horizontal" ? img.naturalWidth : img.naturalHeight; }
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Merge failed")), "image/jpeg", quality / 100));
        downloadBlob(blob, "myksa-merged.jpg");
      } else if (slug === "csv-to-json") {
        if (!files[0]) throw new Error("Select a CSV file.");
        const rows = parseCsv(await readText(files[0]));
        const headers = rows[0] || [];
        const data = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h || `column_${i + 1}`, r[i] ?? ""])));
        downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), "converted.json");
      } else if (slug === "json-to-csv") {
        if (!files[0]) throw new Error("Select a JSON file.");
        const data = JSON.parse(await readText(files[0]));
        const arr = Array.isArray(data) ? data : [data];
        const headers = Array.from(new Set(arr.flatMap((o: any) => Object.keys(o || {}))));
        downloadBlob(new Blob([rowsToCsv([headers, ...arr.map((o: any) => headers.map((h) => o?.[h] ?? ""))])], { type: "text/csv;charset=utf-8" }), "converted.csv");
      } else if (slug === "xml-to-json") {
        if (!files[0]) throw new Error("Select an XML file.");
        const doc = new DOMParser().parseFromString(await readText(files[0]), "application/xml");
        if (doc.querySelector("parsererror")) throw new Error("Invalid XML file.");
        const convert = (el: Element): any => {
          const obj: any = {};
          for (const attr of Array.from(el.attributes)) obj[`@${attr.name}`] = attr.value;
          for (const child of Array.from(el.children)) {
            const val = child.children.length || child.attributes.length ? convert(child) : child.textContent ?? "";
            if (obj[child.tagName] === undefined) obj[child.tagName] = val;
            else obj[child.tagName] = Array.isArray(obj[child.tagName]) ? [...obj[child.tagName], val] : [obj[child.tagName], val];
          }
          return Object.keys(obj).length ? obj : (el.textContent ?? "");
        };
        downloadBlob(new Blob([JSON.stringify({ [doc.documentElement.tagName]: convert(doc.documentElement) }, null, 2)], { type: "application/json" }), "converted.json");
      } else if (slug === "json-to-xml") {
        if (!files[0]) throw new Error("Select a JSON file.");
        const data = JSON.parse(await readText(files[0]));
        const node = (name: string, value: any): string => Array.isArray(value) ? value.map((v) => node(name, v)).join("") : value && typeof value === "object" ? `<${name}>${Object.entries(value).map(([k, v]) => node(k, v)).join("")}</${name}>` : `<${name}>${xmlEscape(value)}</${name}>`;
        const root = data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 1 ? Object.entries(data)[0] : ["root", data];
        downloadBlob(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${node(root[0] as string, root[1])}`], { type: "application/xml" }), "converted.xml");
      } else if (slug === "json-formatter") {
        if (!files[0]) throw new Error("Select a JSON file.");
        const pretty = JSON.stringify(JSON.parse(await readText(files[0])), null, 2);
        downloadBlob(new Blob([pretty], { type: "application/json" }), "formatted.json");
        setText(pretty);
      } else if (slug === "csv-to-excel" || slug === "excel-to-csv") {
        const XLSX = await loadScript(CDN.xlsx, "XLSX");
        if (!files[0]) throw new Error("Select a file first.");
        if (slug === "csv-to-excel") {
          const rows = parseCsv(await readText(files[0]));
          const ws = XLSX.utils.aoa_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); XLSX.writeFile(wb, "converted.xlsx");
        } else {
          const buf = await files[0].arrayBuffer(); const wb = XLSX.read(buf, { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; const csv = XLSX.utils.sheet_to_csv(ws);
          downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "converted.csv");
        }
      } else if (["txt-to-pdf", "jpg-to-pdf", "images-to-pdf", "merge-pdf", "split-pdf", "rotate-pdf", "extract-pdf-pages"].includes(slug)) {
        const PDFLib = await loadScript(CDN.pdfLib, "PDFLib");
        if (slug === "txt-to-pdf") {
          const source = files[0] ? await readText(files[0]) : text;
          if (!source.trim()) throw new Error("Choose a TXT file or enter text.");
          downloadBytes(await buildTextPdf(source, PDFLib), "converted.pdf", "application/pdf");
        } else if (slug === "jpg-to-pdf" || slug === "images-to-pdf") {
          if (!files.length) throw new Error("Select one or more images.");
          downloadBytes(await imagesToPdf(files, PDFLib), "images.pdf", "application/pdf");
        } else if (slug === "merge-pdf") {
          if (files.length < 2) throw new Error("Select at least two PDF files.");
          const out = await PDFLib.PDFDocument.create();
          for (const f of files) { const src = await PDFLib.PDFDocument.load(await f.arrayBuffer()); const pages = await out.copyPages(src, src.getPageIndices()); pages.forEach((p: any) => out.addPage(p)); }
          downloadBytes(await out.save(), "merged.pdf", "application/pdf");
        } else if (slug === "split-pdf" || slug === "extract-pdf-pages") {
          if (!files[0]) throw new Error("Select a PDF file.");
          const src = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
          const pageNumbers = prompt(`Enter page numbers to export, e.g. 1,3,5 (1-${src.getPageCount()})`, "1");
          if (!pageNumbers) return;
          const indices = pageNumbers.split(",").map((n) => Number(n.trim()) - 1).filter((n) => n >= 0 && n < src.getPageCount());
          if (!indices.length) throw new Error("No valid page numbers.");
          const out = await PDFLib.PDFDocument.create(); const pages = await out.copyPages(src, indices); pages.forEach((p: any) => out.addPage(p));
          downloadBytes(await out.save(), "selected-pages.pdf", "application/pdf");
        } else if (slug === "rotate-pdf") {
          if (!files[0]) throw new Error("Select a PDF file.");
          const src = await PDFLib.PDFDocument.load(await files[0].arrayBuffer()); const angle = Number(prompt("Rotate pages by 90, 180 or 270 degrees", "90"));
          if (![90, 180, 270].includes(angle)) throw new Error("Angle must be 90, 180 or 270.");
          src.getPages().forEach((p: any) => p.setRotation(PDFLib.degrees(p.getRotation().angle + angle)));
          downloadBytes(await src.save(), "rotated.pdf", "application/pdf");
        }
      } else {
        throw new Error("This converter needs a server-side format engine and is not enabled yet.");
      }
      setMessage("Done — your file is ready and the download should have started.");
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  const needsText = slug === "txt-to-pdf";
  const multi = ["image-merger", "images-to-pdf", "merge-pdf"].includes(slug);

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        {needsText && <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste text here…" rows={7} style={{ width: "100%", border: "1px solid #cbd8d3", borderRadius: 12, padding: 12, font: "inherit" }} />}
        <input type="file" accept={accept} multiple={multi} onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        {files.length > 0 && <small style={{ color: "#52615e" }}>{files.length} file(s) selected: {files.map((f) => f.name).join(", ")}</small>}
        {slug === "image-merger" && <label>Direction: <select value={direction} onChange={(e) => setDirection(e.target.value as any)}><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></label>}
        {slug === "image-resizer" && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><label>Width <input type="number" min="1" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></label><label>Height <input type="number" min="1" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label></div>}
        {["image-merger", "image-compressor", "jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png"].includes(slug) && <label>Quality: {quality}% <input type="range" min="30" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} /></label>}
        <button onClick={run} disabled={busy} style={{ border: 0, borderRadius: 12, padding: "12px 18px", background: "#005744", color: "#fff", fontWeight: 800, cursor: busy ? "wait" : "pointer" }}>{busy ? "Processing…" : `Convert ${input} → ${output}`}</button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
      </div>
      <p style={{ margin: "14px 0 0", color: "#65716f", fontSize: 12 }}>Files are processed in your browser for these tools. They are not uploaded to MYKSA CONNECT.</p>
    </div>
  );
}
