"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const DOCX_URL = "https://esm.sh/docx@9.5.1?bundle";

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "1") return resolve();
    existing?.remove();

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Required PDF engine could not be loaded."));
    };
    document.head.appendChild(script);
  });
}

async function loadPdfEngine() {
  if (!window.pdfjsLib) await loadScript(PDFJS_URL, "myksa-pdfjs-word");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
}

async function loadDocx() {
  return (0, eval)(`import(${JSON.stringify(DOCX_URL)})`);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function cleanName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "converted";
}

export default function BrowserPdfWordClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function run() {
    if (!file) {
      setMessage("Choose a PDF file first.");
      return;
    }

    setBusy(true);
    setProgress(0);
    setMessage("Opening PDF and preserving the original page geometry…");

    try {
      await loadPdfEngine();
      const bytes = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const docx = await loadDocx();
      const { Document, ImageRun, Packer, Paragraph } = docx;

      const sections: any[] = [];

      // Fidelity-first conversion:
      // Each source PDF page is rendered as a high-resolution page image and
      // placed on a DOCX page with the exact PDF page dimensions. This avoids
      // the common PDF->DOCX failure where extracted text reflows into extra
      // pages and destroys tables, columns, borders and signatures.
      // The source PDF is read-only; only a brand-new DOCX is generated.
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round(((i - 1) / pdf.numPages) * 90));
        setMessage(`Preserving page ${i} of ${pdf.numPages} exactly…`);

        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2.25, Math.max(1.75, 1600 / Math.max(baseViewport.width, baseViewport.height)));
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Could not create the PDF rendering canvas.");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        if (!base64) throw new Error(`Could not render PDF page ${i}.`);
        const binary = atob(base64);
        const imageBytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) imageBytes[j] = binary.charCodeAt(j);

        // PDF points -> DOCX twips for the physical page size.
        const pageWidthTwips = Math.round(baseViewport.width * 20);
        const pageHeightTwips = Math.round(baseViewport.height * 20);

        // Display the high-resolution image at the PDF's original physical size.
        // Word's ImageRun uses CSS-pixel dimensions; 96 CSS px = 72 PDF points.
        const imageWidthPx = Math.round((baseViewport.width * 96) / 72);
        const imageHeightPx = Math.round((baseViewport.height * 96) / 72);

        sections.push({
          properties: {
            page: {
              width: pageWidthTwips,
              height: pageHeightTwips,
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 240 },
              children: [
                new ImageRun({
                  type: "png",
                  data: imageBytes,
                  transformation: {
                    width: imageWidthPx,
                    height: imageHeightPx,
                  },
                }),
              ],
            }),
          ],
        });
      }

      setProgress(95);
      setMessage("Building a new Word document without changing the source PDF…");

      const document = new Document({ sections });
      const output = await Packer.toBlob(document);

      download(output, `${cleanName(file.name)}.docx`);
      setProgress(100);
      setMessage(
        `Done — ${pdf.numPages} source page${pdf.numPages === 1 ? "" : "s"} preserved as ${pdf.numPages} Word page${pdf.numPages === 1 ? "" : "s"}. Tables, columns, borders, signatures and page positioning are kept visually intact. The original PDF was not modified.`
      );
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? `PDF to Word conversion failed: ${error.message}`
          : "PDF to Word conversion failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "#f7faf8", border: "1px solid #d9e6e0" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setProgress(0);
            setMessage("");
            e.currentTarget.value = "";
          }}
        />

        {file && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>
            PDF selected • {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB • Source unchanged
          </div>
        )}

        <small style={{ color: "#65716f", lineHeight: 1.6 }}>
          Browser-based, fidelity-first PDF → Word conversion. Each original PDF page is preserved as a fixed-layout Word page so tables, columns, borders, stamps and signatures do not reflow into different pages. Your original PDF is never edited, deleted or overwritten.
        </small>

        <button
          type="button"
          onClick={run}
          disabled={busy || !file}
          style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}
        >
          {busy ? "Converting…" : "Convert PDF → Word"}
        </button>

        {busy && (
          <div style={{ height: 9, background: "#dfe9e5", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#f6b91f", transition: "width .2s" }} />
          </div>
        )}

        {message && (
          <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700, lineHeight: 1.5 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
