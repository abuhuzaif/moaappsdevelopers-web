"use client";

import { useState } from "react";

declare global { interface Window { PDFLib?: any; } }

const PDF_LIB_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";

type MergeItem = { file: File; pageCount: number | null; rotate: number /* extra turn chosen by the user: 0 | 90 | 180 | 270 */ };

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

/** Puts every page (in order, top to bottom) on ONE A4 portrait sheet, e.g. both sides of a passport or ID.
 *  `angle` = clockwise turn to show the page upright (its own /Rotate + the user's ⟳ choice). */
async function onePage(PDFLib: any, parts: { page: any; angle: number }[]) {
  const out = await PDFLib.PDFDocument.create();
  const A4W = 595.28, A4H = 841.89, M = 28, GAP = 18;
  const sheet = out.addPage([A4W, A4H]);
  const boxes = [];
  for (const { page, angle } of parts) {
    const cb = page.getCropBox();
    const emb = await out.embedPage(page, { left: cb.x, bottom: cb.y, right: cb.x + cb.width, top: cb.y + cb.height });
    const turned = angle === 90 || angle === 270;
    boxes.push({ emb, angle, w: turned ? cb.height : cb.width, h: turned ? cb.width : cb.height, cw: cb.width, ch: cb.height });
  }
  // same width for all, then shrink everything if the stack is taller than the sheet
  const availW = A4W - 2 * M, availH = A4H - 2 * M - GAP * (boxes.length - 1);
  let k = 1;
  const total = boxes.reduce((sum, b) => sum + (b.h * availW) / b.w, 0);
  if (total > availH) k = availH / total;
  let top = A4H - M;
  for (const b of boxes) {
    const s = (availW / b.w) * k;          // scale for this page
    const bw = b.w * s, bh = b.h * s;      // its box on the sheet
    const bx = (A4W - bw) / 2, by = top - bh;
    const ew = b.cw * s, eh = b.ch * s;    // un-turned size
    // pdf-lib turns counter-clockwise around (x, y): pick the corner so the turned page lands in its box
    const at =
      b.angle === 90 ? { x: bx, y: by + ew } :
      b.angle === 180 ? { x: bx + ew, y: by + eh } :
      b.angle === 270 ? { x: bx + eh, y: by } :
      { x: bx, y: by };
    sheet.drawPage(b.emb, { ...at, width: ew, height: eh, rotate: PDFLib.degrees(-b.angle) });
    top = by - GAP;
  }
  return out;
}

