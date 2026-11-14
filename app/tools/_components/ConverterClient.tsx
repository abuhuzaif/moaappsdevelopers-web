"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

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

// Images → PDF in full quality.
// Before: every image was shrunk to 595 px and re-saved as JPEG, so text in
// screenshots/documents came out blurry. Now the PAGE is still ~A4-sized
// (595 pt on the long side), but the picture inside keeps its real pixels
// (up to 3000 px), so it stays sharp when zoomed or printed.
// PNG (screenshots, documents) stays PNG = lossless; photos use high-quality JPEG.
// Drawing through a canvas also applies the phone's photo rotation (EXIF).
const PDF_PAGE_MAX_PT = 595;
const A4: [number, number] = [595.28, 841.89];
const A4_MARGIN = 24;

// Output clarity choices (Images → PDF / JPG → PDF)
type PdfQuality = "standard" | "high" | "max";
const PDF_QUALITY: Record<PdfQuality, { maxPx: number; jpeg: number; keepPng: boolean; label: string; hint: string }> = {
  standard: { maxPx: 1600, jpeg: 0.85, keepPng: false, label: "Standard", hint: "Smaller file — good for WhatsApp and email" },
  high: { maxPx: 3000, jpeg: 0.95, keepPng: true, label: "High", hint: "Recommended — sharp text, normal size" },
  max: { maxPx: 6000, jpeg: 0.98, keepPng: true, label: "Maximum", hint: "Original sharpness — best for printing, bigger file" },
};
type PdfPage = "fit" | "a4";

