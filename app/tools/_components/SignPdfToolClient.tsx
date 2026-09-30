"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: any;
    PDFLib?: any;
  }
}

type Mode = "upload" | "draw" | "type";
type Placement = { x: number; y: number; width: number; height: number };

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFLIB = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const old = document.getElementById(id) as HTMLScriptElement | null;
    if (old) {
      if (old.dataset.loaded === "true") return resolve();
      old.addEventListener("load", () => resolve(), { once: true });
      old.addEventListener("error", () => reject(new Error(`Could not load ${id}.`)), { once: true });
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

function typedSignature(text: string) {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 260;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#111827";
  ctx.font = "italic 92px cursive";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 35, 130);
  return c.toDataURL("image/png");
}

async function imageSignature(file: File, removeWhite: boolean) {
  const bitmap = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = bitmap.width; c.height = bitmap.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  if (removeWhite) {
    const pixels = ctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 238 && Math.max(r, g, b) - Math.min(r, g, b) < 18) pixels.data[i + 3] = 0;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  return { src: c.toDataURL("image/png"), width: c.width, height: c.height };
}

export default function SignPdfToolClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const resizeRef = useRef<{ x: number; width: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [base, setBase] = useState({ width: 0, height: 0 });
  const [signature, setSignature] = useState<string | null>(null);
  const [sigSize, setSigSize] = useState({ width: 500, height: 150 });
  const [placement, setPlacement] = useState<Placement>({ x: 80, y: 100, width: 220, height: 70 });
  const [mode, setMode] = useState<Mode>("upload");
  const [typed, setTyped] = useState("");
  const [removeWhite, setRemoveWhite] = useState(true);
  const [drawn, setDrawn] = useState(false);
  const [apply, setApply] = useState<"current" | "all" | "custom">("current");
  const [custom, setCustom] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([loadScript(PDFJS, "myska-pdfjs"), loadScript(PDFLIB, "myska-pdflib")])
      .then(() => {
        if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        if (active) setReady(true);
      })
      .catch((e) => active && setMessage(e instanceof Error ? e.message : "PDF engine could not load."));
    return () => { active = false; };
  }, []);

  const render = useCallback(async (data: ArrayBuffer, number: number) => {
    if (!window.pdfjsLib || !canvasRef.current) return;
    setLoading(true); setMessage("");
    try {
      const pdf = await window.pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      const p = await pdf.getPage(number);
      const unscaled = p.getViewport({ scale: 1 });
      const available = Math.max(360, Math.min(860, (pageRef.current?.parentElement?.clientWidth || 760) - 20));
      const viewport = p.getViewport({ scale: Math.min(1.5, available / unscaled.width) });
      const canvas = canvasRef.current;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await p.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      setBase({ width: unscaled.width, height: unscaled.height });
      setPages(pdf.numPages);
    } catch (e) {
      setPages(0);
      setMessage(e instanceof Error ? e.message : "This PDF could not be opened.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (bytes && ready) void render(bytes, page); }, [bytes, ready, page, render]);

  async function choosePdf(selected: File | null) {
    if (!selected) return;
    setMessage("");
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) { setMessage("Please choose a PDF file."); return; }
    if (selected.size > 25 * 1024 * 1024) { setMessage("Please keep the PDF under 25 MB."); return; }
    try {
      const data = await selected.arrayBuffer();
      setFile(selected); setBytes(data); setPage(1); setPages(0); setSignature(null);
      setPlacement({ x: 80, y: 100, width: 220, height: 70 });
      setMessage(ready ? "Opening PDF…" : "PDF selected. Loading PDF engine…");
    } catch { setMessage("Could not read the selected PDF."); }
  }

  async function chooseSignature(selected: File | null) {
    if (!selected) return;
    try {
      const result = await imageSignature(selected, removeWhite);
      const ratio = result.height / Math.max(1, result.width);
      setSignature(result.src); setSigSize({ width: result.width, height: result.height });
      setPlacement((p) => ({ ...p, width: 220, height: Math.max(45, 220 * ratio) }));
      setMessage("");
    } catch { setMessage("Could not read the signature image. Please use PNG or JPG."); }
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = drawRef.current; if (!c) return;
    c.setPointerCapture(e.pointerId);
    const r = c.getBoundingClientRect(); const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "#111827"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); setDrawn(true);
  }
  function drawMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawn) return; const c = drawRef.current; if (!c) return;
    const r = c.getBoundingClientRect(); const ctx = c.getContext("2d")!;
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke();
  }
  function finishDraw() {
    if (!drawn || !drawRef.current) return;
    setDrawn(false); setSignature(drawRef.current.toDataURL("image/png")); setSigSize({ width: 560, height: 220 });
    setPlacement((p) => ({ ...p, width: 220, height: 75 }));
  }
  function clearDraw() { const c = drawRef.current; c?.getContext("2d")?.clearRect(0, 0, c.width, c.height); setSignature(null); setDrawn(false); }

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.resize) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: placement.x, y: placement.y, px: e.clientX, py: e.clientY };
  }
  function dragMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current; const wrap = pageRef.current; if (!d || !wrap) return;
    const maxX = Math.max(0, wrap.clientWidth - placement.width); const maxY = Math.max(0, wrap.clientHeight - placement.height);
    setPlacement((p) => ({ ...p, x: Math.min(maxX, Math.max(0, d.x + e.clientX - d.px)), y: Math.min(maxY, Math.max(0, d.y + e.clientY - d.py)) }));
  }
  function stopDrag() { dragRef.current = null; }
  function startResize(e: React.PointerEvent<HTMLDivElement>) { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); resizeRef.current = { x: e.clientX, width: placement.width }; }
  function resizeMove(e: React.PointerEvent<HTMLDivElement>) { const r = resizeRef.current; if (!r) return; const ratio = sigSize.height / Math.max(1, sigSize.width); const width = Math.max(60, r.width + e.clientX - r.x); setPlacement((p) => ({ ...p, width, height: Math.max(32, width * ratio) })); }
  function stopResize() { resizeRef.current = null; }

  async function download() {
    if (!bytes || !signature) { setMessage("Upload a PDF and add a signature first."); return; }
    if (!window.PDFLib) { setMessage("PDF engine is still loading. Please try again."); return; }
    setLoading(true); setMessage("Creating signed PDF…");
    try {
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0));
      const image = await pdf.embedPng(await fetch(signature).then((r) => r.arrayBuffer()));
      let targets: number[] = apply === "current" ? [page] : apply === "all" ? Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1) : [];
      if (apply === "custom") targets = custom.split(",").flatMap((part) => { const s = part.trim(); if (s.includes("-")) { const [a,b] = s.split("-").map(Number); return Number.isFinite(a) && Number.isFinite(b) ? Array.from({ length: Math.abs(b-a)+1 }, (_,i) => Math.min(a,b)+i) : []; } const n = Number(s); return Number.isFinite(n) ? [n] : []; }).filter((n) => n >= 1 && n <= pdf.getPageCount());
      targets = [...new Set(targets)]; if (!targets.length) throw new Error("Select at least one valid page.");
      const cw = canvasRef.current?.clientWidth || 1, ch = canvasRef.current?.clientHeight || 1;
      const sx = base.width / cw, sy = base.height / ch;
      for (const n of targets) {
        const p = pdf.getPage(n - 1); const size = p.getSize();
        p.drawImage(image, { x: placement.x * sx * size.width / base.width, y: size.height - ((placement.y + placement.height) * sy * size.height / base.height), width: placement.width * sx * size.width / base.width, height: placement.height * sy * size.height / base.height });
      }
      const out = await pdf.save(); const url = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}-signed.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500); setMessage("Signed PDF created successfully.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create the signed PDF."); }
    finally { setLoading(false); }
  }

  const css = `.sp{color:#102027}.sp *{box-sizing:border-box}.card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px rgba(6,38,31,.07)}.btn{border:0;border-radius:10px;padding:12px 16px;font-weight:800;cursor:pointer}.primary{background:#005744;color:#fff}.gold{background:#f6b91f;color:#13221e}.drop{border:2px dashed #b9d1c8;background:#f7fbf9;border-radius:16px;padding:30px;text-align:center}.muted{color:#65736e;font-size:13px;line-height:1.6}.grid{display:grid;grid-template-columns:150px minmax(0,1fr) 300px;gap:14px}.page{position:relative;display:inline-block;background:#fff;line-height:0;box-shadow:0 12px 30px #0002;max-width:100%}.page canvas{display:block;max-width:100%;height:auto}.sig{position:absolute;border:1.5px dashed #005744;cursor:move;touch-action:none}.sig img{width:100%;height:100%;object-fit:contain;pointer-events:none}.handle{position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;border-radius:50%;background:#f6b91f;border:2px solid #fff;cursor:nwse-resize}.tab{flex:1;border:0;background:transparent;padding:10px;font-weight:800;cursor:pointer;color:#65736e}.tab.active{background:#fff;color:#005744;border-radius:9px}.input{width:100%;border:1px solid #cbd8d3;border-radius:10px;padding:11px}.message{margin-top:10px;padding:10px;border-radius:10px;background:#fff8df;color:#665300;font-size:13px}.draw{width:100%;height:150px;border:1px solid #cbd8d3;border-radius:10px;touch-action:none}@media(max-width:980px){.grid{grid-template-columns:1fr}}`;

  if (!file || !pages) return <div className="sp"><style>{css}</style><div className="card" style={{ padding: 26 }}><div className="drop"><div style={{ fontSize: 42 }}>✍️</div><h2>Upload your PDF</h2><p className="muted">Choose a PDF, preview its pages, then add and position your signature.</p><input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { void choosePdf(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} /><button type="button" className="btn primary" onClick={() => inputRef.current?.click()}>Choose PDF</button><p className="muted">PDF only • Up to 25 MB • Processing stays in your browser</p></div>{!ready && <div className="message">Loading PDF editor…</div>}{message && <div className="message">{message}</div>}</div></div>;

  return <div className="sp"><style>{css}</style><div className="card" style={{ padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}><div><strong>{file.name}</strong><div className="muted">{pages} pages • Page {page}</div></div><button type="button" className="btn" onClick={() => inputRef.current?.click()}>Replace PDF</button><input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { void choosePdf(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} /></div><div className="grid"><aside className="card" style={{ padding: 10 }}>{Array.from({ length: pages }, (_, i) => <button type="button" key={i} className="btn" style={{ width: "100%", marginBottom: 8, background: page === i + 1 ? "#eef8f4" : "#f8faf9" }} onClick={() => setPage(i + 1)}>Page {i + 1}</button>)}</aside><section className="card" style={{ padding: 14, background: "#eef2f0" }}><strong>PDF Preview</strong><div style={{ minHeight: 520, display: "flex", justifyContent: "center", overflow: "auto", padding: 10 }}><div className="page" ref={pageRef}><canvas ref={canvasRef} />{signature && <div className="sig" style={{ left: placement.x, top: placement.y, width: placement.width, height: placement.height }} onPointerDown={startDrag} onPointerMove={dragMove} onPointerUp={stopDrag}><img src={signature} alt="Signature" /><div className="handle" data-resize="true" onPointerDown={startResize} onPointerMove={resizeMove} onPointerUp={stopResize} /></div>}</div></div>{loading && <div className="muted" style={{ textAlign: "center" }}>Processing…</div>}</section><aside className="card" style={{ padding: 16 }}><div style={{ display: "flex", background: "#eef2f0", borderRadius: 10 }}>{(["upload","draw","type"] as Mode[]).map((m) => <button type="button" key={m} className={`tab ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>{m[0].toUpperCase() + m.slice(1)}</button>)}</div>{mode === "upload" && <div style={{ marginTop: 16 }}><button type="button" className="drop" style={{ width: "100%", cursor: "pointer" }} onClick={() => { const el = document.getElementById("sign-image-input") as HTMLInputElement | null; el?.click(); }}>Upload PNG / JPG</button><input id="sign-image-input" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden onChange={(e) => { void chooseSignature(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} /><label className="muted"><input type="checkbox" checked={removeWhite} onChange={(e) => setRemoveWhite(e.target.checked)} /> Remove white background</label></div>}{mode === "draw" && <div style={{ marginTop: 16 }}><canvas ref={drawRef} className="draw" width={560} height={220} onPointerDown={startDraw} onPointerMove={drawMove} onPointerUp={finishDraw} onPointerCancel={finishDraw} /><button type="button" className="btn" onClick={clearDraw}>Clear</button></div>}{mode === "type" && <div style={{ marginTop: 16 }}><input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Your name" /><button type="button" className="btn primary" style={{ width: "100%", marginTop: 9 }} onClick={() => { if (!typed.trim()) return setMessage("Enter your name first."); setSignature(typedSignature(typed.trim())); setSigSize({ width: 900, height: 260 }); setPlacement((p) => ({ ...p, width: 240, height: 70 })); }}>Use Signature</button></div>}<div style={{ marginTop: 18 }}><strong>Apply to</strong><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>{(["current","all","custom"] as const).map((m) => <button type="button" key={m} className="btn" style={{ background: apply === m ? "#eef8f4" : "#fff", border: "1px solid #cbd8d3" }} onClick={() => setApply(m)}>{m === "current" ? `Current (${page})` : m === "all" ? `All (${pages})` : "Custom"}</button>)}</div>{apply === "custom" && <input className="input" style={{ marginTop: 8 }} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="1,3,5-7" />}</div><div style={{ marginTop: 16, padding: 10, background: "#eef8f4", borderRadius: 10, fontSize: 12 }}>🔒 PDF and signature are processed in your browser.</div><button type="button" className="btn gold" style={{ width: "100%", marginTop: 12 }} disabled={!signature || loading} onClick={() => void download()}>{loading ? "Creating PDF…" : "Download Signed PDF"}</button>{message && <div className="message">{message}</div>}</aside></div></div>;
}