export default function MergePdfClient() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [layout, setLayout] = useState<"pages" | "one">("pages"); // pages = normal merge, one = everything on a single A4 page

  const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

  /** Adds one or many PDFs (file picker with several selected, or drag & drop). */
  async function addFiles(list: File[]) {
    if (!list.length) return;
    const pdfs = list.filter(isPdf);
    const notPdf = list.length - pdfs.length;
    if (!pdfs.length) {
      setMessage("Please choose PDF files only.");
      return;
    }
    setAdding(true);
    setMessage("");
    let duplicates = 0;
    let unreadable = 0;
    const added: MergeItem[] = [];
    try {
      const PDFLib = await loadPdfLib();
      for (const file of pdfs) {
        if (items.some((it) => sameFile(it.file, file)) || added.some((it) => sameFile(it.file, file))) {
          duplicates++;
          continue;
        }
        try {
          const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
          added.push({ file, pageCount: pdf.getPageCount(), rotate: 0 });
        } catch {
          unreadable++;
        }
      }
      setItems((current) => [...current, ...added.filter((a) => !current.some((c) => sameFile(c.file, a.file)))]);
      const notes: string[] = [];
      if (added.length) notes.push(`${added.length} PDF${added.length === 1 ? "" : "s"} added`);
      if (duplicates) notes.push(`${duplicates} already in the list`);
      if (unreadable) notes.push(`${unreadable} could not be read`);
      if (notPdf) notes.push(`${notPdf} non-PDF file${notPdf === 1 ? "" : "s"} skipped`);
      setMessage(notes.length && (duplicates || unreadable || notPdf) ? notes.join(" • ") : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read these PDFs.");
    } finally {
      setAdding(false);
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

  function turn(index: number, by: 90 | -90) {
    setItems((current) => current.map((it, i) => (i === index ? { ...it, rotate: (((it.rotate + by) % 360) + 360) % 360 } : it)));
  }

  function remove(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
    setMessage("");
  }

  async function run() {
    const totalPagesNow = items.reduce((sum, it) => sum + (it.pageCount || 0), 0);
    if (layout === "pages" ? items.length < 2 : totalPagesNow < 2) {
      setMessage(layout === "pages" ? "Add at least two PDF files to merge." : "Add PDFs with at least two pages in total.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const PDFLib = await loadPdfLib();
      if (layout === "one") {
        const parts: { page: any; angle: number }[] = [];
        for (const item of items) {
          const src = await PDFLib.PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true });
          for (const page of src.getPages()) {
            const own = Number(page.getRotation?.().angle ?? 0) || 0;
            parts.push({ page, angle: (((own + item.rotate) % 360) + 360) % 360 });
          }
        }
        const sheet = await onePage(PDFLib, parts);
        download(await sheet.save());
        setMessage(`Done — ${parts.length} pages placed on one A4 page, top to bottom in the order shown above.`);
        return;
      }
      const out = await PDFLib.PDFDocument.create();
      for (const item of items) {
        const src = await PDFLib.PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true });
        const srcPages = src.getPages();
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((page: any, i: number) => {
          // Keep each page the way it looks in the original. Phone scanners often store a page
          // sideways and turn it with /Rotate (sometimes set on the parent page tree); write the
          // effective angle onto the page itself so it can't be lost, plus any turn the user chose.
          const own = Number(srcPages[i]?.getRotation?.().angle ?? 0) || 0;
          const angle = (((own + item.rotate) % 360) + 360) % 360;
          page.setRotation(PDFLib.degrees(angle));
          out.addPage(page);
        });
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
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); void addFiles(Array.from(e.dataTransfer.files || [])); }}
          style={{
            display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", padding: 18, borderRadius: 14,
            border: `2px dashed ${dragging ? "#005744" : "#9bbab1"}`, background: dragging ? "#eaf6f1" : "#fbfaf7",
          }}
        >
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 12, padding: "12px 20px", background: "#005744", color: "#fff", fontWeight: 800, cursor: adding ? "wait" : "pointer" }}>
            {adding ? "Reading PDFs…" : items.length ? "+ Add more PDFs" : "+ Choose PDF files"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              hidden
              disabled={adding}
              onChange={(e) => { void addFiles(Array.from(e.target.files || [])); e.currentTarget.value = ""; }}
            />
          </label>
          <span style={{ color: "#52615e", fontSize: 13 }}>
            Select <strong>several PDFs at once</strong> (hold Ctrl or Shift), or drag &amp; drop them here. Then arrange the order with ↑ ↓.
          </span>
        </div>

        {items.length > 0 && <div style={{ display: "grid", gap: 8 }}>
          {items.map((item, index) => (
            <div key={`${item.file.name}-${item.file.lastModified}-${index}`} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto auto auto auto auto auto", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 12, border: "1px solid #d9e6e0", background: "#fff" }}>
              <strong style={{ color: "#005744" }}>{index + 1}</strong>
              <div style={{ minWidth: 0 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800 }}>{item.file.name}</div>
                <div style={{ color: "#65716f", fontSize: 12 }}>{item.pageCount === null ? "Reading pages…" : `${item.pageCount} page${item.pageCount === 1 ? "" : "s"}`} • {(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move PDF up" style={{ padding: "7px 9px" }}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move PDF down" style={{ padding: "7px 9px" }}>↓</button>
              <button type="button" onClick={() => turn(index, -90)} title="Rotate left" aria-label="Rotate this PDF left" style={{ padding: "7px 9px" }}>⟲</button>
              <button type="button" onClick={() => turn(index, 90)} title="Rotate right" aria-label="Rotate this PDF right" style={{ padding: "7px 9px" }}>⟳{item.rotate ? ` ${item.rotate}°` : ""}</button>
              <button type="button" onClick={() => remove(index)} aria-label={`Remove ${item.file.name}`} style={{ padding: "7px 9px" }}>Remove</button>
              <span style={{ color: "#65716f", fontSize: 12 }} className="mp-src">Source unchanged</span>
            </div>
          ))}
        </div>}

        {items.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-label="Output layout">
            {([
              ["pages", "📄 Separate pages", "Normal merge — every page stays its own page"],
              ["one", "🪪 All on one page", "Stack everything on a single A4 page (ID / passport front + back)"],
            ] as const).map(([v, label, hint]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={layout === v}
                onClick={() => setLayout(v)}
                style={{
                  flex: "1 1 220px", textAlign: "left", padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${layout === v ? "#005744" : "#d9e6e0"}`, background: layout === v ? "#eaf6f1" : "#fff",
                }}
              >
                <strong style={{ display: "block", color: "#102027" }}>{label}</strong>
                <span style={{ fontSize: 12, color: "#65716f" }}>{hint}</span>
              </button>
            ))}
          </div>
        )}
        {layout === "one" && items.reduce((n, it) => n + (it.pageCount || 0), 0) > 4 && (
          <p style={{ margin: 0, color: "#9a4d00", fontSize: 12, fontWeight: 700 }}>More than 4 pages on one sheet will be small — best for 2–4 pages.</p>
        )}

        <button type="button" onClick={run} disabled={busy || (layout === "pages" ? items.length < 2 : items.reduce((n, it) => n + (it.pageCount || 0), 0) < 2)} style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || !items.length ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !items.length ? "not-allowed" : "pointer" }}>
          {busy ? "Merging…" : layout === "one" ? "Combine on One Page" : `Merge ${items.length || "PDF"} Files`}
        </button>
        {message && <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>{message}</p>}
        <p style={{ margin: 0, color: "#65716f", fontSize: 12 }}>Safety: your original PDFs are read-only. Removing or reordering an item only changes this merge list; the original files are never edited, deleted, or overwritten. The merged PDF is always downloaded as a new file.</p>
      </div>
    </div>
  );
}
