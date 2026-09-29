"use client";

const TOOLS = [
  ["📄", "PDF to Word", "Convert PDF files to editable Word documents.", "/tools/pdf-to-word/"],
  ["🔗", "Merge PDF", "Combine multiple PDF files into one document.", "/tools/merge-pdf/"],
  ["🗜️", "Compress PDF", "Reduce PDF size for easy sharing and upload.", "/tools/compress-pdf/"],
  ["🖼️", "JPG to PDF", "Convert images to a professional PDF online.", "/tools/jpg-to-pdf/"],
  ["📑", "PDF to JPG", "Convert PDF pages into high-quality JPG images.", "/tools/pdf-to-jpg/"],
  ["✂️", "Split PDF", "Split a PDF and extract the pages you need.", "/tools/split-pdf/"],
  ["✍️", "Sign PDF", "Add, move and resize your signature on a PDF.", "/tools/sign-pdf/", "NEW"],
  ["🔎", "PDF OCR", "Extract searchable text from scanned PDFs.", "/tools/pdf-ocr/"],
] as const;

export default function PopularPdfTools() {
  return (
    <section className="mk-pdf-popular" aria-labelledby="popular-pdf-tools-title">
      <style>{`
        .mk-pdf-popular{position:relative;overflow:hidden;margin:0 0 28px;padding:24px;border-radius:20px;background:linear-gradient(135deg,#f8fbfa,#ffffff);border:1px solid #dce9e4;box-shadow:0 8px 24px rgba(0,55,43,.06)}
        .mk-pdf-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}
        .mk-pdf-kicker{margin:0 0 5px;color:#8b6500;font-size:11px;font-weight:900;letter-spacing:.7px;text-transform:uppercase}
        .mk-pdf-head h2{margin:0;color:#12332c;font-size:25px}
        .mk-pdf-head p{margin:6px 0 0;color:#65736e;font-size:13px;line-height:1.5}
        .mk-pdf-all{white-space:nowrap;text-decoration:none;color:#005744;font-weight:900;font-size:13px}
        .mk-pdf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .mk-pdf-card{position:relative;display:flex;align-items:center;gap:11px;min-height:88px;padding:14px;border-radius:15px;text-decoration:none;background:#fff;border:1px solid #dce7e3;border-top:3px solid #3b82f6;box-shadow:0 5px 14px rgba(0,55,43,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
        .mk-pdf-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(0,55,43,.12)}
        .mk-pdf-icon{width:46px;height:46px;display:grid;place-items:center;flex:0 0 46px;border-radius:13px;background:#dbeafe;font-size:23px}
        .mk-pdf-card:nth-child(1){background:#eef6ff;border-color:#bfdbfe;border-top-color:#3b82f6}.mk-pdf-card:nth-child(1) .mk-pdf-icon{background:#dbeafe}
        .mk-pdf-card:nth-child(2){background:#ecfdf5;border-color:#a7f3d0;border-top-color:#22c55e}.mk-pdf-card:nth-child(2) .mk-pdf-icon{background:#d1fae5}
        .mk-pdf-card:nth-child(3){background:#fff9df;border-color:#fde68a;border-top-color:#eab308}.mk-pdf-card:nth-child(3) .mk-pdf-icon{background:#fef3c7}
        .mk-pdf-card:nth-child(4){background:#f7f0ff;border-color:#ddd6fe;border-top-color:#8b5cf6}.mk-pdf-card:nth-child(4) .mk-pdf-icon{background:#ede9fe}
        .mk-pdf-card:nth-child(5){background:#fff1e8;border-color:#fed7aa;border-top-color:#f97316}.mk-pdf-card:nth-child(5) .mk-pdf-icon{background:#ffedd5}
        .mk-pdf-card:nth-child(6){background:#eafbff;border-color:#a5f3fc;border-top-color:#06b6d4}.mk-pdf-card:nth-child(6) .mk-pdf-icon{background:#cffafe}
        .mk-pdf-card:nth-child(7){background:#fff0f7;border-color:#fbcfe8;border-top-color:#ec4899}.mk-pdf-card:nth-child(7) .mk-pdf-icon{background:#fce7f3}
        .mk-pdf-card:nth-child(8){background:#f2f0ff;border-color:#c4b5fd;border-top-color:#7c3aed}.mk-pdf-card:nth-child(8) .mk-pdf-icon{background:#ede9fe}
        .mk-pdf-card strong{display:block;color:#173b33;font-size:14px;line-height:1.2}.mk-pdf-card small{display:block;margin-top:5px;color:#5f6f6a;font-size:11px;line-height:1.35}.mk-pdf-arrow{margin-left:auto;color:#005744;font-weight:900;font-size:18px}
        .mk-pdf-card:nth-child(1) .mk-pdf-arrow{color:#2563eb}.mk-pdf-card:nth-child(2) .mk-pdf-arrow{color:#16a34a}.mk-pdf-card:nth-child(3) .mk-pdf-arrow{color:#ca8a04}.mk-pdf-card:nth-child(4) .mk-pdf-arrow{color:#7c3aed}.mk-pdf-card:nth-child(5) .mk-pdf-arrow{color:#ea580c}.mk-pdf-card:nth-child(6) .mk-pdf-arrow{color:#0891b2}.mk-pdf-card:nth-child(7) .mk-pdf-arrow{color:#db2777}.mk-pdf-card:nth-child(8) .mk-pdf-arrow{color:#6d28d9}
        .mk-pdf-new{position:absolute;right:9px;top:8px;padding:3px 7px;border-radius:999px;background:#f6b91f;color:#4e3900;font-size:8px;font-weight:900;letter-spacing:.5px}
        @media(max-width:900px){.mk-pdf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.mk-pdf-popular{padding:17px}.mk-pdf-head{align-items:flex-start;flex-direction:column}.mk-pdf-grid{grid-template-columns:1fr}.mk-pdf-card{min-height:76px}.mk-pdf-all{align-self:flex-start}}
      `}</style>
      <div className="mk-pdf-head">
        <div>
          <p className="mk-pdf-kicker">🔥 Most Popular PDF Tools</p>
          <h2 id="popular-pdf-tools-title">Free Online PDF Tools</h2>
          <p>Convert, merge, compress, split and sign PDF files quickly and easily.</p>
        </div>
        <a className="mk-pdf-all" href="/tools/">View All PDF Tools →</a>
      </div>
      <div className="mk-pdf-grid">
        {TOOLS.map(([icon,title,description,href,badge]) => (
          <a className="mk-pdf-card" href={href} key={href}>
            {badge && <span className="mk-pdf-new">{badge}</span>}
            <span className="mk-pdf-icon" aria-hidden="true">{icon}</span>
            <span><strong>{title}</strong><small>{description}</small></span>
            <b className="mk-pdf-arrow" aria-hidden="true">→</b>
          </a>
        ))}
      </div>
    </section>
  );
}
