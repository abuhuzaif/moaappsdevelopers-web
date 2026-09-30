"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

declare global { interface Window { pdfjsLib?: any; PDFLib?: any; } }

const PDFJS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
];
const PDFWORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFLIB = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",
];

function loadScript(urls: string[], id: string) {
  return new Promise<void>(async (resolve, reject) => {
    if ((window as any)[id]) return resolve();
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "1") return resolve();
    existing?.remove();
    for (const url of urls) {
      try {
        await new Promise<void>((ok, bad) => {
          const s = document.createElement("script"); s.id = id; s.src = url; s.async = true;
          s.onload = () => { s.dataset.loaded = "1"; ok(); };
          s.onerror = () => { s.remove(); bad(new Error("load failed")); };
          document.head.appendChild(s);
        });
        return resolve();
      } catch {}
    }
    reject(new Error("PDF engine could not be loaded. Please refresh and try again."));
  });
}

async function loadPdfJs() {
  if (!window.pdfjsLib) await loadScript(PDFJS, "mk-pdfjs-v8");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWORKER;
}
async function loadPdfLib() { if (!window.PDFLib) await loadScript(PDFLIB, "mk-pdflib-v8"); }

function makeTypedSignature(text: string) {
  const c = document.createElement("canvas"); c.width = 700; c.height = 180;
  const x = c.getContext("2d")!; x.clearRect(0, 0, c.width, c.height); x.fillStyle = "#111";
  x.font = "italic 76px 'Brush Script MT','Segoe Script',cursive"; x.fillText(text, 30, 110);
  return c.toDataURL("image/png");
}

