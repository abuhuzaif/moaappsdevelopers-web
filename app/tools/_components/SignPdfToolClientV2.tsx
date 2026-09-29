"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { pdfjsLib?: any; PDFLib?: any; }
}

const PDF_SOURCES = [
  { src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" },
  { src: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js", worker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js" },
  { src: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js", worker: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js" },
];
const PDF_LIB = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
let activePdfWorker = PDF_SOURCES[0].worker;

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") return resolve();
    if (existing) existing.remove();
    const s = document.createElement("script");
    s.id = id; s.src = src; s.async = true;
    s.onload = () => { s.dataset.loaded = "true"; resolve(); };
    s.onerror = () => { s.remove(); reject(new Error("CDN load failed")); };
    document.head.appendChild(s);
  });
}

async function loadPdfEngine() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = activePdfWorker;
    return;
  }
  let last: unknown;
  for (const source of PDF_SOURCES) {
    try {
      await loadScript(source.src, "myska-pdfjs-v2");
      if (window.pdfjsLib) {
        activePdfWorker = source.worker;
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
        return;
      }
    } catch (e) { last = e; }
  }
  throw last instanceof Error ? last : new Error("PDF viewer engine could not be loaded. Please check your internet connection or browser extensions.");
}

async function loadPdfLib() {
  if (window.PDFLib) return;
  await loadScript(PDF_LIB, "myska-pdflib-v2");
}

