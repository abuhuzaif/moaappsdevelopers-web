"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: any;
    PDFLib?: any;
  }
}

type Placement = { x: number; y: number; width: number; height: number };
type Mode = "upload" | "draw" | "type";

const PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFLIB_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Could not load ${id}.`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error(`Could not load ${id}.`));
    document.head.appendChild(script);
  });
}

function makeTypedSignature(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 260;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111827";
  ctx.font = "italic 92px cursive";
  ctx.textBaseline = "middle";
  ctx.fillText(text || "Signature", 35, 130);
  return canvas.toDataURL("image/png");
}

async function makeTransparentSignature(file: File, removeWhite: boolean) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  if (removeWhite) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i];
      const g = image.data[i + 1];
      const b = image.data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 238 && Math.max(r, g, b) - Math.min(r, g, b) < 18) image.data[i + 3] = 0;
      else if (brightness > 220) image.data[i + 3] = Math.round(image.data[i + 3] * Math.max(0, (255 - brightness) / 35));
    }
    ctx.putImageData(image, 0, 0);
  }
  return { dataUrl: canvas.toDataURL("image/png"), width: bitmap.width, height: bitmap.height };
}

export default function SignPdfToolClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageBaseSize, setPageBaseSize] = useState({ width: 0, height: 0 });
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureNatural, setSignatureNatural] = useState({ width: 420, height: 130 });
  const [placement, setPlacement] = useState<Placement>({ x: 80, y: 100, width: 220, height: 75 });
  const [mode, setMode] = useState<Mode>("upload");
  const [typed, setTyped] = useState("");
  const [drawn, setDrawn] = useState(false);
  const [removeWhite, setRemoveWhite] = useState(true);
  const [applyMode, setApplyMode] = useState<"current" | "all" | "custom">("current");
  const [customPages, setCustomPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageShellRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadScript(PDFJS_SRC, "myska-pdfjs"), loadScript(PDFLIB_SRC, "myska-pdflib")])
      .then(() => {
        if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        if (mounted) setReady(true);
      })
      .catch((error) => mounted && setMessage(error instanceof Error ? error.message : "PDF editor could not load."));
    return () => { mounted = false; };
  }, []);

  const renderPage = useCallback(async (bytes: ArrayBuffer, number: number) => {
    if (!window.pdfjsLib || !canvasRef.current) return;
    setLoadingPdf(true);
    try {
      const pdf = await window.pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const targetWidth = Math.min(860, Math.max(520, pageShellRef.current?.parentElement?.clientWidth ?? 760));
      const scale = Math.min(1.5, targetWidth / base.width);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      setPageBaseSize({ width: base.width, height: base.height });
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      setPageCount(pdf.numPages);
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  useEffect(() => {
    if (pdfBytes && ready) void renderPage(pdfBytes, pageNumber);
  }, [pdfBytes, ready, pageNumber, renderPage]);

  async function handlePdf(file: File | null) {
    setMessage("");
    setSignature(null);
    setPdfFile(file);
    if (!file) { setPdfBytes(null); setPageCount(0); return; }
    if (file.type !== "application/pdf") { setMessage("Please choose a PDF file."); return; }
    if (file.size > 25 * 1024 * 1024) { setMessage("Please keep the PDF under 25 MB."); return; }
    const bytes = await file.arrayBuffer();
    setPdfBytes(bytes);
    setPageNumber(1);
    setPlacement({ x: 80, y: 100, width: 220, height: 75 });
  }

  async function handleSignatureUpload(file: File | null) {
    if (!file) return;
    try {
      const result = await makeTransparentSignature(file, removeWhite);
      setSignature(result.dataUrl);
      setSignatureNatural({ width: result.width, height: result.height });
      const ratio = result.height / Math.max(1, result.width);
      const width = 220;
      setPlacement((p) => ({ ...p, width, height: Math.max(45, width * ratio) }));
      setMessage("");
    } catch {
      setMessage("Could not read the signature image. Please use PNG or JPG.");
    }
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = drawRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawn(true);
  }

  function drawMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawn) return;
    const canvas = drawRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function finishDraw() {
    if (!drawn || !drawRef.current) return;
    setDrawn(false);
    setSignature(drawRef.current.toDataURL("image/png"));
    setSignatureNatural({ width: drawRef.current.width, height: drawRef.current.height });
    setPlacement((p) => ({ ...p, width: 220, height: 75 }));
  }

  function clearDraw() {
    const canvas = drawRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    setDrawn(false);
  }

  function useTypedSignature() {
    const value = typed.trim();
    if (!value) return setMessage("Enter your name or signature text first.");
    setSignature(makeTypedSignature(value));
    setSignatureNatural({ width: 900, height: 260 });
    setPlacement((p) => ({ ...p, width: 240, height: 70 }));
    setMessage("");
  }

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.resize === "true") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, x: placement.x, y: placement.y };
  }

  function dragMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const wrap = pageShellRef.current;
    if (!drag || !wrap) return;
    const maxX = Math.max(0, wrap.clientWidth - placement.width);
    const maxY = Math.max(0, wrap.clientHeight - placement.height);
    setPlacement((p) => ({ ...p, x: Math.min(maxX, Math.max(0, drag.x + e.clientX - drag.startX)), y: Math.min(maxY, Math.max(0, drag.y + e.clientY - drag.startY)) }));
  }

  function stopDrag() { dragRef.current = null; }

  function startResize(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, width: placement.width, height: placement.height };
  }

  function resizeMove(e: React.PointerEvent<HTMLDivElement>) {
    const resize = resizeRef.current;
    if (!resize) return;
    const ratio = signatureNatural.height / Math.max(1, signatureNatural.width);
    const nextWidth = Math.max(60, resize.width + e.clientX - resize.startX);
    const nextHeight = Math.max(32, nextWidth * ratio);
    setPlacement((p) => ({ ...p, width: nextWidth, height: nextHeight }));
  }

  function stopResize() { resizeRef.current = null; }

  async function downloadSignedPdf() {
    if (!pdfBytes || !signature) return setMessage("Upload a PDF and add a signature first.");
    if (!window.PDFLib) return setMessage("PDF engine is still loading. Please try again in a moment.");
    setBusy(true);
    setMessage("");
    try {
      const { PDFDocument } = window.PDFLib;
      const pdf = await PDFDocument.load(pdfBytes.slice(0));
      const imageBytes = await fetch(signature).then((r) => r.arrayBuffer());
      const image = await pdf.embedPng(imageBytes);
      const targets = applyMode === "current"
        ? [pageNumber]
        : applyMode === "all"
          ? Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1)
          : customPages.split(",").flatMap((part) => {
              const trimmed = part.trim();
              if (!trimmed) return [];
              if (trimmed.includes("-")) {
                const [a, b] = trimmed.split("-").map(Number);
                if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
                const start = Math.min(a, b);
                const end = Math.max(a, b);
                return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
              }
              const n = Number(trimmed);
              return Number.isFinite(n) ? [n] : [];
            }).filter((n, i, arr) => n >= 1 && n <= pdf.getPageCount() && arr.indexOf(n) === i);
      if (!targets.length) throw new Error("Select at least one valid page.");

      const canvasWidth = canvasRef.current?.clientWidth || 1;
      const canvasHeight = canvasRef.current?.clientHeight || 1;
      const pageScaleX = pageBaseSize.width / canvasWidth;
      const pageScaleY = pageBaseSize.height / canvasHeight;
      const pdfX = placement.x * pageScaleX;
      const pdfWidth = placement.width * pageScaleX;
      const pdfHeight = placement.height * pageScaleY;
      const pdfY = pageBaseSize.height - ((placement.y + placement.height) * pageScaleY);

      for (const target of targets) {
        const page = pdf.getPage(target - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const ratioX = pageWidth / pageBaseSize.width;
        const ratioY = pageHeight / pageBaseSize.height;
        page.drawImage(image, { x: pdfX * ratioX, y: pdfY * ratioY, width: pdfWidth * ratioX, height: pdfHeight * ratioY });
      }

      const out = await pdf.save();
      const blob = new Blob([out], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdfFile?.name.replace(/\.pdf$/i, "") || "document"}-signed.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setMessage("Signed PDF created successfully. Your download should start automatically.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the signed PDF.");
    } finally {
      setBusy(false);
    }
  }

  const hasPdf = Boolean(pdfBytes && pageCount);

  return (
    <div className="sign-pdf-editor">
      <style>{`
        .sign-pdf-editor{color:#102027}.sign-pdf-editor *{box-sizing:border-box}.sp-card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px rgba(6,38,31,.07)}.sp-btn{border:0;border-radius:10px;padding:12px 16px;font-weight:800;cursor:pointer}.sp-btn:disabled{opacity:.5;cursor:not-allowed}.sp-primary{background:#005744;color:#fff}.sp-gold{background:#f6b91f;color:#13221e}.sp-tab{flex:1;border:0;background:transparent;padding:11px 8px;font-weight:800;color:#65716f;cursor:pointer}.sp-tab.active{background:#fff;color:#005744;box-shadow:0 2px 8px rgba(0,0,0,.07);border-radius:10px}.sp-input{width:100%;border:1px solid #cbd8d3;border-radius:10px;padding:11px 12px;background:#fff;color:#102027}.sp-editor-grid{display:grid;grid-template-columns:180px minmax(0,1fr) 300px;gap:16px}.sp-thumb{border:1px solid #d8e3df;background:#f8faf9;border-radius:10px;padding:6px;cursor:pointer}.sp-thumb.active{border:2px solid #005744;background:#eaf5f1}.sp-page-shell{position:relative;display:inline-block;max-width:100%;line-height:0;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,.15)}.sp-page-shell canvas{display:block;max-width:100%;height:auto}.sp-signature{position:absolute;border:1.5px dashed #005744;background:rgba(255,255,255,.05);touch-action:none;cursor:move;line-height:0}.sp-signature img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}.sp-resize{position:absolute;right:-7px;bottom:-7px;width:15px;height:15px;border-radius:50%;background:#f6b91f;border:2px solid #fff;cursor:nwse-resize}.sp-drop{border:2px dashed #b9d1c8;background:#f7fbf9;border-radius:16px;padding:30px;text-align:center}.sp-muted{color:#6b7774;font-size:13px;line-height:1.6}.sp-label{display:block;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;color:#52615d;margin-bottom:7px}.sp-scroll{max-height:620px;overflow:auto;padding:8px}.sp-draw{width:100%;height:150px;background:#fff;border:1px solid #cbd8d3;border-radius:10px;touch-action:none}.sp-privacy{padding:10px 12px;border-radius:10px;background:#eef8f4;color:#37645a;font-size:12px;line-height:1.5}.sp-message{margin-top:12px;padding:10px 12px;border-radius:10px;background:#fff8df;color:#6a5400;font-size:13px}.sp-radio-row{display:flex;gap:8px;flex-wrap:wrap}.sp-radio{border:1px solid #cbd8d3;background:#fff;border-radius:9px;padding:9px 11px;font-size:12px;font-weight:800;cursor:pointer}.sp-radio.active{border-color:#005744;background:#eef8f4;color:#005744}@media(max-width:980px){.sp-editor-grid{grid-template-columns:1fr}.sp-scroll{display:flex;gap:8px;max-height:none;overflow:auto}.sp-thumb{min-width:92px}.sp-thumb canvas{max-width:80px;height:auto}.sp-page-shell{width:100%}}@media(max-width:620px){.sp-editor-grid{gap:10px}.sp-card{border-radius:14px}.sp-page-shell canvas{width:100%}}
      `}</style>

      {!hasPdf ? (
        <div className="sp-card" style={{ padding: 26 }}>
          <div className="sp-drop">
            <div style={{ fontSize: 42, marginBottom: 8 }}>✍️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, color: "#102027" }}>Upload your PDF</h2>
            <p className="sp-muted" style={{ margin: "0 auto 18px", maxWidth: 560 }}>Choose a PDF, preview its pages, then upload or draw your signature and place it exactly where you need it.</p>
            <label className="sp-btn sp-primary" style={{ display: "inline-block" }}>
              Choose PDF
              <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => void handlePdf(e.target.files?.[0] ?? null)} />
            </label>
            <p className="sp-muted" style={{ margin: "14px 0 0" }}>PDF only • Up to 25 MB • Processing stays in your browser</p>
          </div>
          {!ready && <p className="sp-message">Loading the PDF editor…</p>}
          {message && <div className="sp-message">{message}</div>}
        </div>
      ) : (
        <>
          <div className="sp-card" style={{ padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div><strong>{pdfFile?.name}</strong><div className="sp-muted">{pageCount} page{pageCount === 1 ? "" : "s"} • Page {pageNumber}</div></div>
            <label className="sp-btn" style={{ background: "#eef8f4", color: "#005744" }}>Replace PDF<input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => void handlePdf(e.target.files?.[0] ?? null)} /></label>
          </div>

          <div className="sp-editor-grid">
            <aside className="sp-card sp-scroll">
              {Array.from({ length: pageCount }, (_, index) => (
                <button key={index} type="button" className={`sp-thumb ${pageNumber === index + 1 ? "active" : ""}`} onClick={() => setPageNumber(index + 1)} style={{ width: "100%", marginBottom: 8 }}>
                  <div style={{ background: "#fff", borderRadius: 5, overflow: "hidden", minHeight: 70, display: "grid", placeItems: "center" }}><span style={{ fontSize: 11, color: "#68736f" }}>Page {index + 1}</span></div>
                </button>
              ))}
            </aside>

            <section className="sp-card" style={{ padding: 14, background: "#eef2f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <strong>PDF Preview</strong>
                {loadingPdf && <span className="sp-muted">Rendering…</span>}
              </div>
              <div style={{ minHeight: 520, display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "auto", padding: 8 }}>
                <div className="sp-page-shell" ref={pageShellRef}>
                  <canvas ref={canvasRef} />
                  {signature && (
                    <div className="sp-signature" style={{ left: placement.x, top: placement.y, width: placement.width, height: placement.height }} onPointerDown={startDrag} onPointerMove={dragMove} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
                      <img src={signature} alt="Signature preview" />
                      <div className="sp-resize" data-resize="true" onPointerDown={startResize} onPointerMove={resizeMove} onPointerUp={stopResize} onPointerCancel={stopResize} />
                    </div>
                  )}
                </div>
              </div>
              <div className="sp-muted" style={{ textAlign: "center", marginTop: 7 }}>Drag the signature to move it. Use the gold handle to resize.</div>
            </section>

            <aside className="sp-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", background: "#eef2f0", borderRadius: 12, padding: 3, marginBottom: 14 }}>
                {(["upload", "draw", "type"] as Mode[]).map((item) => <button key={item} type="button" className={`sp-tab ${mode === item ? "active" : ""}`} onClick={() => setMode(item)}>{item === "upload" ? "Upload" : item === "draw" ? "Draw" : "Type"}</button>)}
              </div>

              {mode === "upload" && <>
                <label className="sp-label">Signature image</label>
                <label className="sp-drop" style={{ display: "block", padding: 18, cursor: "pointer" }}>
                  <strong>Upload PNG or JPG</strong><div className="sp-muted">Transparent PNG gives the cleanest result.</div>
                  <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" hidden onChange={(e) => void handleSignatureUpload(e.target.files?.[0] ?? null)} />
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontSize: 12, fontWeight: 700 }}><input type="checkbox" checked={removeWhite} onChange={(e) => setRemoveWhite(e.target.checked)} /> Remove white background</label>
              </>}

              {mode === "draw" && <>
                <label className="sp-label">Draw signature</label>
                <canvas ref={drawRef} className="sp-draw" width={560} height={220} onPointerDown={startDraw} onPointerMove={drawMove} onPointerUp={finishDraw} onPointerCancel={finishDraw} />
                <button type="button" className="sp-btn" style={{ marginTop: 9, background: "#edf1ef" }} onClick={clearDraw}>Clear</button>
              </>}

              {mode === "type" && <>
                <label className="sp-label">Type signature</label>
                <input className="sp-input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Your name" />
                <button type="button" className="sp-btn sp-primary" style={{ marginTop: 9, width: "100%" }} onClick={useTypedSignature}>Use Signature</button>
              </>}

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #e1e9e5" }}>
                <label className="sp-label">Apply signature to</label>
                <div className="sp-radio-row">
                  {(["current", "all", "custom"] as const).map((item) => <button key={item} type="button" className={`sp-radio ${applyMode === item ? "active" : ""}`} onClick={() => setApplyMode(item)}>{item === "current" ? `Current page (${pageNumber})` : item === "all" ? `All pages (${pageCount})` : "Custom"}</button>)}
                </div>
                {applyMode === "custom" && <input className="sp-input" style={{ marginTop: 9 }} value={customPages} onChange={(e) => setCustomPages(e.target.value)} placeholder="Example: 1,3,5-7" />}
              </div>

              <div className="sp-privacy" style={{ marginTop: 16 }}>🔒 Your PDF and signature are processed locally in this browser. They are not uploaded to our server.</div>
              <button type="button" className="sp-btn sp-gold" style={{ width: "100%", marginTop: 14 }} disabled={!signature || busy} onClick={() => void downloadSignedPdf()}>{busy ? "Creating PDF…" : "Download Signed PDF"}</button>
              {message && <div className="sp-message">{message}</div>}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