export default function SignPdfToolClientV3() {
  const input = useRef<HTMLInputElement>(null), canvas = useRef<HTMLCanvasElement>(null), wrap = useRef<HTMLDivElement>(null), draw = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const [file, setFile] = useState<File|null>(null), [bytes, setBytes] = useState<ArrayBuffer|null>(null), [pages, setPages] = useState(0), [page, setPage] = useState(1);
  const [sig, setSig] = useState<string|null>(null), [mode, setMode] = useState<"upload"|"draw"|"type">("upload"), [typed, setTyped] = useState("");
  const [pos, setPos] = useState({x:70,y:90,w:220,h:70}), [drag, setDrag] = useState<any>(null), [resize, setResize] = useState<any>(null);
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(""), [saveMode, setSaveMode] = useState<"current"|"all">("current"), [drawing, setDrawing] = useState(false);

  useEffect(() => { loadPdfJs().catch(e => setStatus(e.message)); }, []);

  async function select(f: File|null) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { setStatus("Please choose a PDF file."); return; }
    if (f.size > 50 * 1024 * 1024) { setStatus("Please keep the PDF under 50 MB for browser signing."); return; }
    setBusy(true); setStatus("Opening PDF…");
    try {
      await loadPdfJs();
      const b = await f.arrayBuffer();
      let doc;
      try { doc = await window.pdfjsLib.getDocument({data: b.slice(0)}).promise; }
      catch { doc = await window.pdfjsLib.getDocument({data: b.slice(0), disableWorker: true}).promise; }
      pdfRef.current = doc; setFile(f); setBytes(b); setPages(doc.numPages); setPage(1); setSig(null); setStatus(`PDF loaded successfully • ${doc.numPages} page${doc.numPages === 1 ? "" : "s"}`);
    } catch (e) { setStatus(e instanceof Error ? e.message : "Could not open PDF. Try another PDF file."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    if (!pdfRef.current || !canvas.current) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await pdfRef.current.getPage(page), base = p.getViewport({scale:1});
        const width = Math.min(850, Math.max(380, (wrap.current?.clientWidth || 760) - 20));
        const v = p.getViewport({scale: Math.min(1.5, width / base.width)});
        if (cancelled || !canvas.current) return;
        canvas.current.width = Math.ceil(v.width); canvas.current.height = Math.ceil(v.height);
        await p.render({canvasContext: canvas.current.getContext("2d")!, viewport:v}).promise;
      } catch (e) { if (!cancelled) setStatus(e instanceof Error ? e.message : "Could not render PDF page."); }
    })();
    return () => { cancelled = true; };
  }, [page, pages]);

  function addImage(f: File|null) {
    if (!f) return;
    if (!["image/png","image/jpeg"].includes(f.type)) { setStatus("Please choose a PNG or JPG signature image."); return; }
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => { const c=document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight; c.getContext("2d")!.drawImage(img,0,0); setSig(c.toDataURL("image/png")); setPos(p=>({...p,w:220,h:Math.max(45,220*(img.naturalHeight/Math.max(1,img.naturalWidth)))})); setStatus("Signature image added."); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); setStatus("Could not read the signature image."); };
    img.src = url;
  }

  function down(e: PointerEvent<HTMLDivElement>) { if ((e.target as HTMLElement).dataset.resize) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag({x:pos.x,y:pos.y,sx:e.clientX,sy:e.clientY}); }
  function move(e: PointerEvent<HTMLDivElement>) { if (!drag) return; setPos(p=>({...p,x:Math.max(0,drag.x+e.clientX-drag.sx),y:Math.max(0,drag.y+e.clientY-drag.sy)})); }
  function rs(e: PointerEvent<HTMLDivElement>) { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); setResize({w:pos.w,h:pos.h,sx:e.clientX,sy:e.clientY}); }
  function rm(e: PointerEvent<HTMLDivElement>) { if (!resize) return; setPos(p=>({...p,w:Math.max(70,resize.w+e.clientX-resize.sx),h:Math.max(35,resize.h+e.clientY-resize.sy)})); }
  function drawStart(e: PointerEvent<HTMLCanvasElement>) { const c=draw.current;if(!c)return;const r=c.getBoundingClientRect(),x=c.getContext("2d")!;x.strokeStyle="#111";x.lineWidth=4;x.lineCap="round";x.beginPath();x.moveTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);c.setPointerCapture(e.pointerId);setDrawing(true); }
  function drawMove(e: PointerEvent<HTMLCanvasElement>) { if(!drawing||!draw.current)return;const c=draw.current,r=c.getBoundingClientRect(),x=c.getContext("2d")!;x.lineTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);x.stroke(); }

  async function save() {
    if (!bytes || !sig) { setStatus("Upload a PDF and add a signature first."); return; }
    setBusy(true); setStatus("Creating signed PDF…");
    try {
      await loadPdfLib();
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0));
      const image = await pdf.embedPng(await fetch(sig).then(r=>r.arrayBuffer()));
      const nums = saveMode === "all" ? Array.from({length:pages},(_,i)=>i+1) : [page];
      const cw=canvas.current?.clientWidth||canvas.current?.width||1, ch=canvas.current?.clientHeight||canvas.current?.height||1;
      for(const n of nums){const p=pdf.getPage(n-1),s=p.getSize();p.drawImage(image,{x:pos.x/cw*s.width,y:s.height-(pos.y+pos.h)/ch*s.height,width:pos.w/cw*s.width,height:pos.h/ch*s.height});}
      const out=await pdf.save(),url=URL.createObjectURL(new Blob([out],{type:"application/pdf"})),a=document.createElement("a");a.href=url;a.download=`${file!.name.replace(/\.pdf$/i,"")}-signed.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);setStatus("Signed PDF downloaded successfully.");
    } catch(e) { setStatus(e instanceof Error ? e.message : "Could not create the signed PDF."); }
    finally { setBusy(false); }
  }

  const css=`.mk *{box-sizing:border-box}.card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px #06261f12}.btn{border:0;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}.primary{background:#005744;color:#fff}.tab{background:#f4f7f6}.active{background:#005744;color:#fff}.msg{margin-top:10px;padding:10px 12px;border-radius:10px;background:#fff8df;color:#665300;font-size:13px}.preview{position:relative;display:inline-block;background:#fff;line-height:0;box-shadow:0 12px 30px #0002;max-width:100%}.preview canvas{display:block;max-width:100%;height:auto}.sig{position:absolute;border:2px dashed #005744;touch-action:none;cursor:move;background:transparent}.sig img{width:100%;height:100%;object-fit:contain;pointer-events:none}.handle{position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;border-radius:50%;background:#005744;border:2px solid #fff;touch-action:none}.draw{width:100%;height:170px;border:1px solid #ccd8d3;border-radius:12px;touch-action:none;background:#fff}@media(max-width:950px){.layout{grid-template-columns:1fr!important}}`;

  if (!file) return <div className="mk"><style>{css}</style><div className="card" style={{padding:28,textAlign:"center"}}><div style={{fontSize:44}}>✍️</div><h2 style={{color:"#102027"}}>Upload your PDF</h2><p style={{color:"#65716f"}}>Your document stays in your browser. PDF files up to 50 MB are supported.</p><input ref={input} type="file" accept="application/pdf,.pdf" onChange={e=>{void select(e.target.files?.[0]||null);e.currentTarget.value=""}} disabled={busy}/>{status&&<div className="msg">{status}</div>}</div></div>;

  return <div className="mk"><style>{css}</style>
    <div className="card" style={{padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><div><strong style={{color:"#102027"}}>{file.name}</strong><div style={{fontSize:13,color:"#65736e"}}>{pages} pages • Page {page}</div></div><label className="btn primary">Replace PDF<input type="file" accept="application/pdf,.pdf" hidden onChange={e=>{void select(e.target.files?.[0]||null);e.currentTarget.value=""}}/></label></div>
    <div className="layout" style={{display:"grid",gridTemplateColumns:"150px minmax(0,1fr) 300px",gap:14}}>
      <aside className="card" style={{padding:10}}>{Array.from({length:pages},(_,i)=><button key={i} className="btn" style={{width:"100%",marginBottom:8,background:page===i+1?"#eef8f4":"#f8faf9"}} onClick={()=>setPage(i+1)}>Page {i+1}</button>)}</aside>
      <section className="card" style={{padding:14,background:"#eef2f0",overflow:"auto"}}><strong style={{color:"#102027"}}>PDF Preview</strong><div ref={wrap} style={{display:"flex",justifyContent:"center",padding:14}}><div className="preview"><canvas ref={canvas}/>{sig&&<div className="sig" style={{left:pos.x,top:pos.y,width:pos.w,height:pos.h}} onPointerDown={down} onPointerMove={move} onPointerUp={()=>setDrag(null)}><img src={sig} alt="Signature"/><div className="handle" data-resize="1" onPointerDown={rs} onPointerMove={rm} onPointerUp={()=>setResize(null)}/></div>}</div></div></section>
      <aside className="card" style={{padding:16}}><h3 style={{marginTop:0,color:"#102027"}}>Add Signature</h3><div style={{display:"flex",gap:7,marginBottom:12}}>{(["upload","draw","type"] as const).map(m=><button key={m} className={`btn tab ${mode===m?"active":""}`} onClick={()=>setMode(m)}>{m[0].toUpperCase()+m.slice(1)}</button>)}</div>
        {mode==="upload"&&<><input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={e=>{addImage(e.target.files?.[0]||null);e.currentTarget.value=""}}/><p style={{fontSize:12,color:"#65716f"}}>PNG or JPG signature image.</p></>}
        {mode==="draw"&&<><canvas ref={draw} width={700} height={170} className="draw" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={()=>setDrawing(false)} onPointerCancel={()=>setDrawing(false)}/><div style={{marginTop:8,display:"flex",gap:7}}><button className="btn" onClick={()=>draw.current?.getContext("2d")?.clearRect(0,0,700,170)}>Clear</button><button className="btn primary" onClick={()=>{if(draw.current){setSig(draw.current.toDataURL("image/png"));setPos(p=>({...p,w:240,h:90}));setStatus("Drawn signature added.")}}}>Use Signature</button></div></>}
        {mode==="type"&&<><input style={{width:"100%",padding:10,border:"1px solid #ccd8d3",borderRadius:8}} value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Type your name"/><button className="btn primary" style={{marginTop:8}} onClick={()=>{if(!typed.trim()){setStatus("Type your name first.");return}setSig(makeTypedSignature(typed.trim()));setPos(p=>({...p,w:250,h:85}));setStatus("Typed signature added.")}}>Use Typed Signature</button></>}
        <hr style={{border:0,borderTop:"1px solid #e4ebe8",margin:"16px 0"}}/><label style={{fontWeight:800,color:"#17332c",display:"block",marginBottom:7}}>Apply signature</label><select value={saveMode} onChange={e=>setSaveMode(e.target.value as typeof saveMode)} style={{width:"100%",padding:9,borderRadius:8,border:"1px solid #ccd8d3"}}><option value="current">Current page only</option><option value="all">All pages</option></select><button className="btn primary" style={{width:"100%",marginTop:12}} disabled={busy||!sig} onClick={save}>{busy?"Working…":"Download Signed PDF"}</button>{status&&<div className="msg">{status}</div>}
      </aside>
    </div>
  </div>;
}