export default function SignPdfToolClientV2() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [sigPos, setSigPos] = useState({ x: 70, y: 90, w: 220, h: 70 });
  const [drag, setDrag] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);

  useEffect(() => {
    let alive = true;
    loadPdfEngine().then(() => { if (alive) setEngineReady(true); }).catch(e => { if (alive) setEngineError(e instanceof Error ? e.message : "PDF engine could not load."); });
    return () => { alive = false; };
  }, []);

  async function selectPdf(f: File | null) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { setMessage("Please select a PDF file."); return; }
    if (f.size > 25 * 1024 * 1024) { setMessage("Please keep the PDF under 25 MB."); return; }
    try {
      const data = await f.arrayBuffer();
      setFile(f); setBytes(data); setPage(1); setPages(0); setSignature(null); setMessage("PDF selected. Preparing preview…");
      await loadPdfEngine();
      setEngineReady(true);
      await render(data, 1);
    } catch (e) {
      console.error(e);
      setMessage(e instanceof Error ? `PDF selected, but preview failed: ${e.message}` : "PDF selected, but preview could not be created.");
    }
  }

  async function render(data: ArrayBuffer, n: number) {
    if (!window.pdfjsLib || !canvasRef.current) return;
    setLoading(true);
    try {
      let doc;
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = activePdfWorker;
        doc = await window.pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      } catch (workerError) {
        console.warn("PDF worker failed; retrying without worker", workerError);
        doc = await window.pdfjsLib.getDocument({ data: data.slice(0), disableWorker: true }).promise;
      }
      const p = await doc.getPage(n);
      const base = p.getViewport({ scale: 1 });
      const width = Math.min(850, Math.max(380, (pageWrapRef.current?.clientWidth || 760) - 20));
      const viewport = p.getViewport({ scale: Math.min(1.5, width / base.width) });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create a PDF preview canvas.");
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      await p.render({ canvasContext: context, viewport }).promise;
      setPages(doc.numPages); setPage(n); setMessage("");
    } catch (e) {
      console.error(e);
      setMessage(e instanceof Error ? `Preview failed: ${e.message}` : "This PDF could not be rendered.");
    } finally { setLoading(false); }
  }

  async function addSignatureImage(f: File | null) {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { const ratio = img.height / Math.max(1, img.width); setSignature(url); setSigPos(p => ({ ...p, w: 220, h: Math.max(45, 220 * ratio) })); };
    img.onerror = () => { URL.revokeObjectURL(url); setMessage("Could not read the signature image."); };
    img.src = url;
  }

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    const r = pageWrapRef.current?.getBoundingClientRect(); if (!r) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: sigPos.x, y: sigPos.y, sx: e.clientX, sy: e.clientY });
  }
  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag || !pageWrapRef.current) return;
    const wrap = pageWrapRef.current.getBoundingClientRect();
    setSigPos(p => ({ ...p, x: Math.max(0, Math.min(wrap.width - p.w, drag.x + e.clientX - drag.sx)), y: Math.max(0, Math.min(wrap.height - p.h, drag.y + e.clientY - drag.sy)) }));
  }

  async function download() {
    if (!bytes || !signature) return setMessage("Upload a PDF and signature first.");
    setLoading(true); setMessage("Creating signed PDF…");
    try {
      await loadPdfLib();
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0));
      const imageBytes = await fetch(signature).then(r => r.arrayBuffer());
      const image = await pdf.embedPng(imageBytes).catch(() => pdf.embedJpg(imageBytes));
      const canvas = canvasRef.current!;
      const wrapW = canvas.clientWidth || canvas.width; const wrapH = canvas.clientHeight || canvas.height;
      const p = pdf.getPage(page - 1); const size = p.getSize();
      p.drawImage(image, { x: sigPos.x / wrapW * size.width, y: size.height - ((sigPos.y + sigPos.h) / wrapH * size.height), width: sigPos.w / wrapW * size.width, height: sigPos.h / wrapH * size.height });
      const out = await pdf.save();
      const url = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}-signed.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500); setMessage("Signed PDF downloaded successfully.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create the signed PDF."); }
    finally { setLoading(false); }
  }

  const css = `.spv{color:#102027}.spv *{box-sizing:border-box}.spv-card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px #06261f12}.spv-btn{border:0;border-radius:10px;padding:12px 16px;font-weight:800;cursor:pointer}.spv-primary{background:#005744;color:#fff}.spv-drop{border:2px dashed #b9d1c8;background:#f7fbf9;border-radius:16px;padding:30px;text-align:center}.spv-msg{margin-top:10px;padding:10px 12px;border-radius:10px;background:#fff8df;color:#665300;font-size:13px}.spv-preview{position:relative;display:inline-block;background:#fff;box-shadow:0 12px 30px #0002;line-height:0;max-width:100%}.spv-preview canvas{display:block;max-width:100%;height:auto}.spv-sig{position:absolute;border:2px dashed #005744;touch-action:none;cursor:move}.spv-sig img{width:100%;height:100%;object-fit:contain;pointer-events:none}@media(max-width:900px){.spv-layout{grid-template-columns:1fr!important}}`;

  if (!file) return <div className="spv"><style>{css}</style><div className="spv-card" style={{padding:26}}><div className="spv-drop"><div style={{fontSize:42}}>✍️</div><h2>Upload your PDF</h2><p style={{color:"#65736e"}}>Choose a PDF to start. Your document stays in your browser.</p><input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={e => { void selectPdf(e.target.files?.[0] || null); e.currentTarget.value=""; }} style={{display:"block",margin:"18px auto",maxWidth:"100%"}}/><p style={{color:"#65736e",fontSize:13}}>PDF only • Up to 25 MB</p></div>{engineError && <div className="spv-msg">PDF viewer engine: {engineError}</div>}{message && <div className="spv-msg">{message}</div>}</div></div>;

  return <div className="spv"><style>{css}</style><div className="spv-card" style={{padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><div><strong>{file.name}</strong><div style={{fontSize:13,color:"#65736e"}}>{pages ? `${pages} pages • Page ${page}` : "PDF selected"}</div></div><label className="spv-btn spv-primary">Replace PDF<input type="file" accept="application/pdf,.pdf" hidden onChange={e=>{void selectPdf(e.target.files?.[0]||null);e.currentTarget.value=""}}/></label></div>{!pages ? <div className="spv-card" style={{padding:30,textAlign:"center"}}><h3>PDF selected</h3><p style={{color:"#65736e"}}>{loading ? "Preparing preview…" : engineError ? `Preview engine issue: ${engineError}` : "Preparing preview…"}</p>{message&&<div className="spv-msg">{message}</div>}</div> : <div className="spv-layout" style={{display:"grid",gridTemplateColumns:"180px minmax(0,1fr) 260px",gap:14}}><aside className="spv-card" style={{padding:10}}>{Array.from({length:pages},(_,i)=><button key={i} className="spv-btn" style={{width:"100%",marginBottom:8,background:page===i+1?"#eef8f4":"#f8faf9"}} onClick={()=>{setPage(i+1);if(bytes)void render(bytes,i+1)}}>Page {i+1}</button>)}</aside><section className="spv-card" style={{padding:14,background:"#eef2f0",overflow:"auto"}}><strong>PDF Preview</strong><div ref={pageWrapRef} style={{display:"flex",justifyContent:"center",padding:14,minHeight:520}}><div className="spv-preview"><canvas ref={canvasRef}/>{signature&&<div className="spv-sig" style={{left:sigPos.x,top:sigPos.y,width:sigPos.w,height:sigPos.h}} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={()=>setDrag(null)}><img src={signature} alt="Signature"/></div>}</div></div></section><aside className="spv-card" style={{padding:16}}><h3 style={{marginTop:0}}>Add Signature</h3><input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={e=>{void addSignatureImage(e.target.files?.[0]||null);e.currentTarget.value=""}}/><button className="spv-btn" style={{marginTop:12,width:"100%"}} onClick={download} disabled={!signature||loading}>{loading?"Creating…":"Download Signed PDF"}</button>{message&&<div className="spv-msg">{message}</div>}</aside></div>}</div>;
}
