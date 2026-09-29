"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

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
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => { script.remove(); reject(new Error(`Could not load PDF engine from ${src}`)); };
    document.head.appendChild(script);
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
      await loadScript(source.src, "myska-pdfjs-v4");
      if (window.pdfjsLib) {
        activePdfWorker = source.worker;
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
        return;
      }
    } catch (error) { last = error; }
  }
  throw last instanceof Error ? last : new Error("PDF viewer engine could not be loaded.");
}

async function loadPdfLib() {
  if (window.PDFLib) return;
  await loadScript(PDF_LIB, "myska-pdflib-v4");
}

type SigMode = "upload" | "draw" | "type";

export default function SignPdfToolClientV2() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [engineError, setEngineError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [sigPos, setSigPos] = useState({ x: 70, y: 90, w: 220, h: 70 });
  const [drag, setDrag] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const [resize, setResize] = useState<{ w: number; h: number; sx: number; sy: number } | null>(null);
  const [mode, setMode] = useState<SigMode>("upload");
  const [typed, setTyped] = useState("");
  const [drawColor, setDrawColor] = useState("#111111");
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPdfEngine().catch(error => {
      if (alive) setEngineError(error instanceof Error ? error.message : "PDF engine could not load.");
    });
    return () => { alive = false; };
  }, []);

  async function openPdf(data: ArrayBuffer) {
    await loadPdfEngine();
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = activePdfWorker;
      return await window.pdfjsLib.getDocument({ data: data.slice(0) }).promise;
    } catch (workerError) {
      console.warn("PDF worker failed; retrying without worker", workerError);
      return await window.pdfjsLib.getDocument({ data: data.slice(0), disableWorker: true }).promise;
    }
  }

  async function selectPdf(f: File | null) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please select a PDF file.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setMessage("Please keep the PDF under 25 MB.");
      return;
    }
    setLoading(true);
    setMessage("Opening PDF…");
    setEngineError("");
    try {
      const data = await f.arrayBuffer();
      const doc = await openPdf(data);
      pdfDocRef.current = doc;
      setFile(f);
      setBytes(data);
      setPage(1);
      setPages(doc.numPages);
      setSignature(null);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? `Preview failed: ${error.message}` : "This PDF could not be opened.");
    } finally { setLoading(false); }
  }

  async function renderPage() {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    setLoading(true);
    try {
      const pdfPage = await doc.getPage(page);
      const base = pdfPage.getViewport({ scale: 1 });
      const width = Math.min(850, Math.max(380, (pageWrapRef.current?.clientWidth || 760) - 20));
      const viewport = pdfPage.getViewport({ scale: Math.min(1.5, width / base.width) });
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create the PDF preview canvas.");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await pdfPage.render({ canvasContext: context, viewport }).promise;
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? `Preview failed: ${error.message}` : "This PDF page could not be rendered.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!pages || !pdfDocRef.current) return;
    const timer = window.setTimeout(() => { void renderPage(); }, 0);
    return () => window.clearTimeout(timer);
  }, [pages, page]);

  async function addSignatureImage(f: File | null) {
    if (!f) return;
    if (!/\.(png|jpe?g)$/i.test(f.name) && !["image/png", "image/jpeg"].includes(f.type)) {
      setMessage("Please select a PNG or JPG signature image.");
      return;
    }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const ratio = img.height / Math.max(1, img.width);
      setSignature(url);
      setSigPos(p => ({ ...p, w: 220, h: Math.max(45, 220 * ratio) }));
      setMessage("Signature added. Drag or resize it on the PDF.");
    };
    img.onerror = () => { URL.revokeObjectURL(url); setMessage("Could not read the signature image."); };
    img.src = url;
  }

  function makeTypedSignature() {
    if (!typed.trim()) { setMessage("Type your name or signature first."); return; }
    const c = document.createElement("canvas");
    c.width = 700; c.height = 180;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#111111";
    ctx.font = "italic 76px 'Brush Script MT', 'Segoe Script', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(typed.trim(), 30, 92);
    setSignature(c.toDataURL("image/png"));
    setSigPos(p => ({ ...p, w: 250, h: 85 }));
    setMessage("Typed signature added. Drag or resize it on the PDF.");
  }

  function startDrawing(e: PointerEvent<HTMLCanvasElement>) {
    const c = drawRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.strokeStyle = drawColor; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo((e.clientX-r.left)*c.width/r.width, (e.clientY-r.top)*c.height/r.height);
    c.setPointerCapture(e.pointerId);
    setDrawing(true);
  }
  function continueDrawing(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const c = drawRef.current; if (!c) return;
    const r = c.getBoundingClientRect(); const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.lineTo((e.clientX-r.left)*c.width/r.width, (e.clientY-r.top)*c.height/r.height);
    ctx.stroke();
  }
  function finishDrawing() { setDrawing(false); }
  function clearDrawing() {
    const c=drawRef.current; const ctx=c?.getContext("2d");
    if(c&&ctx) ctx.clearRect(0,0,c.width,c.height);
  }
  function useDrawing() {
    const c=drawRef.current; if(!c) return;
    setSignature(c.toDataURL("image/png"));
    setSigPos(p=>({...p,w:240,h:90}));
    setMessage("Drawn signature added. Drag or resize it on the PDF.");
  }

  function startDrag(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.resize) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: sigPos.x, y: sigPos.y, sx: e.clientX, sy: e.clientY });
  }
  function moveDrag(e: PointerEvent<HTMLDivElement>) {
    if (!drag || !pageWrapRef.current) return;
    const wrap = pageWrapRef.current.getBoundingClientRect();
    setSigPos(p => ({ ...p, x: Math.max(0, Math.min(wrap.width - p.w, drag.x + e.clientX - drag.sx)), y: Math.max(0, Math.min(wrap.height - p.h, drag.y + e.clientY - drag.sy)) }));
  }
  function startResize(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setResize({ w: sigPos.w, h: sigPos.h, sx: e.clientX, sy: e.clientY });
  }
  function moveResize(e: PointerEvent<HTMLDivElement>) {
    if (!resize) return;
    const dx=e.clientX-resize.sx; const dy=e.clientY-resize.sy;
    setSigPos(p=>({...p,w:Math.max(70,resize.w+dx),h:Math.max(35,resize.h+dy)}));
  }

  async function download() {
    if (!bytes || !signature) { setMessage("Upload a PDF and signature first."); return; }
    setLoading(true); setMessage("Creating signed PDF…");
    try {
      await loadPdfLib();
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0));
      const imageBytes = await fetch(signature).then(response => response.arrayBuffer());
      const image = await pdf.embedPng(imageBytes).catch(() => pdf.embedJpg(imageBytes));
      const canvas = canvasRef.current!;
      const wrapW = canvas.clientWidth || canvas.width;
      const wrapH = canvas.clientHeight || canvas.height;
      const pdfPage = pdf.getPage(page - 1);
      const size = pdfPage.getSize();
      pdfPage.drawImage(image, {
        x: sigPos.x / wrapW * size.width,
        y: size.height - ((sigPos.y + sigPos.h) / wrapH * size.height),
        width: sigPos.w / wrapW * size.width,
        height: sigPos.h / wrapH * size.height,
      });
      const out = await pdf.save();
      const url = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      const link = document.createElement("a"); link.href=url;
      link.download=`${file?.name.replace(/\.pdf$/i, "") || "document"}-signed.pdf`;
      link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      setMessage("Signed PDF downloaded successfully.");
    } catch(error) { setMessage(error instanceof Error ? error.message : "Could not create the signed PDF."); }
    finally { setLoading(false); }
  }

  const css = `.spv{color:#102027}.spv *{box-sizing:border-box}.spv-card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px #06261f12}.spv-btn{border:0;border-radius:10px;padding:11px 14px;font-weight:800;cursor:pointer}.spv-primary{background:#005744;color:#fff}.spv-tab{background:#f4f7f6;color:#23332e}.spv-tab.active{background:#005744;color:#fff}.spv-msg{margin-top:10px;padding:10px 12px;border-radius:10px;background:#fff8df;color:#665300;font-size:13px}.spv-preview{position:relative;display:inline-block;background:#fff;box-shadow:0 12px 30px #0002;line-height:0;max-width:100%}.spv-preview canvas{display:block;max-width:100%;height:auto}.spv-sig{position:absolute;border:2px dashed #005744;touch-action:none;cursor:move;background:#ffffff22}.spv-sig img{width:100%;height:100%;object-fit:contain;pointer-events:none}.spv-resize{position:absolute;right:-7px;bottom:-7px;width:15px;height:15px;background:#005744;border:2px solid #fff;border-radius:50%;cursor:nwse-resize;touch-action:none}.spv-draw{width:100%;height:170px;border:1px solid #ccd8d3;border-radius:12px;background:#fff;touch-action:none}.spv-input{width:100%;padding:11px;border:1px solid #ccd8d3;border-radius:10px;font-size:16px}.spv-tools{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}@media(max-width:900px){.spv-layout{grid-template-columns:1fr!important}}`;

  if (!file) return <div className="spv"><style>{css}</style><div className="spv-card" style={{padding:26}}><div className="spv-drop"><div style={{fontSize:42}}>✍️</div><h2>Upload your PDF</h2><p style={{color:"#65736e"}}>Choose a PDF to start. Your document stays in your browser.</p><input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={e=>{void selectPdf(e.target.files?.[0]||null);e.currentTarget.value=""}} style={{display:"block",margin:"18px auto",maxWidth:"100%"}}/><p style={{color:"#65736e",fontSize:13}}>PDF only • Up to 25 MB</p></div>{engineError&&<div className="spv-msg">PDF viewer engine: {engineError}</div>}{message&&<div className="spv-msg">{message}</div>}</div></div>;

  return <div className="spv"><style>{css}</style><div className="spv-card" style={{padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><div><strong>{file.name}</strong><div style={{fontSize:13,color:"#65736e"}}>{pages?`${pages} pages • Page ${page}`:"PDF selected"}</div></div><label className="spv-btn spv-primary">Replace PDF<input type="file" accept="application/pdf,.pdf" hidden onChange={e=>{void selectPdf(e.target.files?.[0]||null);e.currentTarget.value=""}}/></label></div>{!pages?<div className="spv-card" style={{padding:30,textAlign:"center"}}><h3>PDF selected</h3><p style={{color:"#65736e"}}>{loading?"Preparing preview…":engineError?`Preview engine issue: ${engineError}`:"Preparing preview…"}</p>{message&&<div className="spv-msg">{message}</div>}</div>:<div className="spv-layout" style={{display:"grid",gridTemplateColumns:"180px minmax(0,1fr) 310px",gap:14}}><aside className="spv-card" style={{padding:10}}>{Array.from({length:pages},(_,i)=><button key={i} className="spv-btn" style={{width:"100%",marginBottom:8,background:page===i+1?"#eef8f4":"#f8faf9"}} onClick={()=>setPage(i+1)}>Page {i+1}</button>)}</aside><section className="spv-card" style={{padding:14,background:"#eef2f0",overflow:"auto"}}><strong>PDF Preview</strong><div ref={pageWrapRef} style={{display:"flex",justifyContent:"center",padding:14,minHeight:520}}><div className="spv-preview"><canvas ref={canvasRef}/>{signature&&<div className="spv-sig" style={{left:sigPos.x,top:sigPos.y,width:sigPos.w,height:sigPos.h}} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={()=>setDrag(null)}><img src={signature} alt="Signature"/><div className="spv-resize" data-resize="true" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={()=>setResize(null)}/></div>}</div></div></section><aside className="spv-card" style={{padding:16}}><h3 style={{marginTop:0}}>Add Signature</h3><div className="spv-tools"><button className={`spv-btn spv-tab ${mode==="upload"?"active":""}`} onClick={()=>setMode("upload")}>Upload</button><button className={`spv-btn spv-tab ${mode==="draw"?"active":""}`} onClick={()=>setMode("draw")}>Draw</button><button className={`spv-btn spv-tab ${mode==="type"?"active":""}`} onClick={()=>setMode("type")}>Type</button></div>{mode==="upload"&&<><input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={e=>{void addSignatureImage(e.target.files?.[0]||null);e.currentTarget.value=""}}/><p style={{fontSize:12,color:"#65736e"}}>Upload a PNG/JPG signature image.</p></>}{mode==="draw"&&<><canvas ref={drawRef} width={700} height={170} className="spv-draw" onPointerDown={startDrawing} onPointerMove={continueDrawing} onPointerUp={finishDrawing} onPointerCancel={finishDrawing}/><div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}><input type="color" value={drawColor} onChange={e=>setDrawColor(e.target.value)}/><button className="spv-btn" onClick={clearDrawing}>Clear</button><button className="spv-btn spv-primary" onClick={useDrawing}>Use Signature</button></div></>}{mode==="type"&&<><input className="spv-input" value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Type your name"/><div style={{fontFamily:"cursive",fontStyle:"italic",fontSize:30,padding:"14px 4px",minHeight:58}}>{typed||"Your signature"}</div><button className="spv-btn spv-primary" style={{width:"100%"}} onClick={makeTypedSignature}>Use Typed Signature</button></>}{signature&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #e1e8e5"}}><strong>Signature size</strong><input type="range" min="70" max="500" value={Math.round(sigPos.w)} onChange={e=>{const w=Number(e.target.value);setSigPos(p=>({...p,w,h:Math.max(35,w*(p.h/Math.max(1,p.w)))}))}} style={{width:"100%"}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#65736e"}}><span>Small</span><span>{Math.round(sigPos.w)} px</span><span>Large</span></div><p style={{fontSize:12,color:"#65736e"}}>Drag the signature on the page or use the corner handle to resize.</p></div>}<button className="spv-btn" style={{marginTop:12,width:"100%",background:signature?"#eef8f4":"#f1f3f2"}} onClick={download} disabled={!signature||loading}>{loading?"Creating…":"Download Signed PDF"}</button>{message&&<div className="spv-msg">{message}</div>}</aside></div>}</div>;
}
