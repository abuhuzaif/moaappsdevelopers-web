"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: any;
    Tesseract?: any;
  }
}

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "1") return resolve();
    existing?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = () => { script.remove(); reject(new Error("Required PDF/OCR engine could not be loaded.")); };
    document.head.appendChild(script);
  });
}

async function loadEngines() {
  if (!window.pdfjsLib) await loadScript(PDFJS_URL, "myksa-pdfjs-ocr");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  if (!window.Tesseract) await loadScript(TESSERACT_URL, "myksa-tesseract");
}

export default function BrowserPdfOcrClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"eng" | "ara" | "eng+ara">("eng+ara");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");

  function choose(f: File | null) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setStatus("Please choose a PDF file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setStatus("Please keep the PDF under 50 MB for browser OCR.");
      return;
    }
    setFile(f);
    setResult("");
    setStatus("PDF selected. Ready to scan.");
  }

  async function runOcr() {
    if (!file) {
      setStatus("Please choose a PDF first.");
      return;
    }
    setBusy(true);
    setProgress(0);
    setResult("");
    try {
      await loadEngines();
      const bytes = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const worker = await window.Tesseract.createWorker(language, 1, {
        logger: (m: any) => {
          if (typeof m.progress === "number") setProgress(Math.min(100, Math.round(m.progress * 100)));
        },
      });

      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Processing page ${i} of ${pdf.numPages}…`);
        setProgress(Math.round(((i - 1) / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const embeddedText = textContent.items.map((item: any) => item.str || "").join(" ").replace(/\s+/g, " ").trim();

        if (embeddedText.length >= 20) {
          pages.push(`Page ${i}\n${embeddedText}`);
          continue;
        }

        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(2.0, Math.max(1.35, 1800 / Math.max(base.width, base.height)));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not create the OCR canvas.");
        await page.render({ canvasContext: context, viewport }).promise;
        const ret = await worker.recognize(canvas);
        pages.push(`Page ${i}\n${(ret?.data?.text || "").trim()}`);
      }

      await worker.terminate();
      const text = pages.join("\n\n").trim() + "\n";
      setResult(text);
      setProgress(100);
      setStatus("OCR completed. Review the text before using it for important documents.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PDF OCR failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, "") || "ocr-result"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div style={{ padding: 22, borderRadius: 16, background: "#f6f8f7", border: "1px solid #d7e3de" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={(e) => { choose(e.target.files?.[0] || null); e.currentTarget.value = ""; }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 800, color: "#17332c" }}>OCR language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} disabled={busy} style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #ccd8d3" }}>
            <option value="eng+ara">English + Arabic</option>
            <option value="eng">English</option>
            <option value="ara">Arabic</option>
          </select>
        </div>
        <p style={{ margin: 0, color: "#65716f", fontSize: 13, lineHeight: 1.6 }}>
          Browser-based OCR. Your PDF is processed on your device instead of being sent through the Vercel server upload endpoint. Supports selectable PDFs and scanned/image PDFs.
        </p>
        <button type="button" onClick={runOcr} disabled={busy || !file} style={{ border: 0, borderRadius: 10, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}>
          {busy ? "Processing…" : "Run PDF OCR"}
        </button>
        {busy && <div style={{ height: 9, background: "#dfe9e5", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${progress}%`, background: "#f6b91f", transition: "width .2s" }} /></div>}
        {status && <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fff8df", color: "#665300", fontSize: 13 }}>{status}</div>}
        {result && <>
          <textarea value={result} readOnly style={{ width: "100%", minHeight: 280, padding: 12, borderRadius: 10, border: "1px solid #ccd8d3", fontFamily: "ui-monospace,SFMono-Regular,Consolas,monospace", fontSize: 12, lineHeight: 1.55 }} />
          <button type="button" onClick={download} style={{ justifySelf: "start", border: 0, borderRadius: 10, padding: "12px 18px", background: "#005744", color: "#fff", fontWeight: 800 }}>Download TXT</button>
        </>}
      </div>
    </div>
  );
}
