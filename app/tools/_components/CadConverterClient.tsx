"use client";

import { useMemo, useState } from "react";

const CONFIG: Record<string, { input: string; output: string; accept: string; button: string; hint: string }> = {
  "dwg-to-dxf": { input: "DWG", output: "DXF", accept: ".dwg", button: "Convert DWG → DXF", hint: "AutoCAD DWG drawings are converted to the more interoperable DXF format." },
  "dwg-to-pdf": { input: "DWG", output: "PDF", accept: ".dwg", button: "Convert DWG → PDF", hint: "Create a PDF copy of your DWG drawing for sharing, printing or review." },
  "dwg-to-svg": { input: "DWG", output: "SVG", accept: ".dwg", button: "Convert DWG → SVG", hint: "Convert the drawing to scalable SVG graphics for web and design workflows." },
  "dxf-to-svg": { input: "DXF", output: "SVG", accept: ".dxf", button: "Convert DXF → SVG", hint: "Convert an open DXF drawing to scalable SVG graphics." },
  "pdf-to-dxf": { input: "PDF", output: "DXF", accept: ".pdf", button: "Convert PDF → DXF", hint: "Vector PDF drawings are converted to DXF format for use in CAD software." },
};

export default function CadConverterClient({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const config = useMemo(() => CONFIG[slug] ?? CONFIG["dwg-to-dxf"], [slug]);

  async function run() {
    if (!file) {
      setMessage("Please choose a CAD file first.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("operation", slug);
      form.append("file", file);

      const response = await fetch("/api/cad-convert", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        let error = "CAD conversion failed. Please try again.";
        try {
          const data = await response.json();
          if (data?.detail) error = data.detail;
        } catch {}
        throw new Error(error);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fallback = `${file.name.replace(/\.[^.]+$/, "") || "drawing"}.${config.output.toLowerCase()}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] || fallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Conversion completed. Your ${config.output} file is ready.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CAD conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 20, borderRadius: 16, background: "#f6f8f7", border: "1px solid #d7e3de" }}>
      <input
        type="file"
        accept={config.accept}
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setMessage("");
        }}
        style={{ display: "block", width: "100%", marginBottom: 14 }}
      />
      {file && (
        <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#eef7f3", color: "#005744", fontSize: 13, fontWeight: 700 }}>
          Source selected • {file.name} • Original file remains unchanged.
        </div>
      )}
      <p style={{ margin: "0 0 8px", color: "#65716f", fontSize: 13, lineHeight: 1.6 }}>{config.hint}</p>
      <p style={{ margin: "0 0 14px", color: "#725600", fontSize: 12, lineHeight: 1.6 }}>
        CAD processing is performed by the site's conversion provider. Do not upload drawings containing information you are not authorized to send to a third-party processing service.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy || !file}
        style={{ border: 0, borderRadius: 10, padding: "13px 18px", background: busy || !file ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy || !file ? "not-allowed" : "pointer" }}
      >
        {busy ? "Converting…" : config.button}
      </button>
      {message && <p style={{ margin: "14px 0 0", color: message.startsWith("Conversion completed") ? "#005744" : "#42504d", fontSize: 13 }}>{message}</p>}
    </div>
  );
}
