"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { cleanSignature } from "@/lib/clean-signature";

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

/** "1, 3, 5-7" → [1,3,5,6,7] (only pages that exist, no duplicates, sorted). */
function parsePages(text: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of text.split(/[,\s]+/)) {
    const m = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part.trim());
    if (!m) continue;
    let a = Number(m[1]), b = Number(m[2] ?? m[1]);
    if (a > b) [a, b] = [b, a];
    for (let n = Math.max(1, a); n <= Math.min(total, b); n++) out.add(n);
  }
  return [...out].sort((x, y) => x - y);
}

/** [1,3,5,6,7] → "1, 3, 5-7" */
function pagesToText(list: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < list.length; i++) {
    let j = i;
    while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
    parts.push(j > i + 1 ? `${list[i]}-${list[j]}` : j === i + 1 ? `${list[i]}, ${list[j]}` : `${list[i]}`);
    i = j;
  }
  return parts.join(", ");
}

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
  // Signature place PER PAGE, as fractions of the page (0–1), so it lands in the same spot whatever the page size.
  // A page you never moved it on uses the last place you set (defFrac).
  type Frac = { x: number; y: number; w: number; h: number };
  const [place, setPlace] = useState<Record<number, Frac>>({}), [defFrac, setDefFrac] = useState<Frac>({ x: 0.1, y: 0.1, w: 0.3, h: 0.09 });
  const [cs, setCs] = useState({ w: 1, h: 1 }); // preview size in CSS px
  const frac = place[page] ?? defFrac;
  const pos = { x: frac.x * cs.w, y: frac.y * cs.h, w: frac.w * cs.w, h: frac.h * cs.h };
  /** Move/resize on the page you're looking at (px in, stored as fractions for this page). */
  function setPos(fn: (p: typeof pos) => typeof pos) {
    const n = fn(pos);
    const f: Frac = { x: n.x / cs.w, y: n.y / cs.h, w: n.w / cs.w, h: n.h / cs.h };
    setPlace(prev => ({ ...prev, [page]: f }));
    setDefFrac(f);
  }
  const [drag, setDrag] = useState<any>(null), [resize, setResize] = useState<any>(null);
  // uploaded signature photo: remove the paper background, recolour the ink
  const [srcFile, setSrcFile] = useState<File|null>(null), [cleanBg, setCleanBg] = useState(true), [ink, setInk] = useState<string>("#1a237e"), [soft, setSoft] = useState(12);
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(""), [saveMode, setSaveMode] = useState<"current"|"all"|"custom">("current"), [drawing, setDrawing] = useState(false);
  // "Choose pages": ticked page numbers + the same as text ("1, 3, 5-7")
  const [chosenPages, setChosenPages] = useState<number[]>([]), [pagesText, setPagesText] = useState("");
  function setChosen(list: number[]) { setChosenPages(list); setPagesText(pagesToText(list)); }
  function togglePage(n: number) { setChosen(chosenPages.includes(n) ? chosenPages.filter(x => x !== n) : [...chosenPages, n].sort((a, b) => a - b)); }
  const targetPages = saveMode === "all" ? Array.from({length:pages},(_,i)=>i+1) : saveMode === "custom" ? chosenPages : [page];

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
      pdfRef.current = doc; setFile(f); setBytes(b); setPages(doc.numPages); setPage(1); setSig(null); setSaveMode("current"); setChosenPages([]); setPagesText(""); setPlace({}); setStatus(`PDF loaded successfully • ${doc.numPages} page${doc.numPages === 1 ? "" : "s"}`);
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
        if (!cancelled && canvas.current) setCs({ w: canvas.current.clientWidth || canvas.current.width, h: canvas.current.clientHeight || canvas.current.height });
      } catch (e) { if (!cancelled) setStatus(e instanceof Error ? e.message : "Could not render PDF page."); }
    })();
    return () => { cancelled = true; };
  }, [page, pages]);

  async function processImage(f: File, opts: { clean: boolean; ink: string; soft: number }, keepPlace: boolean) {
    try {
      let url: string;
      if (opts.clean) {
        url = await cleanSignature(f, { ink: opts.ink, softness: opts.soft });
      } else {
        url = await new Promise<string>((ok, bad) => {
          const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => bad(new Error("Could not read the signature image.")); r.readAsDataURL(f);
        });
      }
      const img = new Image();
      await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = () => bad(new Error("Could not read the signature image.")); img.src = url; });
      const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
      setSig(url);
      if (!keepPlace) setPlace({});
      setPos(p => { const w = keepPlace ? p.w : 220; return { ...p, w, h: Math.max(35, w * ratio) }; });
      setStatus(opts.clean ? "Signature added — background removed." : "Signature image added (original background).");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not read the signature image.");
    }
  }

  function addImage(f: File|null) {
    if (!f) return;
    if (!["image/png","image/jpeg","image/webp"].includes(f.type)) { setStatus("Please choose a PNG or JPG signature image."); return; }
    setSrcFile(f);
    setStatus("Cleaning signature…");
    void processImage(f, { clean: cleanBg, ink, soft }, false);
  }

  // re-clean the same photo when the user changes colour / strength / background option
  useEffect(() => {
    if (!srcFile) return;
    const t = setTimeout(() => void processImage(srcFile, { clean: cleanBg, ink, soft }, true), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBg, ink, soft]);

  function down(e: PointerEvent<HTMLDivElement>) { if ((e.target as HTMLElement).dataset.resize) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag({x:pos.x,y:pos.y,sx:e.clientX,sy:e.clientY}); }
  function move(e: PointerEvent<HTMLDivElement>) { if (!drag) return; setPos(p=>({...p,x:Math.max(0,drag.x+e.clientX-drag.sx),y:Math.max(0,drag.y+e.clientY-drag.sy)})); }
  function rs(e: PointerEvent<HTMLDivElement>) { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); setResize({w:pos.w,h:pos.h,sx:e.clientX,sy:e.clientY}); }
  function rm(e: PointerEvent<HTMLDivElement>) { if (!resize) return; setPos(p=>({...p,w:Math.max(70,resize.w+e.clientX-resize.sx),h:Math.max(35,resize.h+e.clientY-resize.sy)})); }
  function drawStart(e: PointerEvent<HTMLCanvasElement>) { const c=draw.current;if(!c)return;const r=c.getBoundingClientRect(),x=c.getContext("2d")!;x.strokeStyle="#111";x.lineWidth=4;x.lineCap="round";x.beginPath();x.moveTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);c.setPointerCapture(e.pointerId);setDrawing(true); }
  function drawMove(e: PointerEvent<HTMLCanvasElement>) { if(!drawing||!draw.current)return;const c=draw.current,r=c.getBoundingClientRect(),x=c.getContext("2d")!;x.lineTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);x.stroke(); }

  async function save() {
    if (!bytes || !sig) { setStatus("Upload a PDF and add a signature first."); return; }
    if (targetPages.length === 0) { setStatus("Choose at least one page to sign (e.g. 1, 3, 5-7)."); return; }
    setBusy(true); setStatus("Creating signed PDF…");
    try {
      await loadPdfLib();
      const pdf = await window.PDFLib.PDFDocument.load(bytes.slice(0));
      const image = await pdf.embedPng(await fetch(sig).then(r=>r.arrayBuffer()));
      const nums = targetPages;
      for(const n of nums){const f=place[n]??defFrac,p=pdf.getPage(n-1),s=p.getSize();p.drawImage(image,{x:f.x*s.width,y:s.height-(f.y+f.h)*s.height,width:f.w*s.width,height:f.h*s.height});}
      const out=await pdf.save(),url=URL.createObjectURL(new Blob([out],{type:"application/pdf"})),a=document.createElement("a");a.href=url;a.download=`${file!.name.replace(/\.pdf$/i,"")}-signed.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);setStatus(`Signed PDF downloaded — signature on ${nums.length === 1 ? `page ${nums[0]}` : `${nums.length} pages (${pagesToText(nums)})`}.`);
    } catch(e) { setStatus(e instanceof Error ? e.message : "Could not create the signed PDF."); }
    finally { setBusy(false); }
  }

  const css=`.mk *{box-sizing:border-box}.card{background:#fff;border:1px solid #dbe7e2;border-radius:18px;box-shadow:0 10px 28px #06261f12}.btn{border:0;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}.primary{background:#005744;color:#fff}.tab{background:#f4f7f6}.active{background:#005744;color:#fff}.msg{margin-top:10px;padding:10px 12px;border-radius:10px;background:#fff8df;color:#665300;font-size:13px}.preview{position:relative;display:inline-block;background:#fff;line-height:0;box-shadow:0 12px 30px #0002;max-width:100%}.preview canvas{display:block;max-width:100%;height:auto}.sig{position:absolute;border:2px dashed #005744;touch-action:none;cursor:move;background:transparent}.sig img{width:100%;height:100%;object-fit:contain;pointer-events:none}.handle{position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;border-radius:50%;background:#005744;border:2px solid #fff;touch-action:none}.draw{width:100%;height:170px;border:1px solid #ccd8d3;border-radius:12px;touch-action:none;background:#fff}@media(max-width:950px){.layout{grid-template-columns:1fr!important}}`;

  if (!file) return <div className="mk"><style>{css}</style><div className="card" style={{padding:28,textAlign:"center"}}><div style={{fontSize:44}}>✍️</div><h2 style={{color:"#102027"}}>Upload your PDF</h2><p style={{color:"#65716f"}}>Your document stays in your browser. PDF files up to 50 MB are supported.</p><input ref={input} type="file" accept="application/pdf,.pdf" onChange={e=>{void select(e.target.files?.[0]||null);e.currentTarget.value=""}} disabled={busy}/>{status&&<div className="msg">{status}</div>}</div></div>;

  return <div className="mk"><style>{css}</style>
    <div className="card" style={{padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><div><strong style={{color:"#102027"}}>{file.name}</strong><div style={{fontSize:13,color:"#65736e"}}>{pages} pages • Page {page}</div></div><label className="btn primary">Replace PDF<input type="file" accept="application/pdf,.pdf" hidden onChange={e=>{void select(e.target.files?.[0]||null);e.currentTarget.value=""}}/></label></div>
    <div className="layout" style={{display:"grid",gridTemplateColumns:"150px minmax(0,1fr) 300px",gap:14}}>
      <aside className="card" style={{padding:10,maxHeight:"80vh",overflowY:"auto"}}>{Array.from({length:pages},(_,i)=>{const n=i+1,signs=!!sig&&targetPages.includes(n);return <button key={i} className="btn" style={{width:"100%",marginBottom:8,background:page===n?"#eef8f4":"#f8faf9",border:page===n?"2px solid #005744":"2px solid transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>setPage(n)}><span>Page {n}</span>{signs&&<span title="Signature goes here" style={{fontSize:12}}>✍️</span>}</button>})}</aside>
      <section className="card" style={{padding:14,background:"#eef2f0",overflow:"auto"}}><strong style={{color:"#102027"}}>PDF Preview</strong>{sig&&<div style={{fontSize:12,color:targetPages.includes(page)?"#005744":"#8a5a00",marginTop:4}}>{targetPages.includes(page)?`Drag the signature to where you want it on page ${page}.${targetPages.length>1?" Each page can have its own spot.":""}`:`Page ${page} will not be signed.`}</div>}<div ref={wrap} style={{display:"flex",justifyContent:"center",padding:14}}><div className="preview"><canvas ref={canvas}/>{sig&&targetPages.includes(page)&&<div className="sig" style={{left:pos.x,top:pos.y,width:pos.w,height:pos.h}} onPointerDown={down} onPointerMove={move} onPointerUp={()=>setDrag(null)}><img src={sig} alt="Signature"/><div className="handle" data-resize="1" onPointerDown={rs} onPointerMove={rm} onPointerUp={()=>setResize(null)}/></div>}</div></div></section>
      <aside className="card" style={{padding:16}}><h3 style={{marginTop:0,color:"#102027"}}>Add Signature</h3><div style={{display:"flex",gap:7,marginBottom:12}}>{(["upload","draw","type"] as const).map(m=><button key={m} className={`btn tab ${mode===m?"active":""}`} onClick={()=>setMode(m)}>{m[0].toUpperCase()+m.slice(1)}</button>)}</div>
        {mode==="upload"&&<><input type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" onChange={e=>{addImage(e.target.files?.[0]||null);e.currentTarget.value=""}}/><p style={{fontSize:12,color:"#65716f"}}>Photo of your signature on white paper (PNG or JPG). The paper background is removed automatically.</p>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,color:"#17332c",margin:"6px 0 10px"}}><input type="checkbox" checked={cleanBg} onChange={e=>setCleanBg(e.target.checked)}/>Remove background</label>
          {cleanBg&&<>
            <div style={{fontSize:12,fontWeight:800,color:"#17332c",marginBottom:6}}>Ink colour</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>{([["#1a237e","Blue"],["#111111","Black"],["original","Original"]] as const).map(([v,l])=><button key={v} type="button" className={`btn tab ${ink===v?"active":""}`} style={{padding:"7px 10px",fontSize:12,display:"flex",alignItems:"center",gap:6}} onClick={()=>setInk(v)}>{v!=="original"&&<span style={{width:12,height:12,borderRadius:"50%",background:v,display:"inline-block",border:"1px solid #fff8"}}/>}{l}</button>)}</div>
            <label style={{display:"block",fontSize:12,fontWeight:800,color:"#17332c"}}>Cleaning strength <span style={{fontWeight:600,color:"#65716f"}}>(raise if strokes look broken)</span>
              <input type="range" min={0} max={40} value={soft} onChange={e=>setSoft(Number(e.target.value))} style={{width:"100%"}}/>
            </label>
          </>}
          {srcFile&&sig&&<div style={{marginTop:8,padding:8,borderRadius:10,border:"1px solid #e4ebe8",background:"repeating-conic-gradient(#f1f4f3 0% 25%, #fff 0% 50%) 50% / 16px 16px",textAlign:"center"}}><img src={sig} alt="Signature preview" style={{maxWidth:"100%",maxHeight:90}}/></div>}
        </>}
        {mode==="draw"&&<><canvas ref={draw} width={700} height={170} className="draw" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={()=>setDrawing(false)} onPointerCancel={()=>setDrawing(false)}/><div style={{marginTop:8,display:"flex",gap:7}}><button className="btn" onClick={()=>draw.current?.getContext("2d")?.clearRect(0,0,700,170)}>Clear</button><button className="btn primary" onClick={()=>{if(draw.current){setSrcFile(null);setSig(draw.current.toDataURL("image/png"));setPlace({});setPos(p=>({...p,w:240,h:90}));setStatus("Drawn signature added.")}}}>Use Signature</button></div></>}
        {mode==="type"&&<><input style={{width:"100%",padding:10,border:"1px solid #ccd8d3",borderRadius:8}} value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Type your name"/><button className="btn primary" style={{marginTop:8}} onClick={()=>{if(!typed.trim()){setStatus("Type your name first.");return}setSrcFile(null);setSig(makeTypedSignature(typed.trim()));setPlace({});setPos(p=>({...p,w:250,h:85}));setStatus("Typed signature added.")}}>Use Typed Signature</button></>}
        <hr style={{border:0,borderTop:"1px solid #e4ebe8",margin:"16px 0"}}/><label style={{fontWeight:800,color:"#17332c",display:"block",marginBottom:7}}>Sign which pages?</label>
        {pages > 1 ? <>
          <div style={{display:"grid",gap:6}}>
            {([["current",`This page only (page ${page})`],["all",`All pages (${pages})`],["custom","Choose pages"]] as const).map(([v,l])=>
              <button key={v} type="button" className={`btn tab ${saveMode===v?"active":""}`} style={{textAlign:"left",fontSize:13}} onClick={()=>{setSaveMode(v);if(v==="custom"&&chosenPages.length===0)setChosen([page]);}}>{saveMode===v?"● ":"○ "}{l}</button>)}
          </div>
          {saveMode==="custom"&&<div style={{marginTop:10}}>
            <input value={pagesText} onChange={e=>{setPagesText(e.target.value);setChosenPages(parsePages(e.target.value,pages));}} placeholder="e.g. 1, 3, 5-7" style={{width:"100%",padding:9,borderRadius:8,border:"1px solid #ccd8d3"}}/>
            <div style={{fontSize:12,color:"#65716f",margin:"4px 0 8px"}}>Type page numbers, or tap them below.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:160,overflowY:"auto"}}>
              {Array.from({length:pages},(_,i)=>{const n=i+1,on=chosenPages.includes(n);return <button key={n} type="button" onClick={()=>togglePage(n)} style={{width:38,height:34,borderRadius:8,border:`2px solid ${on?"#005744":"#ccd8d3"}`,background:on?"#005744":"#fff",color:on?"#fff":"#17332c",fontWeight:800,cursor:"pointer"}}>{n}</button>})}
            </div>
            <div style={{display:"flex",gap:10,marginTop:8,fontSize:12}}>
              <button type="button" onClick={()=>setChosen(Array.from({length:pages},(_,i)=>i+1).filter(n=>n%2===1))} style={{border:0,background:"transparent",color:"#005744",fontWeight:800,cursor:"pointer",padding:0}}>Odd pages</button>
              <button type="button" onClick={()=>setChosen([pages])} style={{border:0,background:"transparent",color:"#005744",fontWeight:800,cursor:"pointer",padding:0}}>Last page</button>
              <button type="button" onClick={()=>setChosen([])} style={{border:0,background:"transparent",color:"#b42318",fontWeight:800,cursor:"pointer",padding:0}}>Clear</button>
            </div>
          </div>}
          <div style={{fontSize:12,color:"#17332c",marginTop:10,padding:"8px 10px",borderRadius:8,background:"#eef8f4"}}>
            {targetPages.length===0?"No page chosen yet.":`Signature on ${targetPages.length===1?`page ${targetPages[0]}`:`${targetPages.length} pages: ${pagesToText(targetPages)}`}.`}
            {targetPages.length>1&&<div style={{marginTop:4,color:"#65716f"}}>Open each page on the left and drag the signature to its spot. Pages you don't move use the last spot you set.</div>}
          </div>
          {sig&&targetPages.length>1&&targetPages.includes(page)&&<button type="button" className="btn tab" style={{width:"100%",marginTop:8,fontSize:12}} onClick={()=>{const f=place[page]??defFrac;setPlace(prev=>{const n={...prev};for(const pg of targetPages)n[pg]=f;return n;});setDefFrac(f);setStatus(`Page ${page}'s spot copied to all ${targetPages.length} pages.`);}}>📌 Use page {page}'s spot on all chosen pages</button>}
        </> : <div style={{fontSize:13,color:"#65716f"}}>This PDF has 1 page.</div>}<button className="btn primary" style={{width:"100%",marginTop:12}} disabled={busy||!sig||targetPages.length===0} onClick={save}>{busy?"Working…":"Download Signed PDF"}</button>{status&&<div className="msg">{status}</div>}
      </aside>
    </div>
  </div>;
}
