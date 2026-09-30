"use client";

import { useState } from "react";

// The previous client only extracted strings with pdf.js and rebuilt them as
// paragraphs. That loses PDF geometry, tables, borders and columns. Use the
// layout-aware documents.js PDF reader/reconstructor instead. The read-only
// entry point keeps the browser bundle focused on PDF -> DOCX.
const DOCUMENTS_URL = "https://esm.sh/documents.js@7.20.19/read?bundle";

async function loadDocuments() {
  return (0, eval)(`import(${JSON.stringify(DOCUMENTS_URL)})`);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BrowserPdfWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    if (!file) {
      setMessage("Choose a PDF file first.");
      return;
    }

    setBusy(true);
    setMessage("Loading the layout-preserving PDF → Word engine…");

    try {
      const documents = await loadDocuments();
      const input = new Uint8Array(await file.arrayBuffer());

      setMessage("Reading PDF structure, positions and tables…");

      // documents.js reconstructs the PDF's positioned content into an
      // editable Word document. In particular, real PDF gridline lattices are
      // recovered as Word tables instead of being flattened into paragraphs.
      const output = documents.pdfToDocx(input, {
        sink: (diagnostic: unknown) => {
          console.warn("PDF conversion diagnostic", diagnostic);
        },
      });

      const bytes = output instanceof Uint8Array ? output : new Uint8Array(output);
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      setMessage("Creating the new editable DOCX…");
      download(blob, `${file.name.replace(/\.[^.]+$/, "") || "converted"}.docx`);
      setMessage(
        "Done — a new editable DOCX was created. The original PDF was not modified, deleted or overwritten. Tables and page layout are reconstructed from the PDF geometry."
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
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setMessage("");
          }}
        />

        {file && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>
            PDF selected • {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB • Source unchanged
          </div>
        )}

        <small style={{ color: "#65716f", lineHeight: 1.6 }}>
          Browser-based layout-preserving conversion. Your PDF is processed on your device and a new DOCX is generated. The original PDF is never edited, deleted or overwritten.
        </small>

        <button
          type="button"
          onClick={run}
          disabled={busy || !file}
          style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}
        >
          {busy ? "Converting…" : "Convert PDF → Word"}
        </button>

        {message && (
          <p style={{ margin: 0, color: message.startsWith("Done") ? "#005744" : "#9a4d00", fontWeight: 700 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