async function imagesToPdf(files: File[], PDFLib: any, quality: PdfQuality = "high", pageMode: PdfPage = "fit") {
  const q = PDF_QUALITY[quality];
  const pdf = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const img = await fileToImage(file);

    // Pixels kept in the PDF (capped by the chosen quality so huge camera photos don't freeze the browser)
    const pxScale = Math.min(1, q.maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * pxScale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * pxScale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const isPng = q.keepPng && (file.type === "image/png" || /\.png$/i.test(file.name));
    const mime = isPng ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Could not prepare image")), mime, isPng ? undefined : q.jpeg));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const embedded = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

    if (pageMode === "a4") {
      // A4 page (portrait for tall images, landscape for wide ones), image centred with a margin
      const [pw, ph] = canvas.width > canvas.height ? [A4[1], A4[0]] : A4;
      const fit = Math.min((pw - A4_MARGIN * 2) / canvas.width, (ph - A4_MARGIN * 2) / canvas.height);
      const w = canvas.width * fit;
      const h = canvas.height * fit;
      const page = pdf.addPage([pw, ph]);
      page.drawImage(embedded, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    } else {
      // Page the same shape as the image (~A4 on the long side)
      const ptScale = PDF_PAGE_MAX_PT / Math.max(canvas.width, canvas.height);
      const width = Math.max(1, canvas.width * ptScale);
      const height = Math.max(1, canvas.height * ptScale);
      const page = pdf.addPage([width, height]);
      page.drawImage(embedded, { x: 0, y: 0, width, height });
    }
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

// ── Accepted input files per tool ─────────────────────────────
type FileKind = "jpgpng" | "jpg" | "png" | "webp" | "images" | "pdf" | "txt" | "csv" | "json" | "xml" | "excel";

const FILE_KINDS: Record<FileKind, { accept: string; exts: string[]; label: string }> = {
  jpgpng: { accept: ".jpg,.jpeg,.png,image/jpeg,image/png", exts: ["jpg", "jpeg", "png"], label: "JPG or PNG images" },
  jpg: { accept: ".jpg,.jpeg,image/jpeg", exts: ["jpg", "jpeg"], label: "a JPG image" },
  png: { accept: ".png,image/png", exts: ["png"], label: "a PNG image" },
  webp: { accept: ".webp,image/webp", exts: ["webp"], label: "a WEBP image" },
  images: { accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp", exts: ["jpg", "jpeg", "png", "webp"], label: "JPG, PNG or WEBP images" },
  pdf: { accept: ".pdf,application/pdf", exts: ["pdf"], label: "a PDF file" },
  txt: { accept: ".txt,text/plain", exts: ["txt"], label: "a TXT file" },
  csv: { accept: ".csv,text/csv", exts: ["csv"], label: "a CSV file" },
  json: { accept: ".json,application/json", exts: ["json"], label: "a JSON file" },
  xml: { accept: ".xml,text/xml,application/xml", exts: ["xml"], label: "an XML file" },
  excel: { accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel", exts: ["xlsx", "xls"], label: "an Excel file (XLSX/XLS)" },
};

/** Input file type for a tool — the part before "-to-", or the tool itself. */
function fileKindFor(slug: string): FileKind {
  const fixed: Record<string, FileKind> = {
    "jpg-to-pdf": "jpgpng", // PDF builder embeds JPG and PNG
    "images-to-pdf": "jpgpng",
    "image-merger": "images",
    "image-compressor": "images",
    "image-resizer": "images",
    "merge-pdf": "pdf",
    "split-pdf": "pdf",
    "rotate-pdf": "pdf",
    "extract-pdf-pages": "pdf",
    "json-formatter": "json",
  };
  if (fixed[slug]) return fixed[slug];
  const from = slug.includes("-to-") ? slug.split("-to-")[0] : slug;
  if (from === "jpg" || from === "jpeg") return "jpg";
  if (from === "png") return "png";
  if (from === "webp") return "webp";
  if (from === "pdf") return "pdf";
  if (from === "txt") return "txt";
  if (from === "csv") return "csv";
  if (from === "json") return "json";
  if (from === "xml") return "xml";
  if (from === "excel") return "excel";
  return "images";
}

function matchesKind(file: File, kind: FileKind): boolean {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return FILE_KINDS[kind].exts.includes(ext);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function iconBtn(disabled: boolean): CSSProperties {
  return {
    width: 34, height: 34, flexShrink: 0, borderRadius: 8, border: "1px solid #d6dfdc", background: "#fff",
    color: "#0c1730", fontWeight: 800, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1,
  };
}

function choiceBtn(on: boolean): CSSProperties {
  return {
    border: `2px solid ${on ? "#005744" : "#d6dfdc"}`, background: on ? "#e8f3ef" : "#fff", color: "#0c1730",
    borderRadius: 10, padding: "7px 14px", fontWeight: 800, cursor: "pointer",
  };
}

export default function ConverterClient({ slug, input, output }: { slug: string; input: string; output: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [quality, setQuality] = useState(82);
  const [text, setText] = useState("");
  // Images → PDF: one PDF with all pages, or a separate PDF for each image
  const [pdfMode, setPdfMode] = useState<"single" | "separate">("single");
  const [pdfQuality, setPdfQuality] = useState<PdfQuality>("high");
  const [pdfPage, setPdfPage] = useState<PdfPage>("fit");

  // Which files the picker shows, based on what the tool takes IN (not what it makes).
  // e.g. "jpg-to-pdf" takes images — before, it matched "pdf" and only showed PDFs.
  const inputKind = useMemo(() => fileKindFor(slug), [slug]);
  const accept = FILE_KINDS[inputKind].accept;

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
          if (pdfMode === "separate" && files.length > 1) {
            // One PDF per image, named after the image (e.g. passport.jpg → passport.pdf).
            // Downloaded one after another — the browser may ask once to allow multiple downloads.
            const used = new Set<string>();
            for (const f of files) {
              const base = (f.name.replace(/\.[^.]+$/, "") || "image").slice(0, 80);
              let name = `${base}.pdf`;
              for (let n = 2; used.has(name); n++) name = `${base} (${n}).pdf`;
              used.add(name);
              downloadBytes(await imagesToPdf([f], PDFLib, pdfQuality, pdfPage), name, "application/pdf");
              await new Promise((r) => setTimeout(r, 400));
            }
          } else {
            downloadBytes(await imagesToPdf(files, PDFLib, pdfQuality, pdfPage), "images.pdf", "application/pdf");
          }
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
  const isImagePdf = slug === "images-to-pdf" || slug === "jpg-to-pdf";
  const inputId = `converter-input-${slug}`;

  // Small previews of the chosen images (revoked when the list changes)
  const thumbs = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files],
  );
  useEffect(() => () => thumbs.forEach((u) => u && URL.revokeObjectURL(u)), [thumbs]);

  function moveFile(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  const multi = ["image-merger", "images-to-pdf", "jpg-to-pdf", "merge-pdf"].includes(slug);

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        {needsText && <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste text here…" rows={7} style={{ width: "100%", border: "1px solid #cbd8d3", borderRadius: 12, padding: 12, font: "inherit" }} />}
        {/* File picker — our own button + list, so files can be removed, re-ordered and added */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: 14, border: "2px dashed #b9cfc7", borderRadius: 14, background: "#fff" }}>
          <label
            htmlFor={inputId}
            style={{ background: "#005744", color: "#fff", fontWeight: 800, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}
          >
            {files.length ? (multi ? "＋ Add more" : "Change file") : multi ? "Choose files" : "Choose file"}
          </label>
          <span style={{ color: "#52615e", fontSize: 14 }}>
            {files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "No file chosen"}
          </span>
          {files.length > 0 && (
            <button
              type="button"
              onClick={() => { setFiles([]); setMessage(""); }}
              style={{ marginLeft: "auto", border: 0, background: "transparent", color: "#b42318", fontWeight: 700, cursor: "pointer" }}
            >
              Clear all
            </button>
          )}
          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple={multi}
            style={{ display: "none" }}
            onChange={(e) => {
              const chosen = Array.from(e.target.files || []);
              e.currentTarget.value = ""; // lets the same file be picked again
              const good = chosen.filter((f) => matchesKind(f, inputKind));
              const wrong = chosen.filter((f) => !matchesKind(f, inputKind));
              setMessage(wrong.length ? `"${wrong[0].name}" can't be used here. Please choose ${FILE_KINDS[inputKind].label}.` : "");
              if (!good.length) return;
              if (!multi) { setFiles(good.slice(0, 1)); return; }
              setFiles((prev) => {
                const key = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
                const seen = new Set(prev.map(key));
                return [...prev, ...good.filter((f) => !seen.has(key(f)))];
              });
            }}
          />
        </div>
        <small style={{ color: "#52615e", marginTop: -8 }}>
          Accepted: {FILE_KINDS[inputKind].exts.map((x) => x.toUpperCase()).join(", ")}{multi ? " · you can select several files" : ""}
        </small>

        {files.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {files.map((f, i) => (
              <div
                key={`${f.name}-${f.size}-${f.lastModified}`}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 12, background: "#fff", border: "1px solid #dfe8e4" }}
              >
                {thumbs[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbs[i]!} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, background: "#eef2f1", flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: 8, background: "#eef2f1", flexShrink: 0 }}>📄</span>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1730", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {multi && files.length > 1 ? `${i + 1}. ` : ""}{f.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#65716f" }}>{formatSize(f.size)}</div>
                </div>
                {multi && files.length > 1 && (
                  <>
                    <button type="button" title="Move up" disabled={i === 0} onClick={() => moveFile(i, -1)} style={iconBtn(i === 0)}>↑</button>
                    <button type="button" title="Move down" disabled={i === files.length - 1} onClick={() => moveFile(i, 1)} style={iconBtn(i === files.length - 1)}>↓</button>
                  </>
                )}
                <button
                  type="button"
                  title="Remove"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  style={{ ...iconBtn(false), color: "#b42318", borderColor: "#f3c4bf" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Output clarity + page size (Images → PDF / JPG → PDF) */}
        {isImagePdf && files.length > 0 && (
          <div style={{ display: "grid", gap: 10, padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #dfe8e4" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0c1730", marginBottom: 6 }}>🔍 Output clarity</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(Object.keys(PDF_QUALITY) as PdfQuality[]).map((k) => (
                  <button key={k} type="button" onClick={() => setPdfQuality(k)} style={choiceBtn(pdfQuality === k)}>
                    {PDF_QUALITY[k].label}
                  </button>
                ))}
              </div>
              <small style={{ color: "#52615e" }}>{PDF_QUALITY[pdfQuality].hint}</small>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0c1730", marginBottom: 6 }}>📐 Page size</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setPdfPage("fit")} style={choiceBtn(pdfPage === "fit")}>Fit to image</button>
                <button type="button" onClick={() => setPdfPage("a4")} style={choiceBtn(pdfPage === "a4")}>A4 (with margin)</button>
              </div>
              <small style={{ color: "#52615e" }}>
                {pdfPage === "a4" ? "Every page is A4 — best for offices, printing and online forms." : "Each page takes the shape of its image — no white borders."}
              </small>
            </div>
          </div>
        )}

        {(slug === "images-to-pdf" || slug === "jpg-to-pdf") && files.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-label="PDF output">
            {([
              ["single", `📄 One PDF (${files.length} pages)`],
              ["separate", `📑 ${files.length} separate PDFs`],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={pdfMode === val}
                onClick={() => setPdfMode(val)}
                style={{
                  border: `2px solid ${pdfMode === val ? "#005744" : "#d6dfdc"}`,
                  background: pdfMode === val ? "#e8f3ef" : "#fff",
                  color: "#0c1730",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
            {pdfMode === "separate" && (
              <small style={{ color: "#52615e", width: "100%" }}>
                Each image becomes its own PDF with the same name. If your browser asks, tap “Allow” for multiple downloads.
              </small>
            )}
          </div>
        )}
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
