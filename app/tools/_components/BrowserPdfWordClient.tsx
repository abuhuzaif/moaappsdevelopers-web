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
    setMessage("Opening PDF and locking each page to its original geometry…");

    try {
      await loadPdfEngine();
      const bytes = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const docx = await loadDocx();
      const { Document, ImageRun, Packer, Paragraph } = docx;

      const sections: any[] = [];

      // Fidelity-first conversion. The PDF page is rendered as a single
      // high-resolution image and anchored to the PAGE, not to the paragraph.
      // This prevents Word's normal text-flow engine from moving, shrinking,
      // splitting or reflowing tables, columns, borders and signatures.
      // A completely new DOCX is generated; the source PDF is read-only.
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round(((i - 1) / pdf.numPages) * 90));
        setMessage(`Preserving page ${i} of ${pdf.numPages} exactly…`);

        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });

        // Render at a useful quality without making the browser unnecessarily
        // heavy. The final Word dimensions are derived from the PDF's physical
        // point dimensions, so rendering scale never changes page geometry.
        const renderScale = Math.min(
          3,
          Math.max(2, 1800 / Math.max(baseViewport.width, baseViewport.height))
        );
        const renderViewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Could not create the PDF rendering canvas.");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport: renderViewport }).promise;

        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        if (!base64) throw new Error(`Could not render PDF page ${i}.`);

        const binary = atob(base64);
        const imageBytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) imageBytes[j] = binary.charCodeAt(j);

        // DOCX page dimensions are twentieths of a point (twips).
        const pageWidthTwips = Math.round(baseViewport.width * 20);
        const pageHeightTwips = Math.round(baseViewport.height * 20);

        // ImageRun dimensions are pixels at Word's 96-DPI image convention.
        // Keep them derived from the PDF points rather than from the render
        // canvas so a high-resolution render never creates an oversized page.
        const imageWidthPx = Math.max(1, Math.round((baseViewport.width * 96) / 72));
        const imageHeightPx = Math.max(1, Math.round((baseViewport.height * 96) / 72));

        const image = new ImageRun({
          type: "png",
          data: imageBytes,
          transformation: {
            width: imageWidthPx,
            height: imageHeightPx,
          },
          // Critical fix: anchor the page image to the physical page edge.
          // Inline images participate in paragraph layout and can cause the
          // image to spill onto another page. A page-anchored image cannot.
          floating: {
            horizontalPosition: {
              relative: "page",
              align: "left",
            },
            verticalPosition: {
              relative: "page",
              align: "top",
            },
            wrap: {
              type: "none",
            },
            allowOverlap: false,
            lockAnchor: true,
            behindDocument: false,
            margins: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        });

        sections.push({
          properties: {
            page: {
              width: pageWidthTwips,
              height: pageHeightTwips,
              margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                header: 0,
                footer: 0,
                gutter: 0,
              },
            },
          },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 240 },
              children: [image],
            }),
          ],
        });
      }

      setProgress(95);
      setMessage("Building the new fixed-layout Word document…");

      const wordDocument = new Document({ sections });
      const output = await Packer.toBlob(wordDocument);

      download(output, `${cleanName(file.name)}.docx`);
      setProgress(100);
      setMessage(
        `Done — ${pdf.numPages} source page${pdf.numPages === 1 ? "" : "s"} preserved as ${pdf.numPages} Word page${pdf.numPages === 1 ? "" : "s"}. Tables, columns, borders, signatures and page positioning are locked to the original PDF layout. The original PDF was not modified.`
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
          Browser-based, fidelity-first PDF → Word conversion. Each PDF page is rendered once and anchored to the physical Word page so tables, columns, borders, stamps and signatures cannot reflow. Your original PDF is never edited, deleted or overwritten.
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
